"use client";
import { useEffect, useRef } from "react";
import * as echarts from "echarts";

/**
 * Thin React wrapper around Apache ECharts.
 * Pass an ECharts `option` object; the chart initialises once and updates when
 * the option changes. SVG renderer keeps it crisp and light.
 */
export default function EChart({ option, height = 300, className = "" }) {
  const elRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!elRef.current) return undefined;
    const chart = echarts.init(elRef.current, null, { renderer: "svg" });
    chartRef.current = chart;
    const onResize = () => chart.resize();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      chart.dispose();
      chartRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (chartRef.current && option) chartRef.current.setOption(option, true);
  }, [option]);

  return <div ref={elRef} className={className} style={{ height, width: "100%" }} />;
}
