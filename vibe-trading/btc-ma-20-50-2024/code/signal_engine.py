"""20/50 SMA crossover: long while SMA20 > SMA50, flat otherwise.

The first 50 bars of the fetched range are MA warmup (signal 0), so with a
start_date 50 calendar days before Jan 1 the strategy is live for all of 2024.
"""

from typing import Dict

import pandas as pd


class SignalEngine:
    FAST = 20
    SLOW = 50

    def generate(self, data_map: Dict[str, pd.DataFrame]) -> Dict[str, pd.Series]:
        signals: Dict[str, pd.Series] = {}
        for code, df in data_map.items():
            close = df["close"]
            fast = close.rolling(self.FAST).mean()
            slow = close.rolling(self.SLOW).mean()
            sig = (fast > slow).astype(float)
            sig[slow.isna()] = 0.0
            signals[code] = sig.reindex(df.index).fillna(0.0)
        return signals
