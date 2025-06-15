
import { useState } from 'react';
import greenLockData from '../data/greenLockData.json';

export default function ReminderForm() {
  const [wallet, setWallet] = useState('');
  const [twitter, setTwitter] = useState('');
  const [stakeAmount, setStakeAmount] = useState(0);
  const [selectedTokens, setSelectedTokens] = useState([]);
  const [days, setDays] = useState(3);
  const [message, setMessage] = useState('');
  const [isStakeValid, setIsStakeValid] = useState(false);

  const TOKEN_ADDRESS = "0x1E562BF73369D1d5B7E547b8580039E1f05cCc56"; // stake edilen token
  const STAKE_CONTRACT = "0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe";
  const BASESCAN_API_KEY = "MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ";

  const maxSelections = stakeAmount >= 500000 * 1e18 ? 3 : stakeAmount >= 200000 * 1e18 ? 2 : stakeAmount >= 100000 * 1e18 ? 1 : 0;

  const handleTokenChange = (e, index) => {
    const newTokens = [...selectedTokens];
    newTokens[index] = e.target.value;
    setSelectedTokens(newTokens);
  };

  const handleCheckStake = async () => {
    if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
      setMessage("Please enter a valid wallet address.");
      return;
    }

    try {
      const address = wallet.replace("0x", "").toLowerCase();
      const data = "0x70a08231000000000000000000000000" + address;
      const url = `https://api.basescan.org/api?module=proxy&action=eth_call&to=${TOKEN_ADDRESS}&data=${data}&tag=latest&apikey=${BASESCAN_API_KEY}`;

      const res = await fetch(url);
      const json = await res.json();

      if (json.result) {
        const balance = parseInt(json.result, 16);
        setStakeAmount(balance);

        if (balance >= 100000 * 1e18) {
          setIsStakeValid(true);
          const eligible = balance >= 250000 * 1e18 ? 3 : balance >= 100000 * 1e18 ? 2 : 1;
          setMessage(`✅ Eligible for ${eligible} reminder(s)`);
        } else {
          setIsStakeValid(false);
          setMessage("❌ You must stake at least 100,000 tokens.");
        }
      } else {
        setIsStakeValid(false);
        setMessage("Could not retrieve stake balance.");
      }
    } catch (err) {
      console.error(err);
      setMessage("Error checking stake.");
    }
  };

  const handleSubmit = async () => {
    if (!isStakeValid) return;

    if (!twitter || !wallet || selectedTokens.length !== maxSelections || selectedTokens.includes("")) {
      setMessage('Please complete all fields.');
      return;
    }

    const res = await fetch('http://localhost:3001/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        twitterUsername: twitter.replace('@', ''),
        walletAddress: wallet,
        tokens: selectedTokens,
        days
      }),
    });

    const data = await res.json();
    if (data.success) {
      setMessage('✅ Reminder set successfully!');
    } else {
      setMessage('❌ Error: ' + data.error);
    }
  };

  return (
    <div className="bg-white p-6 rounded shadow-md max-w-md mx-auto text-black">
      <h2 className="text-xl font-bold mb-4 text-center">Subscribe to Unlock Reminder</h2>
      <div className="flex space-x-2 mb-3">
        <input
          type="text"
          placeholder="Your Wallet Address"
          className="flex-1 p-2 border border-gray-400 rounded text-black"
          value={wallet}
          onChange={e => setWallet(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-3 rounded hover:bg-indigo-700" onClick={handleCheckStake}>
          Check Stake
        </button>
      </div>
      <input
        type="text"
        placeholder="Your Twitter Username"
        className="w-full p-2 mb-3 border border-gray-400 rounded text-black"
        value={twitter}
        onChange={e => setTwitter(e.target.value)}
      />
      {[...Array(maxSelections)].map((_, i) => (
        <select
          key={i}
          className="w-full p-2 mb-3 border border-gray-400 rounded text-black bg-white"
          value={selectedTokens[i] || ""}
          onChange={e => handleTokenChange(e, i)}
        >
          <option value="">Select a Token</option>
          {greenLockData.map(token => (
            <option key={token.ticker} value={token.ticker} className="text-black bg-white">
              {token.ticker}
            </option>
          ))}
        </select>
      ))}
      <input
        type="number"
        placeholder="Reminder in X days"
        className="w-full p-2 mb-3 border border-gray-400 rounded text-black"
        value={days}
        onChange={e => setDays(Number(e.target.value))}
      />
      <button
        className={`w-full px-4 py-2 rounded ${isStakeValid ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-gray-400 cursor-not-allowed'}`}
        onClick={handleSubmit}
        disabled={!isStakeValid}
      >
        Subscribe
      </button>
      {message && <p className="mt-3 text-sm text-center">{message}</p>}
    </div>
  );
}
