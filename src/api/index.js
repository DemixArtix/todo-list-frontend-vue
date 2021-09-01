import axios from 'axios';
import config from './config';
import { getAccessToken } from '@/api/user';
import store from '@/store';
import mutations from '@/store/mutations';
// import { showErrors } from '@/utils/messages.js';

// переменная для хранения запроса токена
let refreshTokenRequest = null;

const { AUTH_LOGOUT, AUTH_REFRESH } = mutations;



const api = axios.create({
  baseURL: config.url,
  headers: config.headers,
  withCredentials: true,
  // ошибки со статусом кода меньше 500 обрабатываем на фронте
  validateStatus: (status) => status < 500,
});

// запросить валидный аксесс токен
async function requestValidAccessToken() {
  // сначала запоминаем текущий accessToken из хранилища
  let accessToken = getAccessToken();
  // приводим текущее время к unix timestamp
  const now = Math.floor(Date.now() * 0.001);

  if (!store.getters.isRefreshTokenValid(now)) {
    // Если рефреш токен устарел, разлогиниваем пользователя
    store.commit(AUTH_LOGOUT);
  } else if (!store.getters.isAccessTokenValid(now)) {
    // если не было запроса на обновление
    // создаем запрос и запоминаем его в переменную
    // для избежания race condition
    if (refreshTokenRequest === null) {
      refreshTokenRequest = await store.dispatch(AUTH_REFRESH);
    }

    // а теперь резолвим этот запрос
    accessToken = await refreshTokenRequest;

    // и очищаем переменную
    refreshTokenRequest = null;
  }

  // возвращаем рабочий accessToken
  return accessToken;
}

// обрабатываем запрос перед отправкой
api.interceptors.request.use(async (config) => {
  // если указан флаг skipAuth, пропускаем запрос дальше как есть
  // этот флаг указан у методов login и refreshToken, они не подкрепляются токенами
  console.log(config);
  if (config.skipAuth) {
    return config;
  }

  // иначе запрашиваем валидный accessToken
  const accessToken = await requestValidAccessToken();

  // и возвращаем пропатченный конфиг с токенов в заголовке
  return {
    ...config,
    headers: {
      common: {
        ['Authorization']: `Bearer ${accessToken}`,
      },
    },
  };
});

// обрабатываем запрос перед обработкой ответа от сервера
api.interceptors.response.use(
  // сюда попадает все, что валидируется успешным ответом status < 500
  (response) => {
    const {
      data: { errors },
      config: { skipErrors },
      status,
    } = response;

    // если пришла 401, разлогиниваем пользователя
    if (status === 401) {
      store.commit(AUTH_LOGOUT);
    } else if (errors && !skipErrors) {
      // показываем ошибки сервера для фронта, если нет указаний пропустить их вывод
      // showErrors(errors);
      console.log(errors)
    }

    return response;
  },
  (error) => Promise.reject(error),
);

export default api ;