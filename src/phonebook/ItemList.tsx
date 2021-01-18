import React, {useContext, useState} from 'react';
import {RouteComponentProps} from 'react-router';
import {
    IonContent,
    IonFab,
    IonFabButton,
    IonHeader,
    IonIcon,
    IonList, IonLoading,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSearchbar,
    IonChip,
    IonLabel, IonAlert, CreateAnimation
} from '@ionic/react';
import {
    add,
    logOutOutline,
    starOutline,
    star,
    closeCircle,
    alertCircle,
    checkmarkCircle,
    imagesOutline
} from 'ionicons/icons';
import Item from './Item';
import {getLogger} from '../core';
import {ItemContext} from './ItemProvider';
import {AuthContext} from '../auth';
// import {useNetwork} from "./useNetwork";

const log = getLogger('ItemList');

const ItemList: React.FC<RouteComponentProps> = ({history}) => {
    const {items, fetching, fetchingError, networkStatus, conflict} = useContext(ItemContext);
    const {logout} = useContext(AuthContext);
    const [searchName, setSearchName] = useState<string>("");
    const [favouriteFilter, setFavouriteFilter] = useState<boolean>(false);
    //use photos
    // const {photos} = usePhotoGallery();
    // const {networkStatus} = useNetwork();

    log('render');
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar color="primary">
                    <IonTitle>My Phonebook</IonTitle>
                    <CreateAnimation
                        duration={500}
                        keyframes={[
                            { offset: 0, transform: 'translate(0px)' },
                            { offset: 0.01, color: 'rgb(255,0,0)' },
                            { offset: 0.125, transform: 'translate(5px)' },
                            { offset: 0.25, transform: 'translate(-5px)' },
                            { offset: 0.375, transform: 'translate(5px)' },
                            { offset: 0.5, transform: 'translate(-5px)' },
                            { offset: 0.625, transform: 'translate(5px)' },
                            { offset: 0.75, transform: 'translate(-5px)' },
                            { offset: 0.875, transform: 'translate(5px)' },
                            { offset: 0.99, color: 'rgb(0,0,0)' },
                            { offset: 1, transform: 'translate(0px)' }
                        ]}
                        play={!networkStatus.connected}
                        stop={networkStatus.connected}
                    >
                        <IonLabel slot="end">Connected
                            {networkStatus.connected && (
                                <IonIcon icon={checkmarkCircle}/>
                            )}
                            {!networkStatus.connected && (
                                <IonIcon icon={alertCircle}/>
                            )}
                        </IonLabel>
                    </CreateAnimation>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonLoading isOpen={fetching} message="Fetching items"/>
                <IonSearchbar debounce={500} value={searchName} onIonChange={e => setSearchName(e.detail.value!)}/>
                <IonChip onClick={() => setFavouriteFilter(prevState => !prevState)}>
                    {favouriteFilter && <IonIcon icon={star}/>}
                    {!favouriteFilter && <IonIcon icon={starOutline} color="yellow"/>}
                    <IonLabel color="primary">Favourite</IonLabel>
                    {favouriteFilter && <IonIcon icon={closeCircle}/>}
                </IonChip>
                {items && (
                    <IonList>
                        {items
                            .filter(({favourite}) => favouriteFilter ? favourite === favouriteFilter : true)   //filtrare dupa favorite
                            .filter(({name}) => name.toLowerCase().indexOf(searchName.toLowerCase()) > -1)    //cautare dupa nume
                            .map(({_id, name, number, favourite, dateAdded, photo, position}) =>
                                <Item key={_id} _id={_id} name={name} number={number} favourite={favourite}
                                      photo={photo}
                                      position={position}
                                      dateAdded={dateAdded} onEdit={id => history.push(`/item/${id}`)}/>)}
                    </IonList>
                )}
                {fetchingError && (
                    <div>{fetchingError.message || 'Failed to fetch items'}</div>
                )}
                <IonAlert
                    isOpen={conflict}
                    header={'Save Error'}
                    message={'There is a version conflict. You do not have the latest version of this item'}
                    buttons={['OK']}
                />
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton color="danger" onClick={() => logout && logout()}>
                        <IonIcon icon={logOutOutline}/>
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton color="tertiary" onClick={() => history.push('/gallery')}>
                        <IonIcon icon={imagesOutline}/>
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="end" slot="fixed">
                    <IonFabButton onClick={() => history.push('/item')}>
                        <IonIcon icon={add}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    );
};

export default ItemList;
