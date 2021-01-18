import React, {useState} from 'react';
import {
    IonAvatar,
    IonButton,
    IonIcon,
    IonImg,
    IonItem,
    IonLabel,
    IonText,
    IonModal,
    IonTitle,
    IonToolbar, IonHeader, IonContent
} from '@ionic/react';
import {callOutline, star} from "ionicons/icons";
import {ItemProps} from './ItemProps';
import {MyMap} from "./MyMap";
import {useMyLocation} from "./useMyLocation";
import {AnimatedMap} from "./AnimatedMap";

interface ItemPropsExt extends ItemProps {
    onEdit: (_id?: string) => void;
}

export interface PositionProps {
    latitude?: number,
    longitude?: number
}

const Item: React.FC<ItemPropsExt> = ({_id, name, number, favourite, dateAdded, photo, position, onEdit}) => {
    // const [showMap, setShowMap] = useState(false);
    // const myLocation = useMyLocation();
    // const {latitude: lat, longitude: lng} = myLocation.position?.coords || {}
    const {latitude: lat, longitude: lng} = position || {};

    return (
        <IonItem>
            <IonLabel className="ion-text-wrap" onClick={() => onEdit(_id)}>
                <IonText color="primary">
                    <h2>{favourite && (<IonIcon icon={star}/>)} {name}</h2>
                    <h3><IonIcon icon={callOutline}/> {number}</h3>
                </IonText>
            </IonLabel>
            <AnimatedMap latitude={lat} longitude={lng} />
            {
                !!photo &&
                <IonAvatar slot="end">
                    <IonImg src={photo?.webviewPath} alt="Avatar Photo"/>
                </IonAvatar>
            }
        </IonItem>
    );
};

export default Item;
