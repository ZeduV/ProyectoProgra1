import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://127.0.0.1:8000';

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [orderStatus, setOrderStatus] = useState(null);

  const handleProcessOrder = async () => {
    // Check if logged in
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }

    setProcessing(true);
    setOrderStatus(null);

    try {
      const payload = {
        usuarioId: user.usuarioId,
        items: items.map((item) => ({
          productoId: item.id,
          cantidad: item.quantity,
          precioUnitario: item.price,
        })),
      };

      const res = await fetch(`${API_BASE}/api/pedidos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        setOrderStatus({
          type: 'success',
          message: `¡Pedido #${data.pedidoId} creado! Total: Bs ${data.total.toFixed(2)}`,
        });
        clearCart();
      } else {
        setOrderStatus({
          type: 'error',
          message: data.detail || 'Error al procesar el pedido',
        });
      }
    } catch {
      setOrderStatus({
        type: 'error',
        message: 'No se pudo conectar con el servidor. Verifica que el backend esté corriendo.',
      });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in-up">
          <div>
            <h1 className="font-[family-name:var(--font-family-heading)] text-3xl sm:text-4xl font-bold text-text-primary">
              Tu Carrito
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'} en tu carrito
            </p>
          </div>
          {items.length > 0 && (
            <button
              onClick={clearCart}
              className="text-sm font-semibold text-text-muted hover:text-error transition-colors cursor-pointer"
            >
              Vaciar carrito
            </button>
          )}
        </div>

        {/* Order status message */}
        {orderStatus && (
          <div
            className={`mb-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-fade-in-up
              ${orderStatus.type === 'success'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-error/10 text-error border border-error/20'
              }`}
          >
            {orderStatus.type === 'success' ? (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            ) : (
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            )}
            <span>{orderStatus.message}</span>
            {orderStatus.type === 'success' && (
              <Link to="/mis-pedidos" className="ml-auto underline font-bold hover:no-underline">
                Ver pedidos →
              </Link>
            )}
          </div>
        )}

        {items.length === 0 && !orderStatus ? (
          /* Empty state */
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6c-.3.5.1 1.1.7 1.1H19m-12.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6zm10.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/>
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-bold text-text-primary mb-2">
              Tu carrito está vacío
            </h2>
            <p className="text-text-muted mb-8 max-w-sm mx-auto">
              Explora nuestro catálogo y encuentra los mejores productos deportivos para ti.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white
                         font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Ver Catálogo
            </Link>
          </div>
        ) : items.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Items list */}
            <div className="lg:col-span-2 space-y-4">
              {items.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-4 sm:gap-5 bg-surface rounded-2xl p-4 sm:p-5 border border-border/50
                             hover:border-border transition-colors duration-200 animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Image */}
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-primary-light flex-shrink-0">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-text-primary text-base sm:text-lg truncate">
                        {item.name}
                      </h3>
                      <p className="text-text-muted text-sm">{item.category}</p>
                    </div>

                    <div className="flex items-center justify-between mt-3">
                      {/* Quantity */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 rounded-lg bg-primary border border-border/50 flex items-center justify-center
                                     text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" d="M20 12H4"/>
                          </svg>
                        </button>
                        <span className="text-base font-bold text-text-primary w-8 text-center">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 rounded-lg bg-primary border border-border/50 flex items-center justify-center
                                     text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all cursor-pointer"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                            <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
                          </svg>
                        </button>
                      </div>

                      {/* Price */}
                      <span className="text-accent font-extrabold text-lg">
                        Bs {(item.price * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => removeItem(item.id)}
                    className="self-start p-2 text-text-muted hover:text-error transition-colors cursor-pointer"
                    aria-label={`Eliminar ${item.name}`}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round"
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                  </button>
                </div>
              ))}
            </div>

            {/* Order summary */}
            <div className="lg:col-span-1">
              <div className="bg-surface rounded-2xl border border-border/50 p-6 sticky top-24 animate-fade-in-up delay-200">
                <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-bold text-text-primary mb-5">
                  Resumen del Pedido
                </h3>

                <div className="space-y-3 mb-5">
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Subtotal ({totalItems} {totalItems === 1 ? 'artículo' : 'artículos'})</span>
                    <span>Bs {totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-text-secondary">
                    <span>Envío</span>
                    <span className="text-success font-semibold">Gratis</span>
                  </div>
                  <div className="h-px bg-border/50"></div>
                  <div className="flex justify-between items-center">
                    <span className="text-text-primary font-bold text-lg">Total</span>
                    <span className="font-[family-name:var(--font-family-heading)] text-2xl font-extrabold text-accent">
                      Bs {totalPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Not logged in warning */}
                {!isLoggedIn && (
                  <div className="mb-4 px-4 py-3 rounded-xl bg-accent/10 text-accent text-xs font-medium
                                  border border-accent/20 flex items-center gap-2">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                    </svg>
                    Inicia sesión para procesar tu pedido
                  </div>
                )}

                <button
                  onClick={handleProcessOrder}
                  disabled={processing}
                  className="w-full py-3.5 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold
                             text-base transition-all duration-300 hover:shadow-lg hover:shadow-accent/25
                             active:scale-[0.98] cursor-pointer animate-pulse-glow
                             disabled:opacity-60 disabled:cursor-not-allowed
                             flex items-center justify-center gap-2"
                >
                  {processing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Procesando...
                    </>
                  ) : !isLoggedIn ? (
                    'Inicia sesión para comprar'
                  ) : (
                    'Procesar Pedido'
                  )}
                </button>

                <Link
                  to="/"
                  className="block text-center w-full mt-3 py-2.5 rounded-xl text-sm font-semibold text-text-muted
                             hover:text-accent transition-colors duration-200"
                >
                  ← Seguir comprando
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
