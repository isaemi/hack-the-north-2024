import { useState, useEffect } from "react";
import logo from "./logo.svg";
import Timer from "./components/Timer";
import Summary from "./components/Summary";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import bringo from "./assets/bringo.png"

const queryClient = new QueryClient();

function App() {
  const startQuiz = () => {
    // Open the quiz in a new tab
    chrome.tabs.create({
      url: chrome.runtime.getURL("quiz.html"), // Points to the quiz page
      active: true,
    });
  };
  return (
    <QueryClientProvider client={queryClient}>
      <main className="main-container">
        <Timer />
        <Summary />
        <div style={{ padding: "20px", textAlign: "center" }} className="container">
          <h2 className="subtitle">Ready for a Quiz?</h2>
          <div className="buttons">
            <button
              onClick={startQuiz}
              style={{ padding: "10px", fontSize: "16px" }}
            >
              Start Quiz
            </button>
            <img src={bringo} alt="Bringo Mascot" width="80px" style={{
              position: 'fixed',
              right: '10px',
              bottom: '1px'
            }}/>
          </div>
        </div>
      </main>
    </QueryClientProvider>
  );
}

export default App;
