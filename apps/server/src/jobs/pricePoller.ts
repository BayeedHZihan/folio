import cron from 'node-cron';
import { refreshAllTrackedStocks, getEurUsdRate } from '../services/stockService';

// Runs every 20 minutes on weekdays during market hours (08:00–22:00 UTC)
const MARKET_HOURS_SCHEDULE = '*/20 8-22 * * 1-5';

// Runs every hour
const FOREX_SCHEDULE = '0 * * * *';

export function startPricePollingJob() {
  cron.schedule(MARKET_HOURS_SCHEDULE, async () => {
    console.log('[PricePoller] Starting scheduled price refresh...');
    try {
      await refreshAllTrackedStocks();
      console.log('[PricePoller] ✅ Price refresh complete');
    } catch (err) {
      console.error('[PricePoller] ❌ Error during price refresh:', err);
    }
  });

  cron.schedule(FOREX_SCHEDULE, async () => {
    console.log('[ForexPoller] Refreshing EUR/USD rate...');
    try {
      const rate = await getEurUsdRate();
      console.log(`[ForexPoller] ✅ EUR/USD rate: ${rate}`);
    } catch (err) {
      console.error('[ForexPoller] ❌ Error refreshing forex rate:', err);
    }
  });

  console.log('📅 Price polling job scheduled (weekdays 08:00–22:00 UTC, every 20 min)');
  console.log('💱 Forex polling job scheduled (every hour)');
}