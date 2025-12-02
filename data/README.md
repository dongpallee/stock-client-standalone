# Mock Data Directory

This directory contains JSON files used for mock data when running the application in standalone mode (without a backend server).

## Directory Structure

```
data/
├── stocks/               # Individual stock data
│   ├── stock-list.json  # List of all stocks
│   ├── 005930.json      # Samsung Electronics
│   ├── 000660.json      # SK Hynix
│   └── ...              # More stock files
├── rankings/            # Stock rankings data
│   └── top-stocks.json  # Top performing stocks
├── market/              # Market-wide data
│   └── indices.json     # Market indices (KOSPI, KOSDAQ)
└── README.md           # This file
```

## Data Formats

### Stock List (`stocks/stock-list.json`)

```json
[
  {
    "stock_code": "005930",
    "stock_name": "삼성전자",
    "current_price": 70000,
    "change_amount": 1500,
    "change_rate": 2.19,
    "volume": 12500000,
    "market_cap": 4200000000000,
    "sector": "반도체",
    "listed_shares": 60000000,
    "description": "글로벌 반도체 및 전자제품 제조업체"
  }
]
```

### Individual Stock Data (`stocks/{stock_code}.json`)

```json
{
  "stock_code": "005930",
  "stock_name": "삼성전자",
  "basic_info": {
    "current_price": 70000,
    "change_amount": 1500,
    "change_rate": 2.19,
    "volume": 12500000,
    "market_cap": 4200000000000,
    "sector": "반도체",
    "industry": "반도체 제조"
  },
  "price_data": {
    "open": 68500,
    "high": 71000,
    "low": 68000,
    "close": 70000,
    "volume": 12500000,
    "week_52_high": 85000,
    "week_52_low": 55000
  },
  "financial_ratios": {
    "per": 15.5,
    "pbr": 1.8,
    "eps": 4516,
    "bps": 38889,
    "roe": 12.5,
    "dividend_yield": 2.8
  },
  "analysis": {
    "composite_score": 85,
    "grade": "A",
    "investment_opinion": "매수",
    "target_price": 85000,
    "technical_score": 82,
    "fundamental_score": 88,
    "sentiment_score": 85
  },
  "chart_data": [
    {
      "date": "2025-01-01",
      "open": 68000,
      "high": 70000,
      "low": 67500,
      "close": 69500,
      "volume": 10000000
    }
  ]
}
```

### Rankings (`rankings/top-stocks.json`)

```json
{
  "overall": [
    {
      "rank": 1,
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "composite_score": 85,
      "grade": "A",
      "change_rate": 2.19
    }
  ],
  "by_sector": {
    "반도체": [
      {
        "rank": 1,
        "stock_code": "005930",
        "stock_name": "삼성전자",
        "composite_score": 85
      }
    ]
  },
  "by_volume": [
    {
      "rank": 1,
      "stock_code": "005930",
      "stock_name": "삼성전자",
      "volume": 12500000
    }
  ]
}
```

### Market Indices (`market/indices.json`)

```json
{
  "kospi": {
    "value": 2650.5,
    "change": 15.2,
    "change_rate": 0.58,
    "volume": 450000000,
    "timestamp": "2025-12-02T15:30:00Z"
  },
  "kosdaq": {
    "value": 850.3,
    "change": -3.5,
    "change_rate": -0.41,
    "volume": 280000000,
    "timestamp": "2025-12-02T15:30:00Z"
  },
  "sectors": {
    "반도체": {
      "change_rate": 2.5,
      "top_stocks": ["005930", "000660"]
    },
    "자동차": {
      "change_rate": -0.8,
      "top_stocks": ["005380", "000270"]
    }
  }
}
```

## How to Use

1. **Create your data files** in the appropriate subdirectories
2. **Follow the JSON formats** shown above
3. **Update the API layer** (`src/lib/api.js`) to use local data:

```javascript
// In src/lib/api.js
const USE_MOCK_DATA = true  // Set to true for standalone mode

export const stockAPI = {
  getStockList: async () => {
    if (USE_MOCK_DATA) {
      const response = await fetch('/data/stocks/stock-list.json')
      return response.json()
    }
    // Real API call
  }
}
```

## Sample Data

To get started quickly, you can use the sample data files provided in this directory. These contain realistic examples for popular Korean stocks like:

- **005930** - 삼성전자 (Samsung Electronics)
- **000660** - SK하이닉스 (SK Hynix)
- **005380** - 현대차 (Hyundai Motor)
- **035720** - 카카오 (Kakao)

## Generating Mock Data

You can generate additional mock data using:

1. **Manual creation** - Create JSON files following the formats above
2. **Data exports** - Export data from the full backend version
3. **Scripts** - Use data generation scripts (if provided)

## Notes

- All prices are in Korean Won (KRW)
- Dates are in ISO 8601 format
- Stock codes follow KRX standard (6 digits)
- Data should be updated regularly for realistic testing
- Large datasets may affect application performance

## Real Data Integration

To integrate real data sources:

1. Enable the API proxy in `vite.config.js`
2. Update `src/lib/api.js` to use real endpoints
3. Configure environment variables for API keys
4. Ensure CORS is properly configured

See the main README for more information on backend integration.
