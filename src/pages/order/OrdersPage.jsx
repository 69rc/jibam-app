import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { IoReceiptOutline, IoChevronForward } from 'react-icons/io5';
import { orderAPI } from '../../services/api';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';
import { ORDER_STATUSES } from '../../constants';

const STATUS_TABS = ['All', 'pending', 'paid', 'processing', 'out_for_delivery', 'delivered', 'cancelled'];

function OrderCard({ order }) {
  const statusInfo = ORDER_STATUSES[order.status] || { label: order.status, color: '#4A5578', bg: '#F4F6FB' };
  const firstItem = order.items?.[0];

  return (
    <Link
      to={`/orders/${order.id}`}
      className="block bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div>
          <p className="text-sm font-bold text-navy">Order #{order.orderNumber}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {new Date(order.createdAt).toLocaleDateString('en-NG', {
              day: '2-digit', month: 'short', year: 'numeric',
            })}
          </p>
        </div>
        <span
          className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
          style={{ color: statusInfo.color, backgroundColor: statusInfo.bg }}
        >
          {statusInfo.label}
        </span>
      </div>

      {firstItem && (
        <p className="text-xs text-gray-500 truncate mb-2">
          {firstItem.productName}
          {order.items.length > 1 && ` +${order.items.length - 1} more`}
        </p>
      )}

      <div className="flex items-center justify-between mt-1">
        <span className="text-base font-extrabold text-navy">₦{Number(order.total).toLocaleString()}</span>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5">
            <div
              className="w-1.5 h-1.5 rounded-full"
              style={{ backgroundColor: order.paymentStatus === 'paid' ? '#0D1B5E' : '#F57C00' }}
            />
            <span className="text-xs text-gray-400 capitalize">{order.paymentStatus}</span>
          </div>
          <IoChevronForward size={14} className="text-gray-300" />
        </div>
      </div>
    </Link>
  );
}

export default function OrdersPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['my-orders', activeTab],
    queryFn: () =>
      orderAPI.getMyOrders({ limit: 50, status: activeTab === 'All' ? undefined : activeTab })
        .then((r) => r.data.data),
  });

  return (
    <div className="">
      <h1 className="text-2xl font-extrabold text-navy mb-5">My Orders</h1>

      {/* Status filter tabs */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 mb-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full border-2 text-xs font-bold transition
              ${activeTab === tab
                ? 'border-navy bg-navy-surface text-navy'
                : 'border-gray-200 text-gray-500 hover:border-gray-300 bg-white'}`}
          >
            {tab === 'All' ? 'All' : (ORDER_STATUSES[tab]?.label || tab)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (data?.length || 0) === 0 ? (
        <EmptyState
          icon={IoReceiptOutline}
          title="No orders yet"
          subtitle="Your order history will appear here"
          actionLabel="Shop Now"
          onAction={() => navigate('/search')}
        />
      ) : (
        <div className="flex flex-col gap-3">
          {data.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
