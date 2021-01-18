import {RouteComponentProps} from "react-router";
import {
    IonCol,
    IonContent, IonFab,
    IonFabButton,
    IonGrid,
    IonHeader, IonIcon,
    IonImg,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar
} from "@ionic/react";
import React from "react";
import {arrowBackOutline} from "ionicons/icons";
import {useMyLocation} from "./useMyLocation";
import {MyMap} from "./MyMap";

const Map: React.FC<RouteComponentProps> = ({history}) => {
    const myLocation = useMyLocation();
    const {latitude: lat, longitude: lng} = myLocation.position?.coords || {}

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Map</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                {lat && lng &&
                <MyMap
                    lat={lat}
                    lng={lng}
                    onMapClick={console.log('onMap')}
                    onMarkerClick={console.log('onMarker')}
                />}
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton color="primary" onClick={() => history.push('/items')}>
                        <IonIcon icon={arrowBackOutline}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    )
}

export default Map;