import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingCart, Check } from 'lucide-react';
import { StarRating } from './ui/StarRating';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

function ProductImage({ product, className = '' }) {
  const [errored, setErrored] = useState(false);

  return (
    <div className={`relative overflow-hidden rounded-md bg-[--color-surface-hover] border border-[--color-line] ${className}`}>
      {!errored ? (
        <img
          src={product.image}
          alt={`${product.brand} ${product.name}`}
          loading="lazy"
          onError={() => setErrored(true)}
          className="w-full h-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center" aria-hidden="true">
          <span className="font-serif text-2xl text-[--color-ink-faint] select-none">
            {product.name.split(' ').map((w) => w[0]).slice(0, 2).join('')}
          </span>
        </div>
      )}
      {!product.inStock && (
        <div className="absolute inset-0 bg-[--color-bg]/70 flex items-center justify-center">
          <span className="text-xs font-medium text-[--color-ink-muted] bg-[--color-surface] px-2 py-1 rounded">
            Out of stock
          </span>
        </div>
      )}
    </div>
  );
}

function WishlistButton({ productId }) {
  const { isWishlisted, toggle } = useWishlist();
  const active = isWishlisted(productId);
  return (
    <button
      type="button"
      onClick={() => toggle(productId)}
      aria-pressed={active}
      aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
      className="p-1.5 rounded-full bg-[--color-surface]/90 border border-[--color-line]
        text-[--color-ink-muted] hover:text-[--color-accent] hover:scale-110
        transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]"
    >
      <Heart
        className={`w-4 h-4 transition-colors ${active ? 'fill-[--color-accent] text-[--color-accent]' : ''}`}
      />
    </button>
  );
}

function AddToCartButton({ product }) {
  const { addItem } = useCart();
  const [justAdded, setJustAdded] = useState(false);

  const handleClick = () => {
    addItem(product);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={!product.inStock}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md text-sm font-medium px-3 py-1.5
        transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]
        disabled:opacity-50 disabled:cursor-not-allowed active:scale-95
        ${justAdded
          ? 'bg-green-600 text-white'
          : 'bg-[--color-accent] text-white hover:bg-[--color-accent-strong] hover:shadow-md'}`}
    >
      {justAdded ? (
        <>
          <Check className="w-4 h-4" /> Added
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" /> Add to cart
        </>
      )}
    </button>
  );
}

export function ProductCard({ product, view = 'grid' }) {
  if (view === 'list') {
    return (
      <article
        className="group flex gap-4 rounded-lg border border-[--color-line] p-4
          transition-all duration-200 hover:border-[--color-accent] hover:shadow-[0_0_0_1px_var(--color-accent),0_8px_20px_-8px_rgba(181,101,45,0.35)]"
      >
        <Link to={`/product/${product.id}`} className="shrink-0 group-hover:opacity-90">
          <ProductImage product={product} className="w-24 h-24" />
        </Link>
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <p className="text-xs uppercase tracking-wide text-[--color-ink-faint]">
            {product.brand} · {product.category}
          </p>
          <Link to={`/product/${product.id}`} className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] rounded">
            <h3 className="font-serif text-lg text-[--color-ink] truncate">{product.name}</h3>
          </Link>
          <StarRating rating={product.rating} reviewCount={product.reviewCount} />
          <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-[--color-ink-faint]">
            {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
              <span key={k}>
                {k.toUpperCase()} <span className="text-[--color-ink-muted]">{v}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="flex flex-col items-end justify-between shrink-0 gap-2">
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-[--color-ink]">{formatPrice(product.price)}</span>
            <WishlistButton productId={product.id} />
          </div>
          <AddToCartButton product={product} />
        </div>
      </article>
    );
  }

  return (
    <article
      className="group flex flex-col gap-2 rounded-lg border border-[--color-line] p-4
        transition-all duration-200 hover:-translate-y-1 hover:border-[--color-accent]
        hover:shadow-[0_0_0_1px_var(--color-accent),0_12px_24px_-12px_rgba(181,101,45,0.35)]"
    >
      <div className="relative">
        <Link to={`/product/${product.id}`} className="block group-hover:opacity-90">
          <ProductImage product={product} className="aspect-square w-full" />
        </Link>
        <div className="absolute top-2 right-2">
          <WishlistButton productId={product.id} />
        </div>
      </div>
      <p className="text-xs uppercase tracking-wide text-[--color-ink-faint] mt-1">
        {product.brand} · {product.category}
      </p>
      <Link to={`/product/${product.id}`} className="hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] rounded inline-block">
        <h3 className="font-serif text-base leading-snug text-[--color-ink]">{product.name}</h3>
      </Link>
      <StarRating rating={product.rating} reviewCount={product.reviewCount} size={12} />
      <div className="flex flex-wrap gap-x-3 gap-y-0.5 font-mono text-[11px] text-[--color-ink-faint]">
        {Object.entries(product.specs).slice(0, 2).map(([k, v]) => (
          <span key={k}>
            {k.toUpperCase()} <span className="text-[--color-ink-muted]">{v}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center justify-between mt-1 gap-2">
        <span className="font-mono text-sm text-[--color-ink]">{formatPrice(product.price)}</span>
        <AddToCartButton product={product} />
      </div>
    </article>
  );
}
