import { useState, useEffect } from "react";
import logo from "./logo.svg";
import Timer from "./components/Timer";
import Summary from "./components/Summary";
import "./App.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="App">
        <header className="App-header">
          <Timer />
          <Summary />
        </header>
      </div>
    </QueryClientProvider>
  );
}

export default App;
