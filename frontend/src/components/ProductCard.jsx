import { useState } from 'react';
import useCartStore from '../store/cartStore';

export default function ProductCard({ product, index }) {
  const addItem = useCartStore((s) => s.addItem);
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    addItem(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  const categoryColors = {
    Ropa: 'bg-blue-500/20 text-blue-400',
    Balones: 'bg-emerald-500/20 text-emerald-400',
    Zapatos: 'bg-purple-500/20 text-purple-400',
  };

  return (
    <div
      className={`card-hover group bg-surface rounded-2xl overflow-hidden border border-border/50
                   animate-fade-in-up`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-primary-light aspect-square">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
        {/* Category Badge */}
        <span className={`absolute top-3 left-3 px-3 py-1 rounded-full text-xs font-semibold
                          ${categoryColors[product.category] || 'bg-accent/20 text-accent'}`}>
          {product.category}
        </span>
      </div>

      {/* Info */}
      <div className="p-4 sm:p-5">
        <h3 className="font-[family-name:var(--font-family-heading)] text-lg font-bold text-text-primary mb-1
                       group-hover:text-accent transition-colors duration-300">
          {product.name}
        </h3>
        <p className="text-text-muted text-sm mb-4 line-clamp-2 leading-relaxed">
          {product.description}
        </p>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-extrabold text-accent">
            Bs {product.price.toFixed(2)}
          </span>

          <button
            onClick={handleAdd}
            disabled={added}
            className={`btn-ripple px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300
                        cursor-pointer flex items-center gap-2
                        ${added
                          ? 'bg-success text-white scale-95'
                          : 'bg-accent hover:bg-accent-hover text-white hover:shadow-lg hover:shadow-accent/25 active:scale-95'
                        }`}
          >
            {added ? (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                ¡Añadido!
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
                Agregar
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
