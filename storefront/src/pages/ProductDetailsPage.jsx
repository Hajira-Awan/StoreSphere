import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Heart, Check } from 'lucide-react';
import { ProductGallery } from '../components/ProductGallery';
import { QuantitySelector } from '../components/QuantitySelector';
import { StarRating } from '../components/ui/StarRating';
import { ProductCard } from '../components/ProductCard';
import { useCart } from '../hooks/useCart';
import { useWishlist } from '../hooks/useWishlist';

function formatPrice(price) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price);
}

export function ProductDetailsPage() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [quantity, setQuantity] = useState(1);
  const [justAdded, setJustAdded] = useState(false);
  
  const { addItem } = useCart();
  const { isWishlisted, toggle: toggleWishlist } = useWishlist();

  useEffect(() => {
    let active = true;
    setLoading(true);
    setQuantity(1); // reset on product change
    
    fetch(`/api/products/${id}`)
      .then(res => {
        if (!res.ok) throw new Error('Product not found');
        return res.json();
      })
      .then(data => {
        if (active) {
          setProduct(data);
          setError(null);
          setLoading(false);
        }
      })
      .catch(err => {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      });
      
    return () => { active = false; };
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-[--color-accent] border-t-transparent rounded-full" />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 flex flex-col items-center justify-center min-h-[50vh] text-center">
        <h2 className="font-serif text-3xl text-[--color-ink] mb-4">Product Not Found</h2>
        <p className="text-[--color-ink-muted] mb-8">{error || "The product you're looking for doesn't exist."}</p>
        <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-[--color-accent] text-white rounded-md hover:bg-[--color-accent-strong] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent]">
          <ArrowLeft className="w-4 h-4" /> Back to Catalog
        </Link>
      </div>
    );
  }

  const activeWishlisted = isWishlisted(product.id);

  const handleAddToCart = () => {
    addItem(product, quantity);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1400);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[--color-ink-muted] mb-8">
        <Link to="/" className="hover:text-[--color-accent] transition-colors">Catalog</Link>
        <span>/</span>
        <span className="text-[--color-ink-faint]">{product.category}</span>
        <span>/</span>
        <span className="text-[--color-ink] font-medium truncate">{product.name}</span>
      </nav>

      {/* Main Product Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        <ProductGallery images={product.images || [product.image]} altText={product.name} />

        <div className="flex flex-col">
          <p className="text-sm uppercase tracking-wider text-[--color-ink-muted] font-medium mb-2">
            {product.brand}
          </p>
          <h1 className="font-serif text-3xl sm:text-4xl text-[--color-ink] leading-tight mb-4">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-6">
            <StarRating rating={product.rating} reviewCount={product.reviewCount} />
            <span className="text-[--color-ink-faint] text-sm">•</span>
            <span className="text-[--color-ink-muted] text-sm">{product.colorway}</span>
          </div>

          <div className="font-mono text-2xl sm:text-3xl text-[--color-ink] font-semibold mb-8">
            {formatPrice(product.price)}
          </div>

          <p className="text-[--color-ink-muted] leading-relaxed mb-8">
            {product.description}
          </p>

          <div className="border-t border-[--color-line] pt-8 mb-8">
            <h3 className="text-sm font-medium uppercase tracking-wider text-[--color-ink] mb-4">
              Specifications
            </h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-4">
              {Object.entries(product.specs || {}).map(([key, value]) => (
                <div key={key} className="flex flex-col">
                  <dt className="text-xs font-medium text-[--color-ink-faint] uppercase tracking-wide">
                    {key}
                  </dt>
                  <dd className="font-mono text-sm text-[--color-ink-muted] mt-1">
                    {value}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="mt-auto flex flex-col gap-4">
            {!product.inStock ? (
              <div className="bg-[--color-surface-hover] text-[--color-ink-muted] p-4 rounded-md text-center font-medium border border-[--color-line]">
                Currently Out of Stock
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
                <button
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-8 py-3 rounded-md font-medium text-base transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[--color-accent] active:scale-[0.98] ${
                    justAdded
                      ? 'bg-green-600 text-white hover:bg-green-700 shadow-md'
                      : 'bg-[--color-accent] text-white hover:bg-[--color-accent-strong] shadow-md hover:shadow-lg'
                  }`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-5 h-5" /> Added to Cart
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="w-5 h-5" /> Add to Cart
                    </>
                  )}
                </button>
                <button
                  onClick={() => toggleWishlist(product.id)}
                  aria-label={activeWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                  className={`p-3 rounded-md border flex items-center justify-center transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--color-accent] ${
                    activeWishlisted
                      ? 'bg-[--color-accent]/10 border-[--color-accent] text-[--color-accent]'
                      : 'bg-[--color-surface] border-[--color-line] text-[--color-ink-muted] hover:bg-[--color-surface-hover] hover:border-[--color-ink-muted]'
                  }`}
                >
                  <Heart className={`w-5 h-5 ${activeWishlisted ? 'fill-[--color-accent]' : ''}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product.relatedProducts && product.relatedProducts.length > 0 && (
        <div className="border-t border-[--color-line] pt-12">
          <h2 className="font-serif text-2xl text-[--color-ink] mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {product.relatedProducts.map((relatedProduct) => (
              <ProductCard key={relatedProduct.id} product={relatedProduct} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
