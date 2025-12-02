import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // 로그인하지 않은 사용자는 로그인 페이지로 리다이렉트
    // 현재 위치를 state로 저장하여 로그인 후 원래 페이지로 돌아갈 수 있도록 함
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;

