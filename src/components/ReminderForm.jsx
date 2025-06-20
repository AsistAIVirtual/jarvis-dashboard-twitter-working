import React, { useState } from 'react';

const ReminderForm = ({ wallet }) => {
  const [twitterUsername, setTwitterUsername] = useState('');
  const [token, setToken] = useState('');
  const [reminderCount, setReminderCount] = useState('');

  const handleSubmit = async () => {
    try {
      const response = await fetch("https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          twitterUsername,
          tokenName: token,
          days: reminderCount,
          wallet // ✅ eksik olan alan eklendi
        })
      });

      const data = await response.json();
      if (data.success) {
        alert("Reminder created and tweet sent!");
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Tweet error:", error);
      alert("An error occurred.");
    }
  };

  return (
    <div className="reminder-form">
      <input
        type="text"
        placeholder="Enter X Username"
        value={twitterUsername}
        onChange={(e) => setTwitterUsername(e.target.value)}
      />
      <input
        type="text"
        placeholder="Token"
        value={token}
        onChange={(e) => setToken(e.target.value)}
      />
      <input
        type="number"
        placeholder="Days"
        value={reminderCount}
        onChange={(e) => setReminderCount(e.target.value)}
      />
      <button onClick={handleSubmit}>Subscribe</button>
    </div>
  );
};

export default ReminderForm;
