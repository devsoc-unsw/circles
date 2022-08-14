import axios from 'axios';

// fallback to localhost port 8000 if env variable is not specified
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_API_BASE_URL || 'http://localhost:8000/';

axios.defaults.headers.post['Content-Type'] = 'application/json';
