import { getCookie } from '../helpers/cookie';

const API_DOMAIN = '/api/';

function getAuthHeaders() {
    // Ưu tiên admin token
    const adminToken = getCookie('adminToken') || localStorage.getItem('adminToken');
    if (adminToken && adminToken !== 'undefined' && adminToken !== 'null') {
        return { 'Authorization': `Bearer ${adminToken}` };
    }
    // Fallback: gửi customer token nếu có (backend xác thực customer qua token này)
    const customerToken = getCookie('token');
    if (customerToken && customerToken !== 'undefined' && customerToken !== 'null') {
        return { 'Authorization': `Bearer ${customerToken}` };
    }
    return {};
}

export const get = async (path) => {
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

export const post = async (path, data) => {
    const authHeaders = getAuthHeaders();
    console.log(`[POST ${path}] Auth headers:`, authHeaders);
    console.log(`[POST ${path}] Request body:`, JSON.stringify(data, null, 2));
    
    const response = await fetch(API_DOMAIN + path, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            ...authHeaders
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    const result = await response.json();
    result._status = response.status;
    result._ok = response.ok;
    console.log(`[POST ${path}] Response status:`, response.status);
    console.log(`[POST ${path}] Response body:`, result);
    return result;
}

// Hàm postWithoutAuth: gọi API POST không kèm Authorization header
// Dùng cho các endpoint không yêu cầu JWT token (ví dụ: đặt hàng customer)
export const postWithoutAuth = async (path, data) => {
    console.log(`[POST ${path} (no auth)] Request body:`, JSON.stringify(data, null, 2));
    
    const response = await fetch(API_DOMAIN + path, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(data)
    });
    const result = await response.json();
    result._status = response.status;
    result._ok = response.ok;
    console.log(`[POST ${path} (no auth)] Response status:`, response.status);
    console.log(`[POST ${path} (no auth)] Response body:`, result);
    return result;
}

export const del = async (path) => {
    const response = await fetch(API_DOMAIN + path, {
        method: 'DELETE',
        headers: {
            ...getAuthHeaders()
        },
        credentials: 'include'
    });
    const result = await response.json();
    return result;
}

export const patch = async (path, data) => {
  const response = await fetch(API_DOMAIN + path, {
      method: 'PATCH',
      headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          ...getAuthHeaders()
      },
      credentials: 'include',
      body: JSON.stringify(data)
  });
  const result = await response.json();
  return result;
}

export const uploadFile = async (path, formData) => {
  const response = await fetch(API_DOMAIN + path, {
      method: 'POST',
      headers: {
          ...getAuthHeaders()
      },
      credentials: 'include',
      body: formData
  });
  const result = await response.json();
  return result;
}
