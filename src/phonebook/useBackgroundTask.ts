import {Plugins} from '@capacitor/core';
import {useEffect} from "react";
import {useNetwork} from "./useNetwork";

const {BackgroundTask} = Plugins;

export const useBackgroundTask = (asyncTask: () => Promise<void>) => {
    const {networkStatus} = useNetwork();
    useEffect(() => {
        if (networkStatus.connected) {
            const taskId = BackgroundTask.beforeExit(async () => {
                console.log("awaiting for asyncTask() before exiting");
                await asyncTask();
                //finishing task
                BackgroundTask.finish({taskId});
            })
        }
        return () => {};
    }, [networkStatus]);

    return {};
}