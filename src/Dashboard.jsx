import { useState } from 'react';
import ReminderForm from './components/ReminderForm';
import DailyVolume from './components/DailyVolume';
import GreenLockPeriod from './components/GreenLockPeriod';

export default function Dashboard() {
  const [showSection, setShowSection] = useState('subscribeUnlock');

  return (
    <>
      <div
        className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white p-4"
        style={{
          backgroundImage: "url('/images/nwbckgrnd.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        <div className="flex flex-col items-center justify-center text-center py-6">
          <h1 className="text-3xl italic font-bold mb-2">Virgenscan</h1>
          <p className="text-sm italic text-gray-300 mb-4">
            $JARVIS is live. <br />
            <span className="text-xs">Official CA: 0x1E562BF73369D1d5B7E547b8580039E1f05cCc56</span>
          </p>
          <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded mb-6">
            TRADE $JARVIS
          </button>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setShowSection('dailyVolume')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Daily Volume
            </button>
            <button
              onClick={() => setShowSection('greenLock')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Green Lock Period
            </button>
            <button
              onClick={() => setShowSection('subscribeUnlock')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Subscribe Unlock Period
            </button>
            <button className="bg-gray-700 text-white px-4 py-2 rounded-lg shadow cursor-not-allowed opacity-50">
              Agent Market (coming soon)
            </button>
            <button
              onClick={() => setShowSection('stakedAgents')}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg shadow"
            >
              Total Staked Agents
            </button>
          </div>
        </div>

        <div className="mt-10">
          {showSection === 'dailyVolume' && <DailyVolume />}
          {showSection === 'greenLock' && <GreenLockPeriod />}
          {showSection === 'subscribeUnlock' && <ReminderForm />}
          {showSection === 'agentMarket' && <p className="text-center">🤖 Agent Market section coming soon</p>}
          {showSection === 'stakedAgents' && <p className="text-center">📈 Total Staked Agents info will be shown here</p>}
        </div>
      </div>
    </>
  );
}
