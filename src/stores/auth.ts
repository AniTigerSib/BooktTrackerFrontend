import {ref, watch} from "vue";
import { defineStore } from "pinia";
import {loginApi, logoutApi, registerApi} from "@/api/user.ts";
/* eslint-disable  @typescript-eslint/no-explicit-any */
export const useAuthStore = defineStore('auth', () => {
  const accessToken = ref(localStorage.getItem('access')?.toString());
  const refreshToken = ref(localStorage.getItem('refresh')?.toString());
  const username = ref('');
  const password = ref('');
  const authError = ref('');
  const isLoginIncorrect = ref<boolean>(false);
  const isLoading = ref(!!accessToken.value);
  const isLoggedIn = ref(!!accessToken.value);

  // Функция сброса ошибок
  const resetErrors = () => {
    authError.value = '';
    isLoginIncorrect.value = false;
  };

  // Отслеживаем изменения username и password
  watch([username, password], () => {
    resetErrors();
  });

  const register = async () => {
    try {
      isLoading.value = true;
      await registerApi(username.value, password.value);
    } catch (e: any) {
      authError.value = e.response.data || 'Something went wrong';
      if (e.response.status !== 500) {
        isLoginIncorrect.value = true;
      }
    } finally {
      isLoading.value = false;
    }
  }

  const login = async () => {
    try {
      isLoading.value = true;
      const { data } = await loginApi(username.value, password.value);
      accessToken.value = data.accessToken;
      refreshToken.value = data.refreshToken;
      localStorage.setItem('access', data.accessToken);
      localStorage.setItem('refresh', data.refreshToken);
      isLoggedIn.value = true;
    } catch (e: any) {
      authError.value = e.response.data || 'Something went wrong';
      if (e.response.status !== 500) {
        isLoginIncorrect.value = true;
      }
    } finally {
      isLoading.value = false;
    }
  }

  const logout = async (sendRequest: boolean) => {
    if (sendRequest) {
      try {
        isLoading.value = true;
        await logoutApi();
      } catch (e) {
        console.log(e);
      } finally {
        isLoading.value = false;
      }
    }
    isLoading.value = false;
    accessToken.value = undefined;
    refreshToken.value = undefined;
    localStorage.removeItem('access');
    localStorage.removeItem('refresh');
    isLoggedIn.value = false;
  }

  return {
    accessToken,
    refreshToken,
    username,
    password,
    authError,
    loading: isLoading,
    isLoggedIn,
    isLoginIncorrect,
    register,
    login,
    logout,
  }
})
