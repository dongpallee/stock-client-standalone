import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target,
  Eye,
  AlertCircle,
  Star,
  Globe
} from 'lucide-react';

const AnalysisResults = () => {
  const analysisData = {
    '005930': { // 삼성전자
      name: '삼성전자',
      signal: 'buy',
      strength: 78,
      confidence: 85,
      ai_sentiment: 'bullish',
      technical_score: 82,
      fundamental_score: 75,
      factors: ['실적 개선 전망', 'AI 수혜주', '외국인 순매수', 'PER 매력적']
    },
    '000660': { // SK하이닉스
      name: 'SK하이닉스',
      signal: 'hold',
      strength: 55,
      confidence: 68,
      ai_sentiment: 'neutral',
      technical_score: 58,
      fundamental_score: 62,
      factors: ['메모리 반도체 회복', '중국 리스크', '재고 조정 중', '실적 변동성']
    },
    '035420': { // NAVER
      name: 'NAVER',
      signal: 'buy',
      strength: 72,
      confidence: 79,
      ai_sentiment: 'bullish',
      technical_score: 75,
      fundamental_score: 70,
      factors: ['플랫폼 성장', 'AI 투자 확대', '해외 진출', '클라우드 사업']
    },
    '207940': { // 삼성바이오로직스
      name: '삼성바이오로직스',
      signal: 'sell',
      strength: 65,
      confidence: 71,
      ai_sentiment: 'bearish',
      technical_score: 42,
      fundamental_score: 55,
      factors: ['고평가 우려', '수주 둔화', '경쟁 심화', '기술적 조정']
    }
  };

  const getSignalColor = (signal) => {
    switch (signal) {
      case 'buy': return 'text-red-600'; // 한국 주식에서 빨간색은 상승
      case 'sell': return 'text-blue-600'; // 한국 주식에서 파란색은 하락
      case 'hold': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const getSignalIcon = (signal) => {
    switch (signal) {
      case 'buy': return <TrendingUp className="h-4 w-4" />;
      case 'sell': return <TrendingDown className="h-4 w-4" />;
      case 'hold': return <Target className="h-4 w-4" />;
      default: return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return 'bg-red-500'; // 한국 주식 색상 체계
      case 'bearish': return 'bg-blue-500';
      case 'neutral': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getSignalText = (signal) => {
    switch (signal) {
      case 'buy': return '매수';
      case 'sell': return '매도';
      case 'hold': return '보유';
      default: return '관망';
    }
  };

  const getSentimentText = (sentiment) => {
    switch (sentiment) {
      case 'bullish': return '강세';
      case 'bearish': return '약세';
      case 'neutral': return '중립';
      default: return '불명';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Brain className="h-5 w-5 text-purple-500" />
            <span>AI 분석 결과</span>
          </CardTitle>
          <CardDescription>
            실시간 AI 기반 주식 분석 및 투자 신호 요약
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overall Market Sentiment */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">강세</div>
              <div className="text-sm text-muted-foreground">시장 분위기</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(
                  Object.values(analysisData)
                    .reduce((sum, d) => sum + d.confidence, 0) /
                  Object.values(analysisData).length
                )}%
              </div>
              <div className="text-sm text-muted-foreground">평균 분석 신뢰도</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(analysisData).length}
              </div>
              <div className="text-sm text-muted-foreground">분석 종목 수</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Object.values(analysisData).filter(d => d.signal === 'buy').length}
              </div>
              <div className="text-sm text-muted-foreground">매수 신호 수</div>
            </div>
          </div>

          {/* Stock Analysis */}
          <div className="space-y-4">
            {Object.entries(analysisData).map(([code, data]) => (
              <div key={code} className="border rounded-lg p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="font-medium text-lg">{data.name} ({code})</div>
                    <Badge 
                      variant="outline"
                      className={`flex items-center space-x-1 ${getSignalColor(data.signal)}`}
                    >
                      {getSignalIcon(data.signal)}
                      <span>{getSignalText(data.signal)}</span>
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${getSentimentColor(data.ai_sentiment)}`} />
                    <span className="text-sm">{getSentimentText(data.ai_sentiment)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">신호 강도</span>
                      <span className="text-sm">{data.strength}%</span>
                    </div>
                    <Progress value={data.strength} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">신뢰도</span>
                      <span className="text-sm">{data.confidence}%</span>
                    </div>
                    <Progress value={data.confidence} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">기술적 점수</span>
                      <span className="text-sm">{data.technical_score}%</span>
                    </div>
                    <Progress value={data.technical_score} className="h-2" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">펀더멘털 점수</span>
                      <span className="text-sm">{data.fundamental_score}%</span>
                    </div>
                    <Progress value={data.fundamental_score} className="h-2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm font-medium">핵심 근거</div>
                  <div className="flex flex-wrap gap-2">
                    {data.factors.map((factor, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {factor}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* AI Market Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Eye className="h-5 w-5 text-blue-500" />
            <span>AI 시장 인사이트 요약</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="p-4 rounded-lg border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20">
              <div className="font-medium text-red-800 dark:text-red-200">반도체 섹터 상승세</div>
              <div className="text-sm text-red-700 dark:text-red-300 mt-1">
                삼성전자와 SK하이닉스 등 반도체 주가 강세. AI 수요 증가와 메모리 반도체 회복 기대감이 주가를 견인하고 있습니다.
              </div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20">
              <div className="font-medium text-blue-800 dark:text-blue-200">플랫폼 기업 성장</div>
              <div className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                NAVER 등 플랫폼 기업들의 AI 투자 확대와 해외 진출 가속화로 중장기 성장 전망이 밝아지고 있습니다.
              </div>
            </div>
            <div className="p-4 rounded-lg border-l-4 border-l-yellow-500 bg-yellow-50 dark:bg-yellow-900/20">
              <div className="font-medium text-yellow-800 dark:text-yellow-200">바이오 섹터 주의</div>
              <div className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                삼성바이오로직스 등 바이오 대형주의 고평가 우려. 신규 수주 둔화와 경쟁 심화로 단기 조정 가능성에 주의가 필요합니다.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Investment Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Star className="h-5 w-5 text-yellow-500" />
            <span>투자 아이디어</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-lg border bg-red-50 dark:bg-red-900/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">보수적 투자자</div>
                <div className="font-medium text-red-800 dark:text-red-200">삼성전자</div>
                <div className="text-sm text-red-700 dark:text-red-300">안정적 대형주</div>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-blue-50 dark:bg-blue-900/20">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">적극적 투자자</div>
                <div className="font-medium text-blue-800 dark:text-blue-200">NAVER</div>
                <div className="text-sm text-blue-700 dark:text-blue-300">성장주 투자</div>
              </div>
            </div>
            <div className="p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">단기 투자자</div>
                <div className="font-medium text-gray-800 dark:text-gray-200">SK하이닉스</div>
                <div className="text-sm text-gray-700 dark:text-gray-300">변동성 활용</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* News Sentiment Analysis */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Globe className="h-5 w-5 text-green-500" />
            <span>뉴스 감정 분석</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h5 className="text-sm font-medium">긍정적 뉴스</h5>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                  <div className="text-sm font-medium">반도체 시장 회복 기대감 확산</div>
                  <div className="text-xs text-muted-foreground mt-1">AI 수요 증가로 메모리 반도체 업황 개선 전망</div>
                </div>
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border-l-4 border-red-500">
                  <div className="text-sm font-medium">플랫폼 기업 해외 진출 가속</div>
                  <div className="text-xs text-muted-foreground mt-1">NAVER 등 글로벌 시장 확장으로 성장 동력 확보</div>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <h5 className="text-sm font-medium">주의 사항</h5>
              <div className="space-y-2">
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                  <div className="text-sm font-medium">바이오 대형주 고평가 우려</div>
                  <div className="text-xs text-muted-foreground mt-1">실적 대비 주가 상승폭이 과도할 수 있어 주의 필요</div>
                </div>
                <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-500">
                  <div className="text-sm font-medium">중국 경제 둔화 리스크</div>
                  <div className="text-xs text-muted-foreground mt-1">대중국 수출 의존도 높은 기업들 영향 가능성</div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalysisResults;