import axios from 'axios';
import { API_URL } from '@env'; // Ensure you have API_URL in your .env file

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
