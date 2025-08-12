import { useState } from 'react';
import tokenList from '../data/greenLockTokens.json';
import greenLockData from '../data/greenLockData.json';

const TOKEN_CONTRACT = "0x1E562BF73369D1d5B7E547b8580039E1f05cCc56";
const STAKE_ADDRESS = "0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe";
const BASESCAN_API = "https://api.basescan.org/api";
const API_KEY = "MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ";

export default function ReminderForm() {
  const [wallet, setWallet] = useState('');
  const [twitterUsername, setTwitterUsername] = useState('');
  const [reminderCount, setReminderCount] = useState(''); // gün
  const [token, setToken] = useState('');                  // seçilen token ticker
  const [isEligible, setIsEligible] = useState(false);
  const [stakeAmount, setStakeAmount] = useState(0);
  const [maxReminders, setMaxReminders] = useState(0);

  // Stake kontrolü (>=100k => 3 hak, >=0 => 1 hak)
  const checkStake = async () => {
    try {
      if (!wallet) {
        alert("Önce cüzdan adresini gir.");
        return;
      }
      const url = `${BASESCAN_API}?module=account&action=tokentx&contractaddress=${TOKEN_CONTRACT}&address=${wallet}&apikey=${API_KEY}`;
      const res = await fetch(url);
      const data = await res.json();

      const txs = (data?.result || []).filter(
        (tx) => tx?.to?.toLowerCase() === STAKE_ADDRESS.toLowerCase()
      );

      const total = txs.reduce((acc, tx) => acc + (parseFloat(tx.value || '0') / 1e18), 0);
      setStakeAmount(total);

      if (total >= 100000) {
        setIsEligible(true);
        setMaxReminders(3);
        alert("Stake detected: 3 reminder rights.");
      } else if (total >= 0) {
        setIsEligible(true);
        setMaxReminders(1);
        alert("Stake detected: 1 reminder right.");
      }
    } catch (err) {
      console.error(err);
      alert("Failed to check stake.");
    }
  };

  // BACKEND'İN BEKLEDİĞİ İSİMLERLE GÖNDERİM + dueAt hesabı
  const handleSubmit = async () => {
    try {
      // basit doğrulamalar
      if (!wallet || !twitterUsername || !token) {
        alert("Wallet, Twitter kullanıcı adı ve Token seçimi zorunlu.");
        return;
      }
      const remindInDays = Number(reminderCount ?? 0);
      if (Number.isNaN(remindInDays) || remindInDays < 0) {
        alert("Days Before Unlock sayısal ve 0+ olmalı.");
        return;
      }

      // Seçilen tokenin unlock tarihini greenLockData.json'dan çıkar
      const row = greenLockData.find(r => (r.ticker || r.Ticker) === token);
      if (!row) {
        alert("Seçili token greenLockData.json içinde bulunamadı.");
        return;
      }

      const baseUnlockDays = Number(row.baseUnlock);
      if (Number.isNaN(baseUnlockDays)) {
        alert("baseUnlock değeri hatalı.");
        return;
      }

      // row.date örn "2025-08-06" -> UTC kabul ediyoruz
      const startDate = new Date(`${row.date}T00:00:00Z`);
      const unlockDate = new Date(startDate.getTime() + baseUnlockDays * 24 * 60 * 60 * 1000);
      const dueAt = new Date(unlockDate.getTime() - remindInDays * 24 * 60 * 60 * 1000);

      // @ işaretini temizle
      const cleanUsername = String(twitterUsername).replace(/^@/, '').trim();

      const payload = {
        wallet: wallet.trim(),
        twitterUsername: cleanUsername,
        token: String(token).trim(),
        remindInDays,
        stakeAmount: Number(stakeAmount || 0),
        dueAt: dueAt.toISOString(), // <<< cron bununla çalışacak
      };

      console.log('subscribe payload ->', payload);

      const response = await fetch("https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        alert(`Error: ${result?.error || `HTTP ${response.status}`}`);
        return;
      }

      if (result?.ok || result?.success) {
        alert("Reminder saved!");
      } else {
        alert(`Error: ${result?.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error("Tweet error:", err);
      alert(`Tweet error: ${String(err?.message || err)}`);
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
          {maxReminders > 0 && <> &nbsp;|&nbsp; Rights: <strong>{maxReminders}</strong></>}
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
