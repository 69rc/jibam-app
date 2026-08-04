import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoHeartOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { wishlistAPI, cartAPI } from '../../services/api';
import ProductCard from '../../components/product/ProductCard';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

export default function WishlistPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['wishlist'],
    queryFn: () => wishlistAPI.get().then((r) => r.data.data),
  });

  const addToCartMutation = useMutation({
    mutationFn: (productId) => cartAPI.addItem({ productId, quantity: 1 }),
    onSuccess: () => { queryClient.invalidateQueries(['cart']); toast.success('Added to cart!'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed'),
  });

  const items = data?.map((w) => w.product).filter(Boolean) || [];

  return (
    <div>
      <h1 className="text-2xl font-extrabold text-primary mb-6">My Wishlist</h1>

      {isLoading ? (
        <PageSpinner />
      ) : items.length === 0 ? (
        <EmptyState
          icon={IoHeartOutline}
          title="Your wishlist is empty"
          subtitle="Save products you love to buy later"
          actionLabel="Browse Medicines"
          onAction={() => navigate('/search')}
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={(p) => addToCartMutation.mutate(p.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
