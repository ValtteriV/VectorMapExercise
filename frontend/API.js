import { getCookie } from "./checkLogin";

const apiEndpoint = import.meta.env.VITE_use_reverse_proxy_backend === 'true' 
? ''
: `http://${import.meta.env.VITE_api_host}${import.meta.env.VITE_api_port ? ':' + import.meta.env.VITE_api_port : ''}`;
let userAuth = undefined;
let userId = undefined;
export const API = {

  login: async (auth) => {
    const resp = await fetch(`${apiEndpoint}/api/login/`, {
      method: "GET",
      headers: {
        Authorization: auth
      }
    });
    return await resp.json();
  },

  register: async (username, password) => {
    const resp = await fetch(`${apiEndpoint}/api/register/`, {
      method: "POST",
      body: JSON.stringify({
        username,
        password
      }),
      headers: {
        "Content-type": 'application/json; charset=UTF-8'
      }
    });
    return await resp.json();
  },

  getPoints: async () => {
    if (!userAuth || !userId) {
      userAuth = getCookie('auth');
      userId = sessionStorage.getItem('userId');
    }
    const resp = await fetch(`${apiEndpoint}/api/points/`, { 
      method: "GET",
      headers: {
        Authorization: userAuth
      }
    });
    return await resp.json();
  },

  savePoint: async (coords) => {
    if (!userAuth || !userId) {
      userAuth = getCookie('auth');
      userId = sessionStorage.getItem('userId');
    }
    const resp = await fetch(`${apiEndpoint}/api/points/`, {
      method: 'POST',
      headers: {
        Authorization: userAuth,
        "Content-type": 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        x: Math.floor(coords[1]),
        y: Math.floor(coords[0]),
        created_by: userId,
      })
    });
    return await resp.json();
  },

  updatePoint: async (feature) => {
    if (!userAuth || !userId) {
      userAuth = getCookie('auth');
      userId = sessionStorage.getItem('userId');
    }

    const pointId = feature.get('pointId');
    const coords = feature.get('geometry').getCoordinates();
    const label = feature.get('label');

    const resp = await fetch(`${apiEndpoint}/api/points/${pointId}/`, {
      method: 'PUT',
      headers: {
        Authorization: userAuth,
        "Content-type": 'application/json; charset=UTF-8'
      },
      body: JSON.stringify({
        x: Math.floor(coords[1]),
        y: Math.floor(coords[0]),
        label: label,
      })
    });
  }
  
};
