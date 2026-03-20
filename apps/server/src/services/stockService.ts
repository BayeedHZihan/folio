import { prisma } from '../lib/prisma';

const FINNHUB_API_KEY = process.env.FINNHUB_API_KEY!;
const BASE_URL = 'https://finnhub.io/api/v1';
const FOREX_API_URL = 'https://api.exchangerate-api.com/v4/latest/USD';

function normaliseSector(finnhubIndustry: string): string {
  const map: Record<string, string> = {
    'Technology': 'Technology',
    'Software': 'Technology',
    'Semiconductors': 'Technology',
    'Health Care': 'Healthcare',
    'Pharmaceuticals': 'Healthcare',
    'Biotechnology': 'Healthcare',
    'Financial Services': 'Financials',
    'Banks': 'Financials',
    'Consumer Cyclical': 'Consumer Discretionary',
    'Consumer Defensive': 'Consumer Staples',
    'Industrials': 'Industrials',
    'Energy': 'Energy',
    'Basic Materials': 'Materials',
    'Utilities': 'Utilities',
    'Real Estate': 'Real Estate',
    'Communication Services': 'Communication Services',
    'Interactive Media & Services': 'Communication Services',
    'Media': 'Communication Services',
    'Entertainment': 'Communication Services',
    'Automobiles': 'Consumer Discretionary',
    'Retail': 'Consumer Discretionary',
    'Food & Staples Retailing': 'Consumer Staples',
    'Food Products': 'Consumer Staples',
    'Aerospace & Defense': 'Industrials',
    'Machinery': 'Industrials',
    'Insurance': 'Financials',
    'Capital Markets': 'Financials',
    'Diversified Financial Services': 'Financials',
    'Metals & Mining': 'Materials',
    'Chemicals': 'Materials',
    'Oil & Gas': 'Energy',
    'Electric Utilities': 'Utilities',
    'Water Utilities': 'Utilities',
  };
  return map[finnhubIndustry] ?? 'Other';
}

function normaliseRegion(country: string): string {
  const northAmerica = ['United States', 'US', 'Canada', 'Mexico'];
  const europe = ['United Kingdom', 'Germany', 'France', 'Netherlands', 'Switzerland', 'Sweden', 'Denmark', 'Norway', 'Finland', 'Italy', 'Spain'];
  const asiaPacific = ['Japan', 'Australia', 'South Korea', 'Hong Kong', 'Singapore', 'New Zealand'];
  const emerging = ['China', 'India', 'Brazil', 'Taiwan', 'South Africa', 'Indonesia', 'Malaysia'];

  if (northAmerica.includes(country)) return 'North America';
  if (europe.includes(country)) return 'Europe';
  if (asiaPacific.includes(country)) return 'Asia Pacific';
  if (emerging.includes(country)) return 'Emerging Markets';
  return 'Other';
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function chunkArray<T>(arr: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );
}

// ─── Forex ────────────────────────────────────────────────────────────────────

export async function getEurUsdRate(): Promise<number> {
  // Check cache first — only refresh if older than 1 hour
  const cached = await prisma.forexRate.findUnique({
    where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'EUR' } },
  });

  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  if (cached && cached.updatedAt > oneHourAgo) {
    return cached.rate;
  }

  // Fetch fresh rate
  const res = await fetch(FOREX_API_URL);
  const data = await res.json() as { rates: Record<string, number> };
  const rate = data.rates['EUR'];

  // Upsert into DB
  await prisma.forexRate.upsert({
    where: { fromCurrency_toCurrency: { fromCurrency: 'USD', toCurrency: 'EUR' } },
    create: { fromCurrency: 'USD', toCurrency: 'EUR', rate },
    update: { rate },
  });

  return rate;
}

// ─── Stocks ───────────────────────────────────────────────────────────────────

export async function fetchAndUpsertStock(ticker: string): Promise<void> {
  const existing = await prisma.stock.findUnique({ where: { ticker } });
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
  if (existing && existing.lastUpdated > thirtyMinutesAgo) return;

  try {
    const [quoteRes, profileRes] = await Promise.all([
      fetch(`${BASE_URL}/quote?symbol=${ticker}&token=${FINNHUB_API_KEY}`),
      fetch(`${BASE_URL}/stock/profile2?symbol=${ticker}&token=${FINNHUB_API_KEY}`),
    ]);
    

    const quote = await quoteRes.json() as { c: number };
    const profile = await profileRes.json() as {
      name: string;
      currency: string;
      finnhubIndustry: string;
      country: string;
    };

    console.log(`[Stock] ${ticker} — industry: "${profile.finnhubIndustry}", country: "${profile.country}"`);

    // Convert USD price to EUR
    const eurUsdRate = await getEurUsdRate();
    const priceInEur = quote.c * eurUsdRate;

    await prisma.stock.upsert({
      where: { ticker },
      create: {
        ticker,
        name: profile.name ?? ticker,
        currentPrice: priceInEur,
        currency: 'EUR',
        sector: normaliseSector(profile.finnhubIndustry ?? ''),
        region: normaliseRegion(profile.country ?? ''),
        lastUpdated: new Date(),
      },
      update: {
        currentPrice: priceInEur,
        currency: 'EUR',
        lastUpdated: new Date(),
        name: profile.name ?? ticker,
        sector: normaliseSector(profile.finnhubIndustry ?? ''),
        region: normaliseRegion(profile.country ?? ''),
      },
    });
  } catch (err) {
    console.error(`Failed to fetch stock data for ${ticker}:`, err);
  }
}

export async function refreshAllTrackedStocks(): Promise<void> {
  const stocks = await prisma.stock.findMany({ select: { ticker: true } });
  console.log(`🔄 Refreshing prices for ${stocks.length} tracked stocks...`);

  const chunks = chunkArray<{ ticker: string }>(stocks, 10);
  for (const chunk of chunks) {
    await Promise.all(chunk.map(({ ticker }) => fetchAndUpsertStock(ticker)));
    await sleep(1000);
  }
}