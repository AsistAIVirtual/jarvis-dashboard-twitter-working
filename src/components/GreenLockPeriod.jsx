import React, { useState, useEffect } from 'react';
import greenLockData from '../data/greenLockData.json';

export default function GreenLockPeriod() {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortOrder, setSortOrder] = useState(null);
  const [filter, setFilter] = useState('all');
  const tokensPerPage = 9;

  const filteredTokens = greenLockData.filter(token => {
    const today = new Date();
    const launchDate = new Date(`${token.date}T${token.launchTime || "00:00"}`);
    const timeDiff = launchDate.getTime() + token.baseUnlock * 24 * 60 * 60 * 1000 - today.getTime();
    const daysLeft = Math.max(0, Math.ceil(timeDiff / (1000 * 60 * 60 * 24)));
    token.daysLeft = daysLeft;

    if (filter === 'under7') return daysLeft <= 7;
    if (filter === 'under22') return daysLeft <= 22;
    return true;
  }).filter(token =>
    token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    token.ticker.toLowerCase().includes(searchQuery.toLowerCase())
  ).sort((a, b) => {
    if (sortOrder === 'asc') return a.daysLeft - b.daysLeft;
    if (sortOrder === 'desc') return b.daysLeft - a.daysLeft;
    return 0;
  });

  const indexOfLastToken = currentPage * tokensPerPage;
  const indexOfFirstToken = indexOfLastToken - tokensPerPage;
  const currentTokens = filteredTokens.slice(indexOfFirstToken, indexOfLastToken);
  const totalPages = Math.ceil(filteredTokens.length / tokensPerPage);

  return (
    <div className="p-4 text-white">
      <div className="flex flex-wrap gap-2 justify-between mb-4">
        <input
          type="text"
          placeholder="Search by name or ticker"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="px-2 py-1 text-black rounded"
        />
        <div className="flex gap-2">
          <button onClick={() => setSortOrder('asc')} className="px-2 py-1 bg-gray-700 rounded">▲ Days</button>
          <button onClick={() => setSortOrder('desc')} className="px-2 py-1 bg-gray-700 rounded">▼ Days</button>
          <button onClick={() => setFilter('under7')} className="px-2 py-1 bg-green-700 rounded">Under 7 Days</button>
          <button onClick={() => setFilter('under22')} className="px-2 py-1 bg-yellow-600 rounded">Under 22 Days</button>
          <button onClick={() => setFilter('all')} className="px-2 py-1 bg-gray-500 rounded">All</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {currentTokens.map((token, index) => (
          <div key={index} className="bg-white bg-opacity-10 backdrop-blur-md p-4 rounded shadow text-center">
            <img src={token.image || `/images/${token.logo}`} alt={token.name} className="h-10 mx-auto mb-2" />
            <h2 className="text-lg font-bold">{token.name}</h2>
            <p className="text-sm text-gray-400">({token.ticker})</p>
            <p className="mt-2 text-sm text-green-300">Unlocking in: {token.daysLeft} days</p>
            <p className="text-sm text-gray-300">👥 Participants: {token.participants}</p>
            <p className="text-sm text-gray-300">📊 Oversub: {token.oversub}</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-600' : 'bg-gray-600'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

