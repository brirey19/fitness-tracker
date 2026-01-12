import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WeightChart({ logs }) {
  // 1. Filter only 'Weight' logs
  // 2. Sort them by date (oldest to newest)
  // 3. Format date to look nice (e.g., "Jan 15")
  const chartData = logs
    .filter(log => log.type === 'Weight')
    .map(log => {
      const dateObj = new Date(log.date);
      return {
        date: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: parseFloat(log.value),
        fullDate: dateObj // Keep full date for sorting
      };
    })
    .sort((a, b) => a.fullDate - b.fullDate); // Sort oldest first

  if (chartData.length < 2) {
    return (
      <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center h-64 text-gray-500">
        <p>Log at least 2 weight entries to see the chart!</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-gray-700 font-bold mb-4">📉 The Race to 250</h2>
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="date" 
              tick={{fontSize: 12}} 
              tickMargin={10}
            />
            <YAxis 
              domain={['dataMin - 5', 'dataMax + 5']} // Auto-scale the Y-axis
              hide={false}
              width={30}
              tick={{fontSize: 12}}
            />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Line 
              type="monotone" 
              dataKey="weight" 
              stroke="#2563eb" 
              strokeWidth={3}
              dot={{ r: 4, fill: "#2563eb", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}