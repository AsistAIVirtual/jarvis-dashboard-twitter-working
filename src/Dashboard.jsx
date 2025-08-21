
import { useState, useEffect } from 'react';
import ReminderForm from './components/ReminderForm';
import DailyVolume from './components/DailyVolume';
import GreenLockPeriod from './components/GreenLockPeriod';
import GenesisStaking from './components/GenesisStaking'; // ✅ new import

export default function Dashboard() {
  const [jarvisPrice, setJarvisPrice] = useState(null);
  const [virtualPrice, setVirtualPrice] = useState(null);

  useEffect(() => {
    async function fetchPrices() {
      try {
        const jarvisRes = await fetch('https://api.geckoterminal.com/api/v2/networks/base/pools/0xb00c5f0f9aa2f95057d7b9a18ad7d2d18f6ff298');
        const jarvisData = await jarvisRes.json();
        const jarvis = jarvisData.data.attributes.base_token_price_usd;
        setJarvisPrice(parseFloat(jarvis).toFixed(4));

        const virtualRes = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=virtual-protocol&vs_currencies=usd');
        const virtualData = await virtualRes.json();
        setVirtualPrice(parseFloat(virtualData["virtual-protocol"].usd).toFixed(4));
      } catch (error) {
        console.error("Failed to fetch token prices:", error);
      }
    }
    fetchPrices();
  }, []);

  const [showSection, setShowSection] = useState('subscribeUnlock');

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4 relative"
        style={{
          backgroundImage: "url('/images/nwbckgrnd.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 text-gray-200 text-base italic font-bold z-10">
          Just A Rather Virgen Intelligent System (J.A.R.V.I.S.)
        </div>

        <div className="flex flex-col items-center justify-center text-center py-6">
          <div className="flex justify-between items-center w-full mb-3 px-3">
            <h1 className="text-5xl italic font-bold">Virgenscan</h1>
            <a href="https://x.com/jarvisagentai" target="_blank" rel="noopener noreferrer">
              <img src="/images/xlogo.png" alt="X" className="w-14 h-14 hover:opacity-80 transition-opacity duration-200" />
            </a>
          </div>

          <div className="flex justify-center items-center space-x-6 mb-4">
            <div className="flex items-center space-x-2">
              <img src="/images/jarvis.png" alt="JARVIS" className="w-9 h-9" />
              <span className="text-sm">$JARVIS: {jarvisPrice ? `$${jarvisPrice}` : "Loading..."}</span>
            </div>
            <div className="flex items-center space-x-2">
              <img src="/images/virtual.png" alt="Virtual" className="w-9 h-9" />
              <span className="text-sm">Virtual: {virtualPrice ? `$${virtualPrice}` : "Loading..."}</span>
            </div>
          </div>

          <p className="text-sm italic text-gray-300 mb-7">
            $JARVIS is live. <br />
            <span className="text-xs">Official CA: 0x1E562BF73369D1d5B7E547b8580039E1f05cCc56</span>
          </p>

          <a
            href="https://app.virtuals.io/virtuals/28325"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded mb-6 inline-block"
          >
            TRADE $JARVIS
          </a>

          <div className="flex flex-wrap justify-center gap-3">
            <button onClick={() => setShowSection('dailyVolume')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow">Daily Volume</button>
            <button onClick={() => setShowSection('greenLock')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow">Green Lock Period</button>
            <button onClick={() => setShowSection('subscribeUnlock')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow">Subscribe Unlock Period</button>
            <button onClick={() => setShowSection('genesisStaking')} className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow">Genesis Staking</button>
          </div>
        </div>

        <div className="mt-10">
          {showSection === 'dailyVolume' && <DailyVolume />}
          {showSection === 'greenLock' && <GreenLockPeriod />}
          {showSection === 'subscribeUnlock' && <ReminderForm />}
          {showSection === 'genesisStaking' && <GenesisStaking />}
        </div>
      </div>
    </>
  );
}
