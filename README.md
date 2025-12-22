# 주식 분석 클라이언트 - 독립 실행형 에디션

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![React](https://img.shields.io/badge/React-19.1.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.5-646CFF.svg)](https://vitejs.dev/)

**백엔드 서버 없이 브라우저에서 완전히 실행되는 독립형 오픈소스 한국 주식 시장 분석 대시보드입니다.**

## 🎯 개요

주식 분석 클라이언트(독립 실행형 에디션)는 한국 주식 시장 데이터를 분석 및 시각화하기 위해 설계된 프론트엔드 전용 React 애플리케이션입니다. 이 프로젝트는 정적 JSON 데이터 파일이나 브라우저 기반 API로 작동하는 독립 실행형 오픈소스 버전으로, 다음 용도에 적합합니다:

- **서버 인프라 없이 로컬(브라우저) 기반 개인 포트폴리오 추적**
- **React 및 데이터 시각화 학습을 위한 교육 목적**
- **주식 분석 인터페이스 프로토타이핑**
- **사전 로드된 데이터로 오프라인 분석**

### 주요 기능

✅ **백엔드 불필요** - 브라우저에서 완전히 실행됩니다
✅ **모의 데이터 지원** - JSON 데이터 파일로 작동합니다
✅ **모던 UI** - React 19와 Tailwind CSS로 구축되었습니다
✅ **반응형 디자인** - 데스크톱과 모바일에서 작동합니다
✅ **데이터 시각화** - Recharts를 사용한 인터랙티브 차트
✅ **한국 주식 시장** - KRX 주식에 특화되었습니다
✅ **오픈 소스** - MIT 라이선스, 자유롭게 사용 및 수정 가능합니다

### 프로젝트 정체성

- **이름**: 주식 분석 클라이언트 - 독립 실행형 에디션
- **유형**: 오픈소스 프론트엔드 전용 애플리케이션
- **라이선스**: MIT
- **버전**: 1.0.0
- **대상 시장**: 한국 주식 시장 (KRX, KOSPI, KOSDAQ)

### 핵심 정의

**stock-client-standalone**은:
- ✅ **완전 독립형** 오픈소스 프론트엔드 애플리케이션
- ✅ **백엔드 서버 불필요** - 브라우저에서만 실행
- ✅ **MIT 라이선스** - 자유롭게 사용, 수정, 배포 가능
- ✅ **교육 및 개인 용도** 최적화

**stock-agent-system과의 관계**:
- ❌ 종속적이지 않음 (Not dependent)
- ❌ 하위 프로젝트가 아님 (Not a sub-project)
- ✅ 독립적인 오픈소스 프로젝트 (Independent OSS project)
- ✅ UI 컴포넌트 일부 공유 (Shares some UI components)

---

## 🚀 빠른 시작

### 필수 요구사항

- **Node.js** 18.0.0 이상
- **pnpm** 10.4.1 이상 (권장) 또는 npm/yarn

### 설치

```bash
# 저장소 클론
git clone git@github.com:dongpallee/stock-client-standalone.git
cd stock-client-standalone

# 의존성 설치
pnpm install

# 개발 서버 시작
pnpm dev
```

애플리케이션은 `http://localhost:8080`에서 사용할 수 있습니다.

### 로그인

기본 제공되는 데모 계정:
- **Username**: `demo`
- **Password**: `demo1234`

또는 새 계정을 등록할 수 있습니다 (LocalStorage에 저장됨).

### 프로덕션 빌드

```bash
# 정적 파일 빌드
pnpm build

# 프로덕션 빌드 미리보기
pnpm preview
```

---

## 📊 Standalone vs Full System 비교

| 특성 | Standalone Edition | Full Stock Agent System |
|------|-------------------|------------------------|
| **프로젝트 타입** | 오픈소스 (Public) | 상용 (Private/Commercial) |
| **라이선스** | MIT (완전 무료) | 별도 라이선스 |
| **백엔드 필요** | ❌ 불필요 | ✅ 필수 (Flask + LangGraph) |
| **설치 시간** | 1분 | 30분+ |
| **의존성** | Frontend only | Python + Redis + APIs |
| **데이터 소스** | JSON 파일 (로컬) | 실시간 API + 데이터베이스 |
| **AI 분석** | ❌ 없음 | ✅ OpenAI/Gemini/Claude |
| **비용** | 무료 (API 비용 없음) | API 사용료 발생 |
| **호스팅** | 정적 사이트 (무료) | 서버 필요 (유료) |
| **사용자 인증** | ❌ 없음 (LocalStorage) | ✅ JWT 인증 |
| **실시간 업데이트** | ❌ 없음 | ✅ WebSocket |
| **뉴스 수집** | ❌ 없음 | ✅ Perplexity AI |
| **데이터베이스** | ❌ 없음 | ✅ SQLite/PostgreSQL |
| **캐싱** | LocalStorage | ✅ Redis |
| **배포** | Vercel/Netlify (무료) | VPS/Cloud (유료) |
| **사용 사례** | 학습, 프로토타입, 개인 | 프로덕션, 실시간 분석 |
| **대상 사용자** | 개발자, 학생 | 전문 분석가, 기업 |

### 언제 어느 것을 사용해야 하나?

#### Standalone 사용 권장 시나리오

✅ **학습 목적**
- React, Vite, Tailwind 학습
- 데이터 시각화 학습
- 프론트엔드 개발 포트폴리오

✅ **빠른 프로토타이핑**
- UI/UX 디자인 테스트
- 아이디어 검증
- 목업 생성

✅ **개인 사용**
- 오프라인 주식 데이터 분석
- 서버 비용 없이 포트폴리오 추적
- 개인 프로젝트

✅ **오픈소스 기여**
- 금융 OSS 프로젝트에 기여
- UI 컴포넌트 개발
- 커뮤니티 프로젝트

#### Full System 사용 권장 시나리오

✅ **프로덕션 환경**
- 실시간 주식 분석 서비스
- 기업용 분석 도구
- 유료 서비스 운영

✅ **고급 분석 필요**
- AI 기반 투자 추천
- 종합적 시장 분석
- 자동화된 리포트 생성

✅ **다중 사용자**
- 팀 협업 도구
- 사용자 계정 관리
- 데이터 공유 필요

✅ **실시간 데이터**
- 분 단위 가격 업데이트
- 뉴스 자동 수집
- 시장 변동 알림

---

## 📁 프로젝트 구조

```
stock-client-standalone/
├── src/
│   ├── components/          # 재사용 가능한 UI 컴포넌트
│   │   ├── auth/           # 인증 컴포넌트
│   │   ├── dashboard/      # 대시보드 위젯
│   │   ├── charts/         # 차트 컴포넌트
│   │   ├── search/         # 검색 기능
│   │   └── ui/            # shadcn/ui 컴포넌트
│   ├── pages/              # 페이지 컴포넌트
│   │   ├── Dashboard.jsx   # 메인 대시보드
│   │   ├── StockList.jsx   # 주식 목록 보기
│   │   ├── StockDetail.jsx # 주식 상세 정보
│   │   └── Ranking.jsx     # 주식 순위
│   ├── lib/                # 유틸리티 및 API
│   │   ├── api.js         # API/데이터 페칭 레이어
│   │   └── auth.js        # 인증 유틸리티
│   ├── hooks/              # 커스텀 React 훅
│   ├── contexts/           # React 컨텍스트
│   └── utils/              # 헬퍼 함수
├── data/                   # 모의 데이터 파일 (JSON)
│   ├── stocks/             # 개별 종목 데이터
│   ├── rankings/           # 랭킹 데이터
│   ├── market/             # 시장 지수
│   ├── dashboard/          # 대시보드 데이터
│   ├── auth/               # 인증 데이터
│   └── watchlist/          # 관심종목
├── public/                 # 정적 자산
└── docs/                   # 문서
```

---

## 🎨 기술 스택

### 핵심 프레임워크
- **React 19.1.0** - 동시성 기능을 갖춘 최신 React
- **Vite 6.3.5** - 초고속 빌드 도구
- **React Router 7.6.1** - 클라이언트 사이드 라우팅

### UI & 스타일링
- **Tailwind CSS 4.1.7** - 유틸리티 우선 CSS 프레임워크
- **shadcn/ui** - Radix UI 기반의 고품질 React 컴포넌트
- **Lucide React** - 아름다운 아이콘 라이브러리
- **Framer Motion** - 부드러운 애니메이션

### 데이터 & 상태 관리
- **TanStack Query 5.85.0** - 강력한 데이터 페칭 및 캐싱
- **React Hook Form 7.56.3** - 고성능 폼 검증
- **Zod 3.24.4** - TypeScript 우선 스키마 검증

### 데이터 시각화
- **Recharts 2.15.3** - 구성 가능한 차트 라이브러리
- **ReactFlow 11.11.4** - 인터랙티브 노드 기반 그래프

---

## 🔧 설정

### 환경 변수

프로젝트 루트에 `.env` 파일을 생성하세요:

```env
# 애플리케이션 모드
VITE_APP_MODE=standalone

# 데이터 소스 (mock 또는 api)
VITE_DATA_SOURCE=mock

# 선택사항: 외부 API 사용 시
# VITE_API_BASE_URL=https://your-api.com

# 기능 플래그
VITE_ENABLE_AUTH=false
VITE_ENABLE_REAL_TIME=false

# 디버그 모드 (선택사항)
# VITE_DEBUG_MODE=true
```

### 데이터 소스

#### 모의 데이터 모드 (기본값)
JSON 데이터 파일을 `data/` 디렉토리에 배치하세요:

```
data/
├── stocks/
│   ├── stock-list.json       # 주식 목록
│   ├── 005930.json          # 삼성전자
│   └── 000660.json          # SK하이닉스
├── rankings/
│   └── top-stocks.json      # 주식 순위
├── market/
│   └── indices.json         # 시장 지수
├── dashboard/
│   ├── summary.json         # 요약 정보
│   └── agents-status.json   # 에이전트 상태 (Mock)
├── auth/
│   └── mock-users.json      # 기본 사용자 정보
└── watchlist/
    └── demo-watchlist.json  # 데모 사용자 관심종목
```

#### 데이터 형식 예시

`data/stocks/stock-list.json`:
```json
[
  {
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "current_price": 70000,
    "change_rate": 2.5,
    "volume": 12500000,
    "market_cap": 4200000,
    "sector": "반도체"
  }
]
```

`data/stocks/005930.json` (개별 종목 상세):
```json
{
  "stock_code": "005930",
  "stock_name": "삼성전자",
  "basic_info": { ... },
  "price_data": { ... },
  "financial_ratios": { ... },
  "chart_data": [ ... ],
  "analysis": {
    "composite_score": 88,
    "grade": "A",
    "investment_opinion": "매수",
    "technical_analysis": { ... },
    "ai_recommendation": { ... }
  }
}
```

---

## 📊 기능

### ✅ 포함된 기능

#### 1. 기본 UI 컴포넌트
- ✅ Dashboard (대시보드)
- ✅ Stock List (주식 목록)
- ✅ Stock Detail (주식 상세)
- ✅ Ranking (순위)
- ✅ Watchlist (관심 목록)
- ✅ Search & Filter (검색 및 필터)
- ✅ Charts (차트 - Recharts)
- ✅ Responsive Layout (반응형 레이아웃)

#### 2. 데이터 처리
- ✅ JSON 파일 로딩
- ✅ LocalStorage 사용
- ✅ 클라이언트 사이드 필터링
- ✅ 클라이언트 사이드 정렬
- ✅ 기본 계산 (수익률, 변동률 등)

#### 3. 사용자 경험
- ✅ 반응형 디자인
- ✅ 빠른 로딩
- ✅ 오프라인 동작
- ✅ 브라우저 기반 저장

#### 4. 완전 작동하는 기능

**대시보드**
- 시장 지수 (KOSPI/KOSDAQ)
- 에이전트 상태 (Mock)
- 인기 종목
- 인기 AI 분석

**종목 목록**
- 10개 주요 종목 표시
- 검색 (종목명/코드)
- 섹터별 필터
- 정렬 (가격, 등락률, 거래량)

**종목 상세**
- 기본 정보
- 가격 차트 (10일 데이터)
- 재무 비율
- 기술적 분석
- AI 추천
- 투자자 유형별 추천

**랭킹**
- 종합 랭킹
- 섹터별 랭킹
- 거래량 상위
- 등락률 상위

**관심종목**
- 추가/제거
- 메모 작성
- 실시간 가격 업데이트 (Mock)

**인증**
- 회원가입
- 로그인/로그아웃
- 프로필 수정
- 비밀번호 변경

### ❌ 제외된 기능 (전체 버전 사용)

#### 백엔드 의존 기능
- ❌ 실시간 주가 데이터 수집
- ❌ AI/LLM 기반 분석 (OpenAI, Gemini, Claude)
- ❌ 뉴스 자동 수집 (Perplexity AI)
- ❌ 재무제표 자동 수집 (pykrx)
- ❌ 외국인 매매 데이터
- ❌ 공매도 데이터

#### 서버 인프라 기능
- ❌ 사용자 인증 및 로그인 (서버 사이드)
- ❌ 다중 사용자 지원
- ❌ 데이터베이스 저장
- ❌ 서버 사이드 캐싱 (Redis)
- ❌ WebSocket 실시간 업데이트
- ❌ 백그라운드 작업 (Celery)
- ❌ API 키 관리

#### 고급 분석 기능
- ❌ LangGraph 멀티에이전트 시스템
- ❌ 동적 워크플로우 라우팅
- ❌ 8가지 인텔리전트 라우팅 규칙
- ❌ TTL 기반 데이터 신선도 검증
- ❌ 종합적 AI 리포트 생성
- ❌ 투자 추천 알고리즘
- ❌ 섹터별 영향 분석

### ⚠️ Mock 동작 (실제 기능 없음)

1. **실시간 데이터 수집**: 버튼을 눌러도 이미 로드된 데이터 표시
2. **AI 분석 실행**: 기존 분석 결과 반환
3. **WebSocket 연결**: 연결되지 않음
4. **뉴스 수집**: Mock 뉴스만 표시
5. **알림 시스템**: Mock 알림만 표시

---

## 🔧 작동 방식

### API 시스템

기존 백엔드 API 호출이 모두 로컬 JSON 파일 로딩으로 대체되었습니다:

| 기존 (Backend) | Standalone (Local) |
|---------------|-------------------|
| `POST /api/auth/login` | LocalStorage 조회 |
| `GET /api/stocks` | `/data/stocks/stock-list.json` |
| `GET /api/stocks/:code` | `/data/stocks/:code.json` |
| `GET /api/dashboard/summary` | `/data/dashboard/summary.json` |
| `GET /api/ranking/top-stocks` | `/data/rankings/top-stocks.json` |

### 인증 시스템

**LocalStorage 기반 Mock 인증**:

1. **회원가입**: 사용자 정보를 `localStorage.mock_users`에 저장
2. **로그인**: 저장된 사용자 정보와 비교 후 Mock JWT 토큰 발급
3. **세션 유지**: `localStorage.access_token`에 토큰 저장
4. **로그아웃**: LocalStorage에서 토큰 삭제

```javascript
// Mock Token 구조
{
  user_id: 1,
  username: "demo",
  exp: 1733234567, // 24시간 후
  iat: 1733148167
}
```

### 관심종목 관리

각 사용자별로 `user_watchlist_{user_id}` 키로 LocalStorage에 저장:

```javascript
localStorage.setItem('user_watchlist_1', JSON.stringify([
  {
    id: 1,
    stock_code: "005930",
    stock_name: "삼성전자",
    notes: "주력 종목",
    added_at: "2025-11-01T00:00:00Z"
  }
]))
```

### 모의 데이터 철학

```javascript
// 모의 데이터 구조는 실제 API 응답을 반영
// 이를 통해 나중에 전체 백엔드로 원활하게 업그레이드 가능

// 예시: data/stocks/005930.json
{
  "stock_code": "005930",
  "stock_name": "삼성전자",
  "current_price": 70000,
  // ... 실제 API 구조와 일치
}
```

---

## 🏗️ 아키텍처 철학

### 독립 실행형 아키텍처 원칙

1. **제로 백엔드 의존성**
   - 서버 사이드 코드 불필요
   - 모든 처리가 브라우저에서 발생
   - file:// 프로토콜에서 실행 가능 (제한 있음)

2. **정적 데이터 우선**
   - JSON 파일에 저장된 모의 데이터
   - 외부 API와의 선택적 통합
   - 점진적 향상 접근 방식

3. **브라우저 기반 저장소**
   - 사용자 설정을 위한 LocalStorage
   - 대용량 데이터셋을 위한 IndexedDB (향후)
   - 데이터베이스 불필요

4. **클라이언트 사이드 전용**
   - 인증 서버 불필요
   - 세션 관리 불필요
   - 프라이버시 중심 (데이터가 브라우저를 떠나지 않음)

### 기술 스택 근거

```
React 19          → 최신 기능, 동시 렌더링
Vite 6            → 즉시 개발 서버, 최적화된 빌드
Tailwind CSS 4    → 빠른 UI 개발
shadcn/ui         → 고품질, 접근 가능한 컴포넌트
TanStack Query    → 스마트한 데이터 페칭 및 캐싱
Recharts          → 선언적 차트 라이브러리
```

---

## 🎨 커스터마이징

### 새 종목 추가

1. `data/stocks/stock-list.json`에 종목 추가:
```json
{
  "stock_code": "035720",
  "stock_name": "카카오",
  "current_price": 42500,
  "change_rate": -1.96,
  "sector": "IT서비스"
}
```

2. `data/stocks/035720.json` 생성 (005930.json 참고)

### 랭킹 수정

`data/rankings/top-stocks.json`을 편집하여 랭킹 순서 변경:
```json
{
  "overall": [
    { "rank": 1, "stock_code": "005930", ... },
    { "rank": 2, "stock_code": "373220", ... }
  ]
}
```

### 시장 지수 업데이트

`data/market/indices.json`에서 KOSPI/KOSDAQ 값 수정:
```json
{
  "kospi": {
    "value": 2650.5,
    "change": 15.2,
    "change_rate": 0.58
  }
}
```

### 사용자 정의 기술적 지표 추가

```javascript
// 사용자 정의 기술적 지표 추가
export const calculateRSI = (prices, period = 14) => {
  // 사용자 정의 계산
}

// 차트에 추가
<Chart data={prices} indicators={[RSI, MACD]} />
```

---

## 🔍 디버깅

### 콘솔에서 확인

브라우저 개발자 도구(F12) → Console 탭에서:

```javascript
// 저장된 사용자 목록 확인
JSON.parse(localStorage.getItem('mock_users'))

// 현재 로그인 사용자 확인
JSON.parse(localStorage.getItem('current_user'))

// 관심종목 확인
JSON.parse(localStorage.getItem('user_watchlist_1'))

// 모든 LocalStorage 데이터 삭제
localStorage.clear()
```

### Mock 데이터 로딩 실패 시

1. **브라우저 콘솔** 확인 (F12)
2. **Network 탭**에서 JSON 파일 로딩 상태 확인
3. `/data` 폴더 경로가 올바른지 확인
4. JSON 파일 형식이 올바른지 확인 (JSONLint 사용)

### 문제 해결

**종목 상세 페이지가 비어있음**
→ `data/stocks/{stock_code}.json` 파일 존재 확인

**로그인이 안됨**
→ 브라우저 콘솔에서 `localStorage.getItem('mock_users')` 확인

**관심종목이 저장 안됨**
→ LocalStorage 용량 확인, 시크릿 모드 확인

**차트가 표시 안됨**
→ `chart_data` 배열이 JSON 파일에 있는지 확인

---

## 💡 팁과 트릭

### 빠른 데이터 리셋

```javascript
// 브라우저 콘솔에서
localStorage.clear()
location.reload()
```

### 다른 사용자로 테스트

`data/auth/mock-users.json`에 추가:
```json
{
  "id": 2,
  "username": "test",
  "email": "test@example.com",
  "password": "test1234",
  "name": "테스트 사용자"
}
```

### Mock 딜레이 조절

`.env` 파일:
```env
VITE_ENABLE_MOCK_DELAYS=true
VITE_MOCK_DELAY=100  # 밀리초 (기본: 300)
```

---

## 🔄 전체 시스템과의 관계

### 진화 경로

```
독립 실행형 에디션 (여기 계신 곳)
       ↓ 선택적 업그레이드
전체 주식 에이전트 시스템
       ↓
   프로덕션 배포
```

### 마이그레이션 경로

Standalone에서 시작하여 나중에 Full System으로 업그레이드하는 것이 가능합니다:

**1단계: Standalone에서 학습**
```bash
# 설치 및 실행
pnpm install
pnpm dev

# UI 익히기, 컴포넌트 수정
```

**2단계: 커스터마이징**
```javascript
// 데이터 구조 이해
// UI 컴포넌트 수정
// 비즈니스 로직 추가
```

**3단계: Full System으로 이동 (선택사항)**
```bash
# Full System 설치
cd stock-agent-system
pip install -r requirements.txt

# Standalone에서 개발한 UI 컴포넌트 재사용
cp stock-client-standalone/src/components/* stock-agent-system/stock-client/src/components/
```

**호환성**:
- ✅ UI 컴포넌트 재사용 가능
- ✅ 데이터 구조 유사
- ✅ API 인터페이스 호환 설계
- ⚠️ 백엔드 통합 작업 필요

### 호환성

독립 실행형 에디션은 전체 시스템과 **동일한 UI 컴포넌트**를 사용하여 마이그레이션이 간단합니다:

```javascript
// 독립 실행형: 모의 데이터
const stocks = await fetch('/data/stocks/list.json')

// 전체 시스템: 실제 API
const stocks = await api.getStocks()

// 동일한 UI 컴포넌트가 둘 다 작동!
<StockList stocks={stocks} />
```

---

## 🛠️ 개발

### 테스트 실행

```bash
# 테스트 실행 (구현 시)
pnpm test

# 린터 실행
pnpm lint
```

### 코드 스타일

이 프로젝트는 코드 품질을 위해 ESLint를 사용합니다. 설정은 `eslint.config.js`에 있습니다.

### 컴포넌트 개발

일관된 UI 컴포넌트를 위해 shadcn/ui를 사용합니다. 새 컴포넌트를 추가하려면:

```bash
# 예시: 새 다이얼로그 컴포넌트 추가
npx shadcn-ui@latest add dialog
```

---

## 🌐 배포

### 정적 호스팅 (권장)

정적 사이트를 지원하는 플랫폼에 배포하세요:

#### Vercel
```bash
pnpm build
# 'dist' 폴더를 Vercel에 배포
```

또는 Vercel CLI 사용:
```bash
npm i -g vercel
cd stock-client-standalone
vercel
```

#### Netlify
```bash
pnpm build
# 'dist' 폴더를 Netlify에 배포
```

또는 Netlify에 저장소 연결:
1. Netlify에 저장소 연결
2. Build command: `pnpm build`
3. Publish directory: `dist`
4. 자동 배포 완료!

#### GitHub Pages
```bash
pnpm build
# 'dist' 폴더를 GitHub Pages에 배포
```

#### Cloudflare Pages
- 글로벌 CDN 포함
- 무료 호스팅

### Docker (선택사항)

```dockerfile
FROM nginx:alpine
COPY dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

```bash
docker build -t stock-client .
docker run -p 8080:80 stock-client
```

### 배포 차이점

**Standalone 배포**:
- ✅ 비용: **$0/월** (무료 티어 사용 시)
- ✅ 호스팅: Vercel, Netlify, GitHub Pages, Cloudflare Pages
- ✅ 배포 프로세스: 빌드 → dist 폴더 업로드 → 끝!

**Full System 배포**:
- ⚠️ 비용: **$20-100/월** (서버 + API 사용료)
- ⚠️ 호스팅: VPS 또는 Cloud 서버 필요
- ⚠️ 배포 프로세스: 서버 설정 → Python 환경 구성 → Redis 설치 → 환경 변수 설정 → 백엔드 실행 → 프론트엔드 빌드 및 서빙

---

## 🛡️ 프라이버시 및 보안

### 데이터 프라이버시 이점

✅ **데이터 수집 없음** - 분석 없음, 추적 없음
✅ **서버 통신 없음** - 데이터가 기기에 유지됨
✅ **계정 불필요** - 저장된 개인 정보 없음
✅ **오픈 소스** - 완전히 감사 가능한 코드
✅ **자체 호스팅** - 배포에 대한 완전한 제어

### 보안 고려사항

⚠️ **서버 사이드 검증 없음** - 클라이언트 사이드만
⚠️ **암호화 없음** - LocalStorage는 암호화되지 않음
⚠️ **인증 없음** - 접근 권한이 있는 사람은 누구나 사용 가능

**권장사항**: 프로덕션 금융 데이터의 경우 적절한 인증 및 암호화가 있는 전체 시스템을 사용하세요.

### 보안 및 프라이버시 차이

**Standalone**:
- ✅ 데이터가 브라우저를 떠나지 않음
- ✅ 서버 해킹 위험 없음
- ✅ API 키 불필요
- ✅ 개인정보 수집 없음
- ✅ 완전히 오프라인 동작 가능
- ⚠️ 클라이언트 사이드 검증만 가능
- ⚠️ LocalStorage는 암호화되지 않음

**Full System**:
- ✅ JWT 인증
- ✅ 서버 사이드 검증
- ✅ 데이터베이스 암호화
- ✅ API 키 서버 관리
- ✅ Rate limiting
- ✅ CORS 설정
- ⚠️ 서버 보안 유지 필요
- ⚠️ API 키 보안 관리 필요

---

## 📈 성능 비교

### Standalone

```
초기 로딩 시간: ~1-2초
빌드 크기: ~500KB (gzipped)
메모리 사용: ~50-100MB
CPU 사용: 낮음 (브라우저만)
네트워크: 0 (오프라인 가능)
```

### Full System

```
초기 로딩 시간: ~3-5초
API 응답 시간: 100-500ms
메모리 사용: ~500MB-1GB (서버)
CPU 사용: 중간-높음 (AI 분석 시)
네트워크: 지속적 (WebSocket)
```

---

## 💡 개발 철학

### Standalone의 설계 원칙

1. **단순성 (Simplicity)**
   - 최소한의 설정
   - 명확한 코드 구조
   - 학습하기 쉬움

2. **독립성 (Independence)**
   - 외부 서비스 의존 없음
   - 자체 완결적
   - 오프라인 동작

3. **접근성 (Accessibility)**
   - 무료 사용
   - 낮은 진입 장벽
   - 오픈소스

4. **교육성 (Educational)**
   - 학습 자료로 활용
   - 명확한 문서
   - 예시 코드 제공

---

## 📝 로드맵

### v1.0.0 (현재)
- [x] 기본 대시보드
- [x] 주식 목록 및 상세 보기
- [x] 모의 데이터 지원
- [x] 반응형 UI

### v1.1.0 (계획됨 - 2026년 Q1)
- [ ] 향상된 차트 (캔들스틱, 거래량)
- [ ] 데이터 내보내기 (CSV, Excel)
- [ ] 다크 모드
- [ ] 사용자 정의 테마

### v1.2.0 (계획됨 - 2026년 Q2)
- [ ] IndexedDB 통합
- [ ] PWA 지원 (오프라인 모드)
- [ ] 고급 기술적 지표
- [ ] 다국어 지원

### v2.0.0 (향후)
- [ ] 선택적 백엔드 통합
- [ ] 플러그인 시스템
- [ ] 사용자 정의 대시보드
- [ ] 데이터 가져오기 도구

---

## 🤝 기여하기

기여를 환영합니다! 가이드라인은 [CONTRIBUTING.md](./CONTRIBUTING.md)를 참조하세요.

### 개발 워크플로우

1. 저장소 포크
2. 기능 브랜치 생성 (`git checkout -b feature/amazing-feature`)
3. 변경사항 커밋 (`git commit -m 'Add amazing feature'`)
4. 브랜치에 푸시 (`git push origin feature/amazing-feature`)
5. Pull Request 열기

### 기여 방법

- 🐛 버그 신고
- 💡 기능 제안
- 📝 문서 개선
- 🎨 UI 개선 디자인
- 💻 코드 제출
- 🌍 다른 언어로 번역

---

## 📖 문서

- [컴포넌트 문서](./docs/README_CLIENT.md) - 상세 컴포넌트 API
- [워크플로우 모달 가이드](./docs/WORKFLOW_MODAL_README.md) - 워크플로우 시각화
- [주식 목록 업데이트](./docs/주식목록_업데이트버튼_추가.md) - 업데이트 기능

---

## 🔒 보안

이것은 브라우저에서 데이터를 처리하는 프론트엔드 전용 애플리케이션입니다. 독립 실행 모드에서는 외부 서버로 민감한 데이터가 전송되지 않습니다.

**모범 사례:**
- API 키나 비밀을 커밋하지 마세요
- 설정에는 환경 변수를 사용하세요
- 모든 사용자 입력을 검증하세요
- 의존성을 최신 상태로 유지하세요

---

## ⚖️ 라이선스

이 프로젝트는 MIT 라이선스 하에 라이선스가 부여됩니다. 자세한 내용은 [LICENSE](LICENSE) 파일을 참조하세요.

**라이선스**: MIT License
**저작권**: 2025 주식 분석 클라이언트 기여자

다음이 자유롭습니다:
- ✅ 상업적 사용
- ✅ 수정
- ✅ 배포
- ✅ 개인 사용

조건:
- 라이선스 및 저작권 고지 포함
- 저작권 표시 제공

---

## 🙏 감사의 말

- [React](https://reactjs.org/) - UI 프레임워크
- [shadcn/ui](https://ui.shadcn.com/) - 컴포넌트 라이브러리
- [TanStack Query](https://tanstack.com/query) - 데이터 페칭
- [Recharts](https://recharts.org/) - 차트 라이브러리
- [Tailwind CSS](https://tailwindcss.com/) - CSS 프레임워크

---

## 📞 지원

- **이슈**: [GitHub Issues](https://github.com/your-username/stock-client-standalone/issues)
- **토론**: [GitHub Discussions](https://github.com/your-username/stock-client-standalone/discussions)
- **문서**: [Wiki](https://github.com/your-username/stock-client-standalone/wiki)

---

## 🌟 스타 히스토리

이 프로젝트가 유용하다고 생각하시면, 스타를 눌러주세요!

---

## 📈 프로젝트 상태

**현재 버전:** 1.0.0
**상태:** 활발한 개발 중
**최종 업데이트:** 2025년 12월

---

## ⚠️ 면책 조항

이 소프트웨어는 **교육 및 정보 제공 목적으로만** 사용됩니다.

- ❌ 금융 조언이 아님
- ❌ 보증이나 보장 없음
- ❌ 본인의 책임하에 사용
- ✅ 항상 면허를 받은 금융 전문가와 상담

이 애플리케이션에 표시된 주식 시장 데이터는 지연되거나 부정확할 수 있습니다. 개발자는 이 소프트웨어 사용으로 인해 발생한 금융 손실에 대해 책임을 지지 않습니다.

---

## 🔗 관련 프로젝트

- **전체 주식 에이전트 시스템** - AI가 있는 백엔드 기반 버전
- **shadcn/ui** - 사용된 UI 컴포넌트 라이브러리
- **Recharts** - 사용된 차트 라이브러리
- **TanStack Query** - 사용된 데이터 페칭 라이브러리

---

**오픈소스 커뮤니티를 위해 ❤️로 제작되었습니다**
