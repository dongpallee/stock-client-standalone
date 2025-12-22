import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Button } from '../ui/button';
import {
  TrendingUp,
  BarChart3,
  Star,
  Settings,
  LogOut,
  Menu,
  User,
  Home
} from 'lucide-react';

const DashboardLayout = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // D-9: 네비게이션 메뉴 재구성 (포트폴리오, 알림 제거)
  const navigation = [
    { name: '개요', href: '/dashboard', icon: Home },
    { name: '시장데이터', href: '/stocks', icon: BarChart3 },
    { name: 'AI분석', href: '/ranking', icon: TrendingUp },
    { name: '관심종목', href: '/watchlist', icon: Star },
  ];


  const handleLogout = async () => {
    try {
      await logout?.();
    } finally {
      navigate('/login', { replace: true });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 바 */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* 로고 및 네비게이션 */}
            <div className="flex items-center space-x-8">
              {/* 모바일 메뉴 버튼 */}
              <button
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-6 w-6 text-gray-400" />
              </button>
              
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">Stock Agent</span>
              </div>
              
              {/* 네비게이션 메뉴 */}
              <div className="hidden md:flex space-x-1">
                {navigation.map((item) => {
                  const isActive = location.pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      to={item.href}
                      className={`
                        px-3 py-2 text-sm font-medium rounded-md transition-colors
                        ${isActive 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                        }
                      `}
                    >
                      <div className="flex items-center">
                        <item.icon className={`
                          mr-2 h-4 w-4 flex-shrink-0
                          ${isActive ? 'text-blue-500' : 'text-gray-400'}
                        `} />
                        {item.name}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* 우측 사용자 정보 및 액션 */}
            <div className="flex items-center space-x-4">
              {/* 날짜 표시 */}
              <span className="hidden lg:block text-sm text-gray-500">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
              </span>
              
              {/* 사용자 정보 */}
              <div className="flex items-center space-x-3">
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-gray-900">
                      {user?.full_name || user?.username || '이동팔'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {user?.email || 'dongpallee@gmail.com'}
                    </p>
                  </div>
                </div>
                
                {/* 액션 버튼들 */}
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/settings')}
                  >
                    <Settings className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">설정</span>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                  >
                    <LogOut className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">로그아웃</span>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* 모바일 메뉴 */}
      {sidebarOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-b border-gray-200">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`
                    block px-3 py-2 text-base font-medium rounded-md transition-colors
                    ${isActive 
                      ? 'bg-blue-50 text-blue-700' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }
                  `}
                  onClick={() => setSidebarOpen(false)}
                >
                  <div className="flex items-center">
                    <item.icon className={`
                      mr-3 h-5 w-5 flex-shrink-0
                      ${isActive ? 'text-blue-500' : 'text-gray-400'}
                    `} />
                    {item.name}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* 메인 콘텐츠 */}
      <main className="flex-1">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardLayout;

