'use client';

import React from 'react';
import { View, Text, Svg, Line, Rect, Path, Circle, StyleSheet } from '@react-pdf/renderer';
import type { DepreciationMonth } from '@/lib/types';
import { formatMonthLabel } from '@/lib/pdf-assets';

const styles = StyleSheet.create({
  container: {
    marginTop: 4,
  },
  fallback: {
    fontSize: 9,
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    paddingVertical: 20,
  },
});

interface DepreciationChartPDFProps {
  data: DepreciationMonth[];
  width?: number;
  height?: number;
}

export function DepreciationChartPDF({
  data,
  width = 220,
  height = 120,
}: DepreciationChartPDFProps) {
  if (!data || data.length < 2) {
    return (
      <View style={styles.container}>
        <Text style={styles.fallback}>No depreciation data available</Text>
      </View>
    );
  }

  // Chart margins
  const ml = 45; // left margin for Y labels
  const mr = 10;
  const mt = 10;
  const mb = 25; // bottom margin for X labels

  const chartW = width - ml - mr;
  const chartH = height - mt - mb;

  // Y-axis: auto-scale to data range with 5% padding
  const amounts = data.map((d) => d.amount);
  const minVal = Math.min(...amounts);
  const maxVal = Math.max(...amounts);
  const range = maxVal - minVal || 1;
  const padding = range * 0.05;
  const yMin = Math.max(0, minVal - padding);
  const yMax = maxVal + padding;

  // Generate "nice" Y-axis ticks
  const yTicks = getNiceTicks(yMin, yMax, 4);

  const scaleX = (i: number) => ml + (i / (data.length - 1)) * chartW;
  const ySpan = yMax - yMin || 1;
  const scaleY = (val: number) =>
    mt + chartH - ((val - yMin) / ySpan) * chartH;

  // Build SVG path for the line
  const pathD = data
    .map((d, i) => {
      const x = scaleX(i).toFixed(1);
      const y = scaleY(d.amount).toFixed(1);
      return `${i === 0 ? 'M' : 'L'}${x},${y}`;
    })
    .join(' ');

  // X-axis labels — skip labels to prevent crowding
  const maxXLabels = 6;
  const step = Math.max(1, Math.ceil(data.length / maxXLabels));

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        {/* Background */}
        <Rect x={ml} y={mt} width={chartW} height={chartH} fill="#f9fafb" />

        {/* Y-axis gridlines and labels */}
        {yTicks.map((tick, i) => {
          const y = scaleY(tick);
          return (
            <React.Fragment key={`ytick-${i}`}>
              <Line
                x1={ml}
                y1={y}
                x2={ml + chartW}
                y2={y}
                stroke="#e5e7eb"
                strokeWidth={0.5}
              />
              <Text
                x={ml - 4}
                y={y - 3}
                style={{ fontSize: 7, textAnchor: 'end', fill: '#6b7280' }}
              >
                {formatTick(tick)}
              </Text>
            </React.Fragment>
          );
        })}

        {/* Line path */}
        <Path d={pathD} stroke="#16a34a" strokeWidth={1.5} fill="none" />

        {/* Data points at each month */}
        {data.map((d, i) => (
          <Circle
            key={`point-${i}`}
            cx={scaleX(i)}
            cy={scaleY(d.amount)}
            r={2.5}
            fill="#16a34a"
          />
        ))}

        {/* X-axis labels */}
        {data.map((d, i) => {
          if (i % step !== 0 && i !== data.length - 1) return null;
          const x = scaleX(i);
          return (
            <Text
              key={`xlabel-${i}`}
              x={x}
              y={mt + chartH + 12}
              style={{
                fontSize: 6,
                textAnchor: 'middle',
                fill: '#6b7280',
              }}
            >
              {formatMonthLabel(d.month)}
            </Text>
          );
        })}
      </Svg>
    </View>
  );
}

function getNiceTicks(min: number, max: number, count: number): number[] {
  const range = max - min;
  if (range === 0) return [min];
  const rawStep = range / (count - 1);
  // Round step to a "nice" number
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawStep)));
  const residual = rawStep / magnitude;
  let niceStep: number;
  if (residual <= 1.5) niceStep = magnitude;
  else if (residual <= 3) niceStep = 2 * magnitude;
  else if (residual <= 7) niceStep = 5 * magnitude;
  else niceStep = 10 * magnitude;

  const start = Math.floor(min / niceStep) * niceStep;
  const ticks: number[] = [];
  for (let t = start; t <= max + niceStep * 0.01; t += niceStep) {
    ticks.push(t);
  }
  return ticks;
}

function formatTick(value: number): string {
  if (value >= 1000) {
    const k = value / 1000;
    return `$${k % 1 === 0 ? k.toFixed(0) : k.toFixed(1)}k`;
  }
  return `$${value.toFixed(0)}`;
}
