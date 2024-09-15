import { useState, useEffect } from "react";
import logo from "./logo.svg";
import Timer from "./components/Timer";
import Summary from "./components/Summary";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
      <div className="App">
        <header className="App-header">
          <Timer />
          <Summary />
        </header>
        <div style={{ padding: "20px", textAlign: "center" }}>
          <h2>Ready for a Quiz?</h2>
          <button
            onClick={startQuiz}
            style={{ padding: "10px", fontSize: "16px" }}
          >
            Start Quiz
          </button>
        </div>
      </div>
    </QueryClientProvider>
  );
}

export default App;
