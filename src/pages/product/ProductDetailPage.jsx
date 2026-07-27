import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoArrowBack, IoHeart, IoHeartOutline, IoCartOutline,
  IoStar, IoStarOutline, IoCheckmarkCircle, IoCloseCircle,
  IoFlask, IoWarning, IoLogoWhatsapp, IoBagAdd,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { productAPI, cartAPI, wishlistAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { PageSpinner } from '../../components/common/Spinner';
import useAuthStore from '../../store/authStore';
import { PHARMACIST_WHATSAPP } from '../../constants';

export default function ProductDetailPage() {
  const { productId } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [wishlisted, setWishlisted] = useState(false);

  const requireAuth = (cb) => {
    if (isAuthenticated) cb();
    else navigate('/login', { state: { from: `/products/${productId}` } });
  };

  const { data, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => productAPI.getById(productId).then((r) => r.data.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: () => cartAPI.addItem({ productId, quantity: qty }),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success(`Added to cart ×${qty}`);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const wishlistMutation = useMutation({
    mutationFn: () => wishlisted ? wishlistAPI.remove(productId) : wishlistAPI.add({ productId }),
    onSuccess: () => {
      setWishlisted((w) => !w);
      toast.success(wishlisted ? 'Removed from wishlist' : 'Added to wishlist');
    },
  });

  const handleWhatsApp = () => {
    const name = data?.product?.name || 'a product';
    const msg = encodeURIComponent(`Hello! I need help about ${name}`);
    window.open(`https://wa.me/${PHARMACIST_WHATSAPP}?text=${msg}`, '_blank');
  };

  const handleBuyNow = () => {
    requireAuth(async () => {
      try {
        await addToCartMutation.mutateAsync();
        navigate('/cart');
      } catch { /* error already toasted */ }
    });
  };

  if (isLoading) return <PageSpinner />;

  const product = data?.product;
  const related = data?.related || [];
  if (!product) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
      <p className="text-gray-500">Product not found.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );

  const images = product.images?.length > 0
    ? product.images.map((img) => img.url)
    : [product.image || `https://via.placeholder.com/500x500/E8ECF8/0D1B5E?text=${product.name?.[0]}`];

  const inStock = product.stock > 0;
  const hasDiscount = product.comparePrice && parseFloat(product.comparePrice) > parseFloat(product.price);
  const discountPct = hasDiscount
    ? Math.round((1 - parseFloat(product.price) / parseFloat(product.comparePrice)) * 100)
    : 0;

  return (
    <div className="pb-4">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-navy mb-4 transition"
      >
        <IoArrowBack size={18} /> Back
      </button>

      <div className="flex flex-col gap-6">
        {/* ── Images ───────────────────────────────── */}
        <div className="flex flex-col gap-3">
          <div className="relative bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm">
            <img
              src={images[activeImage]}
              alt={product.name}
              className="w-full h-64 object-contain p-4"
            />
            {/* Badges */}
            {hasDiscount && (
              <span className="absolute top-3 left-3 bg-cyan text-white text-xs font-bold px-2 py-1 rounded-lg">
                -{discountPct}%
              </span>
            )}
            {product.prescriptionRequired && (
              <span className="absolute top-3 right-3 bg-navy text-white text-xs font-bold px-2 py-1 rounded-lg">Rx</span>
            )}
            {/* Nav controls */}
            <div className="absolute top-3 right-3 flex gap-2">
              <button
                onClick={() => requireAuth(() => wishlistMutation.mutate())}
                className="w-9 h-9 rounded-xl bg-white/90 shadow flex items-center justify-center hover:bg-white transition"
              >
                {wishlisted
                  ? <IoHeart size={18} className="text-red-500" />
                  : <IoHeartOutline size={18} className="text-gray-500" />}
              </button>
              <Link to="/cart" className="w-9 h-9 rounded-xl bg-white/90 shadow flex items-center justify-center hover:bg-white transition">
                <IoCartOutline size={18} className="text-gray-500" />
              </Link>
            </div>
          </div>

          {/* Thumbnail strip */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto">
              {images.map((uri, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`flex-shrink-0 w-16 h-16 rounded-xl border-2 overflow-hidden transition
                    ${i === activeImage ? 'border-navy' : 'border-gray-200'}`}
                >
                  <img src={uri} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ── Details ──────────────────────────────── */}
        <div className="flex flex-col gap-4">
          {/* Category badges */}
          <div className="flex flex-wrap gap-2">
            {product.category && (
              <span className="badge-navy">{product.category.name}</span>
            )}
            {!inStock && (
              <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">Out of Stock</span>
            )}
          </div>

          {/* Name */}
          <h1 className="text-2xl font-extrabold text-navy leading-tight">{product.name}</h1>
          {product.manufacturer && (
            <p className="text-sm text-gray-500 -mt-2">by {product.manufacturer}</p>
          )}

          {/* Rating */}
          {product.averageRating > 0 && (
            <div className="flex items-center gap-1.5">
              {[1,2,3,4,5].map((s) => (
                s <= Math.round(product.averageRating)
                  ? <IoStar key={s} size={16} className="text-amber-400" />
                  : <IoStarOutline key={s} size={16} className="text-amber-300" />
              ))}
              <span className="text-sm font-bold text-gray-700 ml-1">{Number(product.averageRating).toFixed(1)}</span>
              <span className="text-sm text-gray-400">({product.totalReviews} reviews)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3">
            <span className="text-3xl font-extrabold text-navy">₦{Number(product.price).toLocaleString()}</span>
            {hasDiscount && (
              <span className="text-base text-gray-400 line-through">₦{Number(product.comparePrice).toLocaleString()}</span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-1.5">
            {inStock
              ? <IoCheckmarkCircle size={16} className="text-green-600" />
              : <IoCloseCircle size={16} className="text-red-500" />}
            <span className={`text-sm font-semibold ${inStock ? 'text-green-600' : 'text-red-500'}`}>
              {inStock ? `${product.stock} units available` : 'Out of Stock'}
            </span>
          </div>

          {/* Quantity selector */}
          {inStock && (
            <div className="flex items-center gap-4 bg-navy-surface px-4 py-3 rounded-xl">
              <span className="text-sm font-semibold text-navy">Quantity</span>
              <div className="flex items-center gap-3 ml-auto">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="w-8 h-8 rounded-lg border-2 border-navy/30 flex items-center justify-center disabled:opacity-40 hover:border-navy transition font-bold text-navy"
                >−</button>
                <span className="text-base font-bold text-navy w-6 text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(product.stock, q + 1))}
                  disabled={qty >= product.stock}
                  className="w-8 h-8 rounded-lg border-2 border-navy/30 flex items-center justify-center disabled:opacity-40 hover:border-navy transition font-bold text-navy"
                >+</button>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => requireAuth(() => addToCartMutation.mutate())}
              disabled={!inStock || addToCartMutation.isPending}
              className="btn-outline flex-1 flex items-center justify-center gap-2"
            >
              <IoCartOutline size={18} />
              {addToCartMutation.isPending ? 'Adding…' : 'Add to Cart'}
            </button>
            <button
              onClick={handleBuyNow}
              disabled={!inStock}
              className="btn-primary flex-1"
            >
              Buy Now
            </button>
          </div>

          {/* WhatsApp */}
          <button
            onClick={handleWhatsApp}
            className="flex items-center justify-center gap-2 border-2 border-green-500 text-green-700 bg-green-50 rounded-xl py-3 font-bold text-sm hover:bg-green-100 transition"
          >
            <IoLogoWhatsapp size={20} className="text-green-500" />
            Chat with Pharmacist
          </button>

          {/* Dosage info card */}
          {product.dosage && (
            <div className="flex items-center gap-3 bg-navy-surface px-4 py-3 rounded-xl">
              <IoFlask size={20} className="text-navy flex-shrink-0" />
              <div>
                <p className="text-xs text-gray-500">Dosage</p>
                <p className="text-sm font-semibold text-navy">{product.dosage}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── Tabs / Content ───────────────────────────── */}
      <div className="mt-8 flex flex-col gap-6">
        {product.description && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-navy mb-2">Description</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.description}</p>
          </div>
        )}

        {product.usageInstructions && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-navy mb-2">Usage Instructions</h3>
            <p className="text-sm text-gray-600 leading-relaxed">{product.usageInstructions}</p>
          </div>
        )}

        {product.sideEffects && (
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-2">
              <IoWarning size={18} className="text-amber-600" />
              <h3 className="text-base font-bold text-amber-700">Side Effects</h3>
            </div>
            <p className="text-sm text-amber-800 leading-relaxed">{product.sideEffects}</p>
          </div>
        )}

        {/* Reviews */}
        {product.reviews?.length > 0 && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h3 className="text-base font-bold text-navy mb-4">Customer Reviews</h3>
            <div className="flex flex-col gap-4">
              {product.reviews.slice(0, 5).map((review) => (
                <div key={review.id} className="flex gap-3 pb-4 border-b border-gray-100 last:border-0 last:pb-0">
                  <div className="w-9 h-9 rounded-full bg-navy flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{review.user?.fullname?.[0]}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-semibold text-navy">{review.user?.fullname}</span>
                      {review.isVerifiedPurchase && (
                        <span className="flex items-center gap-0.5 text-xs text-navy font-semibold">
                          <IoCheckmarkCircle size={12} /> Verified
                        </span>
                      )}
                    </div>
                    <div className="flex gap-0.5 mb-1">
                      {[1,2,3,4,5].map((s) => (
                        s <= review.rating
                          ? <IoStar key={s} size={12} className="text-amber-400" />
                          : <IoStarOutline key={s} size={12} className="text-amber-300" />
                      ))}
                    </div>
                    {review.comment && <p className="text-sm text-gray-600 leading-relaxed">{review.comment}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Related products */}
        {related.length > 0 && (
          <div>
            <h3 className="text-base font-bold text-navy mb-4">Related Products</h3>
            <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-4 px-4 snap-x snap-mandatory">
              {related.map((p) => (
                <div key={p.id} className="flex-shrink-0 w-[44vw] max-w-[180px] snap-start">
                  <ProductCard
                    product={p}
                    compact
                    onAddToCart={(product) => {
                      if (!isAuthenticated) { navigate('/login'); return; }
                      cartAPI.addItem({ productId: product.id, quantity: 1 })
                        .then(() => { queryClient.invalidateQueries(['cart']); toast.success('Added!'); })
                        .catch((err) => toast.error(err.response?.data?.message || 'Failed'));
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
