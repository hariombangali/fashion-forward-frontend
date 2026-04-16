import { Navigate } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { FullPageLoader } from './Loader';

const ProtectedRoute = ({ children, roles = [], redirectTo = '/login' }) => {
  const { user, token } = useAuthStore();

  // If a token exists but user hasn't been fetched yet, wait (initial load)
  // Don't check `loading` — it flickers for profile updates, cart, etc. which
  // shouldn't unmount the child component.
  if (token && !user) {
    return <FullPageLoader />;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace />;
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
