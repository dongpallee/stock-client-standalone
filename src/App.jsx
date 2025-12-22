import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from './lib/queryClient';
import { AuthProvider } from './contexts/AuthContext';
import { useInactivityTimer } from './hooks/useInactivityTimer';

// Layout & Route Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';

// Page-level Route Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';
import Dashboard from './pages/Dashboard';
import StockList from './pages/StockList';
import StockDetail from './pages/StockDetail';
import Ranking from './pages/Ranking';
import Watchlist from './pages/Watchlist';
import Settings from './pages/Settings';

import './App.css';

// 사용자 비활성 상태를 감지하기 위한 래퍼 컴포넌트
const AppWithInactivityTimer = ({ children }) => {
  useInactivityTimer();
  return children;
};

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppWithInactivityTimer>
          <Router>
            <div className="min-h-screen bg-gray-50">
              <Routes>
              {/* 인증 없이 접근 가능한 공개 라우트 */}
              <Route path="/login" element={<LoginForm />} />
              <Route path="/register" element={<RegisterForm />} />
              
              {/* 보호된 라우트 */}
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Dashboard />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/stocks" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StockList />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/stocks/:stockCode" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <StockDetail />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/ranking" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Ranking />
                  </DashboardLayout>
                </ProtectedRoute>
              } />
              
              <Route path="/watchlist" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Watchlist />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              <Route path="/settings" element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Settings />
                  </DashboardLayout>
                </ProtectedRoute>
              } />

              {/* 기본 리다이렉트 */}
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </div>
          </Router>
        </AppWithInactivityTimer>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;

