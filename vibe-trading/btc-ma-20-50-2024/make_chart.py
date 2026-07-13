"""Equity curve vs buy-and-hold + drawdown subplot for the BTC 20/50 MA backtest."""

import matplotlib

matplotlib.use("Agg")
import matplotlib.dates as mdates
import matplotlib.pyplot as plt
import pandas as pd

RUN = "/tmp/claude-0/-home-user-ChicoloCoLab/3fe26846-e986-5b0c-abc1-061fe14ecb7c/scratchpad/btc-ma-run/artifacts"
OUT = "/tmp/claude-0/-home-user-ChicoloCoLab/3fe26846-e986-5b0c-abc1-061fe14ecb7c/scratchpad/equity_curve_2024.png"

SURFACE = "#fcfcfb"
INK = "#0b0b0b"
SECONDARY = "#52514e"
MUTED = "#898781"
GRID = "#e1e0d9"
BASELINE = "#c3c2b7"
BLUE = "#2a78d6"   # series 1: strategy
AQUA = "#1baf7a"   # series 2: buy & hold

eq = pd.read_csv(f"{RUN}/equity.csv", parse_dates=[0], index_col=0).loc["2024"]
strat = eq["equity"] / eq["equity"].iloc[0] * 1_000_000
px = pd.read_csv(f"{RUN}/ohlcv_BTC-USDT.csv", parse_dates=[0], index_col=0).loc["2024", "close"]
bench = px / px.iloc[0] * 1_000_000
dd = (strat / strat.cummax() - 1) * 100

fig, (ax1, ax2) = plt.subplots(
    2, 1, figsize=(10, 6.2), dpi=160, sharex=True,
    gridspec_kw={"height_ratios": [2.6, 1], "hspace": 0.12},
)
fig.patch.set_facecolor(SURFACE)

for ax in (ax1, ax2):
    ax.set_facecolor(SURFACE)
    ax.grid(axis="y", color=GRID, linewidth=0.8)
    for side in ("top", "right", "left"):
        ax.spines[side].set_visible(False)
    ax.spines["bottom"].set_color(BASELINE)
    ax.tick_params(colors=MUTED, labelsize=9, length=0)

ax1.plot(bench.index, bench.values, color=AQUA, linewidth=2, label="BTC buy & hold")
ax1.plot(strat.index, strat.values, color=BLUE, linewidth=2, label="20/50 MA strategy")

# direct labels at line ends (relief rule for the sub-3:1 aqua)
ax1.annotate(f"Buy & hold\n+{bench.iloc[-1] / 1e6 - 1:.0%}", xy=(bench.index[-1], bench.iloc[-1]),
             xytext=(8, 0), textcoords="offset points", color=AQUA, fontsize=9,
             fontweight="bold", va="center")
ax1.annotate(f"Strategy\n+{strat.iloc[-1] / 1e6 - 1:.0%}", xy=(strat.index[-1], strat.iloc[-1]),
             xytext=(8, 0), textcoords="offset points", color=BLUE, fontsize=9,
             fontweight="bold", va="center")

ax1.set_title("BTC-USDT 20/50 MA crossover vs buy & hold — 2024 (growth of $1M)",
              color=INK, fontsize=12, loc="left", pad=12)
ax1.yaxis.set_major_formatter(lambda v, _: f"${v / 1e6:.1f}M")
ax1.legend(frameon=False, loc="upper left", fontsize=9, labelcolor=SECONDARY)
ax1.margins(x=0.01)

ax2.fill_between(dd.index, dd.values, 0, color=BLUE, alpha=0.18, linewidth=0)
ax2.plot(dd.index, dd.values, color=BLUE, linewidth=1.5)
ax2.text(0.635, 0.06, f"max drawdown {dd.min():.1f}%", transform=ax2.transAxes,
         color=SECONDARY, fontsize=9, ha="left", va="bottom")
ax2.set_ylabel("Strategy drawdown", color=SECONDARY, fontsize=9)
ax2.yaxis.set_major_formatter(lambda v, _: f"{v:.0f}%")
ax2.xaxis.set_major_locator(mdates.MonthLocator())
ax2.xaxis.set_major_formatter(mdates.DateFormatter("%b"))
ax2.margins(x=0.01)

fig.subplots_adjust(left=0.08, right=0.87, top=0.92, bottom=0.06)
fig.savefig(OUT, facecolor=SURFACE)
print(OUT)
