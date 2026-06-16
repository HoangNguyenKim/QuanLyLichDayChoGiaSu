import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosClient.interceptors.response.use(
  (response) => {
    // If the response contains warning flag from our backend, 
    // we can handle it at the component level or show a toast here.
    return response.data;
  },
  (error) => {
    // Handle global errors here
    return Promise.reject(error.response?.data || error.message);
  }
);

export default axiosClient;
