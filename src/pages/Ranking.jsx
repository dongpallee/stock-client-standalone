import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { rankingAPI } from '../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { 
  Trophy, 
  TrendingUp, 
  BarChart3, 
  Newspaper,
  Calculator,
  Crown,
  Medal,
  Award,
  Loader2,
  AlertCircle,
  Eye
} from 'lucide-react';

const Ranking = () => {
  const [selectedCategory, setSelectedCategory] = useState('overall');
  const [limit, setLimit] = useState(20);

  // 전체 랭킹 조회
  const { 
    data: topStocksData, 
    isLoading: topStocksLoading, 
    error: topStocksError 
  } = useQuery({
    queryKey: ['top-stocks', { limit }],
    queryFn: () => rankingAPI.getTopStocks({ limit }),
  });

  // 카테고리별 랭킹 조회
  const CATEGORY_LIMIT = 10;

  const { 
    data: categoryRankingData, 
    isLoading: categoryLoading,
    error: categoryError,
  } = useQuery({
    queryKey: ['ranking-by-category', selectedCategory, CATEGORY_LIMIT],
    queryFn: () => rankingAPI.getRankingByCategory(selectedCategory, CATEGORY_LIMIT),
    enabled: activeTab === 'category',
  });

  const topStocks = topStocksData?.data?.ranking || [];
  const categoryRanking = categoryRankingData?.data?.ranking || [];

  const getRecommendationColor = (recommendation) => {
    switch (recommendation) {
      case '매수': return 'bg-green-100 text-green-800';
      case '매도': return 'bg-red-100 text-red-800';
      default: return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getGradeColor = (grade) => {
    if (['A+', 'A'].includes(grade)) return 'text-green-600';
    if (['B+', 'B'].includes(grade)) return 'text-blue-600';
    if (['C+', 'C'].includes(grade)) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="text-sm font-bold text-gray-600">#{rank}</span>;
    }
  };

  const categories = [
    { id: 'overall', name: '종합', icon: Trophy, description: '전체 종합 점수' },
    { id: 'technical', name: '기술적', icon: BarChart3, description: '기술적 분석 점수' },
    { id: 'fundamental', name: '재무', icon: Calculator, description: '재무 분석 점수' },
    { id: 'news', name: '뉴스', icon: Newspaper, description: '뉴스 분석 점수' },
  ];

  if (topStocksError) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">종목 랭킹</h1>
        </div>
        
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">데이터를 불러올 수 없습니다</h3>
                <p className="text-gray-500">
                  랭킹 데이터를 불러오는 중 오류가 발생했습니다.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return ( 
    <div className="space-y-6"> 
      {/* 페이지 헤더 */} 
      <div className="flex items-center justify-between"> 
        <div> 
          <h1 className="text-3xl font-bold text-gray-900">종목 랭킹</h1> 
          <p className="text-gray-500 mt-1"> 
            상승 가능성이 높은 종목들을 확인하세요 
          </p> 
        </div> 
        <div className="flex items-center space-x-2"> 
          <Button 
            variant={limit === 20 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setLimit(20)} > 
            Top 20 
          </Button> 
          <Button 
            variant={limit === 50 ? "default" : "outline"} 
            size="sm" 
            onClick={() => setLimit(50)} 
          > 
            Top 50 
          </Button> 
        </div> 
      </div>





      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
          <TabsTrigger value="overall">전체 랭킹</TabsTrigger>
          <TabsTrigger value="category">카테고리별</TabsTrigger>
        </TabsList>

        {/* 전체 랭킹 */}
        <TabsContent value="overall" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
                상승 가능성 Top {limit}
              </CardTitle>
              <CardDescription>
                종합 분석 점수 기준 상위 {limit}개 종목
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topStocksLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : topStocks.length > 0 ? (
                <div className="space-y-3">
                  {topStocks.map((stock) => (
                    <div 
                      key={stock.stock_code} 
                      className={`
                        flex items-center justify-between p-4 rounded-lg border transition-colors hover:bg-gray-50
                        ${stock.rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200' : 'bg-white'}
                      `}
                    >
                      <div className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-12 flex justify-center">
                          {getRankIcon(stock.rank)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-1">
                            <h3 className="font-semibold text-gray-900">
                              {stock.stock_name}
                            </h3>
                            <Badge variant="outline">
                              {stock.market}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              {stock.stock_code}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600">
                            {stock.sector}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className={`text-xl font-bold ${getGradeColor(stock.grade)}`}>
                              {stock.overall_score}점
                            </span>
                            <Badge className={getRecommendationColor(stock.recommendation)}>
                              {stock.recommendation}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.grade} 등급 • 신뢰도 {stock.confidence}%
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/stocks/${stock.stock_code}`}>
                            <Eye className="h-4 w-4 mr-1" />
                            상세보기
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">랭킹 데이터가 없습니다</h3>
                  <p className="text-gray-500">
                    분석된 종목이 없습니다. 먼저 종목 분석을 수행해주세요.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 카테고리별 랭킹 */}
        <TabsContent value="category" className="space-y-6">
          {/* 카테고리 선택 */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.map((category) => {
              const Icon = category.icon;
              return (
                <Card 
                  key={category.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCategory === category.id 
                      ? 'ring-2 ring-blue-500 bg-blue-50' 
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                >
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Icon className={`h-8 w-8 mx-auto mb-2 ${
                        selectedCategory === category.id ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <h3 className="font-medium">{category.name}</h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {category.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 선택된 카테고리 랭킹 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                {React.createElement(
                  categories.find(c => c.id === selectedCategory)?.icon || Trophy,
                  { className: "h-5 w-5 mr-2" }
                )}
                {categories.find(c => c.id === selectedCategory)?.name} 분석 Top 10
              </CardTitle>
              <CardDescription>
                {categories.find(c => c.id === selectedCategory)?.description} 기준 상위 10개 종목
              </CardDescription>
            </CardHeader>
            <CardContent>
              {categoryLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : categoryError ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
                    <p className="text-gray-600">카테고리 랭킹을 불러오지 못했습니다.</p>
                  </div>
                </div>

              ) : categoryRanking.length > 0 ? (
                <div className="space-y-3">
                  {categoryRanking.map((stock) => (
                    <div 
                      key={stock.stock_code} 
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0 w-8 flex justify-center">
                          {getRankIcon(stock.rank)}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">
                            {stock.stock_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            {stock.stock_code} • {stock.market}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <div className="font-bold text-lg">
                            {stock.category_score}점
                          </div>
                          <div className="text-sm text-gray-500">
                            종합 {stock.overall_score}점
                          </div>
                        </div>
                        
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/stocks/${stock.stock_code}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">데이터가 없습니다</h3>
                  <p className="text-gray-500">
                    해당 카테고리의 분석 데이터가 없습니다.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Ranking;

