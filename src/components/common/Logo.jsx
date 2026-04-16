import { Link } from 'react-router-dom';
import useSettingsStore from '../../store/settingsStore';

/**
 * Centralized brand Logo component.
 * - If admin uploaded a logoUrl in settings → show that image
 * - Otherwise → show storeName as gradient text
 *
 * Props:
 *   - to: link destination (default '/')
 *   - size: 'sm' | 'md' | 'lg' | 'xl'
 *   - variant: 'default' | 'dark' | 'light' — controls text color when no logo
 *   - showTagline: boolean
 *   - className: extra classes for the wrapper
 */
export default function Logo({
  to = '/',
  size = 'md',
  variant = 'default',
  showTagline = false,
  className = '',
}) {
  const { settings } = useSettingsStore();
  const logoUrl  = settings?.logoUrl;
  const storeName = settings?.storeName || 'Fashion Forward';
  const tagline   = settings?.tagline   || 'Curating your style';

  const sizeMap = {
    sm: { img: 'h-8',  text: 'text-lg',  tagline: 'text-[10px]' },
    md: { img: 'h-10', text: 'text-2xl', tagline: 'text-xs' },
    lg: { img: 'h-14', text: 'text-3xl', tagline: 'text-sm' },
    xl: { img: 'h-20', text: 'text-5xl', tagline: 'text-base' },
  };
  const s = sizeMap[size] || sizeMap.md;

  const textColorClass =
    variant === 'dark'  ? 'text-white'
    : variant === 'light' ? 'text-gray-900'
    : 'text-brand-gradient font-extrabold';

  const content = logoUrl ? (
    <div className="flex items-center gap-2">
      <img
        src={logoUrl}
        alt={storeName}
        className={`${s.img} w-auto object-contain`}
        onError={(e) => { e.currentTarget.style.display = 'none'; }}
      />
      {showTagline && (
        <span className={`${s.tagline} text-gray-500 hidden sm:inline`}>{tagline}</span>
      )}
    </div>
  ) : (
    <div className="flex flex-col leading-none">
      <span className={`${s.text} ${textColorClass} font-extrabold tracking-tight`}>
        {storeName}
      </span>
      {showTagline && (
        <span className={`${s.tagline} mt-1 ${variant === 'dark' ? 'text-white/70' : 'text-gray-500'}`}>
          {tagline}
        </span>
      )}
    </div>
  );

  if (!to) return <div className={className}>{content}</div>;

  return (
    <Link to={to} className={`inline-block ${className}`}>
      {content}
    </Link>
  );
}
