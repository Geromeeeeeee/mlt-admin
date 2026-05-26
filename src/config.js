const isLocalhost = window.location.hostname === 'localhost';

export const API_BASE_URL = isLocalhost 
  ? 'http://localhost/mlt-admin'
  : 'https://mlt-admin.mltcarrental.online';