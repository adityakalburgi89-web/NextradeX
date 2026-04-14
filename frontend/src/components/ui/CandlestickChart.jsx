import React, { useEffect, useRef } from "react";
import { createChart } from "lightweight-charts";

export default function CandlestickChart({ data = [], options = {}, height = 420 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const seriesRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const chart = createChart(containerRef.current, {
      width: containerRef.current.clientWidth,
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

    const candlestickSeries = chart.addCandlestickSeries({
      upColor: "#22c55e",
      downColor: "#ef4444",
      borderUpColor: "#22c55e",
      borderDownColor: "#ef4444",
      wickUpColor: "#22c55e",
      wickDownColor: "#ef4444",
    });

    if (data && data.length > 0) {
      candlestickSeries.setData(data);
      chart.timeScale().fitContent();
    }

    chartRef.current = chart;
    seriesRef.current = candlestickSeries;

    const resizeObserver = new ResizeObserver(() => {
      if (containerRef.current) {
        chart.applyOptions({
          width: containerRef.current.clientWidth,
          height,
        });
        chart.timeScale().fitContent();
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
      chart.remove();
    };
  }, [height, options]);

  useEffect(() => {
    if (seriesRef.current && data && data.length > 0) {
      seriesRef.current.setData(data);
      chartRef.current?.timeScale().fitContent();
    }
  }, [data]);

  if (!data.length) {
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
