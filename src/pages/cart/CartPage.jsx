import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { IoTrashOutline, IoCartOutline } from 'react-icons/io5';
import toast from 'react-hot-toast';
import { cartAPI } from '../../services/api';
import useCartStore from '../../store/cartStore';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { DELIVERY_FEE } from '../../constants';

function CartItem({ item, onUpdateQty, onRemove, updating }) {
  const product = item.product;
  return (
    <div className="flex gap-4 items-start bg-white rounded-2xl p-4 border border-gray-100 shadow-sm">
      <img
        src={product?.image || `https://via.placeholder.com/80x80/E8F5E9/1B5E20?text=${product?.name?.[0]}`}
        alt={product?.name}
        className="w-20 h-20 rounded-xl object-cover bg-gray-50 flex-shrink-0"
      />
      <div className="flex-1 min-w-0">
        <Link to={`/products/${product?.id}`} className="text-sm font-semibold text-primary hover:text-accent line-clamp-2 leading-snug">
          {product?.name}
        </Link>
        <p className="text-sm text-gray-400 mt-0.5">₦{Number(item.price).toLocaleString()}</p>

        {/* Qty controls */}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => onUpdateQty(item.id, item.quantity - 1)}
            disabled={item.quantity <= 1 || updating}
            className="w-7 h-7 rounded-lg border-2 border-primary/30 flex items-center justify-center disabled:opacity-30 hover:border-primary transition font-bold text-primary text-sm"
          >−</button>
          <span className="text-sm font-bold text-primary w-5 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQty(item.id, item.quantity + 1)}
            disabled={item.quantity >= product?.stock || updating}
            className="w-7 h-7 rounded-lg border-2 border-primary/30 flex items-center justify-center disabled:opacity-30 hover:border-primary transition font-bold text-primary text-sm"
          >+</button>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button onClick={() => onRemove(item.id)} className="p-1 text-red-400 hover:text-red-600 transition">
          <IoTrashOutline size={17} />
        </button>
        <span className="text-sm font-extrabold text-primary">
          ₦{Number(item.price * item.quantity).toLocaleString()}
        </span>
      </div>
    </div>
  );
}

export default function CartPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setCartData = useCartStore((s) => s.setCartData);

  const { data: cart, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartAPI.getCart().then((r) => r.data.data),
  });

  useEffect(() => {
    if (cart) setCartData({ itemCount: cart.itemCount || 0, subtotal: cart.subtotal || 0 });
  }, [cart, setCartData]);

  const updateMutation = useMutation({
    mutationFn: ({ itemId, quantity }) => cartAPI.updateItem(itemId, { quantity }),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed'),
  });

  const removeMutation = useMutation({
    mutationFn: (itemId) => cartAPI.removeItem(itemId),
    onSuccess: () => { queryClient.invalidateQueries(['cart']); toast.success('Item removed'); },
  });

  const clearMutation = useMutation({
    mutationFn: () => cartAPI.clearCart(),
    onSuccess: () => queryClient.invalidateQueries(['cart']),
  });

  const handleClear = () => {
    if (window.confirm('Remove all items from your cart?')) clearMutation.mutate();
  };

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const total = subtotal + DELIVERY_FEE;

  if (isLoading) return <PageSpinner />;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-primary">
          My Cart
          {items.length > 0 && (
            <span className="ml-2 text-base font-semibold text-gray-400">
              ({items.length} item{items.length > 1 ? 's' : ''})
            </span>
          )}
        </h1>
        {items.length > 0 && (
          <button onClick={handleClear} className="text-sm text-red-500 font-semibold hover:underline">
            Clear Cart
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={IoCartOutline}
          title="Your cart is empty"
          subtitle="Add medicines and products to your cart to continue shopping"
          actionLabel="Browse Products"
          onAction={() => navigate('/search')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {/* Items */}
          <div className="flex flex-col gap-3">
            {items.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                onUpdateQty={(id, qty) => updateMutation.mutate({ itemId: id, quantity: qty })}
                onRemove={(id) => removeMutation.mutate(id)}
                updating={updateMutation.isPending}
              />
            ))}
          </div>

          {/* Order summary */}
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h2 className="text-base font-bold text-primary mb-4">Order Summary</h2>
            <div className="flex flex-col gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-semibold text-primary">₦{Number(subtotal).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Delivery Fee</span>
                <span className="font-semibold text-primary">₦{DELIVERY_FEE.toLocaleString()}</span>
              </div>
              <div className="border-t border-gray-100 pt-3 flex justify-between items-baseline">
                <span className="font-bold text-primary">Total</span>
                <span className="text-xl font-extrabold text-primary">₦{Number(total).toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={() => navigate('/checkout')}
              className="btn-primary w-full mt-5 text-center"
            >
              Proceed to Checkout
            </button>

            <Link to="/search" className="block text-center text-sm text-gray-400 mt-3 hover:text-primary transition">
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
