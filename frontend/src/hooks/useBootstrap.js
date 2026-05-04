import { useEffect, useState } from 'react';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';

export default function useBootstrap() {
  const [ready, setReady] = useState(false);
  const { token, setAuth, logout } = useAuthStore();

  useEffect(() => {
    if (!token) { setReady(true); return; }

    authApi.me()
      .then((res) => setAuth(token, res.data.user))
      .catch(() => logout())
      .finally(() => setReady(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return ready;
}
