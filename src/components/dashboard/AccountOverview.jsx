import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Wallet,
  PieChart,
  Target,
  Star,
  Eye
} from 'lucide-react';

const AccountOverview = ({ data }) => {
  // Default data if not provided
  const defaultData = {
    total_portfolio_value: 50000000, // 5천만원
    total_investment: 45000000, // 4천5백만원  
    total_profit: 5000000, // 500만원
    daily_profit: 250000, // 25만원
    watchlist_count: 15,
    profitable_stocks: 8
  };

  const accountData = data || defaultData;
  
    const safeNumber = (v, fallback = 0) =>
    Number.isFinite(Number(v)) ? Number(v) : fallback;

  const investment = safeNumber(accountData.total_investment);
  const portfolioValue = safeNumber(accountData.total_portfolio_value);
  const totalProfit = safeNumber(accountData.total_profit);
  const dailyProfit = safeNumber(accountData.daily_profit);

  const profitPercentage =
    investment > 0 ? (totalProfit / investment) * 100 : 0;

  const dailyProfitPercentage =
    portfolioValue > 0 ? (dailyProfit / portfolioValue) * 100 : 0;

  const normalizeWon = (amount) => {
    const n = Number(amount);
    if (!Number.isFinite(n)) return 0;
    const rounded = Math.round(n);
    return Object.is(rounded, -0) ? 0 : rounded;
  };

  const formatKoreanCurrency = (amount) => {
    const won = normalizeWon(amount);
    const abs = Math.abs(won);
    const sign = won < 0 ? '-' : '';

    if (abs >= 100000000) return `${sign}${(abs / 100000000).toFixed(1)}억원`;
    if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(0)}천만원`;
    if (abs >= 10000) return `${sign}${(abs / 10000).toFixed(0)}만원`;
    return `${sign}${abs.toLocaleString()}원`;
  };

  const formatPercentage = (percentage) => {
    return `${percentage >= 0 ? '+' : ''}${percentage.toFixed(2)}%`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Wallet className="h-5 w-5 text-blue-500" />
          <span>포트폴리오 개요</span>
        </CardTitle>
        <CardDescription>
          실시간 포트폴리오 가치 및 수익률 현황
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Portfolio Overview */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">총 포트폴리오 가치</span>
            </div>
            <div className="text-2xl font-bold">{formatKoreanCurrency(accountData.total_portfolio_value)}</div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Wallet className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">총 투자원금</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">
              {formatKoreanCurrency(accountData.total_investment)}
            </div>
          </div>
        </div>

        {/* P&L Section */}
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                {accountData.total_profit >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500" />
                )}
                <span className="text-sm font-medium">총 손익</span>
              </div>
              <div className={`text-xl font-bold ${accountData.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatKoreanCurrency(accountData.total_profit)}
              </div>
              <div className={`text-sm ${accountData.total_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(profitPercentage)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Target className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">일일 손익</span>
              </div>
              <div className={`text-xl font-bold ${accountData.daily_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatKoreanCurrency(accountData.daily_profit)}
              </div>
              <div className={`text-sm ${accountData.daily_profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(dailyProfitPercentage)}
              </div>
            </div>
          </div>
        </div>

        {/* Investment Distribution */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <PieChart className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">수익률 분포</span>
            </div>
            <span className="text-sm font-medium">{profitPercentage.toFixed(1)}%</span>
          </div>
          <Progress
            value={Math.min(Math.abs(profitPercentage), 100)}
            className="h-3"
          />
          <span className="text-xs text-muted-foreground">
            {profitPercentage >= 0 ? '수익 구간' : '손실 구간'}
          </span>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>투자원금: {formatKoreanCurrency(accountData.total_investment)}</span>
            <span>수익: {formatKoreanCurrency(accountData.total_profit)}</span>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {accountData.watchlist_count > 0
                ? ((accountData.profitable_stocks / accountData.watchlist_count) * 100).toFixed(1)
                : '0.0'}%
            </div>
            <div className="text-xs text-muted-foreground">수익종목 비율</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-purple-600">
              {Math.abs(profitPercentage).toFixed(1)}%
            </div>
            <div className="text-xs text-muted-foreground">수익률</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {profitPercentage > 20 ? '공격적' : profitPercentage > 10 ? '중도' : '보수적'}
            </div>
            <div className="text-xs text-muted-foreground">투자성향</div>
          </div>
        </div>

        {/* Portfolio Breakdown */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">포트폴리오 구성</h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm">대형주</span>
              </div>
              <span className="text-sm font-medium">{formatKoreanCurrency(accountData.total_portfolio_value * 0.6)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <Star className="h-4 w-4 text-blue-500" />
                <span className="text-sm">중소형주</span>
              </div>
              <span className="text-sm font-medium">{formatKoreanCurrency(accountData.total_portfolio_value * 0.3)}</span>
            </div>
            <div className="flex justify-between items-center p-2 rounded bg-gray-50 dark:bg-gray-800">
              <div className="flex items-center space-x-2">
                <Eye className="h-4 w-4 text-purple-500" />
                <span className="text-sm">테마주</span>
              </div>
              <span className="text-sm font-medium">{formatKoreanCurrency(accountData.total_portfolio_value * 0.1)}</span>
            </div>
          </div>
        </div>

        {/* Watchlist Summary */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">관심종목 현황</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold text-blue-600">{accountData.watchlist_count}</div>
              <div className="text-sm text-muted-foreground">총 관심종목</div>
            </div>
            <div className="text-center p-3 rounded-lg border">
              <div className="text-2xl font-bold text-green-600">{accountData.profitable_stocks}</div>
              <div className="text-sm text-muted-foreground">수익종목</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccountOverview;