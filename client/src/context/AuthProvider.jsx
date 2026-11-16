import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthContext } from './AuthContext.js';
import { setUnauthorizedHandler } from '../services/api.js';
import { clearToken, getToken, saveToken } from '../services/authStorage.js';
import { fetchCurrentUser, loginRequest, registerRequest } from '../services/authApi.js';

const ANONYMOUS = { status: 'anonymous', user: null, signedOut: false };

export function AuthProvider({ children }) {
  const [state, setState] = useState(() => ({
    status: getToken() ? 'loading' : 'anonymous',
    user: null,
    signedOut: false,
  }));

  useEffect(() => {
    if (!getToken()) return undefined;

    let active = true;

    fetchCurrentUser()
      .then((user) => {
        if (active) setState({ status: 'authenticated', user, signedOut: false });
      })
      .catch(() => {
        if (active) setState(ANONYMOUS);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => {
      clearToken();
      setState(ANONYMOUS);
    });

    return () => setUnauthorizedHandler(null);
  }, []);

  const login = useCallback(async ({ email, password, rememberMe = false }) => {
    const { token, user } = await loginRequest({ email, password, rememberMe });
    saveToken(token, rememberMe);
    setState({ status: 'authenticated', user, signedOut: false });
    return user;
  }, []);

  const register = useCallback(
    async (values) => {
      await registerRequest(values);

      try {
        return await login({ email: values.email, password: values.password, rememberMe: true });
      } catch (error) {
        error.accountCreated = true;
        throw error;
      }
    },
    [login]
  );

  const logout = useCallback(() => {
    clearToken();
    setState({ status: 'anonymous', user: null, signedOut: true });
  }, []);

  const updateUser = useCallback((user) => {
    setState((current) => ({ ...current, user }));
  }, []);

  const value = useMemo(
    () => ({
      status: state.status,
      user: state.user,
      signedOut: state.signedOut,
      isAuthenticated: state.status === 'authenticated',
      login,
      register,
      logout,
      updateUser,
    }),
    [state, login, register, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}