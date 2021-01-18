import React, {useCallback, useContext, useEffect, useReducer} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {ItemProps} from './ItemProps';
import {createItem, getItems, newWebSocket, updateItem} from './itemApi';
import {AuthContext} from '../auth';
import {Plugins} from "@capacitor/core";
import {useBackgroundTask} from "./useBackgroundTask";
import {useNetwork} from "./useNetwork";

const log = getLogger('ItemProvider');

const {Storage} = Plugins;

type SaveItemFn = (item: ItemProps) => Promise<any>;

export interface ItemsState {
    items?: ItemProps[],
    fetching: boolean,
    fetchingError?: Error | null,
    saving: boolean,
    savingError?: Error | null,
    saveItem?: SaveItemFn,
    networkStatus: { connected: boolean, connectionType: string },
    conflict: boolean
}

interface ActionProps {
    type: string,
    payload?: any,
}

const initialState: ItemsState = {
    fetching: false,
    saving: false,
    networkStatus: {connected: false, connectionType: "unknown"},
    conflict: false
};

const FETCH_ITEMS_STARTED = 'FETCH_ITEMS_STARTED';
const FETCH_ITEMS_SUCCEEDED = 'FETCH_ITEMS_SUCCEEDED';
const FETCH_ITEMS_FAILED = 'FETCH_ITEMS_FAILED';
const SAVE_ITEM_STARTED = 'SAVE_ITEM_STARTED';
const SAVE_ITEM_SUCCEEDED = 'SAVE_ITEM_SUCCEEDED';
const SAVE_ITEM_FAILED = 'SAVE_ITEM_FAILED';

const reducer: (state: ItemsState, action: ActionProps) => ItemsState =
    (state, {type, payload}) => {
        switch (type) {
            case FETCH_ITEMS_STARTED:
                return {...state, fetching: true, fetchingError: null};
            case FETCH_ITEMS_SUCCEEDED:
                return {...state, items: payload.items, fetching: false};
            case FETCH_ITEMS_FAILED:
                return {...state, fetchingError: payload.error, fetching: false};
            case SAVE_ITEM_STARTED:
                return {...state, savingError: null, saving: true};
            case SAVE_ITEM_SUCCEEDED:
                const items = [...(state.items || [])];
                const item = payload.item;
                const index = items.findIndex(it => it._id === item._id);
                console.log("INDEX= " + index);
                if (index === -1) {
                    items.splice(0, 0, item);
                } else {
                    items[index] = item;
                }
                return {...state, items, saving: false};
            case SAVE_ITEM_FAILED:
                return {...state, savingError: payload.error, saving: false, conflict: payload.conflict};
            default:
                return state;
        }
    };

export const ItemContext = React.createContext<ItemsState>(initialState);

interface ItemProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const ItemProvider: React.FC<ItemProviderProps> = ({children}) => {
    const {token} = useContext(AuthContext);
    const [state, dispatch] = useReducer(reducer, initialState);
    const {items, fetching, fetchingError, saving, savingError, conflict} = state;
    //network status
    const {networkStatus} = useNetwork();
    useEffect(getItemsEffect, [token]);
    useEffect(wsEffect, [token]);
    const saveItem = useCallback<SaveItemFn>(saveItemCallback, [token]);
    const value = {items, fetching, fetchingError, saving, savingError, saveItem, networkStatus, conflict};
    //online/offline mode backgroundTask
    useBackgroundTask(() => new Promise(resolve => {
        //sends data to server
        console.log("SENDING DATA TO THE SERVER...");
        syncToServer();
        resolve();
    }));
    log('returns');
    return (
        <ItemContext.Provider value={value}>
            {children}
        </ItemContext.Provider>
    );

    function syncToServer() {
        sync();

        async function sync() {
            const {value} = await Storage.get({key: "items"});
            const localItems: ItemProps[] = value ? JSON.parse(value) : []   //local items
            localItems.forEach(element => {
                if (element._id && !isNaN(+element._id)) {  //este un item local
                    const index = localItems.findIndex(it => it._id === element._id);
                    localItems.splice(index, 1);
                    Storage.set({key: "items", value: JSON.stringify(localItems)});
                    saveItemCallback(element);
                }
            })
        }
    }

    function getItemsEffect() {
        let canceled = false;
        fetchItems();
        return () => {
            canceled = true;
            //cleanup
        }

        async function fetchItems() {
            if (!token?.trim()) {
                return;
            }
            try {
                log('fetchItems started');
                dispatch({type: FETCH_ITEMS_STARTED});
                const items = await getItems(token);
                log('fetchItems succeeded');
                if (!canceled) {
                    //save local items
                    await Storage.set({key: 'items', value: JSON.stringify(items)});
                    dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items}});
                }
            } catch (error) {
                log('fetchItems failed');
                const {value} = await Storage.get({key: 'items'}); //local items
                const items: ItemProps[] = JSON.parse(value!);
                value ? dispatch({
                    type: FETCH_ITEMS_SUCCEEDED,
                    payload: {items: items}
                }) : dispatch({type: FETCH_ITEMS_FAILED, payload: {error}});
            }
        }
    }

    async function saveItemCallback(item: ItemProps) {
        // const items = await saveItemLocal(item);        //salvare item local
        // log('saveItem local succeeded');
        // dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}})
        try {
            log('saveItem started');
            //save local item
            // dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: item}});
            dispatch({type: SAVE_ITEM_STARTED});
            const savedItem = await ((item._id && isNaN(+item._id)) ? updateItem(token, item) : createItem(token, item));
            log('saveItem succeeded');
            // console.log("saved item: ");
            // console.log(savedItem);
            dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item: savedItem}});
            const items = await saveItemLocal(savedItem);        //salvare item local
            log('saveItem local succeeded');
            dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}})
        } catch (error) {
            log('saveItem failed');
            if (error.response && error.response.status === 409) {  //este conflict
                dispatch({type: SAVE_ITEM_FAILED, payload: {error: error, conflict: true}});
            } else{
                dispatch({type: SAVE_ITEM_FAILED, payload: {error: error, conflict: false}});
                const items = await saveItemLocal(item);        //salvare item local
                log('saveItem local succeeded');
                dispatch({type: FETCH_ITEMS_SUCCEEDED, payload: {items: items}})
            }
        }

        async function saveItemLocal(item: ItemProps) {
            const {value} = await Storage.get({key: 'items'});      //get local items
            const items: ItemProps[] = JSON.parse(value!);
            const index = items.findIndex(it => it._id === item._id);
            if (index === -1) {
                if (item._id === undefined) {
                    item._id = (-(items.length + 1)).toString();   //pune un mock _id
                }
                items.splice(0, 0, item);
            } else {
                items[index] = item;
            }
            // items.splice(0, 0, item);
            await Storage.set({key: 'items', value: JSON.stringify(items)})   //save new local items
            return Promise.resolve(items);
        }
    }

    function wsEffect() {
        let canceled = false;
        log('wsEffect - connecting');
        let closeWebSocket: () => void;
        if (token?.trim()) {
            closeWebSocket = newWebSocket(token, message => {
                if (canceled) {
                    return;
                }
                const {type, payload: item} = message;
                log(`ws message, item ${type}`);
                if (type === 'created' || type === 'updated') {
                    dispatch({type: SAVE_ITEM_SUCCEEDED, payload: {item}});
                }
            });
            return () => {
                log('wsEffect - disconnecting');
                canceled = true;
                closeWebSocket();
            }
        }
    }
};
