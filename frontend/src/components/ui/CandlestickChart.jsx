import React, { useEffect, useRef } from "react";
import { createChart, CandlestickSeries } from "lightweight-charts";

const EMPTY_OPTIONS = {};

export default function CandlestickChart({ data = [], options = EMPTY_OPTIONS, height = 420 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth || 800,
      height,
      layout: {
        background: { type: "solid", color: "transparent" },
        textColor: "#9ca3af",
        fontFamily: '"JetBrains Mono", monospace',
      },
      grid: {
        vertLines: { color: "rgba(148, 163, 184, 0.08)" },
        horzLines: { color: "rgba(148, 163, 184, 0.08)" },
      },
      crosshair: {
        mode: 1,
        vertLine: { color: "rgba(247, 147, 26, 0.35)", width: 1, style: 2 },
        horzLine: { color: "rgba(247, 147, 26, 0.35)", width: 1, style: 2 },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: { top: 0.1, bottom: 0.1 },
      },
      timeScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        timeVisible: true,
        secondsVisible: false,
      },
      handleScale: { axisPressedMouseMove: true, mouseWheel: true, pinch: true },
      handleScroll: { vertTouchDrag: false, mouseWheel: true, pressedMouseMove: true },
      ...options,
    });

    const candlestickSeries = chart.addSeries(CandlestickSeries, {
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current && chartRef.current) {
        chartRef.current.applyOptions({
          width: containerRef.current.clientWidth,
          height,
        });
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      if (chartRef.current) {
        chartRef.current.remove();
        chartRef.current = null;
      }
    };
  }, [height]);

  useEffect(() => {
    if (seriesRef.current && chartRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  if (!data || data.length === 0) {
    return (
      <div
        className="chart-shell flex items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/50 text-sm text-muted"
        style={{ height }}
      >
        Waiting for candle data...
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className="chart-shell w-full overflow-hidden rounded-[28px] bg-black/20"
      style={{ height }}
    />
  );
}
