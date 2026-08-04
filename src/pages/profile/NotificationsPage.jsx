import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  IoArrowBack, IoNotificationsOutline, IoReceiptOutline,
  IoCardOutline, IoPricetagOutline, IoAlarmOutline,
} from 'react-icons/io5';
import { notificationAPI } from '../../services/api';
import { PageSpinner } from '../../components/common/Spinner';
import EmptyState from '../../components/common/EmptyState';

const TYPE_ICONS = {
  order: IoReceiptOutline,
  payment: IoCardOutline,
  promo: IoPricetagOutline,
  reminder: IoAlarmOutline,
  system: IoNotificationsOutline,
};

const TYPE_COLORS = {
  order: '#1B5E20',
  payment: '#1976D2',
  promo: '#E65100',
  reminder: '#7B1FA2',
  system: '#4A5578',
};

export default function NotificationsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationAPI.getAll().then((r) => r.data),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationAPI.markRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllMutation = useMutation({
    mutationFn: () => notificationAPI.markAllRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = data?.data || [];
  const unreadCount = data?.pagination?.unreadCount || 0;

  return (
    <div className="">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-xl bg-white shadow-sm flex items-center justify-center hover:bg-primary-surface transition">
            <IoArrowBack size={18} className="text-primary" />
          </button>
          <h1 className="text-2xl font-extrabold text-primary">Notifications</h1>
        </div>
        {unreadCount > 0 && (
          <button
            onClick={() => markAllMutation.mutate()}
            className="text-xs font-semibold text-primary hover:text-accent transition"
          >
            Mark all read
          </button>
        )}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={IoNotificationsOutline}
          title="No notifications"
          subtitle="You're all caught up! Notifications will appear here."
        />
      ) : (
        <div className="flex flex-col gap-2">
          {notifications.map((n) => {
            const Icon = TYPE_ICONS[n.type] || IoNotificationsOutline;
            const color = TYPE_COLORS[n.type] || '#4A5578';
            return (
              <button
                key={n.id}
                onClick={() => !n.isRead && markReadMutation.mutate(n.id)}
                className={`flex items-start gap-3 p-4 rounded-2xl border text-left transition w-full
                  ${n.isRead
                    ? 'bg-white border-gray-100'
                    : 'bg-primary-surface border-primary/20'}`}
              >
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: color + '18' }}
                >
                  <Icon size={20} style={{ color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm leading-snug ${n.isRead ? 'font-medium text-gray-700' : 'font-bold text-primary'}`}>
                    {n.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {new Date(n.createdAt).toLocaleDateString('en-NG', {
                      day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
                    })}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1.5" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
