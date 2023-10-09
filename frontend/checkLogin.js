import { API } from "./API";

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

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


export async function checkCookie() {
  let auth = getCookie("auth");
  if (auth == "") {
    const loginDialog = document.getElementById('dialog');
    loginDialog.showModal();
  } else {
    const res = await API.login(auth);
    if (res.id) {
      sessionStorage.setItem('userId', res.id);
      const event = new Event("auth-success");
      const map = document.getElementById('map');
      map.dispatchEvent(event);
    } else {
      document.cookie = undefined;
      loginDialog.showModal();
    }
  }
}

function basicAuth(user, password) {
  const token = user + ':' + password;
  return `Basic ${btoa(token)}`;  
}

const submitLogin = document.getElementById('submit-login');
console.log(submitLogin);
submitLogin.addEventListener('click', async (e) => {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const auth = basicAuth(username, password);
  e.preventDefault();
  const res = await API.login(auth);
  if (res.id) {
    sessionStorage.setItem('userId', res.id);
    setCookie('auth', auth, 7);
    //Better way to do this would be to fetch user based on auth on each login
    setCookie('userId', res.id, 7);
    const loginDialog = document.getElementById('dialog');
    loginDialog.close();
    map.dispatchEvent(event);

  }
  console.log(res);
});

const submitRegister = document.getElementById('submit-register');
submitRegister.addEventListener('click', async (e) => {
  e.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const auth = basicAuth(username, password);
  e.preventDefault();
  const resp = await fetch(`${apiEndpont}/register/`, {
    method: "POST",
    body: JSON.stringify({
      username,
      password
    }),
    headers: {
      "Content-type": 'application/json; charset=UTF-8'
    }
  })
  const res = await resp.json();
  if (res.id) {
    sessionStorage.setItem('userId', res.id);
    setCookie('auth', auth, 7);
    const loginDialog = document.getElementById('dialog');
    loginDialog.close();
    map.dispatchEvent(event);
  }
});

