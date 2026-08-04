import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoSearchOutline, IoCloseCircle, IoCheckmarkCircle, IoEllipseOutline,
} from 'react-icons/io5';
import toast from 'react-hot-toast';
import { productAPI, cartAPI, categoryAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { useDebounce } from '../../hooks/useDebounce';
import useAuthStore from '../../store/authStore';
import PWAInstallPrompt from '../../components/pwa/PWAInstallPrompt';

export default function SearchPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState(searchParams.get('categoryId') || '');
  const [rxOnly, setRxOnly] = useState(false);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [showPWAInstall, setShowPWAInstall] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const debouncedSearch = useDebounce(search, 400);

  const { data: catData } = useQuery({
    queryKey: ['categories-list'],
    queryFn: () => categoryAPI.getAll().then((r) => r.data.data),
  });

  const { data, isLoading } = useQuery({
    queryKey: ['search', debouncedSearch, selectedCat, rxOnly, inStockOnly, page],
    queryFn: () =>
      productAPI
        .getAll({
          search: debouncedSearch || undefined,
          categoryId: selectedCat || undefined,
          prescriptionRequired: rxOnly ? true : undefined,
          inStock: inStockOnly ? true : undefined,
          page,
          limit: 24,
        })
        .then((r) => r.data),
    placeholderData: (prev) => prev,
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId) => cartAPI.addItem({ productId, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Added to cart!');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleAddToCart = (product) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: '/search' } });
      return;
    }
    addToCartMutation.mutate(product.id);
  };

  // Show PWA install prompt after each search (until installed)
  useEffect(() => {
    if (debouncedSearch) {
      setHasSearched(true);
      // Show PWA install prompt after a short delay on each search
      setTimeout(() => {
        setShowPWAInstall(true);
      }, 1500);
    }
  }, [debouncedSearch]);

  const products = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div className="flex flex-col gap-3">
      {/* PWA Install Prompt */}
      {showPWAInstall && (
        <PWAInstallPrompt 
          forceShow={true} 
          onDismiss={() => setShowPWAInstall(false)} 
        />
      )}
      
      {/* ── Search input — sticky below the top header ──── */}
      {/* --header-h = 56px, defined in index.css */}
      <div
        className="sticky z-20 bg-[#F0F2F8] py-2 -mx-4 px-4"
        style={{ top: 'var(--header-h)' }}
      >
        <div className="relative">
          <IoSearchOutline
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Search medicines, vitamins…"
            className="input-field pl-10 pr-10 shadow-sm text-sm"
            autoFocus
          />
          {search && (
            <button
              onClick={() => {
                setSearch('');
                setPage(1);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <IoCloseCircle size={17} className="text-gray-400" />
            </button>
          )}
        </div>
      </div>

      {/* ── Category filter chips ─────────────────────── */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-4 px-4">
        <button
          onClick={() => {
            setSelectedCat('');
            setPage(1);
          }}
          className={`flex-shrink-0 px-3 py-1 rounded-full border-2 text-xs font-semibold transition
            ${!selectedCat
              ? 'border-primary bg-primary-surface text-primary'
              : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}
        >
          All
        </button>
        {catData?.map((cat) => (
          <button
            key={cat.id}
            onClick={() => {
              setSelectedCat(selectedCat === cat.id ? '' : cat.id);
              setPage(1);
            }}
            className={`flex-shrink-0 px-3 py-1 rounded-full border-2 text-xs font-semibold transition
              ${selectedCat === cat.id
                ? 'border-primary bg-primary-surface text-primary'
                : 'border-gray-200 text-gray-500 bg-white hover:border-gray-300'}`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* ── Toggle filters row ───────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          {
            label: 'In Stock',
            active: inStockOnly,
            toggle: () => {
              setInStockOnly(!inStockOnly);
              setPage(1);
            },
          },
          {
            label: 'Rx Only',
            active: rxOnly,
            toggle: () => {
              setRxOnly(!rxOnly);
              setPage(1);
            },
          },
        ].map(({ label, active, toggle }) => (
          <button
            key={label}
            onClick={toggle}
            className={`flex items-center gap-1 px-3 py-1 rounded-full border text-xs font-semibold transition
              ${active ? 'border-primary bg-primary-surface text-primary' : 'border-gray-200 text-gray-500 bg-white'}`}
          >
            {active ? (
              <IoCheckmarkCircle size={13} className="text-primary" />
            ) : (
              <IoEllipseOutline size={13} className="text-gray-400" />
            )}
            {label}
          </button>
        ))}
        {pagination && (
          <span className="ml-auto text-[11px] text-gray-400">{pagination.total} results</span>
        )}
      </div>

      {/* ── Results grid ─────────────────────────────── */}
      {isLoading ? (
        <PageSpinner />
      ) : products.length === 0 ? (
        <EmptyState
          icon={IoSearchOutline}
          title="No results found"
          subtitle={
            search
              ? `No medicines match "${search}"`
              : 'Try searching for a medicine or browse categories'
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
            ))}
          </div>

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-3">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-primary disabled:opacity-40 hover:bg-primary-surface transition"
              >
                Prev
              </button>
              <span className="text-xs text-gray-500">
                {page} / {pagination.totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={!pagination.hasNext}
                className="px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-primary disabled:opacity-40 hover:bg-primary-surface transition"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
