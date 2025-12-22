import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Shield,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
  Brain
} from 'lucide-react';

const InvestmentRecommendation = ({ analysisData, className = "" }) => {
  const [selectedInvestorType, setSelectedInvestorType] = useState('moderate');
  
  if (!analysisData?.data) {
    return (
      <Card className={className}>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="text-center">
              <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">AI 분석 결과를 불러오는 중입니다.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const analysis = analysisData.data;
  const recommendation = analysis.recommendation || {};
  const riskLevel = analysis.risk_level || 'medium';
  const confidence = analysis.confidence_score || 75;
  
  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-green-600 bg-green-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getRecommendationIcon = (action) => {
    switch(action) {
      case '매수': return <TrendingUp className="h-5 w-5 text-green-600" />;
      case '매도': return <TrendingDown className="h-5 w-5 text-red-600" />;
      case '보유': return <Shield className="h-5 w-5 text-blue-600" />;
      default: return <BarChart3 className="h-5 w-5 text-gray-600" />;
    }
  };

  const investorProfiles = {
    conservative: {
      name: '안정형',
      description: '위험을 최소화하고 안정적 수익 추구',
      icon: <Shield className="h-5 w-5" />,
      color: 'text-blue-600'
    },
    moderate: {
      name: '균형형',
      description: '적정 위험을 감수하며 균형잡힌 수익 추구',
      icon: <Target className="h-5 w-5" />,
      color: 'text-green-600'
    },
    aggressive: {
      name: '성장형',
      description: '높은 수익을 위해 적극적 위험 감수',
      icon: <Zap className="h-5 w-5" />,
      color: 'text-purple-600'
    }
  };

  const getInvestmentAdvice = (type) => {
    const baseAdvice = {
      action: recommendation.action || '보유',
      targetPrice: recommendation.target_price ?? null,
      stopLoss: recommendation.stop_loss ?? null,
            timeHorizon: recommendation.time_horizon || '3-6개월',
      reason: recommendation.reason || 'AI 분석을 통한 종합적 판단'
    };

    switch(type) {
      case 'conservative':
        return {
          ...baseAdvice,
          positionSize: '포트폴리오의 3-5%',
          riskTolerance: '최대 5% 손실까지 허용',
          strategy: '분할 매수, 장기 보유'
        };
      case 'moderate':
        return {
          ...baseAdvice,
          positionSize: '포트폴리오의 5-10%',
          riskTolerance: '최대 10% 손실까지 허용',
          strategy: '기술적 분석 병행, 중기 투자'
        };
      case 'aggressive':
        return {
          ...baseAdvice,
          positionSize: '포트폴리오의 10-15%',
          riskTolerance: '최대 20% 손실까지 허용',
          strategy: '적극적 매매, 단기-중기 투자'
        };
      default:
        return baseAdvice;
    }
  };

  const currentAdvice = getInvestmentAdvice(selectedInvestorType);

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-blue-600" />
              AI 투자 추천
            </CardTitle>
            <CardDescription>
              인공지능 기반 종합 분석 결과
            </CardDescription>
          </div>
          <Badge className={`${getRiskColor(riskLevel)} border-0`}>
             {riskLevel === 'low' ? '낮음'
              : riskLevel === 'medium' ? '보통'
              : riskLevel === 'high' ? '높음'
              : '알 수 없음'} 위험
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <Tabs value={selectedInvestorType} onValueChange={setSelectedInvestorType} className="space-y-6">
          {/* 투자자 성향 선택 */}
          <TabsList className="grid w-full grid-cols-3">
            {Object.entries(investorProfiles).map(([key, profile]) => (
              <TabsTrigger key={key} value={key} className="flex items-center gap-2">
                {profile.icon}
                {profile.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* 공통 추천 정보 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 추천 행동 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  {getRecommendationIcon(currentAdvice.action)}
                  추천 행동
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2">
                      {currentAdvice.action}
                    </div>
                    <div className="text-sm text-gray-600">
                      신뢰도: {confidence}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${confidence}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-600 text-center">
                    {currentAdvice.reason}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 가격 목표 */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Target className="h-5 w-5 text-green-600" />
                  가격 목표
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">목표가</span>
                    <span className="font-bold text-green-600">
                      {currentAdvice.targetPrice == null ? 'N/A' : `${currentAdvice.targetPrice.toLocaleString()}원`}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">손절가</span>
                    <span className="font-bold text-red-600">
                      {currentAdvice.stopLoss?.toLocaleString() || 'N/A'}원
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">투자 기간</span>
                    <span className="font-medium">
                      {currentAdvice.timeHorizon}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 투자자별 맞춤 조언 */}
          {Object.entries(investorProfiles).map(([key, profile]) => (
            <TabsContent key={key} value={key} className="space-y-4">
              <Card className="border-2 border-dashed">
                <CardHeader>
                  <CardTitle className={`text-lg flex items-center gap-2 ${profile.color}`}>
                    {profile.icon}
                    {profile.name} 투자자를 위한 맞춤 조언
                  </CardTitle>
                  <CardDescription>{profile.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-blue-600" />
                        <span className="font-medium">포지션 크기</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {currentAdvice.positionSize}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <span className="font-medium">위험 허용도</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {currentAdvice.riskTolerance}
                      </p>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-green-600" />
                        <span className="font-medium">투자 전략</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {currentAdvice.strategy}
                      </p>
                      
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-purple-600" />
                        <span className="font-medium">모니터링 주기</span>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {key === 'conservative' ? '주 1회' :
                         key === 'moderate' ? '주 2-3회' : '일 1회'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          ))}

          {/* 주요 위험 요소 */}
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-yellow-800">
                <AlertTriangle className="h-5 w-5" />
                주요 위험 요소
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {(analysis.risks || [
                  '시장 전반적 변동성 증가',
                  '업종별 규제 리스크',
                  '거시경제 불확실성'
                ]).map((risk, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span>{risk}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 투자 체크리스트 */}
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2 text-green-800">
                <CheckCircle className="h-5 w-5" />
                투자 전 체크리스트
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[
                  '포트폴리오 내 동일 섹터 비중 확인',
                  '개인 위험 허용도와 일치 여부 검토',
                  '투자 자금의 여유도 확인',
                  '경제 지표 및 뉴스 모니터링',
                  '손절매 기준 설정 및 준수 의지'
                ].map((item, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default InvestmentRecommendation;