const KEY='reelo_token';

let memoryToken=null;

export function getToken() {
    if(memoryToken) return memoryToken;

    try {
        return localStorage.getItem(KEY) || sessionStorage.getItem(KEY);
    } catch {
        return null;
    }
}

export function clearToken() {
    memoryToken=null;

    try {
        localStorage.removeItem(KEY);
        sessionStorage.removeItem(KEY);
    } catch {

    }
}

export function saveToken(token,remember){
    clearToken();
    memoryToken=token;

    try {
        (remember ? localStorage : sessionStorage).setItem(KEY,token);
    } catch {

    }
}

