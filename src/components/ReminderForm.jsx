// ReminderForm.jsx (görsel bozulmadan, işlevler tam)

import React, { useState, useEffect } from 'react';
import greenLockTokens from '../data/greenLockTokens.json';

const ReminderForm = () => {
  const [wallet, setWallet] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [days, setDays] = useState('');
  const [stakeAmount, setStakeAmount] = useState(null);
  const [eligibleReminders, setEligibleReminders] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const JARVIS_TOKEN_ADDRESS = '0x1E562BF73369D1d5B7E547b8580039E1f05cCc56';
  const STAKE_CONTRACT_ADDRESS = '0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe';
  const API_KEY = 'MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ';

  const handleCheckStake = async () => {
    if (!wallet) return alert('Enter wallet address');
    setLoading(true);
    setStatus('');

    try {
      const url = `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${JARVIS_TOKEN_ADDRESS}&address=${STAKE_CONTRACT_ADDRESS}&tag=latest&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      const balance = parseFloat(data.result) / 1e18;
      setStakeAmount(balance);

      if (balance >= 500000) setEligibleReminders(2);
      else if (balance >= 200000) setEligibleReminders(1);
      else setEligibleReminders(0);

    } catch (err) {
      console.error(err);
      setStatus('Error checking stake');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!wallet || !twitterUsername || !selectedToken || !days) return alert('Fill all fields');
    setStatus('');
    setLoading(true);

    try {
      const res = await fetch('https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ twitterUsername, tokenName: selectedToken, days, wallet })
      });

      const json = await res.json();
      if (json.success) {
        setStatus('Reminder saved and tweet sent.');
      } else {
        setStatus(`Error: ${json.error}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('Submission failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto bg-white rounded shadow">
      <h2 className="text-lg font-bold mb-4">Subscribe Reminder</h2>

      <div className="mb-2">
        <label className="block text-sm font-medium">Wallet Address</label>
        <input value={wallet} onChange={(e) => setWallet(e.target.value)} className="w-full border px-2 py-1" />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Enter X Username</label>
        <input value={twitterUsername} onChange={(e) => setTwitterUsername(e.target.value)} className="w-full border px-2 py-1" />
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Token</label>
        <select value={selectedToken} onChange={(e) => setSelectedToken(e.target.value)} className="w-full border px-2 py-1">
          <option value="">Select token</option>
          {greenLockTokens.map((token) => (
            <option key={token.Ticker} value={token.Ticker}>{token.Ticker}</option>
          ))}
        </select>
      </div>

      <div className="mb-2">
        <label className="block text-sm font-medium">Days Before Unlock</label>
        <input type="number" value={days} onChange={(e) => setDays(e.target.value)} className="w-full border px-2 py-1" />
      </div>

      <div className="flex items-center space-x-4 my-2">
        <button onClick={handleCheckStake} className="px-3 py-1 bg-blue-600 text-white rounded">Check Stake</button>
        {stakeAmount !== null && <span className="text-sm">Detected Stake: {stakeAmount.toFixed(0)} JARVIS</span>}
      </div>

      <button
        disabled={eligibleReminders === 0 || loading}
        onClick={handleSubmit}
        className={`px-4 py-2 rounded text-white ${eligibleReminders > 0 ? 'bg-green-600' : 'bg-gray-400 cursor-not-allowed'}`}
      >
        {loading ? 'Processing...' : 'Subscribe'}
      </button>

      {status && <p className="mt-3 text-sm text-red-500">{status}</p>}

      <p className="mt-3 text-xs text-gray-500">
        You must stake at least 200,000 $JARVIS to be eligible. 1 reminder for 200k+, 2 reminders for 500k+.
      </p>
    </div>
  );
};

export default ReminderForm;
