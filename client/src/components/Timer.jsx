import { useState, useEffect, useRef} from 'react'

function Timer() {
    const [endTime, setEndTime] = useState(null);
    const [startTime, setStartTime] = useState(null);
    const [timeElapsed, setTimeElapsed] = useState(null);
    const intervalRef = useRef(null); // Holds the interval ID

    const startTimer = async () => {
        let startTime = null;
        let endTime = null;
        try {
            const result = await chrome.storage.local.get(['startTime', 'endTime']);

            startTime = result.startTime;
            endTime = result.endTime;

            if (!startTime || !endTime || Date.now() > endTime) {
                startTime = Date.now();
                endTime = startTime + 600000;
                await chrome.storage.local.set({ startTime, endTime });
            }

            setEndTime(endTime);
            setStartTime(startTime);
        } catch (error) {
            console.error('Error fetching or saving time from storage:', error);
        }
    }

    const stopTimer = async () => {
        await chrome.storage.local.remove(['startTime', 'endTime'], function (result) {
            console.log("Timer stopped!")
        });
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
        startTimer();
    }, []);

    return (
        <div className="section">
            <h2>Timer</h2>
            <h1>{formatTime(timeElapsed)}</h1>
            <div class="flex">
                <button onClick={startTimer} disabled={timeElapsed !== 0}>Start Timer</button>
                <button onClick={stopTimer} disabled={timeElapsed === 0}>Stop Timer</button>
            </div>
        </div>
    )
}

export default Timer;
