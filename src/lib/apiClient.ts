const API_BASE_URL = 'http://localhost:3001/api';

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const token = localStorage.getItem('authToken');

    const headers = new Headers({
        'Content-Type': 'application/json',
        ...options?.headers,
    });
    
    if (token) {
        headers.append('Authorization', `Bearer ${token}`);
    }

    const response = await fetch(url, { ...options, headers });

    if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: 'Erro na resposta da API' }));
        throw new Error(errorBody.error || `Erro ${response.status}: ${response.statusText}`);
    }
    
    if (response.status === 204) {
        return null as T;
    }

    return response.json();
}

export const apiClient = {
    get: <T>(endpoint: string) => request<T>(endpoint),
    post: <T, B>(endpoint: string, body: B) => request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
    put: <T, B>(endpoint: string, body: B) => request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
    delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
