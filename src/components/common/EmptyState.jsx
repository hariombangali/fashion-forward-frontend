import { Link } from 'react-router-dom';
import { PackageOpen } from 'lucide-react';

const EmptyState = ({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  message = '',
  actionLabel,
  actionLink,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="mb-4 h-16 w-16 text-gray-300" />
      <h3 className="mb-2 text-lg font-semibold text-gray-900">{title}</h3>
      {message && <p className="mb-6 max-w-sm text-sm text-gray-500">{message}</p>}
      {actionLabel && actionLink && (
        <Link
          to={actionLink}
          className="rounded-md bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
        >
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
