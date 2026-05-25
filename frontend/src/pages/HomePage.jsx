import { useState, useEffect, useMemo, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import mockProducts, { categories as mockCategories } from '../data/mockProducts';

const API_BASE = 'http://127.0.0.1:8000';

export default function HomePage() {
  const [activeCategory, setActiveCategory] = useState('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState(['Todos']);
  const [loading, setLoading] = useState(true);
  const [usingApi, setUsingApi] = useState(false);

  // Mapa de imagen de archivo local para cada ImagenURL de la BD
  const imageMap = useMemo(() => {
    const map = {};
    mockProducts.forEach((p) => {
      map[p.name] = p.image;
    });
    return map;
  }, []);

  // Debounce the search query (400ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 400);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Fetch products from the backend
  const fetchProducts = useCallback(async (search = '') => {
    try {
      let url = `${API_BASE}/api/productos`;
      const params = new URLSearchParams();
      if (search.trim()) params.append('buscar', search.trim());
      if (params.toString()) url += `?${params.toString()}`;

      const [prodRes, catRes] = await Promise.all([
        fetch(url),
        fetch(`${API_BASE}/api/categorias`),
      ]);

      if (prodRes.ok && catRes.ok) {
        const prodData = await prodRes.json();
        const catData = await catRes.json();

        const productsWithImages = prodData.map((p) => ({
          ...p,
          image: imageMap[p.name] || p.image || 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&q=80&w=400',
        }));

        setProducts(productsWithImages);
        setCategories(['Todos', ...catData.map((c) => c.name)]);
        setUsingApi(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }, [imageMap]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      const ok = await fetchProducts();
      if (!ok) {
        setProducts(mockProducts);
        setCategories(mockCategories);
        setUsingApi(false);
      }
      setLoading(false);
    };
    init();
  }, [fetchProducts]);

  // Re-fetch when the debounced query changes (only if using API)
  useEffect(() => {
    if (!usingApi) return;
    const refetch = async () => {
      setLoading(true);
      await fetchProducts(debouncedQuery);
      setLoading(false);
    };
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery]);

  // Filter by category + local search fallback
  const filteredProducts = useMemo(() => {
    let list = products;
    if (activeCategory !== 'Todos') {
      list = list.filter((p) => p.category === activeCategory);
    }
    // If not using API, also filter by search locally
    if (!usingApi && searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, products, searchQuery, usingApi]);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-24 sm:pt-28 pb-12 sm:pb-16 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-20 -left-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 -right-32 w-96 h-96 bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="animate-fade-in-up">
            <span className="inline-block px-4 py-1.5 bg-accent/10 text-accent text-sm font-semibold rounded-full mb-5 border border-accent/20">
              🏆 Los mejores productos deportivos
            </span>
            <h1 className="font-[family-name:var(--font-family-heading)] text-4xl sm:text-5xl lg:text-7xl font-black text-text-primary leading-tight mb-5">
              Equipa tu{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent to-accent-light">
                pasión
              </span>
            </h1>
            <p className="text-text-secondary text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Descubre nuestra colección de ropa, calzado y equipamiento deportivo.
              Calidad premium para atletas de todos los niveles.
            </p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-8 sm:gap-14 mt-10 animate-fade-in-up delay-200">
            {[
              { value: '200+', label: 'Productos' },
              { value: '50K+', label: 'Clientes' },
              { value: '4.9★', label: 'Calificación' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="font-[family-name:var(--font-family-heading)] text-2xl sm:text-3xl font-extrabold text-accent">
                  {stat.value}
                </div>
                <div className="text-text-muted text-xs sm:text-sm mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Catalog Section */}
      <section className="pb-16 sm:pb-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Section Header + Search + Filters */}
          <div className="mb-8 sm:mb-10 space-y-5">
            {/* Top row: title + data source badge */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-[family-name:var(--font-family-heading)] text-2xl sm:text-3xl font-bold text-text-primary">
                  Nuestro Catálogo
                </h2>
                <p className="text-text-muted text-sm mt-1">
                  {loading ? 'Cargando...' : `${filteredProducts.length} productos disponibles`}
                  {!loading && (
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs font-medium ${
                      usingApi
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-accent/10 text-accent border border-accent/20'
                    }`}>
                      {usingApi ? '● Base de datos' : '● Datos locales'}
                    </span>
                  )}
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="relative max-w-xl">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <input
                id="search-products"
                type="text"
                placeholder="Buscar productos... (ej: Raqueta, Balón, Zapatillas)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-xl bg-surface border border-border/50 text-text-primary
                           placeholder-text-muted text-sm
                           focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                           transition-all duration-200"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-text-muted hover:text-text-primary
                             transition-colors cursor-pointer"
                  aria-label="Limpiar búsqueda"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
                  </svg>
                </button>
              )}
            </div>

            {/* Category filters */}
            <div className="flex items-center gap-2 flex-wrap">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer
                    ${activeCategory === cat
                      ? 'bg-accent text-white shadow-lg shadow-accent/25'
                      : 'bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-light border border-border/50'
                    }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Loading state */}
          {loading && (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-3 border-accent/30 border-t-accent rounded-full animate-spin"></div>
            </div>
          )}

          {/* Product Grid */}
          {!loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
              {filteredProducts.map((product, index) => (
                <ProductCard key={product.id} product={product} index={index} />
              ))}
            </div>
          )}

          {!loading && filteredProducts.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">
                {searchQuery
                  ? `No se encontraron productos para "${searchQuery}".`
                  : 'No se encontraron productos en esta categoría.'}
              </p>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="mt-4 px-5 py-2 rounded-xl bg-surface border border-border/50 text-sm font-semibold
                             text-text-secondary hover:text-accent hover:border-accent/50 transition-all cursor-pointer"
                >
                  Limpiar búsqueda
                </button>
              )}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
