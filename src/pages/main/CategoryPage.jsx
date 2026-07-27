import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoArrowBack } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { productAPI, cartAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import useAuthStore from '../../store/authStore';

export default function CategoryPage() {
  const { categoryId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const categoryName = location.state?.categoryName || 'Category';

  const { data, isLoading } = useQuery({
    queryKey: ['category-products', categoryId],
    queryFn: () => productAPI.getByCategory(categoryId, { limit: 40 }).then((r) => r.data.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId) => cartAPI.addItem({ productId, quantity: 1 }),
    onSuccess: () => { queryClient.invalidateQueries(['cart']); toast.success('Added to cart!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const handleAddToCart = (product) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: location.pathname } }); return; }
    addToCartMutation.mutate(product.id);
  };

  return (
    <div>
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-navy-surface transition">
          <IoArrowBack size={18} className="text-navy" />
        </button>
        <h1 className="text-xl font-extrabold text-navy">{categoryName}</h1>
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (data || []).length === 0 ? (
        <EmptyState
          title="No products found"
          subtitle="No medicines in this category yet"
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {(data || []).map((p) => (
            <ProductCard key={p.id} product={p} onAddToCart={handleAddToCart} />
          ))}
        </div>
      )}
    </div>
  );
}
