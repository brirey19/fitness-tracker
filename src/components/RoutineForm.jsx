import { useState } from 'react';

export default function RoutineForm({ API_URL, onSave }) {
  const [routineName, setRoutineName] = useState('');
  const [estCalories, setEstCalories] = useState('');
  
  // Updated state structure to include new fields
  const [exercises, setExercises] = useState([
    { name: '', weight: '', sets: '', reps: '', time: '' }
  ]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Helper to update a specific exercise in the list
  const handleExerciseChange = (index, field, value) => {
    const newExercises = [...exercises];
    newExercises[index][field] = value;
    setExercises(newExercises);
  };

  // Add a new empty row
  const addExercise = () => {
    setExercises([
      ...exercises, 
      { name: '', weight: '', sets: '', reps: '', time: '' }
    ]);
  };

  // Remove a row
  const removeExercise = (index) => {
    const newExercises = exercises.filter((_, i) => i !== index);
    setExercises(newExercises);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    const payload = {
      action: "create_routine",
      routineName: routineName,
      exercises: exercises, // This now contains the richer data object
      estCalories: estCalories
    };

    fetch(API_URL, {
      method: "POST",
      body: JSON.stringify(payload)
    })
    .then(res => res.json())
    .then(data => {
      alert("Routine Saved! ✅");
      // Reset form
      setRoutineName('');
      setEstCalories('');
      setExercises([{ name: '', weight: '', sets: '', reps: '', time: '' }]);
      setIsSubmitting(false);
      if (onSave) onSave();
    })
    .catch(err => {
      console.error(err);
      alert("Error saving routine ❌");
      setIsSubmitting(false);
    });
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-20">
      <h2 className="text-xl font-bold mb-4 text-blue-600">💪 Create New Routine</h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Routine Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Routine Name</label>
          <input 
            type="text" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., Upper Body Power"
            value={routineName}
            onChange={(e) => setRoutineName(e.target.value)}
            required
          />
        </div>

        {/* Dynamic Exercise List */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-gray-700">Exercises</label>
          
          {exercises.map((ex, index) => (
            <div key={index} className="bg-gray-50 p-3 rounded border border-gray-200 relative">
              
              {/* Row 1: Exercise Name & Delete */}
              <div className="flex justify-between items-center mb-2">
                <input 
                  placeholder="Exercise Name (e.g. Bench Press)" 
                  className="w-full p-2 border border-gray-300 rounded-md text-sm mr-2 font-medium"
                  value={ex.name}
                  onChange={(e) => handleExerciseChange(index, 'name', e.target.value)}
                  required
                />
                <button 
                  type="button"
                  onClick={() => removeExercise(index)}
                  className="text-red-500 hover:text-red-700 font-bold px-2"
                  title="Remove Exercise"
                >
                  ✕
                </button>
              </div>

              {/* Row 2: Detailed Metrics Grid */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Weight</label>
                  <input 
                    placeholder="lbs" 
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    value={ex.weight}
                    onChange={(e) => handleExerciseChange(index, 'weight', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Sets</label>
                  <input 
                    placeholder="#" 
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    value={ex.sets}
                    onChange={(e) => handleExerciseChange(index, 'sets', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Reps</label>
                  <input 
                    placeholder="#" 
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    value={ex.reps}
                    onChange={(e) => handleExerciseChange(index, 'reps', e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 uppercase font-bold">Time</label>
                  <input 
                    placeholder="min" 
                    className="w-full p-1 border border-gray-300 rounded text-sm"
                    value={ex.time}
                    onChange={(e) => handleExerciseChange(index, 'time', e.target.value)}
                  />
                </div>
              </div>
            </div>
          ))}
          
          <button 
            type="button" 
            onClick={addExercise}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center"
          >
            <span className="text-xl mr-1">+</span> Add Another Exercise
          </button>
        </div>

        {/* Calories */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Est. Calories Burned</label>
          <input 
            type="number" 
            className="mt-1 block w-full p-2 border border-gray-300 rounded-md"
            placeholder="e.g., 300"
            value={estCalories}
            onChange={(e) => setEstCalories(e.target.value)}
          />
        </div>

        {/* Submit */}
        <button 
          type="submit" 
          disabled={isSubmitting}
          className={`w-full py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-bold text-white 
            ${isSubmitting ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {isSubmitting ? 'Saving...' : 'Save Routine'}
        </button>

      </form>
    </div>
  );
}