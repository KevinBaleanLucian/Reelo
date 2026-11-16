import api from "./api.js";

export async function loginRequest({email,password,rememberMe}) {
    const {data}=await api.post('/auth/login', {email,password,rememberMe});

    return data;
}

export async function registerRequest(values){
    const {data} = await api.post('/auth/register',values);
    return data.user;
}
export async function fetchCurrentUser() {
    const {data} = await api.get('/auth/me');
    return data.user;
}

