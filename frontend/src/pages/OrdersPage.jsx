import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://127.0.0.1:8000';

export default function OrdersPage() {
  const user = useAuthStore((s) => s.user);
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn());
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrder, setExpandedOrder] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${user.usuarioId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      } else {
        throw new Error('Error al cargar los pedidos');
      }
    } catch (err) {
      setError('No se pudieron cargar los pedidos. Verifica que el servidor esté corriendo.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!isLoggedIn) {
      setLoading(false);
      return;
    }
    fetchOrders();
  }, [isLoggedIn, user]);

  const toggleOrder = (pedidoId) => {
    setExpandedOrder(expandedOrder === pedidoId ? null : pedidoId);
  };

  const handleCancelOrder = async (pedidoId) => {
    setCancellingId(pedidoId);
    setStatusMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/cancelar`, {
        method: 'PUT',
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({ type: 'success', text: `Pedido #${pedidoId} cancelado con éxito` });
        await fetchOrders();
      } else {
        setStatusMsg({ type: 'error', text: data.detail || 'Error al cancelar el pedido' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error de conexión con el servidor' });
    } finally {
      setCancellingId(null);
    }
  };

  const getEstadoColor = (estado) => {
    switch (estado?.toLowerCase()) {
      case 'completado': return 'bg-success/15 text-success border-success/25';
      case 'cancelado': return 'bg-error/15 text-error border-error/25';
      default: return 'bg-accent/15 text-accent border-accent/25';
    }
  };

  // Not logged in
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl font-bold text-text-primary mb-3">
            Inicia sesión para ver tus pedidos
          </h1>
          <p className="text-text-muted mb-8 max-w-sm mx-auto">
            Necesitas una cuenta para acceder a tu historial de compras.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/login"
              className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl
                         transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
            >
              Iniciar Sesión
            </Link>
            <Link
              to="/registro"
              className="px-6 py-3 border border-border/50 text-text-secondary hover:text-accent
                         hover:border-accent/50 font-semibold rounded-xl transition-all duration-300"
            >
              Crear Cuenta
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
      <div className="fixed top-40 -left-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed bottom-20 -right-40 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-3xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl sm:text-4xl font-bold text-text-primary">
            Mis Pedidos
          </h1>
          <p className="text-text-muted text-sm mt-1">
            Historial de compras de {user?.nombre} {user?.apellido}
          </p>
        </div>

        {/* Status message */}
        {statusMsg && (
          <div
            className={`mb-6 px-5 py-4 rounded-xl text-sm font-medium flex items-center gap-3 animate-fade-in-up
              ${statusMsg.type === 'success'
                ? 'bg-success/10 text-success border border-success/20'
                : 'bg-error/10 text-error border border-error/20'
              }`}
          >
            {statusMsg.type === 'success' ? '✓' : '✕'} {statusMsg.text}
            <button
              onClick={() => setStatusMsg(null)}
              className="ml-auto text-current opacity-60 hover:opacity-100 cursor-pointer"
            >
              ✕
            </button>
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin"></div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="bg-error/10 text-error border border-error/20 rounded-xl px-5 py-4 text-sm font-medium
                          flex items-center gap-3 animate-fade-in-up">
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            {error}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && orders.length === 0 && (
          <div className="text-center py-20 animate-fade-in-up">
            <div className="w-24 h-24 bg-surface rounded-2xl flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <h2 className="font-[family-name:var(--font-family-heading)] text-2xl font-bold text-text-primary mb-2">
              Aún no tienes pedidos
            </h2>
            <p className="text-text-muted mb-8 max-w-sm mx-auto">
              Explora nuestro catálogo y realiza tu primera compra.
            </p>
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white
                         font-bold rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
              </svg>
              Ir al Catálogo
            </Link>
          </div>
        )}

        {/* Orders list */}
        {!loading && !error && orders.length > 0 && (
          <div className="space-y-4">
            {orders.map((order, index) => (
              <div
                key={order.pedidoId}
                className="bg-surface rounded-2xl border border-border/50 overflow-hidden
                           hover:border-border transition-colors duration-200 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.08}s` }}
              >
                {/* Order header */}
                <button
                  onClick={() => toggleOrder(order.pedidoId)}
                  className="w-full flex items-center justify-between p-5 sm:p-6 cursor-pointer
                             hover:bg-surface-light/30 transition-colors duration-200"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 bg-accent/15 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-text-primary font-semibold text-base">Pedido #{order.pedidoId}</p>
                      <p className="text-text-muted text-xs mt-0.5">
                        {new Date(order.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric', month: 'long', day: 'numeric',
                          hour: '2-digit', minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getEstadoColor(order.estado)}`}>
                      {order.estado}
                    </span>
                    <span className="font-[family-name:var(--font-family-heading)] text-lg font-extrabold text-accent">
                      Bs {order.total.toFixed(2)}
                    </span>
                    <svg
                      className={`w-5 h-5 text-text-muted transition-transform duration-300
                                  ${expandedOrder === order.pedidoId ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7"/>
                    </svg>
                  </div>
                </button>

                {/* Order details (expandable) */}
                {expandedOrder === order.pedidoId && (
                  <div className="border-t border-border/50 px-5 sm:px-6 py-4 space-y-3 animate-fade-in-up">
                    <p className="text-text-muted text-xs font-semibold uppercase tracking-wider mb-3">
                      Productos del pedido
                    </p>
                    {order.detalles.map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                        <div className="flex-1">
                          <p className="text-text-primary text-sm font-medium">{item.producto}</p>
                          <p className="text-text-muted text-xs">
                            {item.cantidad} × Bs {item.precioUnitario.toFixed(2)}
                          </p>
                        </div>
                        <span className="text-accent font-bold text-sm">
                          Bs {(item.cantidad * item.precioUnitario).toFixed(2)}
                        </span>
                      </div>
                    ))}

                    {/* Cancel button — only for pending orders */}
                    {order.estado === 'Pendiente' && (
                      <div className="pt-3 border-t border-border/30">
                        <button
                          onClick={() => handleCancelOrder(order.pedidoId)}
                          disabled={cancellingId === order.pedidoId}
                          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-error/10 text-error text-sm font-semibold
                                     border border-error/20 hover:bg-error/20 transition-all cursor-pointer
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === order.pedidoId ? (
                            <>
                              <div className="w-4 h-4 border-2 border-error/30 border-t-error rounded-full animate-spin"></div>
                              Cancelando...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                              </svg>
                              Cancelar Pedido
                            </>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
