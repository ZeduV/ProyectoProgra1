import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const API_BASE = 'http://127.0.0.1:8000';

export default function AdminPage() {
  const user = useAuthStore((s) => s.user);
  const isAdmin = useAuthStore((s) => s.isAdmin());
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [statusMsg, setStatusMsg] = useState(null);
  const [formData, setFormData] = useState({
    nombreProducto: '',
    descripcion: '',
    precio: '',
    stock: '',
    imagenURL: '',
    categoriaId: '',
  });

  // Fetch products and categories
  const fetchData = async () => {
    try {
      const [prodRes, catRes] = await Promise.all([
        fetch(`${API_BASE}/api/productos`),
        fetch(`${API_BASE}/api/categorias`),
      ]);
      if (prodRes.ok && catRes.ok) {
        setProducts(await prodRes.json());
        setCategories(await catRes.json());
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error al cargar datos del servidor' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin) fetchData();
    else setLoading(false);
  }, [isAdmin]);

  // Open modal for create
  const openCreateModal = () => {
    setEditingProduct(null);
    setFormData({
      nombreProducto: '',
      descripcion: '',
      precio: '',
      stock: '',
      imagenURL: '',
      categoriaId: categories[0]?.id || '',
    });
    setShowModal(true);
  };

  // Open modal for edit
  const openEditModal = (product) => {
    setEditingProduct(product);
    setFormData({
      nombreProducto: product.name,
      descripcion: product.description,
      precio: String(product.price),
      stock: String(product.stock),
      imagenURL: product.image || '',
      categoriaId: String(product.categoryId),
    });
    setShowModal(true);
  };

  // Handle form change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Submit create or update
  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg(null);

    const payload = {
      nombreProducto: formData.nombreProducto,
      descripcion: formData.descripcion,
      precio: parseFloat(formData.precio),
      stock: parseInt(formData.stock),
      imagenURL: formData.imagenURL || null,
      categoriaId: parseInt(formData.categoriaId),
    };

    try {
      let res;
      if (editingProduct) {
        // UPDATE
        res = await fetch(`${API_BASE}/api/productos/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        // CREATE
        res = await fetch(`${API_BASE}/api/productos`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({
          type: 'success',
          text: editingProduct ? 'Producto actualizado con éxito' : `Producto creado (ID: ${data.productoId})`,
        });
        setShowModal(false);
        fetchData(); // Refresh the list
      } else {
        setStatusMsg({ type: 'error', text: data.detail || 'Error al guardar' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error de conexión con el servidor' });
    }
  };

  // Delete product
  const handleDelete = async (productId) => {
    setStatusMsg(null);

    try {
      const res = await fetch(`${API_BASE}/api/productos/${productId}`, {
        method: 'DELETE',
      });

      const data = await res.json();

      if (res.ok) {
        setStatusMsg({ type: 'success', text: 'Producto eliminado con éxito' });
        setDeleteConfirm(null);
        fetchData();
      } else {
        setStatusMsg({ type: 'error', text: data.detail || 'Error al eliminar' });
      }
    } catch {
      setStatusMsg({ type: 'error', text: 'Error de conexión con el servidor' });
    }
  };

  // Not admin guard
  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-24 sm:pt-28 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg mx-auto text-center animate-fade-in-up">
          <div className="w-20 h-20 bg-error/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-error" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
          <h1 className="font-[family-name:var(--font-family-heading)] text-3xl font-bold text-text-primary mb-3">
            Acceso Denegado
          </h1>
          <p className="text-text-muted mb-8">
            Solo los administradores pueden acceder a este panel.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-accent hover:bg-accent-hover text-white font-bold rounded-xl
                       transition-all duration-300 hover:shadow-lg hover:shadow-accent/25"
          >
            Volver al Inicio
          </Link>
        </div>
      </div>
    );
  }

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

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="w-10 h-10 bg-accent/15 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round"
                    d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h1 className="font-[family-name:var(--font-family-heading)] text-3xl sm:text-4xl font-bold text-text-primary">
                Panel Admin
              </h1>
            </div>
            <p className="text-text-muted text-sm">
              Gestiona los productos de la tienda — {user?.nombre} {user?.apellido}
            </p>
          </div>

          <button
            onClick={openCreateModal}
            className="flex items-center gap-2 px-5 py-3 bg-accent hover:bg-accent-hover text-white font-bold
                       rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-accent/25
                       active:scale-[0.98] cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
            </svg>
            Agregar Producto
          </button>
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

        {/* Products Table */}
        {!loading && (
          <div className="bg-surface rounded-2xl border border-border/50 overflow-hidden animate-fade-in-up delay-100">
            {/* Table Header */}
            <div className="hidden sm:grid sm:grid-cols-12 gap-4 px-6 py-4 bg-primary-light/50 border-b border-border/50
                            text-xs font-semibold text-text-muted uppercase tracking-wider">
              <div className="col-span-1">ID</div>
              <div className="col-span-3">Producto</div>
              <div className="col-span-2">Categoría</div>
              <div className="col-span-1">Precio</div>
              <div className="col-span-1">Stock</div>
              <div className="col-span-4 text-right">Acciones</div>
            </div>

            {/* Table Rows */}
            {products.length === 0 ? (
              <div className="text-center py-12 text-text-muted">
                No hay productos registrados.
              </div>
            ) : (
              products.map((product, index) => (
                <div
                  key={product.id}
                  className="grid grid-cols-1 sm:grid-cols-12 gap-2 sm:gap-4 px-6 py-4 border-b border-border/30
                             hover:bg-surface-light/30 transition-colors duration-200 items-center animate-fade-in-up"
                  style={{ animationDelay: `${index * 0.03}s` }}
                >
                  {/* ID */}
                  <div className="col-span-1 text-text-muted text-sm font-mono">
                    <span className="sm:hidden text-text-muted text-xs font-semibold mr-2">ID:</span>
                    #{product.id}
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <p className="text-text-primary font-semibold text-sm truncate">{product.name}</p>
                    <p className="text-text-muted text-xs truncate">{product.description}</p>
                  </div>

                  {/* Category */}
                  <div className="col-span-2">
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-accent/10 text-accent border border-accent/20">
                      {product.category}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="col-span-1 text-accent font-bold text-sm">
                    Bs {product.price.toFixed(2)}
                  </div>

                  {/* Stock */}
                  <div className="col-span-1">
                    <span className={`text-sm font-semibold ${product.stock > 5 ? 'text-success' : product.stock > 0 ? 'text-accent' : 'text-error'}`}>
                      {product.stock}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-4 flex items-center justify-end gap-2">
                    <button
                      onClick={() => openEditModal(product)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-accent/10 text-accent text-xs font-semibold
                                 hover:bg-accent/20 transition-colors cursor-pointer"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round"
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                      </svg>
                      Editar
                    </button>
                    {deleteConfirm === product.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="px-3 py-2 rounded-lg bg-error text-white text-xs font-semibold
                                     hover:bg-error/80 transition-colors cursor-pointer"
                        >
                          Confirmar
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="px-3 py-2 rounded-lg bg-surface-light text-text-secondary text-xs font-semibold
                                     hover:text-text-primary transition-colors cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error/10 text-error text-xs font-semibold
                                   hover:bg-error/20 transition-colors cursor-pointer"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                        </svg>
                        Eliminar
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Modal: Create/Edit Product */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-4">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-overlay"
            onClick={() => setShowModal(false)}
          />

          {/* Modal content */}
          <div className="relative bg-surface rounded-2xl border border-border/50 w-full max-w-lg p-6 sm:p-8
                          shadow-2xl shadow-black/30 animate-fade-in-up max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-[family-name:var(--font-family-heading)] text-xl font-bold text-text-primary">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-light/50
                           transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label htmlFor="admin-name" className={labelClasses}>Nombre del Producto</label>
                <input
                  id="admin-name"
                  name="nombreProducto"
                  type="text"
                  placeholder="Balón de fútbol Pro"
                  value={formData.nombreProducto}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="admin-desc" className={labelClasses}>Descripción</label>
                <textarea
                  id="admin-desc"
                  name="descripcion"
                  placeholder="Descripción del producto..."
                  value={formData.descripcion}
                  onChange={handleChange}
                  className={`${inputClasses} resize-none h-20`}
                  required
                />
              </div>

              {/* Price + Stock */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="admin-price" className={labelClasses}>Precio (Bs)</label>
                  <input
                    id="admin-price"
                    name="precio"
                    type="number"
                    step="0.01"
                    min="0"
                    placeholder="129.99"
                    value={formData.precio}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
                <div>
                  <label htmlFor="admin-stock" className={labelClasses}>Stock</label>
                  <input
                    id="admin-stock"
                    name="stock"
                    type="number"
                    min="0"
                    placeholder="50"
                    value={formData.stock}
                    onChange={handleChange}
                    className={inputClasses}
                    required
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <label htmlFor="admin-cat" className={labelClasses}>Categoría</label>
                <select
                  id="admin-cat"
                  name="categoriaId"
                  value={formData.categoriaId}
                  onChange={handleChange}
                  className={inputClasses}
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Image URL */}
              <div>
                <label htmlFor="admin-img" className={labelClasses}>URL de Imagen (opcional)</label>
                <input
                  id="admin-img"
                  name="imagenURL"
                  type="text"
                  placeholder="https://ejemplo.com/imagen.png"
                  value={formData.imagenURL}
                  onChange={handleChange}
                  className={inputClasses}
                />
              </div>

              {/* Submit */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-bold
                             transition-all duration-300 hover:shadow-lg hover:shadow-accent/25
                             active:scale-[0.98] cursor-pointer"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-5 py-3 rounded-xl border border-border/50 text-text-secondary font-semibold
                             hover:text-text-primary hover:border-border transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
