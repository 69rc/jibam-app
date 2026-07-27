import { useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoSearchOutline, IoHeartOutline, IoMedkitOutline, IoChevronForward,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { productAPI, cartAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import CategoryChip from '../../components/product/CategoryChip';
import { PageSpinner } from '../../components/common/Spinner';
import useAuthStore from '../../store/authStore';
import useCartStore from '../../store/cartStore';

const PROMO_BANNERS = [
  { id: '1', title: 'Up to 20% Off', subtitle: 'On selected antibiotics', bg: 'bg-navy', textColor: 'text-white' },
  { id: '2', title: 'Free Delivery', subtitle: 'On orders above ₦5,000', bg: 'bg-cyan', textColor: 'text-white' },
  { id: '3', title: 'New Arrivals', subtitle: 'Fresh stock every week', bg: 'bg-navy-light', textColor: 'text-white' },
];

function SectionHeader({ title, to }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="text-sm font-bold text-navy">{title}</h2>
      {to && (
        <Link
          to={to}
          className="flex items-center gap-0.5 text-xs text-navy font-semibold hover:text-cyan transition-colors"
        >
          See All <IoChevronForward size={13} />
        </Link>
      )}
    </div>
  );
}

export default function HomePage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuthStore();
  const setCartData = useCartStore((s) => s.setCartData);
  const queryClient = useQueryClient();

  const { data: homeData, isLoading } = useQuery({
    queryKey: ['home'],
    queryFn: () => productAPI.getHome().then((r) => r.data.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: ({ productId }) => cartAPI.addItem({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Added to cart!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add'),
  });

  const handleAddToCart = useCallback(
    (product) => {
      if (!isAuthenticated) {
        navigate('/login', { state: { from: '/' } });
        return;
      }
      addToCartMutation.mutate({ productId: product.id });
    },
    [isAuthenticated, navigate, addToCartMutation]
  );

  if (isLoading) return <PageSpinner />;

  return (
    <div className="flex flex-col gap-5 pb-4">
      {/* ── Welcome greeting ─────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-extrabold text-navy">
            {isAuthenticated
              ? `Hello, ${user?.fullname?.split(' ')[0]} 👋`
              : 'Welcome to Jibam 👋'}
          </h1>
          <p className="text-xs text-gray-500">Find your medicines quickly</p>
        </div>
        <Link
          to="/wishlist"
          className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-navy-surface transition"
          aria-label="Wishlist"
        >
          <IoHeartOutline size={18} className="text-navy" />
        </Link>
      </div>

      {/* ── Search bar (tap → /search) ───────────────────── */}
      <button
        onClick={() => navigate('/search')}
        className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-sm w-full hover:border-navy/30 transition text-left"
      >
        <IoSearchOutline size={18} className="text-gray-400 flex-shrink-0" />
        <span className="text-sm text-gray-400 flex-1">Search medicines, vitamins…</span>
        <div className="w-7 h-7 rounded-xl bg-navy-surface flex items-center justify-center flex-shrink-0">
          <IoMedkitOutline size={14} className="text-navy" />
        </div>
      </button>

      {/* ── Promo banners (horizontal scroll) ───────────── */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory -mx-4 px-4 pb-1">
        {PROMO_BANNERS.map((b) => (
          <div
            key={b.id}
            className={`flex-shrink-0 w-[78vw] max-w-xs snap-start rounded-2xl p-4 ${b.bg} flex items-center justify-between overflow-hidden relative`}
          >
            <div className="z-10">
              <h3 className={`text-base font-extrabold ${b.textColor}`}>{b.title}</h3>
              <p className={`text-xs mt-0.5 ${b.textColor} opacity-80`}>{b.subtitle}</p>
              <button className="mt-2.5 bg-white/25 text-white text-xs font-semibold px-3 py-1 rounded-lg hover:bg-white/35 transition">
                Shop Now
              </button>
            </div>
            <div className="absolute right-3 bottom-[-6px] opacity-20">
              <IoMedkitOutline size={64} className="text-white" />
            </div>
          </div>
        ))}
      </div>

      {/* ── Categories ───────────────────────────────────── */}
      {homeData?.categories?.length > 0 && (
        <section>
          <SectionHeader title="Categories" to="/search" />
          <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
            {homeData.categories.map((cat) => (
              <CategoryChip
                key={cat.id}
                category={cat}
                onPress={() =>
                  navigate(`/category/${cat.id}`, { state: { categoryName: cat.name } })
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* ── Featured Products ─────────────────────────────── */}
      {homeData?.featured?.length > 0 && (
        <section>
          <SectionHeader title="Featured Products" to="/search?featured=true" />
          <div className="grid grid-cols-2 gap-3">
            {homeData.featured.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* ── New Arrivals ──────────────────────────────────── */}
      {homeData?.newArrivals?.length > 0 && (
        <section>
          <SectionHeader title="🆕 New Arrivals" to="/search?isNewArrival=true" />
          <div className="grid grid-cols-2 gap-3">
            {homeData.newArrivals.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}

      {/* ── Best Sellers ──────────────────────────────────── */}
      {homeData?.bestSellers?.length > 0 && (
        <section>
          <SectionHeader title="🔥 Best Sellers" to="/search?isBestSeller=true" />
          <div className="grid grid-cols-2 gap-3">
            {homeData.bestSellers.slice(0, 6).map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
