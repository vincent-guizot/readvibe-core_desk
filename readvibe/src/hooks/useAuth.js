'use client';

import { useAppDispatch, useAppSelector } from './useRedux';
import { setCredentials, updateUserProfile, logout } from '../redux/slices/authSlice';

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

  return {
    user,
    token,
    isAuthenticated,
    status,
    error,
    login: loginUser,
    logout: logoutUser,
    updateProfile,
  };
}

export default useAuth;
