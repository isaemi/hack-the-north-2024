import { useState, useEffect } from 'react'
import logo from './logo.svg'
import './App.css'

function App() {
  const [seconds, setSeconds] = useState(600);

  const formatTime = (secondsTime) => {
    const minutes = Math.floor(secondsTime / 60);
    const seconds = secondsTime % 60;
  
    // Format minutes and seconds with leading zeroes if needed
    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(seconds).padStart(2, '0');
  
    return `${formattedMinutes}:${formattedSeconds}`;
  };

  useEffect(() => {
    // Initialize the interval
    const intervalId = setInterval(() => {
      setSeconds((prevSeconds) => {
        if (prevSeconds <= 0) {
          clearInterval(intervalId);
          return 0;
        }
        return prevSeconds - 1;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <p>Pomodoro Time</p>
        <h1>{formatTime(seconds)}</h1>
      </header>
    </div>
  )
}

export default App
