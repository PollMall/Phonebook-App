import React, {useContext, useState} from 'react';
import {Redirect} from 'react-router-dom';
import {RouteComponentProps} from 'react-router';
import {IonButton, IonContent, IonHeader, IonInput, IonLoading, IonPage, IonTitle, IonToolbar} from '@ionic/react';
import {AuthContext} from './AuthProvider';
import {getLogger} from '../core';

const log = getLogger('Login');


interface LoginState {
    username?: string;
    password?: string;
}

export const Login: React.FC<RouteComponentProps> = ({history}) => {
    const {isAuthenticated, isAuthenticating, login, authenticationError} = useContext(AuthContext);
    const [state, setState] = useState<LoginState>({});
    const {username, password} = state;
    // const localToken = getLocalToken().then(res => res);

    const handleLogin = () => {
        log('handleLogin...');
        login?.(username, password);
    };
    log('render');
    console.log('isAuthenticated = ' + isAuthenticated);
    if (isAuthenticated) {
        console.log("AM TOKEEEEEEEEEN");
        return <Redirect to={{pathname: '/'}}/>
    }
    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>Login</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent>
                <IonInput
                    placeholder="Username"
                    value={username}
                    onIonChange={e => setState({
                        ...state,
                        username: e.detail.value || ''
                    })}/>
                <IonInput
                    placeholder="Password"
                    value={password}
                    onIonChange={e => setState({
                        ...state,
                        password: e.detail.value || ''
                    })}/>
                <IonLoading isOpen={isAuthenticating}/>
                {authenticationError && (
                    <div>{authenticationError.message || 'Failed to authenticate'}</div>
                )}
                <IonButton onClick={handleLogin} expand="block">Login</IonButton>
            </IonContent>
        </IonPage>
    );
};