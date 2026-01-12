import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function WorkoutBarChart({ logs }) {
  
  // 1. Group Workouts by "Week Start Date" (Sunday)
  const weeklyCounts = {};

  logs.forEach(log => {
    if (log.type !== 'Workout') return;

    // Get the date of the workout
    const logDate = new Date(log.date);
    
    // Find the Sunday of that week
    const dayOfWeek = logDate.getDay(); // 0 = Sunday
    const sunday = new Date(logDate);
    sunday.setDate(logDate.getDate() - dayOfWeek);
    sunday.setHours(0, 0, 0, 0); // Reset time to ensure grouping works

    // Create a key string (e.g. "2025-01-12")
    const key = sunday.toISOString().split('T')[0];

    // Increment count
    if (weeklyCounts[key]) {
      weeklyCounts[key]++;
    } else {
      weeklyCounts[key] = 1;
    }
  });

  // 2. Convert to Array for Recharts
  const data = Object.keys(weeklyCounts).map(dateKey => {
    // Format label like "Jan 12"
    const dateObj = new Date(dateKey + 'T00:00:00'); // Force local time parsing
    return {
      name: dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: weeklyCounts[dateKey],
      fullDate: dateKey // For sorting
    };
  });

  // 3. Sort by Date (Oldest to Newest)
  data.sort((a, b) => new Date(a.fullDate) - new Date(b.fullDate));

  // 4. Ensure we have at least one empty bar if no data exists
  if (data.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg shadow text-center text-gray-400">
        Log a workout to see your weekly breakdown!
      </div>
    );
  }

  return (
    <div className="bg-white p-4 rounded-lg shadow">
      <h2 className="text-gray-700 font-bold mb-4">📊 Weekly Consistency</h2>
      <div className="h-48 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="name" 
              tick={{fontSize: 12}} 
            />
            <YAxis 
              allowDecimals={false} // Don't show "1.5 workouts"
              width={30}
              tick={{fontSize: 12}}
            />
            <Tooltip 
              cursor={{fill: '#f3f4f6'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
            />
            <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}