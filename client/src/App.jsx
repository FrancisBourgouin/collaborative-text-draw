import React from 'react';
import './App.css';
import { useEffect } from 'react';
import { useState } from 'react';
import { useRef } from 'react';
let time

function App() {
  const textArea = useRef()
  const [ws, setWs] = useState({})
  const [textContent, setTextContent] = useState({ text: "", caretPosition: 0, latency: 0 })
  const handleChange = e => {
    time = Date.now()
    setTextContent({ ...textContent, caretPosition: e.target.selectionStart })
    ws.send(e.target.value)
  }
  ws.onopen = () => {
    console.log('client connected')
  }

  ws.onmessage = message => {
    // console.log('received', message)
    // console.log(Date.now() - time)
    // setTextContent(message.data)
    setTextContent({ ...textContent, text: message.data, latency: Date.now() - time })
    textArea.current.selectionStart = textContent.caretPosition
    textArea.current.selectionEnd = textContent.caretPosition
  }
  useEffect(() => {
    setWs(new WebSocket('ws://localhost:8000', "echo-protocol"))



  }, [])

  return (
    <div className="App">
      <textarea
        rows="10"
        cols="30"
        ref={textArea}
        value={textContent.text}
        onChange={handleChange}
      />
      <p>Latency: {textContent.latency}</p>
    </div>
  );
}

export default App;
