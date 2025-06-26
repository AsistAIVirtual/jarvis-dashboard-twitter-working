
import React, { useEffect, useState } from 'react';
import genesisTokens from '../data/genesisMarketTokens.json';

export default function GenesisMarket() {
  const [tokenData, setTokenData] = useState([]);

  useEffect(() => {
    async function fetchTokenData() {
      const fetched = await Promise.all(genesisTokens.map(async (token) => {
        try {
          const response = await fetch(`https://api.geckoterminal.com/api/v2/networks/base/pools/${token.lpAddress}`);
          const data = await response.json();
          return {
            ...token,
            price: data.data.attributes.base_token_price_usd,
            change: data.data.attributes.price_change_percentage.h24,
            volume: data.data.attributes.volume_usd.h24,
            fdv: data.data.attributes.fdv_usd,
            liquidity: data.data.attributes.total_liquidity_usd,
          };
        } catch {
          return { ...token, price: 0, change: 0, volume: 0, fdv: 0, liquidity: 0 };
        }
      }));
      setTokenData(fetched);
    }
    fetchTokenData();
  }, []);

  return (
    <div className="p-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tokenData.map((token, index) => (
          <a key={index} href={token.appVirtualsLink} target="_blank" rel="noopener noreferrer">
            <div className="bg-black bg-opacity-70 text-white p-4 rounded-xl shadow-md hover:shadow-xl transition">
              <div className="text-lg font-bold">{token.ticker}</div>
              <div>Price: ${parseFloat(token.price).toFixed(4)}</div>
              <div>FDV: ${parseFloat(token.fdv).toLocaleString()}</div>
              <div>24h %: {parseFloat(token.change).toFixed(2)}%</div>
              <div>24h Volume: ${parseFloat(token.volume).toLocaleString()}</div>
              <div>Liquidity: ${parseFloat(token.liquidity).toLocaleString()}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}
