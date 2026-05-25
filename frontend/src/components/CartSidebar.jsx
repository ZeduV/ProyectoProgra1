import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useCartStore from '../store/cartStore';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://127.0.0.1:8000';

export default function CartSidebar() {
  const isOpen = useCartStore((s) => s.isOpen);
  const closeCart = useCartStore((s) => s.closeCart);
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalPrice = useCartStore((s) => s.getTotalPrice());
  const totalItems = useCartStore((s) => s.getTotalItems());
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [orderMsg, setOrderMsg] = useState(null);

  // Close on Escape
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') closeCart();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, closeCart]);

  // Clear order message when sidebar closes
  useEffect(() => {
    if (!isOpen) setOrderMsg(null);
  }, [isOpen]);

  const handleProcessOrder = async () => {
    if (!isLoggedIn) {
      closeCart();
      navigate('/login');
      return;
    }

    setProcessing(true);
    setOrderMsg(null);

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
        setOrderMsg({ type: 'success', text: `¡Pedido #${data.pedidoId} creado!` });
        clearCart();
        setTimeout(() => {
          closeCart();
          navigate('/mis-pedidos');
        }, 1500);
      } else {
        setOrderMsg({ type: 'error', text: data.detail || 'Error al procesar' });
      }
    } catch {
      setOrderMsg({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-overlay transition-opacity duration-300"
        onClick={closeCart}
      />

      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className="absolute right-0 top-0 h-full w-full sm:w-[420px] bg-primary border-l border-border/50
                   shadow-2xl flex flex-col animate-slide-in-right"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6c-.3.5.1 1.1.7 1.1H19m-12.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6zm10.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/>
              </svg>
            </div>
            <div>
              <h2 className="font-[family-name:var(--font-family-heading)] text-lg font-bold text-text-primary">
                Tu Carrito
              </h2>
              <p className="text-text-muted text-xs">
                {totalItems} {totalItems === 1 ? 'artículo' : 'artículos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-light/50
                       transition-all duration-200 cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mb-5">
                <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.3 4.6c-.3.5.1 1.1.7 1.1H19m-12.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6zm10.3 0a1.3 1.3 0 100 2.6 1.3 1.3 0 000-2.6z"/>
                </svg>
              </div>
              <p className="text-text-secondary font-semibold text-lg mb-1">Carrito vacío</p>
              <p className="text-text-muted text-sm">Agrega productos para empezar</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 bg-surface rounded-xl p-3 border border-border/30
                           hover:border-border/60 transition-colors duration-200 animate-fade-in-up"
              >
                {/* Thumbnail */}
                <div className="w-20 h-20 rounded-lg overflow-hidden bg-primary-light flex-shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-text-primary truncate">{item.name}</h4>
                  <p className="text-accent font-bold text-sm mt-0.5">Bs {item.price.toFixed(2)}</p>

                  {/* Quantity controls */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-7 h-7 rounded-lg bg-primary-light border border-border/50 flex items-center justify-center
                                 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" d="M20 12H4"/>
                      </svg>
                    </button>
                    <span className="text-sm font-bold text-text-primary w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-7 h-7 rounded-lg bg-primary-light border border-border/50 flex items-center justify-center
                                 text-text-secondary hover:text-text-primary hover:border-accent/50 transition-all cursor-pointer"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                        <path strokeLinecap="round" d="M12 4v16m8-8H4"/>
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Remove */}
                <button
                  onClick={() => removeItem(item.id)}
                  className="self-start p-1.5 text-text-muted hover:text-error transition-colors cursor-pointer"
                  aria-label={`Eliminar ${item.name}`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-border/50 px-6 py-5 space-y-4">
            {/* Order status message */}
            {orderMsg && (
              <div className={`px-4 py-3 rounded-xl text-sm font-medium flex items-center gap-2 animate-fade-in-up
                ${orderMsg.type === 'success'
                  ? 'bg-success/10 text-success border border-success/20'
                  : 'bg-error/10 text-error border border-error/20'
                }`}>
                {orderMsg.type === 'success' ? '✓' : '✕'} {orderMsg.text}
              </div>
            )}

            {/* Subtotals */}
            <div className="space-y-2">
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

            {/* Actions */}
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

            <button
              onClick={clearCart}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-text-muted
                         hover:text-error hover:bg-error-light/30 transition-all duration-200 cursor-pointer"
            >
              Vaciar carrito
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
