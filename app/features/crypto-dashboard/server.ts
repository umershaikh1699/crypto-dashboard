import type { CryptoDashboardData } from "./contracts";
import { getCachedDashboardData } from "./internal/services/dashboard-loader.server";
import { normalizeCryptoCards } from "./internal/services/rate-normalizer";

export function getCryptoDashboardData(): Promise<CryptoDashboardData> {
  return getCachedDashboardData();
}

export { normalizeCryptoCards };
