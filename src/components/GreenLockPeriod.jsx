
import React, { useState } from 'react';
import greenLockData from '../data/greenLockData.json';

const GreenLockPeriod = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const perPage = 18;

  const filtered = greenLockData.filter((token) => {
    const match = token.name.toLowerCase().includes(search.toLowerCase()) || token.ticker.toLowerCase().includes(search.toLowerCase());
    const days = Number(token.baseUnlock);
    const filterCheck = filter === 'under7' ? days < 7 : filter === 'under22' ? days < 22 : true;
    return match && filterCheck;
  });

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'asc') return a.baseUnlock - b.baseUnlock;
    if (sort === 'desc') return b.baseUnlock - a.baseUnlock;
    return 0;
  });

  const pageData = sorted.slice(currentPage * perPage, (currentPage + 1) * perPage);
  const totalPages = Math.ceil(sorted.length / perPage);
  const emptySlots = perPage - pageData.length;
  const fillers = Array(emptySlots).fill(null);

  return (
    <div className="p-4 text-white">
      <div className="flex flex-wrap gap-2 justify-center mb-4">
        <input
          type="text"
          placeholder="Search by name or ticker"
          className="p-2 rounded bg-gray-800 text-white"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setCurrentPage(0);
          }}
        />
        <select className="p-2 rounded bg-gray-800 text-white" value={filter} onChange={(e) => {
          setFilter(e.target.value);
          setCurrentPage(0);
        }}>
          <option value="all">All</option>
          <option value="under7">Under 7 Days</option>
          <option value="under22">Under 22 Days</option>
        </select>
        <select className="p-2 rounded bg-gray-800 text-white" value={sort} onChange={(e) => {
          setSort(e.target.value);
          setCurrentPage(0);
        }}>
          <option value="">No Sort</option>
          <option value="asc">Unlocking Days Asc</option>
          <option value="desc">Unlocking Days Desc</option>
        </select>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-0 justify-items-center">
        {pageData.map((token, index) => (
          <div key={index}
            className="backdrop-blur-lg bg-white/10 border border-white/20 rounded-xl shadow p-3 w-[180px] min-h-[180px] flex flex-col items-center text-center"
          >
            <img src={token.image} alt={token.name} className="w-10 h-10 rounded-full mb-1" />
            <div className="text-sm font-semibold">{token.name}</div>
            <div className="text-xs text-gray-300 mb-1">Ticker: {token.ticker}</div>
            <div className="text-xs">Unlock in: {token.baseUnlock} days</div>
            <div className="text-xs">Participants: {token.participants}</div>
            <div className="text-xs">Oversub: {token.oversub}</div>
          </div>
        ))}
        {fillers.map((_, i) => (
          <div key={`empty-${i}`} className="w-[180px] min-h-[180px] opacity-0 pointer-events-none" />
        ))}
      </div>

      <div className="flex justify-center mt-4 gap-4 items-center">
        <button
          className="px-4 py-2 bg-white/20 text-white rounded-lg backdrop-blur-md hover:bg-white/30 disabled:opacity-40"
          disabled={currentPage === 0}
          onClick={() => setCurrentPage((p) => p - 1)}
        >
          Previous
        </button>
        <span className="text-white text-sm">Page {currentPage + 1} / {totalPages}</span>
        <button
          className="px-4 py-2 bg-white/20 text-white rounded-lg backdrop-blur-md hover:bg-white/30 disabled:opacity-40"
          disabled={currentPage >= totalPages - 1}
          onClick={() => setCurrentPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GreenLockPeriod;
