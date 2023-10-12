import { API } from './API';

function setCookie(cname, cvalue, exdays) {
  const d = new Date();
  d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
  let expires = "expires="+d.toUTCString();
  document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function basicAuth(user, password) {
  const token = user + ':' + password;
  return `Basic ${btoa(token)}`;  
}

const event = new Event("auth-success");

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
  } else {
    alert('Wrong username or password');
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
  const res = await API.register(username, password);
  if (res.id) {
    sessionStorage.setItem('userId', res.id);
    setCookie('auth', auth, 7);
    const loginDialog = document.getElementById('dialog');
    loginDialog.close();
    map.dispatchEvent(event);
  } else {
    alert('registration failed');
  }
});
