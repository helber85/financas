const API_BASE_URL = "http://localhost:8000/api/transacoes/";

async function fetchApi(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
        "Content-Type": "application/json",
        ...options.headers,
    };

    try {
        const response = await fetch(url, { ...options, headers });

        if (!response.ok) {
            const errorBody = await response.text();
            throw new Error(`Erro na API: ${response.status} - ${errorBody || response.statusText}`);
        }

        if (response.status === 204) { // Handle "No Content" for DELETE
            return true;
        }

        return response.json();
    } catch (error) {
        console.error(`Falha na chamada da API para ${url}:`, error);
        throw error; // Re-throw to allow caller to handle it
    }
}

export async function carregarTransacoes() {
    try {
        return await fetchApi('');
    } catch (error) {
        return null;
    }
}

export async function carregarTransacaoPorId(id) {
    try {
        return await fetchApi(`${id}/`);
    } catch (error) {
        return null;
    }
}

export async function deletarTransacao(id) {
    try {
        return await fetchApi(`${id}/`, { method: 'DELETE' });
    } catch (error) {
        return false;
    }
}

export async function cadastrarTransacao(dados) {
    try {
        return await fetchApi('', {
            method: 'POST',
            body: JSON.stringify(dados),
        });
    } catch (error) {
        return null;
    }
}

export async function atualizarTransacao(id, dados) {
    try {
        return await fetchApi(`${id}/`, {
            method: 'PUT',
            body: JSON.stringify(dados),
        });
    } catch (error) {
        return null;
    }
}