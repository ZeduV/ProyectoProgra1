import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://127.0.0.1:8000';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);
  const navigate = useNavigate();
  const login = useAuthStore((s) => s.login);

  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!email.trim()) {
      setStatus({ type: 'error', message: 'El correo es obligatorio' });
      triggerShake();
      return;
    }
    if (password.length < 6) {
      setStatus({ type: 'error', message: 'La contraseña debe tener al menos 6 caracteres' });
      triggerShake();
      return;
    }

    setLoading(true);

    const result = await login(email, password);

    if (result.success) {
      setStatus({ type: 'success', message: '¡Bienvenido de vuelta!' });
      setTimeout(() => navigate('/'), 800);
    } else {
      setStatus({ type: 'error', message: result.message });
      triggerShake();
    }

    setLoading(false);
  };

  const inputClasses = `w-full px-4 py-3 rounded-xl bg-primary border border-border/50 text-text-primary
                        placeholder-text-muted text-sm
                        focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                        transition-all duration-200`;

  const labelClasses = 'block text-sm font-semibold text-text-secondary mb-1.5';

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      {/* Decorative blobs */}
      <div className="fixed top-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-md mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-8 animate-fade-in-up">
          <div className="w-16 h-16 bg-accent/15 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl sm:text-4xl font-bold text-text-primary">
            Iniciar Sesión
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Ingresa a tu cuenta EDUGO para continuar comprando
          </p>
        </div>

        {/* Form Card */}
        <div className={`bg-surface rounded-2xl border border-border/50 p-6 sm:p-8 shadow-2xl shadow-black/20
                         animate-fade-in-up delay-100 ${shakeForm ? 'animate-shake' : ''}`}>

          {/* Status Message */}
          {status && (
            <div
              className={`mb-6 px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-up
                ${status.type === 'success'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-error/10 text-error border border-error/20'
                }`}
            >
              {status.type === 'success' ? (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              ) : (
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              )}
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="login-email" className={labelClasses}>Correo Electrónico</label>
              <input
                id="login-email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputClasses}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="login-password" className={labelClasses}>Contraseña</label>
              <input
                id="login-password"
                type="password"
                placeholder="Tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputClasses}
                required
                minLength={6}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold
                         text-base transition-all duration-300 hover:shadow-lg hover:shadow-accent/25
                         active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer
                         flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Ingresando...
                </>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-border/50"></div>
            <span className="text-text-muted text-xs">¿No tienes cuenta?</span>
            <div className="flex-1 h-px bg-border/50"></div>
          </div>

          {/* Register Link */}
          <Link
            to="/registro"
            className="block w-full py-3 rounded-xl border border-border/50 text-center text-sm font-semibold
                       text-text-secondary hover:text-accent hover:border-accent/50 transition-all duration-300"
          >
            Crear una cuenta nueva
          </Link>
        </div>

        {/* Backend info */}
        <p className="text-center text-text-muted text-xs mt-6 animate-fade-in-up delay-300">
          Autenticación segura con{' '}
          <code className="text-accent/80 bg-accent/5 px-1.5 py-0.5 rounded text-xs">
            SHA-256
          </code>
        </p>
      </div>
    </div>
  );
}
