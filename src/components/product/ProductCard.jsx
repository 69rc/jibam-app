import { Link } from 'react-router-dom';
import { IoBagAdd, IoStar } from 'react-icons/io5';

/**
 * ProductCard — fills its grid cell (no fixed width).
 * Use inside a CSS grid and the card stretches naturally.
 * compact prop makes the image shorter (for "related products" row).
 */
export default function ProductCard({ product, onAddToCart, compact = false }) {
  const hasDiscount =
    product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
    : 0;
  const inStock = product.stock > 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col hover:shadow-md transition-shadow w-full">
      {/* ── Image ──────────────────────────────────────────── */}
      <Link to={`/products/${product.id}`} className="relative block">
        <img
          src={
            product.image ||
            `https://via.placeholder.com/180x180/E8F5E9/1B5E20?text=${encodeURIComponent(
              product.name?.[0] || '+'
            )}`
          }
          alt={product.name}
          className={`w-full object-cover bg-primary-surface ${
            compact ? 'aspect-square' : 'aspect-[4/3]'
          }`}
        />

        {hasDiscount && (
          <span className="absolute top-2 left-2 bg-accent text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            -{discountPct}%
          </span>
        )}
        {product.prescriptionRequired && (
          <span className="absolute top-2 right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            Rx
          </span>
        )}
        {!inStock && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <span className="text-white text-xs font-bold">Out of Stock</span>
          </div>
        )}
      </Link>

      {/* ── Info ───────────────────────────────────────────── */}
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <Link to={`/products/${product.id}`}>
          <p className="text-xs font-semibold text-primary leading-tight line-clamp-2 hover:text-accent-dark transition-colors">
            {product.name}
          </p>
        </Link>

        {product.manufacturer && !compact && (
          <p className="text-[10px] text-gray-400 truncate">{product.manufacturer}</p>
        )}

        {product.averageRating > 0 && (
          <div className="flex items-center gap-0.5">
            <IoStar size={10} className="text-amber-400 flex-shrink-0" />
            <span className="text-[10px] font-semibold text-gray-700">
              {Number(product.averageRating).toFixed(1)}
            </span>
            <span className="text-[10px] text-gray-400">({product.totalReviews})</span>
          </div>
        )}

        {/* Price row */}
        <div className="flex items-center justify-between mt-auto pt-1 gap-1">
          <div className="min-w-0">
            <span className="text-xs font-extrabold text-primary">
              ₦{Number(product.price).toLocaleString()}
            </span>
            {hasDiscount && (
              <span className="text-[10px] text-gray-400 line-through ml-1">
                ₦{Number(product.comparePrice).toLocaleString()}
              </span>
            )}
          </div>

          {onAddToCart && inStock && (
            <button
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
              className="w-7 h-7 rounded-lg bg-accent flex items-center justify-center hover:bg-accent-dark transition-colors flex-shrink-0"
              aria-label="Add to cart"
            >
              <IoBagAdd size={14} className="text-white" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
