import { useState } from 'react';

const API_BASE = 'http://127.0.0.1:8000';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    edad: '',
    email: '',
    password: '',
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [status, setStatus] = useState(null); // { type: 'success' | 'error', message: string }
  const [loading, setLoading] = useState(false);
  const [shakeForm, setShakeForm] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    if (!formData.nombre.trim()) return 'El nombre es obligatorio';
    if (!formData.apellido.trim()) return 'El apellido es obligatorio';
    if (!formData.edad || parseInt(formData.edad) < 1 || parseInt(formData.edad) > 120) return 'La edad debe ser un número válido entre 1 y 120';
    if (!formData.email.trim()) return 'El email es obligatorio';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) return 'El formato del email no es válido';
    if (formData.password.length < 6) return 'La contraseña debe tener al menos 6 caracteres';
    if (formData.password !== confirmPassword) return 'Las contraseñas no coinciden';
    return null;
  };

  const triggerShake = () => {
    setShakeForm(true);
    setTimeout(() => setShakeForm(false), 500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    const validationError = validate();
    if (validationError) {
      setStatus({ type: 'error', message: validationError });
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_BASE}/api/usuarios/registro`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          edad: parseInt(formData.edad),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.detail || 'Error al registrar el usuario';
        setStatus({ type: 'error', message: errorMsg });
        triggerShake();
      } else {
        setStatus({ type: 'success', message: data.mensaje || '¡Registro exitoso!' });
        setFormData({ nombre: '', apellido: '', edad: '', email: '', password: '' });
        setConfirmPassword('');
      }
    } catch (err) {
      setStatus({
        type: 'error',
        message: 'No se pudo conectar con el servidor. Asegúrate de que el backend esté corriendo.',
      });
      triggerShake();
    } finally {
      setLoading(false);
    }
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"/>
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl sm:text-4xl font-bold text-text-primary">
            Crear Cuenta
          </h1>
          <p className="text-text-muted text-sm mt-2">
            Únete a la comunidad EDUGO y disfruta de ofertas exclusivas
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
            {/* Name row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="nombre" className={labelClasses}>Nombre</label>
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  placeholder="Juan"
                  value={formData.nombre}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
              <div>
                <label htmlFor="apellido" className={labelClasses}>Apellido</label>
                <input
                  id="apellido"
                  name="apellido"
                  type="text"
                  placeholder="Pérez"
                  value={formData.apellido}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>
            </div>

            {/* Age */}
            <div>
              <label htmlFor="edad" className={labelClasses}>Edad</label>
              <input
                id="edad"
                name="edad"
                type="number"
                placeholder="25"
                min="1"
                max="120"
                value={formData.edad}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className={labelClasses}>Correo Electrónico</label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="juan@ejemplo.com"
                value={formData.email}
                onChange={handleChange}
                className={inputClasses}
                required
              />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className={labelClasses}>Contraseña</label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="Mínimo 6 caracteres"
                value={formData.password}
                onChange={handleChange}
                className={inputClasses}
                required
                minLength={6}
              />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirmPassword" className={labelClasses}>Confirmar Contraseña</label>
              <input
                id="confirmPassword"
                type="password"
                placeholder="Repite tu contraseña"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClasses}
                required
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
                  Registrando...
                </>
              ) : (
                'Crear Cuenta'
              )}
            </button>
          </form>
        </div>

        {/* Backend info */}
        <p className="text-center text-text-muted text-xs mt-6 animate-fade-in-up delay-300">
          Los datos se envían al servidor en{' '}
          <code className="text-accent/80 bg-accent/5 px-1.5 py-0.5 rounded text-xs">
            {API_BASE}/api/usuarios/registro
          </code>
        </p>
      </div>
    </div>
  );
}
