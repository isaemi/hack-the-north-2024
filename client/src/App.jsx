import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [endTime, setEndTime] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [timeElapsed, setTimeElapsed] = useState(0);

  function startTimer() {
    let startTime = null;
    let endTime = null;
    chrome.storage.local.get(['startTime', 'endTime'], function (result) {
      const startTimeResult = result.startTime;
      const endTimeResult = result.endTime;

      console.log('Start Time:', startTime);
      console.log('End Time:', endTime);

      startTime = startTimeResult;
      endTime = endTimeResult;
    });

    if (!startTime || !endTime) {
      startTime = Date.now();
      endTime = startTime + 600000;
      chrome.storage.local.set({ startTime, endTime });
    }

    setEndTime(endTime);
    setStartTime(startTime);
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
      return "N/A";
    }
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = elapsedTime % 60;

    // Format minutes and seconds with leading zeroes if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
  };

  // useEffect(() => {
  //   // Initialize the interval
  //   const intervalId = setInterval(() => {
  //     setStartTime((startTime) => {
  //       if (!startTime || startTime ) {
  //         clearInterval(intervalId);
  //         return 0;
  //       }
  //       return prevSeconds - 1;
  //     });
  //   }, 1000);

  //   return () => clearInterval(intervalId);
  // }, []);

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
