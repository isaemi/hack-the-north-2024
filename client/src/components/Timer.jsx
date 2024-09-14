import { useState, useEffect, useRef } from 'react';

function Timer() {
    const [endTime, setEndTime] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(null);
    const intervalRef = useRef(null); // Holds the interval ID

    const startTimer = () => {
        let startTime = null;
        let endTime = null;
        try {
            startTime = window.localStorage.getItem('startTime');
            endTime = window.localStorage.getItem('endTime');

            if (!startTime || !endTime || Date.now() > endTime) {
                startTime = Date.now();
                endTime = startTime + 600000;
                window.localStorage.setItem('startTime', startTime);
                window.localStorage.setItem('endTime', endTime);
            }

            setEndTime(endTime);
            setStartTime(startTime);
        } catch (error) {
            console.error('Error fetching or saving time from storage:', error);
        }
    }

    const stopTimer = () => {
        window.localStorage.removeItem('startTime');
        window.localStorage.removeItem('endTime');
        setTimeElapsed(0);
        clearInterval(intervalRef.current);
    }

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

    useEffect(() => {
        let interval = null;

        if (startTime) {
            intervalRef.current = setInterval(() => {
                const remainingTime = Math.floor((endTime - Date.now()) / 1000);

                if (remainingTime <= 0) {
                    clearInterval(intervalRef.current); // Stop the interval if the time has passed
                    setTimeElapsed(0); // Optionally set timeElapsed to 0 if the time is up
                } else {
                    setTimeElapsed(remainingTime);
                }
            }, 1000);
        }

        return () => clearInterval(interval);
    }, [startTime]);

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
