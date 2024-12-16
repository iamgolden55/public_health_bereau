// lib/api.js

const API_URL = 'http://localhost:8000/api';

export async function fetchPosts() {
    const res = await fetch(`${API_URL}/posts/`);
    if (!res.ok) {
        throw new Error('Failed to fetch posts');
    }
    return res.json();
}