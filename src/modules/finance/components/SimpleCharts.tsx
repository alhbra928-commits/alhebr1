import React from 'react';
import { ChartData } from '../services/advancedAnalyticsService';

interface PieChartProps {
  data: ChartData;
  colors?: string[];
}

export function SimplePieChart({ data, colors = ['#10b981', '#3b82f6', '#8b5cf6'] }: PieChartProps) {
  const total = data.values.reduce((sum, val) => sum + val, 0);

  if (total === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        لا توجد بيانات للعرض
      </div>
    );
  }

  const percentages = data.values.map(val => (val / total) * 100);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg viewBox="0 0 100 100" className="transform -rotate-90">
            {data.values.map((value, index) => {
              const startAngle = percentages.slice(0, index).reduce((sum, p) => sum + (p * 3.6), 0);
              const endAngle = startAngle + (percentages[index] * 3.6);

              const startX = 50 + 45 * Math.cos((startAngle * Math.PI) / 180);
              const startY = 50 + 45 * Math.sin((startAngle * Math.PI) / 180);
              const endX = 50 + 45 * Math.cos((endAngle * Math.PI) / 180);
              const endY = 50 + 45 * Math.sin((endAngle * Math.PI) / 180);

              const largeArc = percentages[index] > 50 ? 1 : 0;

              return (
                <path
                  key={index}
                  d={`M 50 50 L ${startX} ${startY} A 45 45 0 ${largeArc} 1 ${endX} ${endY} Z`}
                  fill={colors[index % colors.length]}
                  className="hover:opacity-80 transition-opacity cursor-pointer"
                />
              );
            })}
            <circle cx="50" cy="50" r="25" fill="white" />
          </svg>
        </div>
      </div>

      <div className="space-y-2">
        {data.labels.map((label, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
            <div className="flex items-center gap-3">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: colors[index % colors.length] }}
              />
              <span className="font-medium text-slate-800">{label}</span>
            </div>
            <div className="text-left">
              <p className="font-bold text-slate-900">
                {percentages[index].toFixed(1)}%
              </p>
              <p className="text-sm text-slate-600">
                {data.values[index].toLocaleString()} ريال
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LineChartProps {
  data: ChartData;
  color?: string;
}

export function SimpleLineChart({ data, color = '#3b82f6' }: LineChartProps) {
  if (data.values.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        لا توجد بيانات للعرض
      </div>
    );
  }

  const max = Math.max(...data.values);
  const min = Math.min(...data.values);
  const range = max - min || 1;

  const points = data.values.map((value, index) => {
    const x = (index / (data.values.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 90;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div className="relative h-64 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-6">
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={color} stopOpacity="0.3" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>

          <polygon
            points={`0,100 ${points} 100,100`}
            fill="url(#lineGradient)"
          />

          <polyline
            points={points}
            fill="none"
            stroke={color}
            strokeWidth="0.5"
            className="drop-shadow-lg"
          />

          {data.values.map((value, index) => {
            const x = (index / (data.values.length - 1)) * 100;
            const y = 100 - ((value - min) / range) * 90;
            return (
              <circle
                key={index}
                cx={x}
                cy={y}
                r="1"
                fill={color}
                className="hover:r-2 transition-all cursor-pointer"
              />
            );
          })}
        </svg>

        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm text-slate-600">الحد الأقصى</p>
          <p className="text-lg font-bold text-slate-900">{max.toLocaleString()} ريال</p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-2">
        {data.labels.map((label, index) => (
          <div key={index} className="flex-shrink-0 text-center">
            <p className="text-xs text-slate-600">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

interface BarChartProps {
  data: ChartData;
  color?: string;
}

export function SimpleBarChart({ data, color = '#10b981' }: BarChartProps) {
  if (data.values.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        لا توجد بيانات للعرض
      </div>
    );
  }

  const max = Math.max(...data.values);

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.labels.map((label, index) => {
          const percentage = (data.values[index] / max) * 100;

          return (
            <div key={index} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-800">{label}</span>
                <span className="text-sm font-bold text-slate-900">
                  {(data.values[index] / 1000).toFixed(0)}K ريال
                </span>
              </div>

              <div className="relative h-8 bg-slate-100 rounded-lg overflow-hidden">
                <div
                  className="absolute inset-y-0 right-0 bg-gradient-to-l transition-all duration-1000 ease-out rounded-lg"
                  style={{
                    width: `${percentage}%`,
                    background: `linear-gradient(to left, ${color}, ${color}dd)`
                  }}
                >
                  <div className="absolute inset-0 bg-white/20 animate-shimmer" />
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-700 mix-blend-difference">
                    {percentage.toFixed(0)}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

interface TimelineProps {
  events: Array<{
    date: string;
    title: string;
    description: string;
    status: 'completed' | 'current' | 'upcoming';
  }>;
}

export function SimpleTimeline({ events }: TimelineProps) {
  if (events.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500">
        لا توجد أحداث للعرض
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {events.map((event, index) => {
        const isLast = index === events.length - 1;

        return (
          <div key={index} className="relative">
            {!isLast && (
              <div className="absolute right-4 top-10 bottom-0 w-0.5 bg-slate-200" />
            )}

            <div className="flex items-start gap-4">
              <div
                className={`
                  relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                  ${event.status === 'completed' ? 'bg-green-500' : ''}
                  ${event.status === 'current' ? 'bg-blue-500 animate-pulse' : ''}
                  ${event.status === 'upcoming' ? 'bg-slate-300' : ''}
                `}
              >
                {event.status === 'completed' && (
                  <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                )}
                {event.status === 'current' && (
                  <div className="w-3 h-3 bg-white rounded-full" />
                )}
                {event.status === 'upcoming' && (
                  <div className="w-2 h-2 bg-slate-500 rounded-full" />
                )}
              </div>

              <div className="flex-1 pb-8">
                <div className="bg-white rounded-xl p-4 shadow-md hover:shadow-lg transition-shadow">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-slate-800">{event.title}</h4>
                    <span className="text-xs text-slate-500">{event.date}</span>
                  </div>
                  <p className="text-sm text-slate-600">{event.description}</p>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
