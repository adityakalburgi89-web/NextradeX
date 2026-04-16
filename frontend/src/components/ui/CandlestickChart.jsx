import React, { useEffect, useRef, useState } from "react";
import { createChart, CandlestickSeries, HistogramSeries } from "lightweight-charts";

const EMPTY_OPTIONS = {};

export default function CandlestickChart({ data = [], options = EMPTY_OPTIONS, height = 420 }) {
  const containerRef = useRef(null);
  const chartRef = useRef(null);
  const candleSeriesRef = useRef(null);
  const volumeSeriesRef = useRef(null);
  const tooltipRef = useRef(null);
  const [tooltipData, setTooltipData] = useState(null);

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
        vertLine: { color: "rgba(247, 147, 26, 0.35)", width: 1, style: 2, labelBackgroundColor: "rgba(247, 147, 26, 0.8)" },
        horzLine: { color: "rgba(247, 147, 26, 0.35)", width: 1, style: 2, labelBackgroundColor: "rgba(247, 147, 26, 0.8)" },
      },
      rightPriceScale: {
        borderColor: "rgba(255, 255, 255, 0.1)",
        scaleMargins: { top: 0.1, bottom: 0.25 },
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

    const volumeSeries = chart.addSeries(HistogramSeries, {
      color: "#6b7280",
      priceFormat: { type: "volume" },
      priceScaleId: "volume",
    });

    chart.priceScale("volume").applyOptions({
      scaleMargins: { top: 0.8, bottom: 0 },
      borderVisible: false,
      alignLabels: false,
    });

    chart.subscribeCrosshairMove((param) => {
      if (param.time) {
        const candleData = param.seriesData.get(candleSeries);
        const volumeData = param.seriesData.get(volumeSeries);
        if (candleData) {
          setTooltipData({
            time: param.time,
            open: candleData.open,
            high: candleData.high,
            low: candleData.low,
            close: candleData.close,
            volume: volumeData?.value || 0,
          });
        }
      } else {
        setTooltipData(null);
      }
    });

    chartRef.current = chart;
    candleSeriesRef.current = candlestickSeries;
    volumeSeriesRef.current = volumeSeries;

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
    if (candleSeriesRef.current && volumeSeriesRef.current && chartRef.current && data && data.length > 0) {
      const candleData = data.map(d => ({ time: d.time, open: d.open, high: d.high, low: d.low, close: d.close }));
      const volumeData = data.map(d => ({ time: d.time, value: d.volume, color: d.close >= d.open ? "rgba(34, 197, 94, 0.5)" : "rgba(239, 68, 68, 0.5)" }));

      candleSeriesRef.current.setData(candleData);
      volumeSeriesRef.current.setData(volumeData);
      chartRef.current.timeScale().fitContent();
    }
  }, [data]);

  const formatPrice = (num) => {
    if (num === undefined || num === null) return "--";
    return Number(num).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatVolume = (num) => {
    if (num === undefined || num === null) return "--";
    if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
    if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
    if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
    return num.toFixed(2);
  };

  if (!data || data.length === 0) {
    return (
      <div
        className="chart-shell relative flex items-center justify-center rounded-[28px] border border-white/10 bg-slate-950/50 text-sm text-muted"
        style={{ height }}
      >
        Waiting for candle data...
      </div>
    );
  }

  return (
    <div className="relative">
      {tooltipData && (
        <div className="absolute left-4 top-4 z-10 rounded-lg border border-white/10 bg-black/80 px-3 py-2 backdrop-blur-sm">
          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs font-mono">
            <span className="text-muted">O</span>
            <span className="text-white">{formatPrice(tooltipData.open)}</span>
            <span className="text-muted">H</span>
            <span className="text-white">{formatPrice(tooltipData.high)}</span>
            <span className="text-muted">L</span>
            <span className="text-white">{formatPrice(tooltipData.low)}</span>
            <span className="text-muted">C</span>
            <span className={tooltipData.close >= tooltipData.open ? "text-accent-green" : "text-accent-red"}>{formatPrice(tooltipData.close)}</span>
            <span className="text-muted">Vol</span>
            <span className="text-white">{formatVolume(tooltipData.volume)}</span>
          </div>
        </div>
      )}
      <div
        ref={containerRef}
        className="chart-shell w-full overflow-hidden rounded-[28px] bg-black/20"
        style={{ height }}
      />
    </div>
  );
}
