
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function DailyVolumeChart({ data }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="w-full max-w-5xl mx-auto mt-8">
      <h2 className="text-lg text-center text-white mb-4">📈 VIRTUAL Token Volume</h2>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
          <XAxis dataKey="date" stroke="#ccc" />
          <YAxis stroke="#ccc" />
          <Tooltip
            contentStyle={{ backgroundColor: "#1a1a1a", border: "1px solid #444", borderRadius: "8px" }}
            labelStyle={{ color: "#fff" }}
            itemStyle={{ color: "#bbb" }}
          />
          <Line type="monotone" dataKey="volume" stroke="#4f46e5" strokeWidth={2} dot={{ r: 4 }} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
