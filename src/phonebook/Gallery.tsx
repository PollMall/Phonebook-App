import {RouteComponentProps} from "react-router";
import {usePhotoGallery} from "./usePhotoGallery";
import React from "react";
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
import {arrowBackOutline} from "ionicons/icons";


const Gallery: React.FC<RouteComponentProps> = ({history}) => {
    const {photos} = usePhotoGallery();

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Gallery</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonGrid>
                    <IonRow>
                        {
                            photos.map((photo,index) => {
                                return (
                                    <IonCol size="4" key={index}>
                                        <IonImg src={photo.webviewPath} alt="Photo"/>
                                    </IonCol>)
                            })
                        }
                    </IonRow>
                </IonGrid>
                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton color="primary" onClick={() => history.push('/items')}>
                        <IonIcon icon={arrowBackOutline}/>
                    </IonFabButton>
                </IonFab>
            </IonContent>
        </IonPage>
    )
}

export default Gallery;