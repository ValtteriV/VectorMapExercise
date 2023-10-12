import { API } from "./API";

export function getCookie(cname) {
  let name = cname + "=";
  let ca = document.cookie.split(';');
  for(let i = 0; i < ca.length; i++) {
    let c = ca[i];
    while (c.charAt(0) == ' ') {
      c = c.substring(1);
    }
    if (c.indexOf(name) == 0) {
      return c.substring(name.length, c.length);
    }
  }
  return "";
}

export function clearCookies() {
  document.cookie.split(";").forEach(function(c) { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
}

export async function checkLogin() {
  let auth = getCookie("auth");
  const loginDialog = document.getElementById('dialog');
  if (auth == "") {
    loginDialog.showModal();
  } else {
    const res = await API.login(auth).catch((e) => {
      clearCookies();
      loginDialog.showModel();
    });
    if (res.id) {
      sessionStorage.setItem('userId', res.id);
      const event = new Event("auth-success");
      const map = document.getElementById('map');
      map.dispatchEvent(event);
      return;
    }
    clearCookies();
    loginDialog.showModal();
  }
}


