import { useLocation, Link, useNavigate } from 'react-router-dom';
import { IoCheckmarkCircle, IoLocationOutline } from 'react-icons/io5';

export default function OrderSuccessPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { orderId, orderNumber } = location.state || {};

  return (
    <div className="max-w-md mx-auto flex flex-col items-center justify-center min-h-[70vh] gap-6 text-center px-4">
      {/* Icon */}
      <div className="w-36 h-36 rounded-full bg-navy-surface flex items-center justify-center animate-[bounceIn_0.6s_ease-out]">
        <IoCheckmarkCircle size={88} className="text-navy" />
      </div>

      <div className="flex flex-col gap-3">
        <h1 className="text-3xl font-black text-navy">Order Placed! 🎉</h1>
        <p className="text-gray-500">Your order has been placed successfully.</p>

        {orderNumber && (
          <div className="bg-navy-surface rounded-2xl px-8 py-4 flex flex-col gap-1">
            <p className="text-xs text-gray-500">Order Number</p>
            <p className="text-xl font-extrabold text-navy">#{orderNumber}</p>
          </div>
        )}

        <p className="text-sm text-gray-400 leading-relaxed">
          You'll receive a confirmation soon. Track your delivery from the Orders page.
        </p>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {orderId && (
          <Link
            to={`/orders/${orderId}`}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            <IoLocationOutline size={18} />
            Track My Order
          </Link>
        )}
        <Link to="/" className="btn-outline w-full text-center">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}
