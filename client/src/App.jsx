import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [endTime, setEndTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  const startTimer = async () => {
    let startTime = null;
    let endTime = null;
    try {
      const result = await chrome.storage.local.get(['startTime', 'endTime']);

      startTime = result.startTime;
      endTime = result.endTime;

      if (!startTime || !endTime) {
        startTime = Date.now();
        endTime = startTime + 600000;
        await chrome.storage.local.set({ startTime, endTime });
      }

      console.log('Start Time and End Time saved!');

      // Update the states
      setEndTime(endTime);
      setStartTime(startTime);
    } catch (error) {
      console.error('Error fetching or saving time from storage:', error);
    }
  }

  function stopTimer() {
    chrome.storage.local.get(['endTime'], function (result) {
      if (result.endTime) {
        console.log("Timer Removed!")
        chrome.storage.local.remove(['endTime']);
      }
    });
    chrome.storage.local.get(['startTime'], function (result) {
      if (result.startTime) {
        console.log("Timer 2 Removed!")
        chrome.storage.local.remove(['startTime']);
      }
    });
  }

  const formatTime = (elapsedTime) => {
    if (!elapsedTime) {
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
      interval = setInterval(() => {
        setTimeElapsed(Math.floor((endTime - Date.now()) / 1000)); // Updates every second
      }, 1000);
    }

    return () => clearInterval(interval);
  }, [startTime]);

  useEffect(() => {
    startTimer();
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Pomodoro2 Time</p>
        <h1>{formatTime(timeElapsed)}</h1>
      </header>
    </div>
  )
}

export default App
