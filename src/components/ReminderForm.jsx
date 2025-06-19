import React, { useState, useEffect } from "react";
import greenLockTokens from "../data/greenLockTokens.json";

export default function ReminderForm() {
  const [wallet, setWallet] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [token, setToken] = useState("");
  const [reminderCount, setReminderCount] = useState("");
  const [tokenOptions, setTokenOptions] = useState([]);

  useEffect(() => {
    const tickers = greenLockTokens.map((t) => t.Ticker);
    setTokenOptions(tickers);
  }, []);

  const handleSubmit = async () => {
    if (!wallet || !twitterUsername || !token || !reminderCount) {
      alert("Please fill in all fields.");
      return;
    }

    try {
      const response = await fetch("https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
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
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Subscribe Unlock Period</h2>

      <input
        type="text"
        placeholder="Enter wallet address"
        className="w-full px-4 py-2 mb-3 border rounded"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
      />

      <input
        type="text"
        placeholder="Enter Twitter username"
        className="w-full px-4 py-2 mb-3 border rounded"
        value={twitterUsername}
        onChange={(e) => setTwitterUsername(e.target.value)}
      />

      <select
        className="w-full px-4 py-2 mb-3 border rounded"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      >
        <option value="">Select token</option>
        {tokenOptions.map((ticker, index) => (
          <option key={index} value={ticker}>
            {ticker}
          </option>
        ))}
      </select>

      <input
        type="number"
        placeholder="Remind in how many days?"
        className="w-full px-4 py-2 mb-3 border rounded"
        value={reminderCount}
        onChange={(e) => setReminderCount(e.target.value)}
      />

      <button
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
        onClick={handleSubmit}
      >
        Subscribe
      </button>
    </div>
  );
}
