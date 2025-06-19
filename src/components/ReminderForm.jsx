
import React, { useState } from "react";

export default function ReminderForm() {
  const [wallet, setWallet] = useState("");
  const [twitterUsername, setTwitterUsername] = useState("");
  const [token, setToken] = useState("");
  const [reminderCount, setReminderCount] = useState(1);

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          wallet,
          twitterUsername,
          token,
          remindInDays: reminderCount
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
    <div className="p-4 border rounded shadow bg-white max-w-md mx-auto mt-10">
      <h2 className="text-xl font-bold mb-4">Set Reminder</h2>
      <input
        type="text"
        placeholder="Wallet Address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        className="w-full p-2 border mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Twitter Username"
        value={twitterUsername}
        onChange={(e) => setTwitterUsername(e.target.value)}
        className="w-full p-2 border mb-2 rounded"
      />
      <input
        type="text"
        placeholder="Token Name"
        value={token}
        onChange={(e) => setToken(e.target.value)}
        className="w-full p-2 border mb-2 rounded"
      />
      <input
        type="number"
        placeholder="Remind In Days"
        value={reminderCount}
        onChange={(e) => setReminderCount(Number(e.target.value))}
        className="w-full p-2 border mb-4 rounded"
      />
      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 w-full"
      >
        Subscribe
      </button>
    </div>
  );
}
