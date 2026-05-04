import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [serverError, setServerError] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/tickets';

  async function onSubmit(data) {
    setServerError('');
    setLoading(true);
    try {
      const res = await authApi.login(data);
      setAuth(res.data.token, res.data.user);
      navigate(from, { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.error || 'Błąd logowania. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">KROSS Helpdesk</h1>
          <p className="text-gray-500 text-sm mt-1">Zaloguj się do systemu</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <Input
            id="email"
            label="Adres e-mail"
            type="email"
            autoComplete="email"
            placeholder="jan@przyklad.pl"
            error={errors.email?.message}
            {...register('email', {
              required: 'E-mail jest wymagany',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Nieprawidłowy adres e-mail' },
            })}
          />
          <Input
            id="password"
            label="Hasło"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            error={errors.password?.message}
            {...register('password', { required: 'Hasło jest wymagane' })}
          />

          {serverError && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {serverError}
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Zaloguj się
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Nie masz konta?{' '}
          <Link to="/register" className="text-blue-600 hover:underline font-medium">
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
