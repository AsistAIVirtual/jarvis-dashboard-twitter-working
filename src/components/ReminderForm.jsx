import { useState, useEffect } from 'react';
import tokenList from '../data/greenLockTokens.json';

const TOKEN_CONTRACT = "0x1E562BF73369D1d5B7E547b8580039E1f05cCc56";
const STAKE_ADDRESS = "0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe";
const BASESCAN_API = "https://api.basescan.org/api";
const API_KEY = "MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ";

export default function ReminderForm() {
  const [wallet, setWallet] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [reminderCount, setReminderCount] = useState('');
  const [token, setToken] = useState('');
  const [isEligible, setIsEligible] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [maxReminders, setMaxReminders] = useState(0);

  const checkStake = async () => {
    try {
      const url = `${BASESCAN_API}?module=account&action=tokentx&contractaddress=${TOKEN_CONTRACT}&address=${wallet}&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();
      const txs = data.result.filter(tx => tx.to.toLowerCase() === STAKE_ADDRESS.toLowerCase());

      const total = txs.reduce((acc, tx) => acc + parseFloat(tx.value) / 1e18, 0);
      setStakeAmount(total);

      if (total >= 250000) {
        setIsEligible(true);
        setMaxReminders(2);
        alert("Stake detected: 2 reminder rights.");
      } else if (total >= 100000) {
        setIsEligible(true);
        setMaxReminders(1);
        alert("Stake detected: 1 reminder right.");
      } else {
        setIsEligible(false);
        setMaxReminders(0);
        alert("Stake too low.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to check stake.");
    }
  };

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterUsername,
          tokenName: token,
          days: reminderCount
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("Reminder saved and tweet sent!");
      } else {
        alert("Error: " + result.error);
      }
    } catch (err) {
      console.error("Tweet error:", err);
      alert("Tweet error.");
    }
  };

  return (
    <div className="flex justify-center items-center mt-10">
      <div className="bg-white bg-opacity-10 p-6 rounded-xl shadow-lg w-full max-w-md text-white">
        <h2 className="text-2xl font-bold mb-6 text-center">Subscribe to Unlock Reminder</h2>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Your Wallet Address</label>
          <input
            type="text"
            value={wallet}
            onChange={(e) => setWallet(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="0x..."
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Your Twitter Username</label>
          <input
            type="text"
            value={twitterUsername}
            onChange={(e) => setTwitterUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="@username"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Days Before Unlock</label>
          <input
            type="number"
            value={reminderCount}
            onChange={(e) => setReminderCount(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="e.g. 3"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Select Token</label>
          <select
            value={token}
            onChange={(e) => setToken(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
          >
            <option value="">-- Choose Token --</option>
            {tokenList.map((t) => (
              <option key={t.ticker} value={t.ticker}>
                {t.name} (${t.ticker})
              </option>
            ))}
          </select>
        </div>

        <div className="mb-2 text-sm text-gray-300">
          Detected Stake: <strong>{stakeAmount.toLocaleString()}</strong> tokens
        </div>

        <div className="flex justify-between items-center gap-2">
          <button
            onClick={checkStake}
            className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
          >
            Check Stake
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isEligible}
            className={`w-1/2 ${
              isEligible ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'
            } text-white font-semibold py-2 px-4 rounded`}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
