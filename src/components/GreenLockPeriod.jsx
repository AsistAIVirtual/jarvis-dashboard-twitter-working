import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import greenLockData from '../data/greenLockData.json';

export default function GreenLockPeriod() {
  const [search, setSearch] = useState('');
  const [sortOption, setSortOption] = useState('');
  const [filterOption, setFilterOption] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const tokensPerPage = 9;
  const [updatedData, setUpdatedData] = useState([]);

  useEffect(() => {
    const calculateDaysLeft = () => {
      const now = new Date();
      const updated = greenLockData.map(token => {
        const launchDate = new Date(token.date);
        const diffTime = now - launchDate;
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
        const baseUnlock = token.baseUnlock || 0;
        const daysLeft = Math.max(0, baseUnlock - diffDays);
        return { ...token, unlockingDays: daysLeft };
      });
      setUpdatedData(updated);
    };

    calculateDaysLeft();
    const interval = setInterval(calculateDaysLeft, 1000 * 60 * 60); // her saat başı güncelle
    return () => clearInterval(interval);
  }, []);

  const filteredData = updatedData
    .filter(token =>
      token.name.toLowerCase().includes(search.toLowerCase()) ||
      token.ticker.toLowerCase().includes(search.toLowerCase())
    )
    .filter(token => {
      if (filterOption === 'under7') return token.unlockingDays < 7;
      if (filterOption === 'under22') return token.unlockingDays < 22;
      return true;
    })
    .sort((a, b) => {
      if (sortOption === 'asc') return a.unlockingDays - b.unlockingDays;
      if (sortOption === 'desc') return b.unlockingDays - a.unlockingDays;
      return 0;
    });

  const indexOfLast = currentPage * tokensPerPage;
  const indexOfFirst = indexOfLast - tokensPerPage;
  const currentTokens = filteredData.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(filteredData.length / tokensPerPage);

  return (
    <div className="text-white p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search by name or ticker"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="p-2 rounded text-black"
        />
        <select onChange={e => setSortOption(e.target.value)} className="p-2 rounded text-black">
          <option value="">Sort by</option>
          <option value="asc">Unlocking Days ↑</option>
          <option value="desc">Unlocking Days ↓</option>
        </select>
        <select onChange={e => setFilterOption(e.target.value)} className="p-2 rounded text-black">
          <option value="">All</option>
          <option value="under7">Under 7 Days</option>
          <option value="under22">Under 22 Days</option>
        </select>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {currentTokens.map((token, i) => (
          <div key={i} className="bg-white bg-opacity-10 backdrop-blur-md p-4 rounded shadow">
            <img src={token.image || '/default.png'} alt={token.ticker} className="w-10 h-10 mb-2" />
            <h3 className="font-bold">{token.name} ({token.ticker})</h3>
            <p>Unlocking in: {token.unlockingDays} days</p>
            <p>Participants: {token.participants || 0}</p>
            <p>Oversubscription: {token.oversub || 0}%</p>
          </div>
        ))}
      </div>
      <div className="flex justify-center mt-4 gap-2">
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${currentPage === i + 1 ? 'bg-blue-500' : 'bg-gray-700'}`}
          >
            {i + 1}
          </button>
        ))}
      </div>
    </div>
  );
}
