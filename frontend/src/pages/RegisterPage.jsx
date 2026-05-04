import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/authStore';
import { authApi } from '../services/api';
import Input from '../components/common/Input';
import Button from '../components/common/Button';

export default function RegisterPage() {
  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const [serverErrors, setServerErrors] = useState([]);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const password = watch('password');

  async function onSubmit({ confirmPassword: _, ...data }) {
    setServerErrors([]);
    setLoading(true);
    try {
      const res = await authApi.register(data);
      setAuth(res.data.token, res.data.user);
      navigate('/tickets', { replace: true });
    } catch (err) {
      const body = err.response?.data;
      if (body?.errors) setServerErrors(body.errors.map((e) => e.message));
      else setServerErrors([body?.error || 'Błąd rejestracji. Spróbuj ponownie.']);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-md p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold text-gray-900">KROSS Helpdesk</h1>
          <p className="text-gray-500 text-sm mt-1">Utwórz nowe konto</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="first_name"
              label="Imię"
              placeholder="Jan"
              error={errors.first_name?.message}
              {...register('first_name', { required: 'Imię jest wymagane' })}
            />
            <Input
              id="last_name"
              label="Nazwisko"
              placeholder="Kowalski"
              error={errors.last_name?.message}
              {...register('last_name', { required: 'Nazwisko jest wymagane' })}
            />
          </div>
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
            autoComplete="new-password"
            placeholder="Min. 8 znaków, wielka litera, cyfra"
            error={errors.password?.message}
            {...register('password', {
              required: 'Hasło jest wymagane',
              minLength: { value: 8, message: 'Minimum 8 znaków' },
              validate: {
                upper:  (v) => /[A-Z]/.test(v) || 'Wymagana co najmniej jedna wielka litera',
                digit:  (v) => /[0-9]/.test(v) || 'Wymagana co najmniej jedna cyfra',
              },
            })}
          />
          <Input
            id="confirmPassword"
            label="Potwierdź hasło"
            type="password"
            autoComplete="new-password"
            placeholder="••••••••"
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Potwierdź hasło',
              validate: (v) => v === password || 'Hasła nie są zgodne',
            })}
          />

          {serverErrors.length > 0 && (
            <div className="rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              <ul className="list-disc list-inside space-y-1">
                {serverErrors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <Button type="submit" loading={loading} className="w-full mt-2">
            Zarejestruj się
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-gray-500">
          Masz już konto?{' '}
          <Link to="/login" className="text-blue-600 hover:underline font-medium">
            Zaloguj się
          </Link>
        </p>
      </div>
    </div>
  );
}
