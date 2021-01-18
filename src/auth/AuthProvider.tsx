import React, {useCallback, useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {getLogger} from '../core';
import {login as loginApi} from './authApi';
import {Plugins} from '@capacitor/core';

const log = getLogger('AuthProvider');

const {Storage} = Plugins;

type LoginFn = (username?: string, password?: string) => void;

type LogoutFn = () => void;

export interface AuthState {
    authenticationError: Error | null;
    isAuthenticated: boolean;
    isAuthenticating: boolean;
    login?: LoginFn;
    pendingAuthentication?: boolean;
    username?: string;
    password?: string;
    token: string;
    logout?: LogoutFn;
}

const initialState: AuthState = {
    isAuthenticated: false,
    isAuthenticating: false,
    authenticationError: null,
    pendingAuthentication: false,
    token: '',
};

export const AuthContext = React.createContext<AuthState>(initialState);

interface AuthProviderProps {
    children: PropTypes.ReactNodeLike,
}

export const AuthProvider: React.FC<AuthProviderProps> = ({children}) => {
    const [state, setState] = useState<AuthState>(initialState);
    const {isAuthenticated, isAuthenticating, authenticationError, pendingAuthentication, token} = state;
    const login = useCallback<LoginFn>(loginCallback, []);
    const logout = useCallback<LogoutFn>(logoutCallback, []);
    useEffect(authenticationEffect, [pendingAuthentication]);
    useEffect(verifyLocalTokenEffect, []);     //verifica daca exista un token local si il seteaza in token;
    const value = {isAuthenticated, login, isAuthenticating, authenticationError, token, logout};
    log('render');

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );

    function verifyLocalTokenEffect() {
        verifyLocalToken();
        return () => {
            //cleanup;
        }
    }

    async function verifyLocalToken() {
        const { value } = await Storage.get({key: 'user'});
        if (value){
            setState((prevState => ({...prevState, isAuthenticated: true, token: value})));
        }
    }

    function logoutCallback(): void {
        log('logout');
        setState({
            ...state,
            isAuthenticated: false,
            // token: '',
        });
        removeLocalToken();

        async function removeLocalToken() {
            await Storage.remove({key: 'user'});    //remove local token
            await Storage.remove({key: 'items'})    //remove local items
            // console.log("Am sters");
            // console.log(Storage.get({key: username || ''}));
        }
    };

    function loginCallback(username?: string, password?: string): void {
        log('login');

        setState({
            ...state,
            pendingAuthentication: true,
            username,
            password
        });
    }

    function authenticationEffect() {
        let canceled = false;
        authenticate();
        return () => {
            canceled = true;
        }

        async function authenticate() {
            if (!pendingAuthentication) {
                log(`authenticate, pendingAuthentication, return`);
                return;
            }
            try {
                log('authenticate...');
                setState({
                    ...state,
                    isAuthenticated: true,
                });
                const {username, password} = state;
                const {token} = await loginApi(username, password);
                saveTokenLocal(token);
                if (canceled) {
                    return;
                }
                log('authenticate succeeded');
                setState({
                    ...state,
                    token,
                    pendingAuthentication: false,
                    isAuthenticated: true,
                    isAuthenticating: false,
                });
            } catch (error) {
                if (canceled) {
                    return;
                }
                log('authenticate failed');
                setState({
                    ...state,
                    authenticationError: error,
                    pendingAuthentication: false,
                    isAuthenticating: false,
                });
            }

            async function saveTokenLocal(token: string) {      //salveaza local token-ul
                await Storage.set({
                    key: 'user',
                    value: token,
                });
            }
        }
    }
}
