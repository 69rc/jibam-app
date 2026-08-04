import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  IoArrowBack, IoLocationOutline, IoCallOutline,
  IoChatbubbleOutline, IoCardOutline, IoReceiptOutline,
  IoCheckmark, IoBicycleOutline,
} from 'react-icons/io5';
import { orderAPI } from '../../services/api';
import { PageSpinner } from '../../components/common/Spinner';
import { ORDER_STATUSES } from '../../constants';

const STATUS_STEPS = ['pending', 'paid', 'processing', 'ready', 'out_for_delivery', 'delivered'];

export default function OrderDetailPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderAPI.getById(orderId).then((r) => r.data.data),
  });

  if (isLoading) return <PageSpinner />;
  if (!order) return (
    <div className="text-center py-20">
      <p className="text-gray-500 mb-4">Order not found.</p>
      <button onClick={() => navigate('/orders')} className="btn-primary px-8">Back to Orders</button>
    </div>
  );

  const statusInfo = ORDER_STATUSES[order.status] || {};
  const currentStep = STATUS_STEPS.indexOf(order.status);

  return (
    <div className="">
      {/* Back */}
      <button
        onClick={() => navigate('/orders')}
        className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-primary mb-5 transition"
      >
        <IoArrowBack size={17} /> Back to Orders
      </button>

      <h1 className="text-xl font-extrabold text-primary mb-5">Order #{order.orderNumber}</h1>

      {/* Status banner */}
      <div
        className="flex items-center gap-4 rounded-2xl p-4 mb-5"
        style={{ backgroundColor: statusInfo.bg || '#E8ECF8' }}
      >
        <div className="w-14 h-14 rounded-xl bg-white/70 flex items-center justify-center flex-shrink-0">
          <IoBicycleOutline size={32} style={{ color: statusInfo.color || '#1B5E20' }} />
        </div>
        <div>
          <p className="text-lg font-extrabold" style={{ color: statusInfo.color || '#1B5E20' }}>
            {statusInfo.label || order.status}
          </p>
          <p className="text-xs text-gray-500">
            {new Date(order.updatedAt || order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'full' })}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        {/* Tracking steps */}
        {order.status !== 'cancelled' && (
          <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
            <h3 className="text-sm font-bold text-primary mb-4">Order Tracking</h3>
            <div className="flex flex-col">
              {STATUS_STEPS.map((step, i) => {
                const isCompleted = i <= currentStep;
                const isCurrent = i === currentStep;
                const info = ORDER_STATUSES[step] || {};
                return (
                  <div key={step} className="flex items-stretch gap-4">
                    {/* Left: dot + line */}
                    <div className="flex flex-col items-center w-6">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition
                        ${isCompleted ? 'bg-primary border-primary' : isCurrent ? 'border-primary bg-white' : 'border-gray-300 bg-white'}`}>
                        {isCompleted && <IoCheckmark size={11} className="text-white" />}
                      </div>
                      {i < STATUS_STEPS.length - 1 && (
                        <div className={`w-0.5 flex-1 min-h-5 mt-0.5 rounded transition ${isCompleted ? 'bg-primary' : 'bg-gray-200'}`} />
                      )}
                    </div>
                    {/* Label */}
                    <p className={`text-sm pb-5 pt-0.5 transition ${isCompleted ? 'text-primary font-semibold' : 'text-gray-400'}`}>
                      {info.label || step}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-4">Items Ordered</h3>
          <div className="flex flex-col gap-3">
            {order.items?.map((item) => (
              <div key={item.id} className="flex items-center gap-3">
                <img
                  src={item.productImage || `https://via.placeholder.com/56x56/E8F5E9/1B5E20?text=${item.productName?.[0]}`}
                  alt={item.productName}
                  className="w-14 h-14 rounded-xl object-cover bg-gray-50 flex-shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-primary line-clamp-2">{item.productName}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity} × ₦{Number(item.price).toLocaleString()}</p>
                </div>
                <span className="text-sm font-extrabold text-primary flex-shrink-0">
                  ₦{Number(item.total).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment summary */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-3">Payment Summary</h3>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Subtotal</span>
              <span className="font-semibold text-primary">₦{Number(order.subtotal).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Delivery Fee</span>
              <span className="font-semibold text-primary">₦{Number(order.deliveryFee).toLocaleString()}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between">
                <span className="text-primary">Discount ({order.promoCode})</span>
                <span className="font-semibold text-primary">-₦{Number(order.discount).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between pt-2 border-t border-gray-100 mt-1">
              <span className="font-bold text-primary">Total Paid</span>
              <span className="text-lg font-extrabold text-primary">₦{Number(order.total).toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Delivery info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-3">Delivery Info</h3>
          <div className="flex flex-col gap-2">
            {[
              { Icon: IoLocationOutline, text: order.deliveryAddress },
              { Icon: IoCallOutline, text: order.deliveryPhone },
              order.deliveryInstructions && { Icon: IoChatbubbleOutline, text: order.deliveryInstructions },
            ].filter(Boolean).map(({ Icon, text }, i) => (
              <div key={i} className="flex items-start gap-2">
                <Icon size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-600 leading-relaxed">{text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment info */}
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <h3 className="text-sm font-bold text-primary mb-3">Payment Info</h3>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <IoCardOutline size={16} className="text-primary" />
              <span className="text-sm text-gray-600">Paystack · {order.paymentStatus}</span>
            </div>
            {order.paymentReference && (
              <div className="flex items-start gap-2">
                <IoReceiptOutline size={16} className="text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs font-mono text-gray-500 break-all">{order.paymentReference}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
