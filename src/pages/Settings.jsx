import React, { useEffect, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../contexts/AuthContext';
import { stockAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import {
  User,
  Lock,
  Image as ImageIcon,
  Trash2,
  History,
  Monitor,
  Sun,
  Moon,
  Palette,
  Home,
  Loader2,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

const Settings = () => {
  const { user, logout } = useAuth();
  const queryClient = useQueryClient();

  // 로컬 상태
  const [profileForm, setProfileForm] = useState({
    full_name: user?.full_name || '',
    email: user?.email || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_password: '',
  });

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [colorScheme, setColorScheme] = useState(localStorage.getItem('colorScheme') || 'blue');
  const [defaultLandingPage, setDefaultLandingPage] = useState(localStorage.getItem('defaultLandingPage') || '/dashboard');

  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [avatarObjectUrl, setAvatarObjectUrl] = useState(null);

  // 프로필 업데이트 mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data) => stockAPI.settings.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      alert('프로필이 업데이트되었습니다.');
    },
    onError: (error) => {
      alert(error.response?.data?.message || '프로필 업데이트에 실패했습니다.');
    },
  });

  // 비밀번호 변경 mutation
  const changePasswordMutation = useMutation({
    mutationFn: (data) => stockAPI.settings.changePassword(data),
    onSuccess: () => {
      setPasswordForm({
        current_password: '',
        new_password: '',
        confirm_password: '',
      });
      alert('비밀번호가 변경되었습니다.');
    },
    onError: (error) => {
      alert(error.response?.data?.message || '비밀번호 변경에 실패했습니다.');
    },
  });

  // 계정 삭제 mutation
  const deleteAccountMutation = useMutation({
    mutationFn: () => stockAPI.settings.deleteAccount(),
    onSuccess: () => {
      alert('계정이 삭제되었습니다.');
      logout();
    },
    onError: (error) => {
      alert(error.response?.data?.message || '계정 삭제에 실패했습니다.');
    },
  });

  // 로그인 기록 조회
  const {
    data: loginHistory,
    isLoading: historyLoading,
    isError: historyError,
    error: historyErrorObj,
    refetch: refetchHistory,
  } = useQuery({
    queryKey: ['login-history'],
    queryFn: () => stockAPI.settings.getLoginHistory(),
    staleTime: 60_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });




  // 활성 세션 조회
  const {
    data: activeSessions,
    isLoading: sessionsLoading,
    isError: sessionsError,
    error: sessionsErrorObj,
    refetch: refetchSessions,
  } = useQuery({
    queryKey: ['active-sessions'],
    queryFn: () => stockAPI.settings.getActiveSessions(),
    staleTime: 30_000,
    retry: 1,
    refetchOnWindowFocus: false,
  });


  // 프로필 업데이트 핸들러
  const handleProfileUpdate = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(profileForm);
  };

  // 비밀번호 변경 핸들러
  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (passwordForm.new_password !== passwordForm.confirm_password) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    if (passwordForm.new_password.length < 8) {
      alert('비밀번호는 최소 8자 이상이어야 합니다.');
      return;
    }

    changePasswordMutation.mutate({
      current_password: passwordForm.current_password,
      new_password: passwordForm.new_password,
    });
  };

  // 아바타 파일 선택 핸들러
  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // 계정 삭제 핸들러
  const handleDeleteAccount = () => {
    if (window.confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      if (window.confirm('모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
        deleteAccountMutation.mutate();
      }
    }
  };

  // 테마 변경 핸들러
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    // 실제 테마 적용은 추후 구현
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  // 색상 테마 변경 핸들러
  const handleColorSchemeChange = (scheme) => {
    setColorScheme(scheme);
    localStorage.setItem('colorScheme', scheme);
    // 실제 색상 테마 적용은 추후 구현
  };

  // 기본 랜딩 페이지 변경 핸들러
  const handleDefaultLandingPageChange = (page) => {
    setDefaultLandingPage(page);
    localStorage.setItem('defaultLandingPage', page);
  };

  const colorSchemes = [
    { name: 'Blue', value: 'blue', color: 'bg-blue-500' },
    { name: 'Green', value: 'green', color: 'bg-green-500' },
    { name: 'Purple', value: 'purple', color: 'bg-purple-500' },
    { name: 'Orange', value: 'orange', color: 'bg-orange-500' },
  ];

  const landingPages = [
    { name: '개요', value: '/dashboard', icon: Home },
    { name: '시장데이터', value: '/stocks', icon: Monitor },
    { name: '관심종목', value: '/watchlist', icon: User },
  ];

  return (
    <div className="space-y-6">
      {/* 페이지 헤더 */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">설정</h1>
        <p className="text-gray-500 mt-1">
          계정 및 시스템 설정을 관리하세요
        </p>
      </div>

      {/* 탭 기반 설정 */}
      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">프로필</TabsTrigger>
          <TabsTrigger value="account">계정 관리</TabsTrigger>
          <TabsTrigger value="display">화면 설정</TabsTrigger>
        </TabsList>

        {/* 프로필 탭 */}
        <TabsContent value="profile" className="space-y-6">
          {/* 기본 정보 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                기본 정보
              </CardTitle>
              <CardDescription>
                이름, 이메일 등 기본 프로필 정보를 수정합니다
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                {/* 이름/닉네임 */}
                <div className="space-y-2">
                  <Label htmlFor="full_name">이름</Label>
                  <Input
                    id="full_name"
                    type="text"
                    value={profileForm.full_name}
                    onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                    placeholder="이름을 입력하세요"
                  />
                </div>

                {/* 이메일 */}
                <div className="space-y-2">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileForm.email}
                    onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                    placeholder="email@example.com"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="w-full"
                >
                  {updateProfileMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      저장 중...
                    </>
                  ) : (
                    '변경사항 저장'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* 프로필 사진 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                프로필 사진
              </CardTitle>
              <CardDescription>
                프로필 사진을 업로드하세요
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-20 w-20 bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="h-full w-full object-cover" />
                  ) : (
                    <User className="h-10 w-10 text-gray-400" />
                  )}
                </div>
                <div className="flex-1">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    JPG, PNG 파일을 업로드하세요 (최대 5MB)
                  </p>
                </div>
              </div>

              {avatarFile && (
                <Button className="w-full" disabled>
                  업로드 (준비 중)
                </Button>
              )}
            </CardContent>
          </Card>

          {/* 비밀번호 변경 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" />
                비밀번호 변경
              </CardTitle>
              <CardDescription>
                계정 보안을 위해 비밀번호를 변경하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handlePasswordChange} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current_password">현재 비밀번호</Label>
                  <Input
                    id="current_password"
                    type="password"
                    value={passwordForm.current_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                    placeholder="현재 비밀번호"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="new_password">새 비밀번호</Label>
                  <Input
                    id="new_password"
                    type="password"
                    value={passwordForm.new_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                    placeholder="새 비밀번호 (최소 8자)"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirm_password">새 비밀번호 확인</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    value={passwordForm.confirm_password}
                    onChange={(e) => setPasswordForm({ ...passwordForm, confirm_password: e.target.value })}
                    placeholder="새 비밀번호 확인"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={changePasswordMutation.isPending}
                  className="w-full"
                >
                  {changePasswordMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      변경 중...
                    </>
                  ) : (
                    '비밀번호 변경'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 계정 관리 탭 */}
        <TabsContent value="account" className="space-y-6">
          {/* 로그인 기록 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                로그인 기록
              </CardTitle>
              <CardDescription>
                최근 로그인 활동을 확인하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {historyLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : loginHistory && loginHistory.length > 0 ? (
                <div className="space-y-3">
                  {loginHistory.slice(0, 5).map((record, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{record.ip_address || 'Unknown IP'}</p>
                        <p className="text-sm text-gray-500">
                          {record.user_agent || 'Unknown Device'}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-600">
                          {new Date(record.login_time).toLocaleString('ko-KR')}
                        </p>
                        <Badge variant="outline" className="mt-1">
                          {record.status || 'Success'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>로그인 기록이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 활성 세션 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                활성 세션
              </CardTitle>
              <CardDescription>
                현재 로그인된 디바이스를 관리하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                </div>
              ) : activeSessions && activeSessions.length > 0 ? (
                <div className="space-y-3">
                  {activeSessions.map((session, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <Monitor className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium">{session.device || 'Unknown Device'}</p>
                          <p className="text-sm text-gray-500">{session.location || 'Unknown Location'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {session.is_current && (
                          <Badge variant="default">현재 세션</Badge>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={session.is_current}
                        >
                          종료
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Info className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>활성 세션이 없습니다</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 계정 삭제 */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                계정 삭제
              </CardTitle>
              <CardDescription>
                계정을 영구적으로 삭제합니다. 이 작업은 되돌릴 수 없습니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-800">
                    <p className="font-semibold mb-1">경고</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>모든 개인 데이터가 영구적으로 삭제됩니다</li>
                      <li>관심종목 목록이 삭제됩니다</li>
                      <li>분석 기록이 삭제됩니다</li>
                      <li>이 작업은 되돌릴 수 없습니다</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Button
                variant="destructive"
                onClick={handleDeleteAccount}
                disabled={deleteAccountMutation.isPending}
                className="w-full"
              >
                {deleteAccountMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    삭제 중...
                  </>
                ) : (
                  '계정 영구 삭제'
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 화면 설정 탭 */}
        <TabsContent value="display" className="space-y-6">
          {/* 테마 설정 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                테마 설정
              </CardTitle>
              <CardDescription>
                라이트/다크 모드를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => handleThemeChange('light')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    theme === 'light'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun className="h-8 w-8 mx-auto mb-3 text-yellow-500" />
                  <p className="font-medium">라이트 모드</p>
                  {theme === 'light' && (
                    <CheckCircle className="h-5 w-5 text-blue-500 mx-auto mt-2" />
                  )}
                </button>

                <button
                  onClick={() => handleThemeChange('dark')}
                  className={`p-6 border-2 rounded-lg transition-all ${
                    theme === 'dark'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon className="h-8 w-8 mx-auto mb-3 text-indigo-500" />
                  <p className="font-medium">다크 모드</p>
                  {theme === 'dark' && (
                    <CheckCircle className="h-5 w-5 text-blue-500 mx-auto mt-2" />
                  )}
                </button>
              </div>
            </CardContent>
          </Card>

          {/* 색상 테마 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                색상 테마
              </CardTitle>
              <CardDescription>
                원하는 색상 테마를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {colorSchemes.map((scheme) => (
                  <button
                    key={scheme.value}
                    onClick={() => handleColorSchemeChange(scheme.value)}
                    className={`p-4 border-2 rounded-lg transition-all ${
                      colorScheme === scheme.value
                        ? 'border-blue-500'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`h-12 w-12 rounded-full ${scheme.color} mx-auto mb-2`} />
                    <p className="text-sm font-medium">{scheme.name}</p>
                    {colorScheme === scheme.value && (
                      <CheckCircle className="h-4 w-4 text-blue-500 mx-auto mt-1" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 대시보드 레이아웃 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                기본 랜딩 페이지
              </CardTitle>
              <CardDescription>
                로그인 후 처음 보여질 페이지를 선택하세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {landingPages.map((page) => (
                  <button
                    key={page.value}
                    onClick={() => handleDefaultLandingPageChange(page.value)}
                    className={`w-full p-4 border-2 rounded-lg transition-all flex items-center justify-between ${
                      defaultLandingPage === page.value
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <page.icon className="h-5 w-5 text-gray-600" />
                      <span className="font-medium">{page.name}</span>
                    </div>
                    {defaultLandingPage === page.value && (
                      <CheckCircle className="h-5 w-5 text-blue-500" />
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 설정 안내 */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="pt-6">
              <div className="flex gap-3">
                <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-semibold mb-1">설정 안내</p>
                  <p>
                    변경한 설정은 자동으로 저장되며, 브라우저를 새로고침해도 유지됩니다.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
