"use client";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

export default function StockChart({ data }) {
  // Keep max 40 visible points → scrolling effect
  const maxPoints = 40;
  const visibleData = data.slice(-maxPoints).map((h, index) => ({
    id: index,
    price: h.price,
    // Use HH:MM:SS for clarity
    timeLabel: new Date(h.timestamp).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }),
  }));

  return (
    <div className="w-full h-80 bg-white dark:bg-gray-900 p-4 rounded-xl shadow">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={visibleData}
          margin={{ top: 20, right: 30, left: 0, bottom: 0 }}
        >
          {/* Grid */}
          <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.15} />

          {/* X axis (time) */}
          <XAxis
            dataKey="timeLabel"
            interval="preserveEnd"
            minTickGap={30}
          />

          {/* Y axis (price) */}
          <YAxis
            domain={["auto", "auto"]}
            tickFormatter={(v) => `$${v}`}
          />

          {/* Tooltip */}
          <Tooltip
            formatter={(value) => [`$${value.toFixed(2)}`, "Price"]}
            labelFormatter={(label) => `Time: ${label}`}
            contentStyle={{
              backgroundColor: "#111827",
              borderRadius: "8px",
              border: "none",
              color: "white",
            }}
          />

          <Line
  type="monotone"
  dataKey="price"
  stroke="#10b981"
  strokeWidth={2}
  isAnimationActive={false}
  dot={(props) => {
    const { cx, cy, index } = props;
    const curr = visibleData[index];
    const prev = visibleData[index - 1];
    const isUp = prev ? curr.price >= prev.price : true;

    return (
      <rect
        key={curr?.id || index}   // 👈 FIX: give unique key
        x={cx - 2}
        y={cy - 6}
        width={4}
        height={12}
        fill={isUp ? "#10b981" : "#ef4444"}
        stroke="white"
        strokeWidth={0.5}
        rx={1}
      />
    );
  }}
/>

        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
