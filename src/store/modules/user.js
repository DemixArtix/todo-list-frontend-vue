import { KJUR } from 'jsrsasign';
import mutations from '@/store/mutations';

import { login, refreshToken } from '@/api/user.js';
import router from '@/router/index.js';

const { AUTH_LOGOUT, AUTH_REFRESH, AUTH_REQUEST, AUTH_SUCCESS } = mutations;

const INITIAL_STATE = {
  accessTokenExpires: localStorage.getItem('accessTokenExpires') || 0, // время в unix timestamp
  refreshTokenExpires: localStorage.getItem('refreshTokenExpires') || 0, // время в unix timestamp
};

const UNAUTHORIZED_ROUTE_NAME = 'Login';


export default {
  state: INITIAL_STATE,
  getters: {
    isAccessTokenValid: (state) => (now) => now < state.accessTokenExpires,
    isRefreshTokenValid: (state) => (now) => now < state.refreshTokenExpires,
  },
  mutations: {
    [AUTH_SUCCESS]: (state, { accessToken, refreshToken }) => {
      // дехешируем accessToken, достаем дату истечения
      const {
        payloadObj: { exp: accessTokenExpires },
      } = KJUR.jws.JWS.parse(accessToken);

      // дехешируем refreshToken, достаем дату истечения
      const {
        payloadObj: { exp: refreshTokenExpires },
      } = KJUR.jws.JWS.parse(refreshToken);

      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('accessTokenExpires', accessTokenExpires);
      localStorage.setItem('refreshTokenExpires', refreshTokenExpires);

      // обновляем состояние
      state = Object.assign(state, {
        accessTokenExpires,
        refreshTokenExpires,
      });


    },
    [AUTH_LOGOUT]: (state) => {
      // сбрасываем состояние
      state = Object.assign(state, INITIAL_STATE);

      localStorage.removeItem('accessToken');
      localStorage.removeItem('accessTokenExpires');
      localStorage.removeItem('refreshTokenExpires');

      // перенаправляем на страницу логина
      if (router.currentRoute.name !== UNAUTHORIZED_ROUTE_NAME) {
        router.push({ name: UNAUTHORIZED_ROUTE_NAME });
      }
    },
  },
  actions: {
    [AUTH_REQUEST]: async function ({ commit }, { email, password }) {
      const data = await login({ email, password });
      const { success, accessToken, refreshToken, message } = data;

      if (success) {
        commit(AUTH_SUCCESS, { accessToken, refreshToken});
      } else {
        commit(AUTH_LOGOUT);
      }

      return { success, message };
    },


    [AUTH_REFRESH]: async function ({ state, commit }) {
      const { accessToken, refreshToken: refToken , success } = await refreshToken();

      if (success) {
        commit(AUTH_SUCCESS, { accessToken, refreshToken: refToken });
      } else {
        commit(AUTH_LOGOUT);
      }

      // возвращает токен строкой, чтобы обновить заголовок клиента axios
      return accessToken;
    },
    onLogOut({commit}) {
      commit(AUTH_LOGOUT);
    }
  }
}