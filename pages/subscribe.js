
import React, { useState } from 'react';
import tokenData from '../data/greenLockData.json';

export default function SubscribePage() {
  const [username, setUsername] = useState('');
  const [selectedToken, setSelectedToken] = useState('');
  const [walletAddress, setWalletAddress] = useState('');
  const [daysBeforeUnlock, setDaysBeforeUnlock] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [status, setStatus] = useState('');

  const BASESCAN_API_KEY = "MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ";
  const STAKE_CONTRACT = "0xa72fb1a92a1489a986fe1d27573f4f6a1ba83dbe";

  const checkStakeTx = async () => {
    const cleanAddress = walletAddress.trim().toLowerCase();

    if (!/^0x[a-fA-F0-9]{40}$/.test(cleanAddress)) {
      setStatus("Invalid wallet address format.");
      return false;
    }

    const url = `https://api.basescan.org/api?module=account&action=txlist&address=${cleanAddress}&sort=desc&apikey=${BASESCAN_API_KEY}`;

    try {
      const res = await fetch(url);
      const data = await res.json();
      if (data.status !== '1') {
        console.error("BaseScan error:", data);
        return false;
      }

      const matched = data.result.some(tx =>
        tx.to && tx.to.toLowerCase() === STAKE_CONTRACT.toLowerCase()
      );
      return matched;
    } catch (error) {
      console.error("Fetch error:", error);
      return false;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('Checking stake activity...');

    if (!agreed) {
      setStatus('You must agree to be notified.');
      return;
    }

    const staked = await checkStakeTx();
    if (!staked) {
      setStatus("Sorry, this wallet hasn't interacted with the stake contract.");
      return;
    }

    setStatus('Sending reminder...');

    const message = `Reminder for ${username} - Token: ${selectedToken}, Wallet: ${walletAddress}, Days Before Unlock: ${daysBeforeUnlock}`;

    try {
      const response = await fetch('/api/tweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('Tweet sent successfully!');
      } else {
        setStatus('Tweet failed: ' + data.message);
      }
    } catch (error) {
      setStatus('Error sending tweet: ' + error.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h1>Subscribe to Unlock Reminder</h1>
      <form onSubmit={handleSubmit} style={{ padding: '1rem', background: '#f2f2f2', borderRadius: '8px' }}>
        <label>Select Token:</label>
        <select
          value={selectedToken}
          onChange={(e) => setSelectedToken(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
        >
          <option value="">-- Select --</option>
          {tokenData.map((token, idx) => (
            <option key={idx} value={token.name}>
              {token.name} ({token.ticker})
            </option>
          ))}
        </select>

        <label>Enter X Username:</label>
        <input
          type="text"
          placeholder="@username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
          required
        />

        <label>Enter Your Wallet Address:</label>
        <input
          type="text"
          value={walletAddress}
          onChange={(e) => setWalletAddress(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
          required
        />

        <label>Reminder Days Before Unlock:</label>
        <input
          type="number"
          value={daysBeforeUnlock}
          onChange={(e) => setDaysBeforeUnlock(e.target.value)}
          style={{ width: '100%', marginBottom: '1rem' }}
          required
        />

        <label>
          <input
            type="checkbox"
            checked={agreed}
            onChange={() => setAgreed(!agreed)}
            style={{ marginRight: '0.5rem' }}
          />
          I agree to be notified before unlock date
        </label>

        <button type="submit" style={{ marginTop: '1rem' }}>Subscribe</button>
        {status && <p>{status}</p>}
      </form>
    </div>
  );
}
