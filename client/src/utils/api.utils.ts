import axios from 'axios';

/** Émis quand l'API répond 401 hors connexion : la session a expiré côté serveur. */
export const UNAUTHORIZED_EVENT = 'solidhive:unauthorized';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
  // Une instance gratuite endormie met jusqu'à une minute à répondre : on
  // attend plutôt que d'échouer trop tôt, mais pas indéfiniment.
  timeout: 90_000,
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error?.response?.status;
    const url: string = error?.config?.url ?? '';
    if (status === 401 && !url.includes('auth/login')) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);

export default api;
