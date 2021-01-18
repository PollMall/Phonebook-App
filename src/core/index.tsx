// export const baseUrl = 'localhost:3000';
// export const baseUrl = '192.168.0.136:3000';     //de la Deva
export const baseUrl = '192.168.0.4:3000';        //de la Cluj

export const getLogger: (tag: string) => (...args: any) => void =
    tag => (...args) => console.log(tag, ...args);

const log = getLogger('api');

export interface ResponseBody<T> {
    data: T;
}

export function withLogs<T>(promise: Promise<ResponseBody<T>>, fnName: string): Promise<T> {
    log(`${fnName} - started`);
    return promise
        .then(res => {
            log(`${fnName} - succeded`);
            return Promise.resolve(res.data);
        })
        .catch(err => {
            log(`${fnName} - failed`);
            return Promise.reject(err);
        })
}

export const config = {
    headers: {
        'Content-Type' : 'application/json'
    }
}

export const authConfig = (token?: string) => ({
    headers: {
        'Content-type' : 'application/json',
        'Authorization' : `Bearer ${token}`,
    }
})