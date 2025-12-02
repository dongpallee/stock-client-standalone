import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { stockAPI } from '../../lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Search, 
  Filter,
  X,
  Loader2 
} from 'lucide-react';

const StockSearch = ({ onResultClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [filters, setFilters] = useState({
    market: '',
    sector: '',
    minMarketCap: '',
    maxMarketCap: '',
    minPer: '',
    maxPer: '',
    minPbr: '',
    maxPbr: ''
  });

  // 실시간 검색 (debounced)
  const { 
    data: searchResults, 
    isLoading,
    error 
  } = useQuery({
    queryKey: ['stock-search', searchTerm, filters],
    queryFn: () => {
      if (!searchTerm.trim() && !Object.values(filters).some(v => v)) {
        return { data: { stocks: [] } };
      }
      
      const params = {
        search: searchTerm,
        per_page: 10,
        ...Object.fromEntries(Object.entries(filters).filter(([_, v]) => v))
      };
      
      return stockAPI.getStocks(params);
    },
    enabled: searchTerm.length >= 2 || Object.values(filters).some(v => v),
    staleTime: 30000 // 30초간 캐시 유지
  });

  const stocks = searchResults?.data?.stocks || [];

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      market: '',
      sector: '',
      minMarketCap: '',
      maxMarketCap: '',
      minPer: '',
      maxPer: '',
      minPbr: '',
      maxPbr: ''
    });
    setSearchTerm('');
  };

  const getMarketColor = (market) => {
    switch (market) {
      case 'KOSPI': return 'bg-blue-100 text-blue-800';
      case 'KOSDAQ': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>종목 검색</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            고급 검색
          </Button>
        </CardTitle>
        <CardDescription>
          종목명 또는 종목코드로 빠르게 검색하세요
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* 기본 검색 */}
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="종목명 또는 종목코드 입력..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1 h-6 w-6 p-0"
              onClick={() => setSearchTerm('')}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* 고급 검색 필터 */}
        {isAdvancedOpen && (
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">고급 필터</h4>
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <X className="h-4 w-4 mr-1" />
                초기화
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">시장</label>
                <select 
                  value={filters.market} 
                  onChange={(e) => handleFilterChange('market', e.target.value)}
                  className="w-full border rounded px-2 py-1 text-sm"
                >
                  <option value="">전체</option>
                  <option value="KOSPI">KOSPI</option>
                  <option value="KOSDAQ">KOSDAQ</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-gray-600">섹터</label>
                <Input
                  type="text"
                  placeholder="업종 입력"
                  value={filters.sector}
                  onChange={(e) => handleFilterChange('sector', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">최소 시가총액 (조원)</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minMarketCap}
                  onChange={(e) => handleFilterChange('minMarketCap', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">최대 시가총액 (조원)</label>
                <Input
                  type="number"
                  placeholder="100"
                  value={filters.maxMarketCap}
                  onChange={(e) => handleFilterChange('maxMarketCap', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">최소 PER</label>
                <Input
                  type="number"
                  placeholder="0"
                  value={filters.minPer}
                  onChange={(e) => handleFilterChange('minPer', e.target.value)}
                  className="text-sm"
                />
              </div>
              
              <div>
                <label className="text-sm text-gray-600">최대 PER</label>
                <Input
                  type="number"
                  placeholder="30"
                  value={filters.maxPer}
                  onChange={(e) => handleFilterChange('maxPer', e.target.value)}
                  className="text-sm"
                />
              </div>
            </div>
          </div>
        )}

        {/* 검색 결과 */}
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            <span className="text-sm text-gray-500">검색 중...</span>
          </div>
        )}

        {error && (
          <div className="text-center py-4">
            <p className="text-sm text-red-500">검색 중 오류가 발생했습니다.</p>
          </div>
        )}

        {stocks.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">검색 결과</h4>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {stocks.map((stock) => (
                <div
                  key={stock.code}
                  className="flex items-center justify-between p-3 bg-white border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                  onClick={() => onResultClick && onResultClick(stock)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-medium text-gray-900">{stock.name}</h5>
                      <Badge className={getMarketColor(stock.market)}>
                        {stock.market}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>{stock.code}</span>
                      <span>{stock.sector}</span>
                      {stock.market_cap && (
                        <span>시총 {(stock.market_cap / 100).toFixed(1)}조</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {stock.current_price && (
                      <div className="text-sm font-medium">
                        {stock.current_price.toLocaleString()}원
                      </div>
                    )}
                    {stock.change_rate && (
                      <div className={`text-xs ${
                        stock.change_rate >= 0 ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {stock.change_rate >= 0 ? '+' : ''}{stock.change_rate}%
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {searchTerm.length >= 2 && stocks.length === 0 && !isLoading && !error && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">검색 결과가 없습니다.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default StockSearch;