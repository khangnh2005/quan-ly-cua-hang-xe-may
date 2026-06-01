import { getCookie } from '../helpers/cookie';

const API_DOMAIN = "/api/";

function getAuthHeaders() {
    const token = getCookie('token');
    if (token) {
        return { 'Authorization': `Bearer ${token}` };
    }
    return {};
}

export const get = async(path) =>{
    const response = await fetch(API_DOMAIN + path, {
        method: 'GET',
        headers: {
            ...getAuthHeaders()
        },
        credentials: 'include'
    });
    const result = await response.json();
    return result;
}

export const post = async(path , data) =>{
    const response = await fetch(API_DOMAIN+ path, {
        method: "POST",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
}

export const del = async(path)=>{
    const response = await fetch(API_DOMAIN + path, {
        method: "DELETE",
        headers: {
            ...getAuthHeaders()
        },
        credentials: 'include'
    });
    const result = await response.json();
    return result;
}

export const patch = async(path, data)=>{
    const response = await fetch(API_DOMAIN + path, {
        method: "PATCH",
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
            ...getAuthHeaders()
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    const result = await response.json();
    return result;
}