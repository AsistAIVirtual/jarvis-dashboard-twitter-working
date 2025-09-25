import { useState } from 'react';
import tokenList from '../data/greenLockTokens.json';
import greenLockData from '../data/greenLockData.json';

const TOKEN_CONTRACT = "0x1E562BF73369D1d5B7E547b8580039E1f05cCc56"; // $JARVIS
const STAKE_ADDRESS = "0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe"; // stake contract
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

  const [unlockPreview, setUnlockPreview] = useState(null);
  const [duePreview, setDuePreview] = useState(null);

  function computePreviews(tkr, daysStr) {
    try {
      const r = greenLockData.find(x => (x.ticker || x.Ticker) === tkr);
      if (!r) { setUnlockPreview(null); setDuePreview(null); return; }
      const base = Number(r.baseUnlock);
      if (!Number.isFinite(base)) { setUnlockPreview(null); setDuePreview(null); return; }

      const start = new Date(`${r.date}T00:00:00Z`);
      let unlock = new Date(start.getTime() + base * 86400000);

      if (r.launchTime && /^\d{1,2}:\d{2}$/.test(r.launchTime)) {
        const [h, m] = r.launchTime.split(':').map(Number);
        unlock = new Date(Date.UTC(
          unlock.getUTCFullYear(), unlock.getUTCMonth(), unlock.getUTCDate(), h, m, 0, 0
        ));
      }

      const d = Number(daysStr ?? 0);
      if (!Number.isFinite(d) || d < 0) { setUnlockPreview(unlock); setDuePreview(null); return; }

      const raw = new Date(unlock.getTime() - d * 86400000);
      const due = new Date(Date.UTC(
        raw.getUTCFullYear(), raw.getUTCMonth(), raw.getUTCDate(), 9, 0, 0, 0
      ));

      setUnlockPreview(unlock);
      setDuePreview(due);
    } catch {
      setUnlockPreview(null);
      setDuePreview(null);
    }
  }

  // Stake kontrolü (wallet balance + stake balance)
  const checkStake = async () => {
    try {
      if (!wallet) { alert("First enter your wallet address."); return; }

      // Wallet balance
      const holdRes = await fetch(
        `${BASESCAN_API}?module=account&action=tokenbalance&contractaddress=${TOKEN_CONTRACT}&address=${wallet}&tag=latest&apikey=${API_KEY}`
      );
      const holdData = await holdRes.json();
      const holdAmount = parseFloat(holdData.result) / 1e18;

      // Stake balance (stake contract)
      const stakeRes = await fetch(
        `${BASESCAN_API}?module=account&action=tokenbalance&contractaddress=${TOKEN_CONTRACT}&address=${STAKE_ADDRESS}&tag=latest&apikey=${API_KEY}`
      );
      const stakeData = await stakeRes.json();
      const stakeBalance = parseFloat(stakeData.result) / 1e18;

      const total = holdAmount + stakeBalance;
      setStakeAmount(total);

      const rights = total >= 100000 ? 3 : 1;
      setMaxReminders(rights);
      setIsEligible(true);
      alert(`Detected: ${total.toLocaleString()} JARVIS. Rights: ${rights}.`);
    } catch (err) {
      console.error(err);
      alert("Failed to check stake.");
    }
  };

  const handleSubmit = async () => {
    try {
      if (!wallet || !twitterUsername || !token) {
        alert("Wallet, Twitter username and Token selection is mandatory.");
        return;
      }
      const remindInDays = Number(reminderCount ?? 0);
      if (!Number.isFinite(remindInDays) || remindInDays < 0) {
        alert("Days Before Unlock must be numeric and >= 0.");
        return;
      }

      const row = greenLockData.find(x => (x.ticker || x.Ticker) === token);
      if (!row) { alert("The selected token was not found in greenLockData.json."); return; }
      const baseUnlockDays = Number(row.baseUnlock);
      if (!Number.isFinite(baseUnlockDays)) { alert("baseUnlock value is incorrect."); return; }

      const startUTC = new Date(`${row.date}T00:00:00Z`);
      let unlockDate = new Date(startUTC.getTime() + baseUnlockDays * 86400000);
      if (row.launchTime && /^\d{1,2}:\d{2}$/.test(row.launchTime)) {
        const [h, m] = row.launchTime.split(':').map(Number);
        unlockDate = new Date(Date.UTC(
          unlockDate.getUTCFullYear(), unlockDate.getUTCMonth(), unlockDate.getUTCDate(), h, m, 0, 0
        ));
      }

      const rawDue = new Date(unlockDate.getTime() - remindInDays * 86400000);
      const dueAt = new Date(Date.UTC(
        rawDue.getUTCFullYear(), rawDue.getUTCMonth(), rawDue.getUTCDate(), 9, 0, 0, 0
      ));
      if (dueAt.getTime() <= Date.now()) {
        alert("The day you selected is in the past. Choose a larger number of days.");
        return;
      }

      const cleanUsername = String(twitterUsername).replace(/^@/, '').trim();

      const payload = {
        wallet: wallet.trim(),
        twitterUsername: cleanUsername,
        token: String(token).trim(),
        remindInDays,
        stakeAmount: Number(stakeAmount || 0),
        dueAt: dueAt.toISOString(),
      };

      console.log('subscribe payload ->', payload);

      const response = await fetch("https://vercel-twitter-reminder-bot.vercel.app/api/subscribe-tweet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json().catch(() => ({}));
      if (!response.ok) { alert(`Error: ${result?.error || `HTTP ${response.status}`}`); return; }

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
          <label className="block mb-1 text-sm">Your X(Twitter) Username</label>
          <input
            type="text"
            value={twitterUsername}
            onChange={(e) => setTwitterUsername(e.target.value)}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="username"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Days Before Unlock</label>
          <input
            type="number"
            value={reminderCount}
            onChange={(e) => { setReminderCount(e.target.value); computePreviews(token, e.target.value); }}
            className="w-full p-2 rounded bg-gray-800 text-white border border-gray-600"
            placeholder="e.g. 3"
            min="0"
          />
        </div>

        <div className="mb-4">
          <label className="block mb-1 text-sm">Select Token</label>
          <select
            value={token}
            onChange={(e) => { setToken(e.target.value); computePreviews(e.target.value, reminderCount); }}
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

        {token && reminderCount !== '' && (
          <div className="mb-3 text-xs text-gray-300">
            <div>Unlock (UTC): <strong>{unlockPreview ? unlockPreview.toUTCString() : '—'}</strong></div>
            <div>Reminder (UTC): <strong>{duePreview ? duePreview.toUTCString() : '—'}</strong></div>
          </div>
        )}

        <div className="mb-2 text-sm text-gray-300">
          Detected Stake: <strong>{stakeAmount.toLocaleString()}</strong> tokens
          {maxReminders > 0 && <> &nbsp;|&nbsp; Rights: <strong>{maxReminders}</strong></>}
        </div>

        <div className="flex justify-between items-center gap-2">
          <button onClick={checkStake} className="w-1/2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded">
            Check Stake
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isEligible}
            className={`w-1/2 ${isEligible ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'} text-white font-semibold py-2 px-4 rounded`}
          >
            Subscribe
          </button>
        </div>
      </div>
    </div>
  );
}
