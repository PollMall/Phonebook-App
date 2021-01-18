import React, { useState } from 'react';

import {
    IonModal,
    IonButton,
    IonContent,
    createAnimation,
    IonHeader,
    IonToolbar,
    IonTitle
} from '@ionic/react';
import {MyMap} from "./MyMap";

export interface PositionProps {
    latitude?: number,
    longitude?: number
}

export const AnimatedMap: React.FC<PositionProps> = (position) => {
    const [showMap, setShowMap] = useState(false);
    const {latitude: lat, longitude: lng} = position || {};

    const enterAnimation = (baseEl: any) => {
        const backdropAnimation = createAnimation()
            .addElement(baseEl.querySelector('ion-backdrop')!)
            .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

        const wrapperAnimation = createAnimation()
            .addElement(baseEl.querySelector('.modal-wrapper')!)
            .keyframes([
                { offset: 0, opacity: '0', transform: 'scale(0)' },
                { offset: 1, opacity: '0.99', transform: 'scale(1)' }
            ]);

        return createAnimation()
            .addElement(baseEl)
            .easing('ease-out')
            .duration(500)
            .addAnimation([backdropAnimation, wrapperAnimation]);
    }

    const leaveAnimation = (baseEl: any) => {
        return enterAnimation(baseEl).direction('reverse');
    }

    return (
        <>
            <IonButton color="light" onClick={() => setShowMap(true)}>
                View on map
            </IonButton>
            <IonModal isOpen={showMap} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>
                            Map
                        </IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    {showMap && lat && lng &&
                    <MyMap
                        lat={lat}
                        lng={lng}
                        onMapClick={() => console.log('onMap')}
                        onMarkerClick={() => console.log('onMarker')}
                    />}
                    <IonButton expand="block" color="light" onClick={() => setShowMap(false)}>
                        Close
                    </IonButton>
                </IonContent>
            </IonModal>
        </>
    );
};