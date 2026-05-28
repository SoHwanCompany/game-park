'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface TimeseriesChartProps {
  data: Array<{ date: string; signups: number; plays: number; likes: number }>;
}

export const TimeseriesChart = ({ data }: TimeseriesChartProps) => (
  <ResponsiveContainer width="100%" height={300}>
    <AreaChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
      <XAxis
        dataKey="date"
        tick={{ fontSize: 11 }}
        tickFormatter={(value: string) => value.slice(5)}
      />
      <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
      <Tooltip contentStyle={{ fontSize: 12 }} labelStyle={{ fontWeight: 600 }} />
      <Legend wrapperStyle={{ fontSize: 12 }} />
      <Area
        type="monotone"
        dataKey="signups"
        name="가입"
        stroke="#3b82f6"
        fill="#3b82f6"
        fillOpacity={0.2}
      />
      <Area
        type="monotone"
        dataKey="plays"
        name="플레이"
        stroke="#10b981"
        fill="#10b981"
        fillOpacity={0.2}
      />
      <Area
        type="monotone"
        dataKey="likes"
        name="좋아요"
        stroke="#f59e0b"
        fill="#f59e0b"
        fillOpacity={0.2}
      />
    </AreaChart>
  </ResponsiveContainer>
);
