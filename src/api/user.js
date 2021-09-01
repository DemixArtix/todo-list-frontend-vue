// @/api/user.js
import api from '@/api/index';

// access токен хранится в замыкании модуля webpack
// и не доступен извне
let accessToken = localStorage.getItem('accessToken') || null;

const getAccessToken = () => accessToken;

// флаг skipAuth понадобится
// чтобы интерцептор игнорировал запросы на получение токенов,
// иначе попадем в рекурсию
async function login({ email, password }) {
  return await api({
    method: 'post',
    url: '/login',
    data: {email, password},
    skipAuth: true,
  }).then(res => {
    const {data} = res;
    accessToken = data.accessToken;
    return data;
  });

}

// refresh токен хранится в httpOnly cookie, не доступен для js
// и не управляется с фронта
async function refreshToken() {
  return await api({
    method: 'post',
    url: '/refresh_token',
    skipAuth: true,
  }).then(res => {
    console.log(res);
    const {data} = res;
    accessToken = data.accessToken;
    return data;
  });
}

export { login, refreshToken, getAccessToken };