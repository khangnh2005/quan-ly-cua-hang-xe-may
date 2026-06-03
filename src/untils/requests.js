import { getCookie } from '../helpers/cookie';

const API_DOMAIN = "/api/";

function getAuthHeaders() {
    // Check cookies first, then localStorage as backup
    const token = getCookie('token') || getCookie('adminToken') || localStorage.getItem('adminToken') || localStorage.getItem('token');
    console.log('API Auth Token:', token ? token.substring(0, 20) + '...' : 'NONE');
    if (token && token !== 'undefined' && token !== 'null' && token !== 'DEMO_ADMIN_001') {
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
    // Attach status code to result for reference
    result._status = response.status;
    result._ok = response.ok;
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

export const uploadFile = async(path, formData)=>{
  const response = await fetch(API_DOMAIN + path, {
      method: "POST",
      headers: {
          ...getAuthHeaders()
          // Note: Content-Type will be set automatically by browser for FormData
      },
      credentials: 'include',
      body: formData
  });
  const result = await response.json();
  return result;
}
