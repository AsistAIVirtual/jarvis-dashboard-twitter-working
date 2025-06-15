
import React from 'react';

export default function App() {
  const handleSubscribe = async () => {
    const res = await fetch('http://localhost:3001/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'Hello from frontend!' })
    });
    const data = await res.json();
    console.log('Response:', data);
  };

  return (
    <div>
      <h1>Jarvis Dashboard</h1>
      <button onClick={handleSubscribe}>Subscribe</button>
    </div>
  );
}
