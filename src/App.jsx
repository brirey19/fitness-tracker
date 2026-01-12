import { useState, useEffect } from 'react';
import RoutineForm from './components/RoutineForm';
import LogForm from './components/LogForm';
import WeightChart from './components/WeightChart';
import WorkoutBarChart from './components/WorkoutBarChart';

// YOUR GOOGLE WEB APP URL
const API_URL = "https://script.google.com/macros/s/AKfycbwdr8iWC4Kh_7qJAhAD1THSlLv4KCzPDxjiiJ6g9EGLPOkvbr2O_frsMTH6a95_zO4Wuw/exec"; 

function App() {
  const [activeTab, setActiveTab] = useState('dashboard'); 
  const [routines, setRoutines] = useState([]); // Store fetched routines
  const [logs, setLogs] = useState([]); // Store fetched logs
  const [loading, setLoading] = useState(true);

  // Function to fetch data from Google Sheets
  const fetchData = () => {
    setLoading(true);
    fetch(API_URL)
      .then(response => response.json())
      .then(data => {
        setRoutines(data.routines || []);
        setLogs(data.logs || []);
        setLoading(false);
      })
      .catch(error => {
        console.error("Error fetching data:", error);
        setLoading(false);
      });
  };

  // Fetch on initial load
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 pb-20"> 
      
      {/* HEADER */}
      <div className="bg-white shadow p-4 mb-4 flex justify-between items-center sticky top-0 z-10">
        <h1 className="text-xl font-bold text-gray-800">My Fitness Tracker 🏋️‍♂️</h1>
        <button 
          onClick={fetchData} 
          className="text-xs bg-gray-200 hover:bg-gray-300 px-2 py-1 rounded"
        >
          🔄 Refresh
        </button>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-md mx-auto px-4">
        
        {loading && (
          <div className="text-center py-4">
            <span className="inline-block animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></span>
            <p className="text-sm text-gray-500 mt-2">Syncing with Google Sheets...</p>
          </div>
        )}

        {/* DASHBOARD TAB */}
        {!loading && activeTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* 1. KEY METRICS ROW */}
            <div className="grid grid-cols-2 gap-4">
              {/* Workouts Card */}
              <div className="bg-white p-4 rounded-lg shadow border-t-4 border-blue-500">
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wide">Workouts</h2>
                
                {/* This Week (Calendar Week Logic) */}
                <div className="mt-2">
                  <span className="text-3xl font-extrabold text-gray-800">
                    {logs.filter(l => {
                      if (l.type !== 'Workout') return false;
                      
                      const logDate = new Date(l.date);
                      const today = new Date();
                      
                      // Calculate the Sunday of the current week
                      const currentSunday = new Date(today);
                      const dayOfWeek = today.getDay(); // 0 is Sunday
                      currentSunday.setDate(today.getDate() - dayOfWeek);
                      currentSunday.setHours(0,0,0,0); // Start of Sunday

                      // Include logs that are AFTER or ON that Sunday
                      return logDate >= currentSunday;
                    }).length}
                  </span>
                  <span className="text-xs text-gray-500 ml-1">this week</span>
                </div>

                {/* Average Calculation (Calendar Week Logic) */}
                <div className="mt-1 pt-2 border-t border-gray-100">
                  <span className="text-lg font-bold text-gray-600">
                    {(() => {
                      const workouts = logs.filter(l => l.type === 'Workout');
                      if (workouts.length === 0) return 0;
                      
                      // 1. Find First Sunday
                      const sorted = workouts.map(l => new Date(l.date)).sort((a,b) => a - b);
                      const firstDate = new Date(sorted[0]);
                      const firstSunday = new Date(firstDate);
                      firstSunday.setDate(firstDate.getDate() - firstDate.getDay());

                      // 2. Count weeks from First Sunday to Today
                      const today = new Date();
                      const diffTime = Math.abs(today - firstSunday);
                      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7)); 
                      const totalWeeks = diffWeeks < 1 ? 1 : diffWeeks;

                      return (workouts.length / totalWeeks).toFixed(1);
                    })()}
                  </span>
                  <span className="text-xs text-gray-400 ml-1">avg / week</span>
                </div>
              </div>
              
              {/* Weight Card */}
              <div className="bg-white p-4 rounded-lg shadow border-t-4 border-green-500">
                <h2 className="text-gray-400 text-xs font-bold uppercase tracking-wide">Current Weight</h2>
                <p className="text-3xl font-extrabold text-gray-800 mt-1">
                  {logs
                    .filter(l => l.type === 'Weight')
                    .sort((a, b) => new Date(b.date) - new Date(a.date)) // Sort Descending
                    [0]?.value || "--"
                  }
                </p>
                <p className="text-xs text-gray-400 mt-1">lbs</p>
              </div>
            </div>

            {/* 2. THE GRAPHS */}
            <WeightChart logs={logs} />
            
            {/* NEW COLUMN GRAPH */}
            <WorkoutBarChart logs={logs} />

            {/* 3. RECENT WORKOUTS LIST */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-700 text-sm">Recent Workouts</h3>
                <span className="text-xs text-gray-400">Last 5</span>
              </div>
              <ul className="divide-y divide-gray-100">
                {logs
                  .filter(l => l.type === 'Workout') 
                  .sort((a, b) => new Date(b.date) - new Date(a.date)) 
                  .slice(0, 5) 
                  .map((log, i) => ( 
                  <li key={i} className="px-4 py-3 flex justify-between items-center text-sm">
                    <div>
                      <div className="font-bold text-blue-900">{log.value}</div>
                      <div className="text-xs text-gray-500">
                        {log.calories ? `~${log.calories} cals` : 'No calorie data'}
                      </div>
                    </div>
                    <span className="text-gray-400 text-xs bg-gray-100 px-2 py-1 rounded">
                      {new Date(log.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </li>
                ))}
                
                {logs.filter(l => l.type === 'Workout').length === 0 && (
                  <li className="px-4 py-3 text-sm text-gray-400 text-center">No workouts logged yet.</li>
                )}
              </ul>
            </div>

          </div>
        )}

        {/* LOG TAB */}
        {!loading && activeTab === 'log' && (
           <LogForm 
             API_URL={API_URL} 
             routines={routines} 
             onSave={fetchData} 
           />
        )}

        {/* ROUTINE TAB */}
        {!loading && activeTab === 'routines' && (
          <RoutineForm 
            API_URL={API_URL} 
            onSave={fetchData} 
          />
        )}

      </div>

      {/* BOTTOM NAV */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around p-3 z-10">
        <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center ${activeTab === 'dashboard' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-2xl">📊</span>
          <span className="text-xs">Stats</span>
        </button>
        <button onClick={() => setActiveTab('log')} className={`flex flex-col items-center ${activeTab === 'log' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-2xl">📝</span>
          <span className="text-xs">Log</span>
        </button>
        <button onClick={() => setActiveTab('routines')} className={`flex flex-col items-center ${activeTab === 'routines' ? 'text-blue-600' : 'text-gray-400'}`}>
          <span className="text-2xl">💪</span>
          <span className="text-xs">Routines</span>
        </button>
      </div>
    </div>
  )
}

export default App