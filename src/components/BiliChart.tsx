import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceDot,
  Label
} from 'recharts';
import { bhutaniData } from '../utils/biliLogic';

interface BiliChartProps {
  ageHours: number;
  tsb: number;
}

export function BiliChart({ ageHours, tsb }: BiliChartProps) {
  // Filter data to show relevant range
  const chartData = bhutaniData;

  return (
    <div className="w-full h-full bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h3 className="text-lg font-bold text-gray-800 mb-4">Bhutani Nomogram</h3>
      <ResponsiveContainer width="100%" height="90%">
        <LineChart
          data={chartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis 
            dataKey="age" 
            type="number" 
            domain={[0, 144]} 
            tickCount={13}
            label={{ value: 'Age (hours)', position: 'insideBottomRight', offset: -10 }} 
          />
          <YAxis 
            domain={[0, 25]} 
            label={{ value: 'TSB (mg/dL)', angle: -90, position: 'insideLeft' }} 
          />
          <Tooltip />
          <Legend verticalAlign="top" height={36}/>
          
          {/* Percentile Lines */}
          <Line 
            type="monotone" 
            dataKey="p95" 
            stroke="#ef4444" 
            strokeWidth={2} 
            name="95th %ile (High Risk)" 
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="p75" 
            stroke="#f97316" 
            strokeWidth={2} 
            name="75th %ile (High Int)" 
            dot={false}
          />
          <Line 
            type="monotone" 
            dataKey="p40" 
            stroke="#eab308" 
            strokeWidth={2} 
            name="40th %ile (Low Int)" 
            dot={false}
          />

          {/* Patient Data Point */}
          {ageHours > 0 && (
            <ReferenceDot 
              x={ageHours} 
              y={tsb} 
              r={6} 
              fill="#3b82f6" 
              stroke="#fff" 
              strokeWidth={2}
            >
              <Label value="Patient" position="top" />
            </ReferenceDot>
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
