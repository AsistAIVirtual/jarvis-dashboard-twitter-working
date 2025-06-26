import React, { useEffect, useState } from "react";
import axios from "axios";

import { tokenList } from "./tokenList";

const BASESCAN_API_KEY = "MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ";
const TOKENS_PER_PAGE = 10;
const TOTAL_SUPPLY = 1_000_000_000;

const GenesisStaking = () => {
  const [stakes, setStakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const [rawData, setRawData] = useState([]);

  useEffect(() => {
    const fetchStakes = async () => {
      setLoading(true);
      const results = [];

      for (const token of tokenList) {
        try {
          const url = `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${token.tokenAddress}&address=${token.stakeContract}&tag=latest&apikey=${BASESCAN_API_KEY}`;
          const response = await axios.get(url);
          const balanceRaw = response.data.result;
          const balance = parseFloat(balanceRaw) / 1e18;
          const percent = ((balance / TOTAL_SUPPLY) * 100).toFixed(2);
          results.push({
            ...token,
            numericStaked: balance,
            staked: balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            percent,
          });
        } catch (err) {
          results.push({ ...token, staked: "-", percent: "-", numericStaked: 0 });
        }
        if ((results.length % 2) === 0) await new Promise(r => setTimeout(r, 1000));
      }

      setRawData(results);
      setLoading(false);
    };

    fetchStakes();
  }, []);

  const filteredData = rawData.filter(token =>
    token.tokenName.toLowerCase().includes(search.toLowerCase()) ||
    token.ticker.toLowerCase().includes(search.toLowerCase())
  );

  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortOrder) return 0;
    return sortOrder === "asc" ? a.numericStaked - b.numericStaked : b.numericStaked - a.numericStaked;
  });

  const start = page * TOKENS_PER_PAGE;
  const end = start + TOKENS_PER_PAGE;
  const currentPageData = sortedData.slice(start, end);
  const totalPages = Math.ceil(sortedData.length / TOKENS_PER_PAGE);

  return (
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-6">Genesis Staking</h1>

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or ticker..."
          className="w-full md:w-64 px-3 py-1.5 rounded-md border border-gray-500 text-sm text-black focus:outline-none focus:ring focus:ring-blue-500"
        />
        <div className="flex gap-2">
          <button
            onClick={() => setSortOrder("desc")}
            className={`px-4 py-2 rounded-lg shadow ${sortOrder === "desc" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            🔽 Desc
          </button>
          <button
            onClick={() => setSortOrder("asc")}
            className={`px-4 py-2 rounded-lg shadow ${sortOrder === "asc" ? "bg-blue-600" : "bg-gray-700 hover:bg-gray-600"}`}
          >
            🔼 Asc
          </button>
          <button
            onClick={() => setSortOrder(null)}
            className="px-4 py-2 rounded-lg shadow bg-gray-700 hover:bg-gray-600"
          >
            ❌ Reset
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-10 animate-pulse text-xl">Loading... Keep calm, Virgen 🌀</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {currentPageData.map((token, i) => (
            <div key={i} className="bg-gradient-to-br from-gray-800 to-gray-900 p-4 rounded-xl shadow-md flex items-center hover:scale-[1.015] transition-transform">
              <img
                src={`/images/${token.imageFile}`}
                onError={(e) => (e.currentTarget.src = "/images/default.png")}
                alt={token.tokenName}
                className="w-14 h-14 rounded-full mr-4 border"
              />
              <div>
                <h2 className="text-xl font-semibold">{token.tokenName}</h2>
                <p className="text-sm text-gray-300">Staked: {token.staked} ({token.percent}%)</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-6 flex justify-center space-x-4">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded disabled:opacity-40"
        >
          Prev
        </button>
        <span className="text-lg">Page {page + 1} of {totalPages}</span>
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages - 1))}
          disabled={page === totalPages - 1}
          className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default GenesisStaking;
