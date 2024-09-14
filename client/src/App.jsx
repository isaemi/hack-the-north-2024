import { useState, useEffect } from 'react'
import logo from './logo.svg'
import Timer from './components/Timer';
import './App.css'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Timer />
      </header>
    </div>
  )
}

export default App
