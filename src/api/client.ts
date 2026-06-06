const API_URL = '/api';

function getHeaders() {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  };
  const apiKey = localStorage.getItem('SERVERFS_API_KEY');
  if (apiKey) {
    headers['x-api-key'] = apiKey;
  }
  return headers;
}

export const fileApi = {
  async listFiles(path: string = '/') {
    const res = await fetch(`${API_URL}/files?path=${encodeURIComponent(path)}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async getInfo(path: string) {
    const res = await fetch(`${API_URL}/info?path=${encodeURIComponent(path)}`, {
      headers: getHeaders()
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async createFolder(path: string) {
    const res = await fetch(`${API_URL}/folder`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ path })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async uploadFiles(path: string, files: File[]) {
    const formData = new FormData();
    formData.append('path', path);
    for (const f of files) {
      formData.append('files', f);
    }
    
    const headers: Record<string, string> = {};
    const apiKey = localStorage.getItem('SERVERFS_API_KEY');
    if (apiKey) headers['x-api-key'] = apiKey;

    const res = await fetch(`${API_URL}/upload`, {
      method: 'POST',
      headers,
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async renameItem(oldPath: string, newName: string) {
    const res = await fetch(`${API_URL}/rename`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ oldPath, newName })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async deleteItem(path: string) {
    const res = await fetch(`${API_URL}/delete`, {
      method: 'DELETE',
      headers: getHeaders(),
      body: JSON.stringify({ path })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async bulkDelete(paths: string[]) {
    const res = await fetch(`${API_URL}/bulk-delete`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paths })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.json();
  },

  async bulkDownload(paths: string[]) {
    const res = await fetch(`${API_URL}/bulk-download`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ paths })
    });
    if (!res.ok) throw new Error(await res.text());
    return res.blob();
  },
  
  getDownloadUrl(path: string) {
    let url = `${window.location.origin}${API_URL}/download?path=${encodeURIComponent(path)}`;
    const apiKey = localStorage.getItem('SERVERFS_API_KEY');
    if (apiKey) url += `&apiKey=${encodeURIComponent(apiKey)}`;
    return url;
  }
};
