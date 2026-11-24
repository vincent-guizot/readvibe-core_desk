'use client';

import { useAppDispatch, useAppSelector } from './useRedux';
import { setCredentials, updateUserProfile, logout } from '../redux/slices/authSlice';
import http from '../services/http';
import { mapUser } from '../services/reader.api';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, token, isAuthenticated, status, error } = useAppSelector((state) => state.auth);

  const loginUser = (userData, authToken) => {
    dispatch(setCredentials({ user: userData, token: authToken }));
  };

  const logoutUser = () => {
    dispatch(logout());
  };

  const updateProfile = (data) => {
    dispatch(updateUserProfile(data));
  };

  const loginWithApi = async (email, password) => {
    const res = await http.post('/api/auth/login', { email, password });
    if (res?.data?.token) {
      const mapped = mapUser(res.data.user);
      dispatch(setCredentials({ user: mapped, token: res.data.token }));
      return { user: mapped, token: res.data.token };
    }
    return res;
  };

  const registerWithApi = async ({ username, email, password, fullname }) => {
    const res = await http.post('/api/auth/register', { username, email, password, fullname });
    if (res?.data?.token) {
      const mapped = mapUser(res.data.user);
      dispatch(setCredentials({ user: mapped, token: res.data.token }));
      return { user: mapped, token: res.data.token };
    }
    return res;
  };

  const fetchMe = async () => {
    const res = await http.get('/api/auth/me');
    if (res?.data?.user) {
      const mapped = mapUser(res.data.user);
      const currentToken = token || (typeof window !== 'undefined' ? localStorage.getItem('readvibe_token') : null);
      if (currentToken) {
        dispatch(setCredentials({ user: mapped, token: currentToken }));
      }
      return mapped;
    }
    return null;
  };

  return {
    user,
    token,
    isAuthenticated,
    status,
    error,
    login: loginUser,
    loginWithApi,
    registerWithApi,
    fetchMe,
    logout: logoutUser,
    updateProfile,
  };
}

export default useAuth;
