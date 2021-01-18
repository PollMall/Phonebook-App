import React, {useContext, useEffect, useState} from "react";
import {
    IonButton,
    IonButtons,
    IonCheckbox,
    IonContent, IonFab, IonFabButton,
    IonHeader, IonIcon,
    IonInput,
    IonItem,
    IonLabel,
    IonPage,
    IonTitle,
    IonToolbar,
    IonImg, IonCard, IonActionSheet, IonCardHeader, IonCardTitle, createAnimation,
} from "@ionic/react";
import {getLogger} from "../core";
import {ItemContext} from "./ItemProvider";
import {RouteComponentProps} from "react-router";
import {ItemProps} from "./ItemProps";
import {arrowBackOutline, cameraOutline, trash, close} from "ionicons/icons";
import {Photo, usePhotoGallery} from "./usePhotoGallery";
import {MyMap} from "./MyMap";
import {useMyLocation} from "./useMyLocation";
import {PositionProps} from "./Item";

const log = getLogger("ItemEdit");

interface ItemEditProps
    extends RouteComponentProps<{
        id?: string;
    }> {
}


const ItemEdit: React.FC<ItemEditProps> = ({history, match}) => {
    const {items, saving, savingError, saveItem} = useContext(ItemContext);
    const [name, setName] = useState("");
    const [number, setNumber] = useState("");
    const [favourite, setFavourite] = useState(false);
    const [currentPhoto, setCurrentPhoto] = useState<Photo>();
    const [photoToDelete, setPhotoToDelete] = useState<Photo>();
    const [item, setItem] = useState<ItemProps>();
    //use camera
    const {photos, takePhoto, deletePhoto} = usePhotoGallery();
    //use location and map
    const [showMap, setShowMap] = useState(false);
    const myLocation = useMyLocation();
    const {latitude, longitude} = myLocation.position?.coords || {}
    const [position, setPosition] = useState<PositionProps>({});
    //use animation
    // const [validInputs, setValidInputs] = useState<boolean>(true);

    useEffect(() => {
        log("useEffect");
        const routeId = match.params.id || "";
        const item = items?.find((it) => it._id === routeId);
        setItem(item);
        if (item) {
            setName(item.name);
            setNumber(item.number);
            setFavourite(item.favourite!);
            setCurrentPhoto(item.photo);
            setPosition(item.position || {});
        }
    }, [match.params.id, items]);
    useEffect(() => {
        chainedAnimationRequiredInput();
    }, []);
    // useEffect(() => {
    //     if(!validInputs) {
    //         groupedAnimationRequiredInput();
    //     }
    // }, [validInputs]);
    const handleSave = () => {
        const editedItem = item ? {...item, name, number, favourite, photo: currentPhoto, position} : {
            name,
            number,
            favourite,
            dateAdded: new Date(),
            photo: currentPhoto,
            position
        };
        if (name && number) {
            // setValidInputs(true);
            saveItem && saveItem(editedItem).then(() => history.goBack());
        } else {
            // setValidInputs(false);
            groupedAnimationRequiredInput();
        }
    };
    const handleTakePhoto = async () => {
        const photo = await takePhoto();
        // setCurrentPhoto(photos[0]);
        setCurrentPhoto(photo);
    };
    const handleOnMapClick = ({latLng}: any) => {
        const lat = latLng.lat();
        const lng = latLng.lng();
        console.log(latLng);
        console.log(lat + ";" + lng);
        setPosition({latitude: lat, longitude: lng});
    };

    function groupedAnimationRequiredInput() {
        const nameItem = document.querySelector("#nameItem");
        const numberItem = document.querySelector("#numberItem");
        if (nameItem && numberItem) {
            const animationNameColor = createAnimation()
                .addElement(nameItem)
                .keyframes(
                    [
                        {offset: 0, color: 'rgb(0,0,0)', transform: 'scale(1)'},
                        {offset: 0.5, color: 'rgb(255,0,0)', transform: 'scale(1.1)'},
                        {offset: 1, color: 'rgb(0,0,0)', transform: 'scale(1)'}
                    ]
                )
            const animationNumberColor = createAnimation()
                .addElement(numberItem)
                .keyframes(
                    [
                        {offset: 0, color: 'rgb(0,0,0)', transform: 'scale(1)'},
                        {offset: 0.5, color: 'rgb(255,0,0)', transform: 'scale(1.1)'},
                        {offset: 1, color: 'rgb(0,0,0)', transform: 'scale(1)'}
                    ]
                )
            const groupedAnimationColor = createAnimation()
                .duration(500)
                .addAnimation([animationNumberColor, animationNameColor]);
            groupedAnimationColor.play();
        }
    }

    async function chainedAnimationRequiredInput() {
        const nameItem = document.querySelector("#nameItem");
        const numberItem = document.querySelector("#numberItem");
        if (nameItem && numberItem) {
            const animationNameShake = createAnimation()
                .duration(500)
                .addElement(nameItem)
                .keyframes([
                    {offset: 0, transform: 'translate(0px)'},
                    {offset: 0.125, transform: 'translate(5px)'},
                    {offset: 0.25, transform: 'translate(-5px)'},
                    {offset: 0.375, transform: 'translate(5px)'},
                    {offset: 0.5, transform: 'translate(-5px)'},
                    {offset: 0.625, transform: 'translate(5px)'},
                    {offset: 0.75, transform: 'translate(-5px)'},
                    {offset: 0.875, transform: 'translate(5px)'},
                    {offset: 1, transform: 'translate(0px)'}
                ])
            const animationNumberShake = createAnimation()
                .duration(500)
                .addElement(numberItem)
                .keyframes([
                    {offset: 0, transform: 'translate(0px)'},
                    {offset: 0.125, transform: 'translate(5px)'},
                    {offset: 0.25, transform: 'translate(-5px)'},
                    {offset: 0.375, transform: 'translate(5px)'},
                    {offset: 0.5, transform: 'translate(-5px)'},
                    {offset: 0.625, transform: 'translate(5px)'},
                    {offset: 0.75, transform: 'translate(-5px)'},
                    {offset: 0.875, transform: 'translate(5px)'},
                    {offset: 1, transform: 'translate(0px)'}
                ])
            await animationNameShake.play();
            await animationNumberShake.play();
        }
    }

    log("render");
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Edit contact</IonTitle>
                    <IonButtons slot="end">
                        <IonButton onClick={handleSave}>Save</IonButton>
                    </IonButtons>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonItem id="nameItem">
                    <IonLabel position="floating">Name</IonLabel>
                    <IonInput
                        value={name}
                        onIonChange={(e) => setName(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem id="numberItem">
                    <IonLabel position="floating">Number</IonLabel>
                    <IonInput
                        type="number"
                        value={number}
                        onIonChange={(e) => setNumber(e.detail.value || "")}
                    />
                </IonItem>
                <IonItem>
                    <IonLabel>Favourite: {favourite}</IonLabel>
                    <IonCheckbox
                        checked={favourite}
                        onIonChange={(e) => setFavourite(e.detail.checked)}
                    />
                </IonItem>
                <IonItem>
                    <IonCard>
                        {!!currentPhoto &&
                        <IonImg src={currentPhoto.webviewPath} alt="Item image"
                                onClick={() => setPhotoToDelete(currentPhoto)}/>
                        }
                        <IonCardHeader>
                            <IonCardTitle>Photo</IonCardTitle>
                        </IonCardHeader>
                    </IonCard>
                </IonItem>
                <IonButton expand="block" color="light" onClick={() => setShowMap(true)}>
                    Add location on Map
                </IonButton>
                {showMap && latitude && longitude &&
                <>
                    <MyMap
                        lat={position.latitude || latitude}
                        lng={position.longitude || longitude}
                        onMapClick={handleOnMapClick}
                        onMarkerClick={() => console.log('onMarker')}
                    />
                    <IonButton expand="block" color="light" onClick={() => setShowMap(false)}>
                        Close Map
                    </IonButton>
                </>}
                {savingError && (
                    <div>{savingError.message || "Failed to save item"}</div>
                )}

                <IonFab vertical="bottom" horizontal="start" slot="fixed">
                    <IonFabButton color="primary" onClick={() => history.push('/items')}>
                        <IonIcon icon={arrowBackOutline}/>
                    </IonFabButton>
                </IonFab>
                <IonFab vertical="bottom" horizontal="center" slot="fixed">
                    <IonFabButton color="primary" onClick={() => {
                        handleTakePhoto();
                    }}>
                        <IonIcon icon={cameraOutline}/>
                    </IonFabButton>
                </IonFab>
                <IonActionSheet
                    isOpen={!!photoToDelete}
                    buttons={[{
                        text: 'Delete',
                        role: 'destructive',
                        icon: trash,
                        handler: () => {
                            if (photoToDelete) {
                                deletePhoto(photoToDelete);
                                setPhotoToDelete(undefined);
                                setCurrentPhoto(undefined);
                            }
                        }
                    }, {
                        text: 'Cancel',
                        icon: close,
                        role: 'cancel'
                    }]}
                    onDidDismiss={() => setPhotoToDelete(undefined)}
                />
            </IonContent>
        </IonPage>
    );
};

export default ItemEdit;
