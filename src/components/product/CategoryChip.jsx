export default function CategoryChip({ category, selected, onPress }) {
  return (
    <button
      onClick={() => onPress?.(category)}
      className="flex flex-col items-center gap-1.5 w-20 flex-shrink-0"
    >
      <div className={`w-14 h-14 rounded-2xl border-2 flex items-center justify-center overflow-hidden transition-all
        ${selected
          ? 'border-navy bg-navy'
          : 'border-gray-200 bg-navy-surface hover:border-navy/40'}`}>
        {category.image
          ? <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
          : <span className="text-2xl">💊</span>}
      </div>
      <span className={`text-xs text-center leading-tight line-clamp-2 transition-colors
        ${selected ? 'text-navy font-bold' : 'text-gray-500 font-medium'}`}>
        {category.name}
      </span>
    </button>
  );
}
