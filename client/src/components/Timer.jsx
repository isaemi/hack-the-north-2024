import { useState, useEffect, useRef } from 'react'

// state
// timeRemaining - in s
// endTime - in ms
// isRunning - true if not paused
// hasStarted - true 
// isBreak
function Timer() {
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const intervalRef = useRef(null); // Holds the interval ID
  const defaultWorkTime = 25 * 60; // 25 mins
  const defaultBreakTime = 5 * 60 // 5 mins

  const startTimer = (overridenEndTime) => {
    setHasStarted(true);
    setIsRunning(true);
    setIsBreak(prev => !prev);
    const t = loadTimerSettings();
    const finalEndTime = overridenEndTime || t.endTime || (Date.now() + isBreak ? defaultWorkTime : defaultBreakTime);
    setEndTime(finalEndTime);
  }

  const pauseTimer = () => {
    clearInterval(intervalRef.current);
    setTimeRemaining(timeRemaining);
    setIsRunning(false);
    syncAllStatesToTimerSettings();
  };

  const resumeTimer = () => {
    setIsRunning(true);
    let overridenEndTime = Date.now() + loadTimerSettings().timeRemaining;
    startTimer(overridenEndTime);
    syncAllStatesToTimerSettings();
  };

  const resetTimer = () => {
    clearInterval(intervalRef.current);
    setIsRunning(false);
    setHasStarted(false);
    setTimeRemaining(isBreak ? defaultBreakTime : defaultWorkTime); // back to prev
    syncAllStatesToTimerSettings();
  };

  const formatTime = (elapsedTime) => {
    if (elapsedTime === null) {
      return "...";
    }
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    // Format minutes and seconds with leading zeroes if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  const setTimeElapsedForUI = () => {
    if (!isRunning) {
      return;
    }

    setTimeRemaining(prev => {
      if (prev <= 0) {
        clearInterval(intervalRef.current); // Stop the interval if the time has passed
        setIsRunning(false);
        syncAllStatesToTimerSettings();
        return isBreak ? defaultWorkTime : defaultBreakTime;
      } else {
        return prev - 1;
      }
    })

  }

  useEffect(() => {
    setTimeElapsedForUI();
    if (endTime && isRunning) {
      intervalRef.current = setInterval(setTimeElapsedForUI, 1000);
    }

    return () => clearInterval(intervalRef.current);
  }, [endTime]);

  const saveToTimerSettings = (value) => {
    try {
      const existingTimerSettings = localStorage.getItem("TIMER_SETTINGS");
      const newTimerSettings = {
        ...existingTimerSettings,
        value
      }
      localStorage.setItem("TIMER_SETTINGS", JSON.stringify(newTimerSettings));
    } catch (error) {
      console.error("Failed to save to localStorage", error);
    }
  };

  const syncAllStatesToTimerSettings = () => {
    const timerSettings = {
      timeRemaining,
      endTime,
      isRunning,
      hasStarted,
      isBreak
    }
    localStorage.setItem("TIMER_SETTINGS", JSON.stringify(timerSettings));
  }

  const loadTimerSettings = () => {
    try {
      const savedValue = localStorage.getItem("TIMER_SETTINGS");
      return savedValue ? JSON.parse(savedValue) : {};
    } catch (error) {
      console.error("Failed to load from localStorage", error);
      return defaultValue;
    }
  };

  useEffect(() => {
    const t = loadTimerSettings();
    if (t.timeRemaining) {
      setTimeRemaining(t.timeRemaining);
    }
    if (t.hasStarted) {
      setHasStarted(t.hasStarted);
    }
    if (t.isRunning) {
      setIsRunning(t.isRunning);
    }
    if (t.isBreak) {
      setIsBreak(t.isBreak);
    }
    if (t.endTime) {
      setEndTime(t.endTime);
    }
    startTimer();
  }, []);

  return (
    <div className="container">
      <h2 className="subtitle">Pomodoro Timer</h2>
      <div className="timer-display">
        <div className="flex flex-row items-center content-center gap-px">
          <h1 style={{ fontSize: '4rem' }}>{formatTime(timeRemaining)}</h1>
          <div className="buttons flex flex-col">
            {!hasStarted && <button onClick={startTimer}>START</button>}
            {hasStarted && isRunning && <button onClick={pauseTimer}>PAUSE</button>}
            {hasStarted && !isRunning && <button onClick={resumeTimer}>RESUME</button>}
            {hasStarted && <button onClick={resetTimer}>RESET</button>}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Timer;
