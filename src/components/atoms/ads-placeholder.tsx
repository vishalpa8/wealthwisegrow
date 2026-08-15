interface AdsPlaceholderProps {
  position?: 'header' | 'sidebar' | 'in-content' | 'below-results' | 'sticky';
  size?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function AdsPlaceholder({ position, size, className, style }: AdsPlaceholderProps) {
  return (
    <div
      className={`
        flex items-center justify-center
        border border-dashed border-neutral-200
        bg-neutral-50/30 text-neutral-400
        rounded-lg overflow-hidden
        transition-all duration-300 ease-in-out
        animate-fade-in
        ${className || ''}
      `}
      style={{
        minHeight: 60,
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
        ...style
      }}
      aria-label="Advertisement placeholder"
    >
      {(position || size) && (
        <span className="text-xs font-medium opacity-50 select-none">
          {position && `Ad: ${position}`}
          {position && size && ' | '}
          {size && size}
        </span>
      )}
    </div>
  );
}
