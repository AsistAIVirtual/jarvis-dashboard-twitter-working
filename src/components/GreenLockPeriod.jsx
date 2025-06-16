
import React, { useEffect, useState } from 'react';

export default function GreenLockPeriod() {
  const [tokens, setTokens] = useState([]);

  useEffect(() => {
    fetch('/data/greenLockData.json')
      .then(res => res.json())
      .then(data => {
        const enriched = data.map(token => {
          const unlockDate = new Date(`${token.date}T${token.launchTime}`);
          const now = new Date();
          const diffDays = Math.max(
            0,
            Math.ceil((unlockDate - now) / (1000 * 60 * 60 * 24))
          );
          return { ...token, daysLeft: diffDays };
        });
        setTokens(enriched);
      });
  }, []);

  return (
    <div className="grid grid-cols-3 gap-4 p-4">
      {tokens.map((token, idx) => (
        <div key={idx} className="bg-white bg-opacity-10 text-white p-4 rounded shadow">
          <img src={token.image} alt={token.ticker} className="w-full h-32 object-contain mb-2" />
          <h3 className="font-bold">{token.name} ({token.ticker})</h3>
          <p>Days Left: {token.daysLeft}</p>
          <p>Participants: {token.participants}</p>
          <p>Oversub: {token.oversub}</p>
        </div>
      ))}
    </div>
  );
}
