import { useState } from 'react';

export default function LogForm({ API_URL, routines, onSave }) {
  const [logType, setLogType] = useState('workout'); // 'workout' or 'weight'
  
  // Date State (Defaults to today's date formatted as YYYY-MM-DD)
  const [date, setDate] = useState(() => {
  return new Date().toLocaleDateString('en-CA', {
    timeZone: 'America/Chicago'
  });
});

  // Workout State
  const [selectedRoutine, setSelectedRoutine] = useState(null); 
  const [isWorkoutActive, setIsWorkoutActive] = useState(false); 
  
  // Weight State
  const [weight, setWeight] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // --- FORMATTING HELPERS ---

  const formatWeightLabel = (val) => {
    if (!val) return '';
    // Check if it's a number (works for '135' or 135)
    const isNumber = !isNaN(parseFloat(val)) && isFinite(val);
    return isNumber ? `${val} lbs` : val;
  };

  const formatTimeLabel = (val) => {
    if (!val) return '';
    const num = parseFloat(val);
    
    // If it's not a number, just return the text
    if (isNaN(num)) return val;

    // If it's a whole number (Integer)
    if (Number.isInteger(num)) return `${num} min`;

    // If it's a decimal (e.g. 1.5), convert to MM:SS
    const minutes = Math.floor(num);
    const seconds = Math.round((num - minutes) * 60);
    // PadStart ensures we get "1:05" instead of "1:5"
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // --- HANDLERS ---

  const handleStartWorkout = (routineName) => {
    if (!routineName) return;
    const routineObj = routines.find(r => r.name === routineName);
    setSelectedRoutine(routineObj);
    setIsWorkoutActive(true);
  };

  const handleCancelWorkout = () => {
    setIsWorkoutActive(false);
    setSelectedRoutine(null);
  };

  const handleFinishWorkout = () => {
    setIsSubmitting(true);

    const payload = {
      action: "log_workout",
      date: date, // Send the selected date
      routineName: selectedRoutine.name,
      details: JSON.parse(selectedRoutine.exercises), 
      calories: selectedRoutine.estCalories
    };

    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      alert("Great Job! Workout Logged! 🏋️‍♂️🔥");
      setIsSubmitting(false);
      setIsWorkoutActive(false);
      setSelectedRoutine(null);
      if (onSave) onSave();
    })
    .catch(err => {
      console.error(err);
      alert("Error logging workout ❌");
      setIsSubmitting(false);
    });
  };

  const handleLogWeight = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ 
        action: "log_weight", 
        weight: weight,
        date: date // Send the selected date
      })
    })
    .then(res => res.json())
    .then(data => {
      alert("Weight Logged! ⚖️");
      setWeight('');
      setIsSubmitting(false);
      if (onSave) onSave();
    })
    .catch(err => {
      console.error(err);
      alert("Error logging weight ❌");
      setIsSubmitting(false);
    });
  };

  // Helper to parse exercises safely
  const getExercises = (routine) => {
    try {
      return JSON.parse(routine.exercises);
    } catch (e) {
      return [];
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-20">
      
      {/* 1. DATE PICKER (Always Visible) */}
      <div className="mb-6">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Date</label>
        <input 
          type="date" 
          className="block w-full p-2 border border-gray-300 rounded-md"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
      </div>

      {/* 2. TOP TABS (Only show if not in active workout mode) */}
      {!isWorkoutActive && (
        <div className="flex rounded-md shadow-sm mb-6" role="group">
          <button
            type="button"
            onClick={() => setLogType('workout')}
            className={`px-4 py-2 text-sm font-medium border flex-1 rounded-l-lg 
              ${logType === 'workout' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            🏋️‍♂️ Start Workout
          </button>
          <button
            type="button"
            onClick={() => setLogType('weight')}
            className={`px-4 py-2 text-sm font-medium border flex-1 rounded-r-lg
              ${logType === 'weight' 
                ? 'bg-blue-600 text-white border-blue-600' 
                : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'}`}
          >
            ⚖️ Log Weight
          </button>
        </div>
      )}

      {/* 3. LOG WEIGHT VIEW */}
      {logType === 'weight' && !isWorkoutActive && (
        <form onSubmit={handleLogWeight} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Current Weight (lbs)</label>
            <input 
              type="number" 
              className="block w-full p-2 border border-gray-300 rounded-md"
              placeholder="e.g. 185.5"
              step="0.1"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              required
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            className={`w-full py-3 px-4 rounded-md shadow-sm text-sm font-bold text-white mt-4
              ${isSubmitting ? 'bg-gray-400' : 'bg-green-600 hover:bg-green-700'}`}
          >
            {isSubmitting ? 'Saving...' : 'Save Weight'}
          </button>
        </form>
      )}

      {/* 4. WORKOUT SELECTION VIEW */}
      {logType === 'workout' && !isWorkoutActive && (
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Routine to Start</label>
          {routines.length > 0 ? (
            <select 
              className="block w-full p-3 border border-gray-300 rounded-md bg-white text-lg"
              onChange={(e) => handleStartWorkout(e.target.value)}
              defaultValue=""
            >
              <option value="" disabled>-- Choose Routine --</option>
              {routines.map((r, idx) => (
                <option key={idx} value={r.name}>
                  {r.name} ({r.estCalories || 0} cal)
                </option>
              ))}
            </select>
          ) : (
            <div className="text-center p-4 bg-yellow-50 text-yellow-800 rounded">
              <p>No routines found yet.</p>
              <p className="text-sm mt-1">Go to the "Routines" tab to create your first workout plan!</p>
            </div>
          )}
        </div>
      )}

      {/* 5. ACTIVE WORKOUT VIEW */}
      {isWorkoutActive && selectedRoutine && (
        <div>
          {/* Header */}
          <div className="border-b pb-4 mb-4 flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">{selectedRoutine.name}</h2>
              <p className="text-sm text-gray-500">Let's crush this! 🔥</p>
            </div>
            <button 
              onClick={handleCancelWorkout}
              className="text-xs text-red-500 underline mt-1"
            >
              Cancel
            </button>
          </div>

          {/* Exercise List */}
          <div className="space-y-4 mb-8">
            {getExercises(selectedRoutine).map((ex, idx) => (
              <div key={idx} className="bg-blue-50 border border-blue-100 p-4 rounded-lg">
                <h3 className="font-bold text-lg text-blue-900 mb-2">{idx + 1}. {ex.name}</h3>
                
                <div className="grid grid-cols-2 gap-y-2 text-sm text-gray-700">
                  {ex.weight && (
                    <div className="flex items-center">
                      <span className="font-bold w-16">Weight:</span> 
                      <span className="bg-white px-2 py-1 rounded border">
                        {formatWeightLabel(ex.weight)}
                      </span>
                    </div>
                  )}
                  {ex.sets && (
                    <div className="flex items-center">
                      <span className="font-bold w-16">Sets:</span>
                      <span className="bg-white px-2 py-1 rounded border">{ex.sets}</span>
                    </div>
                  )}
                  {ex.reps && (
                    <div className="flex items-center">
                      <span className="font-bold w-16">Reps:</span>
                      <span className="bg-white px-2 py-1 rounded border">{ex.reps}</span>
                    </div>
                  )}
                  {ex.time && (
                    <div className="flex items-center">
                      <span className="font-bold w-16">Time:</span>
                      <span className="bg-white px-2 py-1 rounded border">
                        {formatTimeLabel(ex.time)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Complete Button */}
          <button 
            onClick={handleFinishWorkout}
            disabled={isSubmitting}
            className={`w-full py-4 text-lg font-bold text-white rounded-lg shadow-lg
              ${isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-green-600 hover:bg-green-700 animate-pulse'}`}
          >
            {isSubmitting ? 'Saving...' : '✅ Finish Workout'}
          </button>
        </div>
      )}

    </div>
  );
}