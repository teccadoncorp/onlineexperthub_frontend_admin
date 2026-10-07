"use client";

import { useState } from "react";
import { formatInr } from "@/lib/money";
import type { SeriesPoint } from "@/lib/admin";
import { tx } from "@/lib/tx";

const DOTS = 10;

export function RevenueChart({ locale, series }: { locale: string; series: SeriesPoint[] }) {
  const [active, setActive] = useState(Math.max(series.length - 1, 0));
  const max = Math.max(1, ...series.map((point) => Math.max(point.actual, point.projected)));
  const mid = Math.round(max / 2);
  const ticks = mid === max || mid === 0 ? [max, 0] : [max, mid, 0];
  return (
    <div className="loop-plot">
      <div className="loop-yaxis">
        {ticks.map((tick, index) => (
          <span key={`${index}-${tick}`}>{formatInr(tick)}</span>
        ))}
      </div>
      <div className="loop-cols" onMouseLeave={() => setActive(Math.max(series.length - 1, 0))}>
        {series.map((point, index) => {
          const actualDots = point.actual === 0 ? 0 : Math.max(1, Math.round((point.actual / max) * DOTS));
          const projectedDots = point.projected === 0 ? 0 : Math.max(1, Math.round((point.projected / max) * DOTS));
          const hot = index === active;
          const showLabel = hot || index % 5 === 0 || index === series.length - 1;
          return (
            <button
              key={`${point.label}-${index}`}
              type="button"
              className={hot ? `loop-col hot${index > series.length - 5 ? " end" : ""}` : `loop-col${index > series.length - 5 ? " end" : ""}`}
              aria-label={`${point.label}, ${formatInr(point.actual)}`}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
            >
              {Array.from({ length: DOTS }, (_, step) => {
                const level = DOTS - step;
                const filled = level <= Math.max(actualDots, projectedDots);
                const soft = filled && level > actualDots;
                return <i key={step} className={filled ? (hot ? "hot" : soft ? "soft" : "on") : ""} />;
              })}
              {hot ? (
                <span className="loop-tip">
                  <b>
                    {tx(locale, "Earned", "আয়")} {formatInr(point.actual)}
                  </b>
                  <span>
                    {tx(locale, "Trend", "ধারা")} {formatInr(point.projected)}
                  </span>
                </span>
              ) : null}
              <em>{showLabel ? point.label : ""}</em>
            </button>
          );
        })}
      </div>
    </div>
  );
}
