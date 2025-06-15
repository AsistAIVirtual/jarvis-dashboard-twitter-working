import React, { useState } from 'react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function DailyVolume() {
  const [wallet, setWallet] = useState('');
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [isEligible, setIsEligible] = useState(false);
  const [volumeData, setVolumeData] = useState(null);

  const checkEligibility = async () => {
    const stakeAddress = '0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe';
    const tokenAddress = '0x1E562BF73369D1d5B7E547b8580039E1f05cCc56';

    try {
      const holdRes = await fetch(
        `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${wallet}&tag=latest&apikey=MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ`
      );
      const holdData = await holdRes.json();
      const holdAmount = parseFloat(holdData.result) / 1e18;

      const stakeRes = await fetch(
        `https://api.basescan.org/api?module=account&action=tokentx&address=${wallet}&contractaddress=${tokenAddress}&startblock=0&endblock=99999999&sort=asc&apikey=MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ`
      );
      const stakeTxData = await stakeRes.json();
      let stakeAmount = 0;

      for (let tx of stakeTxData.result) {
        if (
          tx.to.toLowerCase() === stakeAddress.toLowerCase() &&
          tx.from.toLowerCase() === wallet.toLowerCase()
        ) {
          stakeAmount += parseFloat(tx.value) / 1e18;
        }
      }

      const total = holdAmount + stakeAmount;
      if (total >= 100000) {
        setIsEligible(true);
      } else {
        setIsEligible(false);
        alert('You must stake or hold at least 100,000 $JARVIS');
      }
    } catch (err) {
      console.error(err);
      alert('Eligibility check failed.');
    }
  };

  const checkVolume = async () => {
    if (!wallet || !startDate || !endDate) return;
    try {
      const virtualTokenAddress = '0x0b3e328455c4059eeb9e3f84b5543f74e24e7e1b';
      const startTimestamp = Math.floor(startDate.setHours(0, 0, 0, 0) / 1000);
      const endTimestamp = Math.floor(endDate.setHours(23, 59, 59, 999) / 1000);

      const txRes = await fetch(
        `https://api.basescan.org/api?module=account&action=tokentx&address=${wallet}&contractaddress=${virtualTokenAddress}&startblock=0&endblock=99999999&sort=asc&apikey=MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ`
      );
      const txData = await txRes.json();

      let totalAmount = 0;
      let txCount = 0;
      for (let tx of txData.result) {
        const timestamp = parseInt(tx.timeStamp);
        if (timestamp >= startTimestamp && timestamp <= endTimestamp) {
          totalAmount += parseFloat(tx.value) / 1e18;
          txCount++;
        }
      }

      const priceRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=virtual-protocol&vs_currencies=usd');
      const priceData = await priceRes.json();
      const price = priceData['virtual-protocol']?.usd || 0;
      const usdValue = totalAmount * price;

      setVolumeData({ totalAmount, usdValue, txCount });
    } catch (err) {
      console.error(err);
      alert('Volume check failed.');
    }
  };

  return (
    <div className="flex flex-col items-center mt-10 text-white">
      <h1 className="text-2xl font-bold mb-2">Daily Volume Checker</h1>
      <p className="text-sm text-gray-300 mb-4">
        You must stake or hold at least 100,000 $JARVIS
      </p>
      <input
        type="text"
        placeholder="Enter Wallet Address"
        value={wallet}
        onChange={(e) => setWallet(e.target.value)}
        className="mb-4 p-2 rounded bg-gray-900 text-white border border-gray-600 w-96"
      />
      <div className="flex gap-2 mb-4">
        <DatePicker
          placeholderText="dd.mm.yyyy"
          dateFormat="dd.MM.yyyy"
          selected={startDate}
          onChange={(date) => setStartDate(date)}
          className="bg-gray-900 text-white border border-gray-600 p-2 rounded"
        />
        <DatePicker
          placeholderText="dd.mm.yyyy"
          dateFormat="dd.MM.yyyy"
          selected={endDate}
          onChange={(date) => setEndDate(date)}
          className="bg-gray-900 text-white border border-gray-600 p-2 rounded"
        />
      </div>
      <div className="flex gap-2 mb-4">
        <button
          onClick={checkEligibility}
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded"
        >
          Check Stake/Hold
        </button>
        <button
          onClick={checkVolume}
          disabled={!isEligible}
          className={`$ {
            isEligible ? 'bg-green-600 hover:bg-green-700' : 'bg-gray-600 cursor-not-allowed'
          } text-white font-semibold py-2 px-4 rounded`}
        >
          Check Volume
        </button>
      </div>
      {volumeData && (
        <div className="mt-6 text-center">
          <p className="text-lg font-semibold">Total Volume: {volumeData.totalAmount.toFixed(4)} VIRTUAL</p>
          <p className="text-md text-gray-300">Transactions: {volumeData.txCount}</p>
          <p className="text-md text-gray-300">≈ ${volumeData.usdValue.toFixed(2)} USD</p>
        </div>
      )}
    </div>
  );
}
