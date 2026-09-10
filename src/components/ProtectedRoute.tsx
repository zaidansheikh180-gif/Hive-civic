import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { authService } from '../services/authService';
import { UserProfile } from '../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
}) => {
  const location = useLocation();
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUserSync());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });

    const unsubscribe = authService.onAuthStateChange((updatedUser) => {
      if (isMounted) {
        setUser(updatedUser);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-[#E7C226] border-t-transparent animate-spin" />
          <span className="text-xs font-mono text-[#CC9E33] tracking-widest uppercase">
            Verifying HIVE Credentials...
          </span>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!user) {
    if (requireAdmin) {
      return <Navigate to="/admin/login" state={{ from: location }} replace />;
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  // Requires admin role
  if (requireAdmin && user.role !== 'admin') {
    return (
      <div className="min-h-[70vh] flex items-center justify-center p-6">
        <div className="glass-panel max-w-md p-8 text-center border border-red-500/30 space-y-4">
          <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 mx-auto flex items-center justify-center font-bold font-mono">
            !
          </div>
          <h2 className="text-lg font-bold text-white uppercase font-helvetica">
            Access Restricted
          </h2>
          <p className="text-xs text-neutral-300 leading-relaxed font-helvetica">
            This administrative area requires verified municipal privileges. Your account ({user.email}) is currently assigned the{' '}
            <span className="font-mono text-[#E7C226]">{user.role}</span> role.
          </p>
          <div className="pt-2 flex flex-col gap-2">
            <a href="/app" className="btn-cut py-2.5 text-xs font-bold uppercase">
              Return to Citizen Portal
            </a>
            <button
              onClick={async () => {
                await authService.signOut();
                window.location.href = '/admin/login';
              }}
              className="btn-cut-border py-2 text-xs font-mono text-neutral-400 hover:text-white"
            >
              Sign In as Municipal Official
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(authService.getCurrentUserSync());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    authService.getCurrentUser().then((currentUser) => {
      if (isMounted) {
        setUser(currentUser);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/app'} replace />;
  }

  return <>{children}</>;
};
