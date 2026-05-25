import { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const toggleCart = useCartStore((s) => s.toggleCart);
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const logout = useAuthStore((s) => s.logout);
  const userMenuRef = useRef(null);

  // Close user dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Nav links change based on auth state
  const navLinks = isLoggedIn
    ? [
        { to: '/', label: 'Inicio' },
        { to: '/mis-pedidos', label: 'Mis Pedidos' },
        ...(isAdmin ? [{ to: '/admin', label: 'Admin' }] : []),
      ]
    : [
        { to: '/', label: 'Inicio' },
        { to: '/login', label: 'Login' },
        { to: '/registro', label: 'Registro' },
      ];

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserMenuOpen(false);
    setMobileMenuOpen(false);
    navigate('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-18">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-accent rounded-lg flex items-center justify-center
                            group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-accent/25">
              <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M13.49 5.48c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm-3.6 13.9l1-4.4 2.1 2v6h2v-7.5l-2.1-2 .6-3c1.3 1.5 3.3 2.5 5.5 2.5v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1l-5.2 2.2v4.7h2v-3.4l1.8-.7-1.6 8.1-4.9-1-.4 2 7 1.4z"/>
              </svg>
            </div>
            <span className="font-[family-name:var(--font-family-heading)] text-xl sm:text-2xl font-extrabold text-text-primary tracking-tight">
              EDU<span className="text-accent">GO</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-300
                  ${isActive(link.to)
                    ? 'bg-accent text-white shadow-lg shadow-accent/25'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light/50'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Cart Button */}
            <button
              onClick={toggleCart}
              className="relative ml-3 p-2.5 rounded-lg text-text-secondary hover:text-accent
                         hover:bg-surface-light/50 transition-all duration-300 cursor-pointer"
              aria-label="Abrir carrito de compras"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6c-.3.5.1 1.1.7 1.1H19m-12.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6zm10.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold
                                 rounded-full flex items-center justify-center animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Avatar / Dropdown (only when logged in) */}
            {isLoggedIn && (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-text-secondary
                             hover:text-text-primary hover:bg-surface-light/50 transition-all duration-300 cursor-pointer"
                >
                  <div className="w-8 h-8 bg-accent/20 rounded-full flex items-center justify-center">
                    <span className="text-accent font-bold text-sm">
                      {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-semibold max-w-[120px] truncate">
                    {user?.nombre}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                {/* Dropdown */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-surface rounded-xl border border-border/50
                                  shadow-2xl shadow-black/30 overflow-hidden animate-fade-in-up z-50">
                    <div className="px-4 py-3 border-b border-border/30">
                      <p className="text-sm font-semibold text-text-primary truncate">
                        {user?.nombre} {user?.apellido}
                      </p>
                      <p className="text-xs text-text-muted truncate">{user?.email}</p>
                    </div>
                    <Link
                      to="/mis-pedidos"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 text-sm text-text-secondary
                                 hover:text-text-primary hover:bg-surface-light/50 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                      Mis Pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-error
                                 hover:bg-error/5 transition-colors cursor-pointer"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                      </svg>
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile: Cart + Hamburger */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              onClick={toggleCart}
              className="relative p-2 rounded-lg text-text-secondary hover:text-accent transition-colors cursor-pointer"
              aria-label="Abrir carrito"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6c-.3.5.1 1.1.7 1.1H19m-12.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6zm10.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/>
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-white text-xs font-bold
                                 rounded-full flex items-center justify-center animate-bounce-in">
                  {totalItems}
                </span>
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              aria-label="Abrir menú"
            >
              {mobileMenuOpen ? (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              ) : (
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/50 animate-fade-in-up">
          <div className="px-4 py-3 space-y-1">
            {/* User info (mobile) */}
            {isLoggedIn && (
              <div className="flex items-center gap-3 px-4 py-3 mb-2 bg-surface/50 rounded-lg">
                <div className="w-9 h-9 bg-accent/20 rounded-full flex items-center justify-center">
                  <span className="text-accent font-bold text-sm">
                    {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-text-primary truncate">
                    {user?.nombre} {user?.apellido}
                  </p>
                  <p className="text-xs text-text-muted truncate">{user?.email}</p>
                </div>
              </div>
            )}

            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all duration-300
                  ${isActive(link.to)
                    ? 'bg-accent text-white'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-light/50'
                  }`}
              >
                {link.label}
              </Link>
            ))}

            {/* Logout button (mobile) */}
            {isLoggedIn && (
              <button
                onClick={handleLogout}
                className="w-full text-left block px-4 py-3 rounded-lg text-sm font-semibold text-error
                           hover:bg-error/5 transition-colors cursor-pointer mt-1"
              >
                Cerrar Sesión
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
