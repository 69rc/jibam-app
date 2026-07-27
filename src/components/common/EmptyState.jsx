export default function EmptyState({ icon: Icon, title, subtitle, actionLabel, onAction }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 gap-4 text-center">
      {Icon && (
        <div className="w-24 h-24 rounded-full bg-cyan-surface border-2 border-cyan/30 flex items-center justify-center">
          <Icon size={48} className="text-cyan" />
        </div>
      )}
      <h3 className="text-lg font-bold text-navy">{title}</h3>
      {subtitle && <p className="text-sm text-gray-500 max-w-xs leading-relaxed">{subtitle}</p>}
      {actionLabel && onAction && (
        <button onClick={onAction} className="btn-primary mt-2 px-8">
          {actionLabel}
        </button>
      )}
    </div>
  );
}
