import { useState, useEffect, useRef } from 'react';

function PomodoroTimer() {
  const [workMinutes, setWorkMinutes] = useState(25); // Default to 25 minutes
  const [workSeconds, setWorkSeconds] = useState(0); // Default to 0 seconds
  const [breakMinutes, setBreakMinutes] = useState(5); // Default to 5 minutes
  const [breakSeconds, setBreakSeconds] = useState(0); // Default to 0 seconds
  const [cycles, setCycles] = useState(4); // Default to 4 cycles
  const [currentCycle, setCurrentCycle] = useState(1);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isBreak, setIsBreak] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [mode, setMode] = useState(''); // Mode input
  const intervalRef = useRef(null);

  // Convert minutes and seconds to total seconds
  const getTotalSeconds = (minutes, seconds) => minutes * 60 + seconds;

  // Format time for display
  const formatTime = (elapsedTime) => {
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;
    return `${String(minutes)}:${String(seconds).padStart(2, '0')}`;
  };

  // Save to localStorage with error handling
  const saveToLocalStorage = (key, value) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };

  // Load from localStorage with error handling
  const loadFromLocalStorage = (key, defaultValue) => {
    try {
      const savedValue = localStorage.getItem(key);
      return savedValue ? JSON.parse(savedValue) : defaultValue;
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      return defaultValue;
    }
  };

  // Start the timer
  const startTimer = () => {
    if (!mode) {
      alert('Please enter a mode for the session');
      return;
    }

    setIsRunning(true);
    setIsPaused(false);
    saveToLocalStorage('mode', mode);

    intervalRef.current = setInterval(() => {
      setTimeElapsed((prev) => {
        if (prev <= 0) {
          clearInterval(intervalRef.current);
          if (currentCycle < cycles) {
            setIsBreak(!isBreak);
            setCurrentCycle((prevCycle) => prevCycle + (isBreak ? 0 : 1));
            return isBreak
              ? getTotalSeconds(workMinutes, workSeconds)
              : getTotalSeconds(breakMinutes, breakSeconds);
          } else {
            stopTimer(); // Stop after all cycles are completed
          }
        }
        return prev - 1;
      });
    }, 1000);
  };

  // Pause the timer
  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setIsPaused(true);
    setIsRunning(false);
    saveToLocalStorage('timeElapsed', timeElapsed);
  };

  // Resume the timer
  const resumeTimer = () => {
    setIsPaused(false);
    setIsRunning(true);
    startTimer();
  };

  // Reset the timer
  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setIsPaused(false);
    setTimeElapsed(getTotalSeconds(workMinutes, workSeconds));
    setCurrentCycle(1);
    setIsBreak(false);
    localStorage.clear(); // Clear all stored data on reset
  };

  // Handle input changes for minutes and seconds
  const handleMinutesChange = (e, setMinutes) => {
    const value = e.target.value;
    if (value < 0) {
      setMinutes(0); // Prevent negative values
    } else {
      setMinutes(value);
    }
  };

  const handleSecondsChange = (e, setSeconds) => {
    const value = e.target.value;
    if (value < 0) {
      setSeconds(0); // Prevent negative values
    } else if (value >= 60) {
      setSeconds(59); // Cap seconds at 59
    } else {
      setSeconds(value);
    }
  };

  useEffect(() => {
    setTimeElapsed(getTotalSeconds(workMinutes, workSeconds));
  }, [workMinutes, workSeconds]);

  useEffect(() => {
    saveToLocalStorage('timeElapsed', timeElapsed);
  }, [timeElapsed]);

  return (
    <div className="pomodoro-container">
      <h2>Pomodoro Timer</h2>

      <div className="timer-display">
        <h1>{formatTime(timeElapsed)}</h1>
      </div>

      <div className="settings">
        <div className="setting-item">
          <label>What will you be doing?</label>
          <input
            type="text"
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            placeholder="Enter your session activity"
            disabled={isRunning || isPaused}
          />
        </div>

        <div className="setting-item">
          <label>Work Duration (Minutes:Seconds):</label>
          <div>
            <input
              type="number"
              value={workMinutes}
              onChange={(e) => handleMinutesChange(e, setWorkMinutes)}
              disabled={isRunning || isPaused}
              min="0"
            />
            <span>:</span>
            <input
              type="number"
              value={workSeconds}
              onChange={(e) => handleSecondsChange(e, setWorkSeconds)}
              disabled={isRunning || isPaused}
              min="0"
              max="59"
            />
          </div>
        </div>

        <div className="setting-item">
          <label>Break Duration (Minutes:Seconds):</label>
          <div>
            <input
              type="number"
              value={breakMinutes}
              onChange={(e) => handleMinutesChange(e, setBreakMinutes)}
              disabled={isRunning || isPaused}
              min="0"
            />
            <span>:</span>
            <input
              type="number"
              value={breakSeconds}
              onChange={(e) => handleSecondsChange(e, setBreakSeconds)}
              disabled={isRunning || isPaused}
              min="0"
              max="59"
            />
          </div>
        </div>

        <div className="setting-item">
          <label>Cycles:</label>
          <input
            type="number"
            value={cycles}
            onChange={(e) => setCycles(e.target.value)}
            disabled={isRunning || isPaused}
            min="1"
          />
        </div>
      </div>

      <div className="buttons">
        {!isRunning && !isPaused && (
          <button onClick={startTimer}>Start</button>
        )}
        {isRunning && (
          <button onClick={pauseTimer}>Pause</button>
        )}
        {isPaused && (
          <button onClick={resumeTimer}>Resume</button>
        )}
        <button onClick={resetTimer}>Reset</button>
      </div>
    </div>
  );
}

export default PomodoroTimer;
