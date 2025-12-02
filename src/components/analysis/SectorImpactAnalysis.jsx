/**
 * 섹터 영향 분석 컴포넌트
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  RadialBarChart,
  RadialBar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  ScatterChart,
  Scatter,
  TreeMap,
  Cell
} from 'recharts';
import {
  Building,
  Factory,
  Car,
  Smartphone,
  ShoppingCart,
  Banknote,
  Home,
  Zap,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Target,
  BarChart3,
  PieChart
} from 'lucide-react';

import { financialMarketAPI, queryKeys } from '@/lib/api';

const SectorImpactAnalysis = () => {
  const [selectedSector, setSelectedSector] = useState('');
  const [analysisType, setAnalysisType] = useState('currency');
  const [impactParameter, setImpactParameter] = useState(5);

  // 섹터별 영향 분석 조회
  const { data: sectorImpact, isLoading, refetch } = useQuery({
    queryKey: [queryKeys.sectorImpact, selectedSector, analysisType, impactParameter],
    queryFn: () => financialMarketAPI.getSectorImpact(selectedSector),
    enabled: true,
    refetchInterval: 300000 // 5분마다 갱신
  });

  // 환율 영향 분석
  const { data: currencyImpact } = useQuery({
    queryKey: [queryKeys.currencyImpact, 'USD', impactParameter],
    queryFn: () => financialMarketAPI.getCurrencyImpact('USD', impactParameter),
    enabled: analysisType === 'currency'
  });

  // 금리 영향 분석
  const { data: interestRateImpact } = useQuery({
    queryKey: [queryKeys.interestRateImpact, impactParameter / 100],
    queryFn: () => financialMarketAPI.getInterestRateImpact(impactParameter / 100),
    enabled: analysisType === 'interest'
  });

  // 섹터 아이콘 매핑
  const sectorIcons = {
    '기술': Smartphone,
    '금융': Banknote,
    '제조업': Factory,
    '자동차': Car,
    '소비재': ShoppingCart,
    '건설/부동산': Home,
    '에너지': Zap,
    '바이오/헬스케어': Building,
    '화학': Factory,
    '철강/소재': Building
  };

  // 섹터 데이터 (시뮬레이션)
  const sectorData = [
    {
      name: '기술',
      impact: 8.5,
      change: 2.3,
      sensitivity: 'high',
      companies: 245,
      marketCap: 892.5,
      avgPER: 24.5,
      correlation: 0.85
    },
    {
      name: '금융',
      impact: -3.2,
      change: -1.8,
      sensitivity: 'medium',
      companies: 89,
      marketCap: 456.2,
      avgPER: 8.9,
      correlation: -0.65
    },
    {
      name: '제조업',
      impact: 5.1,
      change: 1.2,
      sensitivity: 'medium',
      companies: 167,
      marketCap: 234.8,
      avgPER: 12.3,
      correlation: 0.72
    },
    {
      name: '자동차',
      impact: 6.8,
      change: 0.9,
      sensitivity: 'high',
      companies: 23,
      marketCap: 189.4,
      avgPER: 15.7,
      correlation: 0.78
    },
    {
      name: '소비재',
      impact: -1.5,
      change: -0.5,
      sensitivity: 'low',
      companies: 134,
      marketCap: 178.9,
      avgPER: 18.2,
      correlation: -0.23
    },
    {
      name: '건설/부동산',
      impact: -4.7,
      change: -2.1,
      sensitivity: 'high',
      companies: 78,
      marketCap: 145.6,
      avgPER: 7.8,
      correlation: -0.81
    },
    {
      name: '에너지',
      impact: 3.4,
      change: 1.1,
      sensitivity: 'medium',
      companies: 45,
      marketCap: 123.7,
      avgPER: 11.5,
      correlation: 0.56
    },
    {
      name: '바이오/헬스케어',
      impact: 2.8,
      change: 0.7,
      sensitivity: 'low',
      companies: 156,
      marketCap: 98.3,
      avgPER: 28.9,
      correlation: 0.34
    }
  ];

  // 감도별 색상 매핑
  const getSensitivityColor = (sensitivity) => {
    switch (sensitivity) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  // 영향도별 색상
  const getImpactColor = (impact) => {
    if (impact > 5) return '#10b981';
    if (impact > 0) return '#3b82f6';
    if (impact > -5) return '#f59e0b';
    return '#ef4444';
  };

  // 트렌드 아이콘
  const getTrendIcon = (change) => {
    if (change > 0) return <ArrowUpRight className="h-4 w-4 text-green-600" />;
    return <ArrowDownRight className="h-4 w-4 text-red-600" />;
  };

  // 감도 배지
  const getSensitivityBadge = (sensitivity) => {
    switch (sensitivity) {
      case 'high':
        return <Badge variant="destructive">높음</Badge>;
      case 'medium':
        return <Badge variant="secondary">보통</Badge>;
      case 'low':
        return <Badge variant="default" className="bg-green-500">낮음</Badge>;
      default:
        return <Badge variant="outline">-</Badge>;
    }
  };

  const formatNumber = (num, decimals = 1) => {
    return new Intl.NumberFormat('ko-KR', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

  const formatCurrency = (num) => {
    return new Intl.NumberFormat('ko-KR', {
      style: 'currency',
      currency: 'KRW',
      notation: 'compact'
    }).format(num * 1000000000000); // 조 단위
  };

  // TreeMap 데이터
  const treeMapData = sectorData.map(sector => ({
    name: sector.name,
    size: sector.marketCap,
    impact: sector.impact,
    fill: getImpactColor(sector.impact)
  }));

  return (
    <div className="space-y-6">
      {/* 제어 패널 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>섹터 영향 분석</span>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">분석 유형</label>
              <Select value={analysisType} onValueChange={setAnalysisType}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="currency">환율 영향</SelectItem>
                  <SelectItem value="interest">금리 영향</SelectItem>
                  <SelectItem value="sector">섹터 비교</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">특정 섹터</label>
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger>
                  <SelectValue placeholder="전체 섹터" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">전체</SelectItem>
                  {sectorData.map(sector => (
                    <SelectItem key={sector.name} value={sector.name}>
                      {sector.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {analysisType === 'currency' ? '환율 변동(%)' : '금리 변동(bp)'}
              </label>
              <Select value={impactParameter.toString()} onValueChange={(v) => setImpactParameter(Number(v))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">{analysisType === 'currency' ? '+1%' : '+10bp'}</SelectItem>
                  <SelectItem value="3">{analysisType === 'currency' ? '+3%' : '+30bp'}</SelectItem>
                  <SelectItem value="5">{analysisType === 'currency' ? '+5%' : '+50bp'}</SelectItem>
                  <SelectItem value="10">{analysisType === 'currency' ? '+10%' : '+100bp'}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="impact">영향도</TabsTrigger>
          <TabsTrigger value="correlation">상관관계</TabsTrigger>
          <TabsTrigger value="heatmap">히트맵</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 섹터별 카드 */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">섹터별 영향도</h3>
              <div className="space-y-3">
                {sectorData
                  .filter(sector => !selectedSector || sector.name === selectedSector)
                  .sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact))
                  .map(sector => {
                    const IconComponent = sectorIcons[sector.name] || Building;
                    return (
                      <Card key={sector.name}>
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                                <IconComponent className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <div className="font-medium">{sector.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {sector.companies}개 기업 • {formatCurrency(sector.marketCap)}
                                </div>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="flex items-center space-x-2">
                                <span className={`font-bold text-lg ${
                                  sector.impact > 0 ? 'text-green-600' : 'text-red-600'
                                }`}>
                                  {sector.impact > 0 ? '+' : ''}{formatNumber(sector.impact)}%
                                </span>
                                {getTrendIcon(sector.change)}
                              </div>
                              <div className="flex items-center space-x-2 mt-1">
                                <span className="text-sm text-muted-foreground">감도:</span>
                                {getSensitivityBadge(sector.sensitivity)}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
              </div>
            </div>

            {/* 시장 크기 시각화 */}
            <div>
              <h3 className="text-lg font-medium mb-4">섹터별 시장 규모</h3>
              <ResponsiveContainer width="100%" height={400}>
                <TreeMap
                  data={treeMapData}
                  dataKey="size"
                  aspectRatio={4 / 3}
                  stroke="#fff"
                  content={({ root, depth, x, y, width, height, index, payload, colors }) => {
                    if (depth === 1) {
                      return (
                        <g>
                          <rect
                            x={x}
                            y={y}
                            width={width}
                            height={height}
                            style={{
                              fill: payload.fill,
                              stroke: '#fff',
                              strokeWidth: 2,
                              strokeOpacity: 1,
                              fillOpacity: 0.7
                            }}
                          />
                          <text
                            x={x + width / 2}
                            y={y + height / 2 - 7}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {payload.name}
                          </text>
                          <text
                            x={x + width / 2}
                            y={y + height / 2 + 7}
                            textAnchor="middle"
                            fill="#fff"
                            fontSize={10}
                          >
                            {payload.impact > 0 ? '+' : ''}{formatNumber(payload.impact)}%
                          </text>
                        </g>
                      );
                    }
                  }}
                />
              </TreeMap>
            </div>
          </div>
        </TabsContent>

        {/* 영향도 탭 */}
        <TabsContent value="impact" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>섹터별 영향도 순위</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <BarChart data={sectorData.sort((a, b) => b.impact - a.impact)}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip formatter={(value) => [`${formatNumber(value)}%`, '영향도']} />
                    <Bar
                      dataKey="impact"
                      fill={(entry) => getImpactColor(entry.impact)}
                      radius={[2, 2, 0, 0]}
                    >
                      {sectorData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getImpactColor(entry.impact)} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>감도별 분포</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <RadialBarChart innerRadius="30%" outerRadius="90%" data={sectorData} startAngle={90} endAngle={450}>
                    <RadialBar
                      minAngle={15}
                      label={{ position: 'insideStart', fill: '#fff', fontSize: 12 }}
                      background
                      clockWise
                      dataKey="impact"
                      fill={(entry) => getSensitivityColor(entry.sensitivity)}
                    />
                    <Tooltip formatter={(value) => [`${formatNumber(value)}%`, '영향도']} />
                  </RadialBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* 영향도 분석 요약 */}
          <Card>
            <CardHeader>
              <CardTitle>영향도 분석 요약</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <h4 className="font-medium text-green-900 mb-2">🔥 최고 수혜 섹터</h4>
                  <div className="text-green-800">
                    <div className="font-bold text-lg">{sectorData.reduce((max, sector) =>
                      sector.impact > max.impact ? sector : max
                    ).name}</div>
                    <div className="text-sm">
                      +{formatNumber(sectorData.reduce((max, sector) =>
                        sector.impact > max.impact ? sector : max
                      ).impact)}% 예상 상승
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-red-50 rounded-lg border border-red-200">
                  <h4 className="font-medium text-red-900 mb-2">📉 최대 타격 섹터</h4>
                  <div className="text-red-800">
                    <div className="font-bold text-lg">{sectorData.reduce((min, sector) =>
                      sector.impact < min.impact ? sector : min
                    ).name}</div>
                    <div className="text-sm">
                      {formatNumber(sectorData.reduce((min, sector) =>
                        sector.impact < min.impact ? sector : min
                      ).impact)}% 예상 하락
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2">🛡️ 안정적 섹터</h4>
                  <div className="text-blue-800">
                    <div className="font-bold text-lg">{sectorData.reduce((stable, sector) =>
                      Math.abs(sector.impact) < Math.abs(stable.impact) ? sector : stable
                    ).name}</div>
                    <div className="text-sm">
                      {formatNumber(Math.abs(sectorData.reduce((stable, sector) =>
                        Math.abs(sector.impact) < Math.abs(stable.impact) ? sector : stable
                      ).impact))}% 변동 예상
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 상관관계 탭 */}
        <TabsContent value="correlation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>섹터-환율 상관관계</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart data={sectorData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="correlation" domain={[-1, 1]} type="number" />
                  <YAxis dataKey="impact" />
                  <Tooltip
                    formatter={(value, name) => [
                      name === 'impact' ? `${formatNumber(value)}%` : formatNumber(value, 2),
                      name === 'impact' ? '예상 영향도' : '상관계수'
                    ]}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                  />
                  <Scatter dataKey="impact" fill="#3b82f6">
                    {sectorData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={getSensitivityColor(entry.sensitivity)} />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 히트맵 탭 */}
        <TabsContent value="heatmap" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>섹터 영향도 히트맵</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-2">
                {sectorData.map(sector => (
                  <div
                    key={sector.name}
                    className="aspect-square rounded-lg p-3 text-white text-center flex flex-col justify-center"
                    style={{ backgroundColor: getImpactColor(sector.impact) }}
                  >
                    <div className="font-medium text-sm mb-1">{sector.name}</div>
                    <div className="text-lg font-bold">
                      {sector.impact > 0 ? '+' : ''}{formatNumber(sector.impact)}%
                    </div>
                    <div className="text-xs opacity-75">{sector.companies}개사</div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  <span className="text-sm">부정적 영향</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-500 rounded"></div>
                  <span className="text-sm">중성적 영향</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  <span className="text-sm">긍정적 영향</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SectorImpactAnalysis;