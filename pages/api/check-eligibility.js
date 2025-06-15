const checkEligibility = async () => {
  const stakeAddress = '0xa72fB1A92A1489a986fE1d27573F4F6a1bA83dBe';
  const tokenAddress = '0x1E562BF73369D1d5B7E547b8580039E1f05cCc56';

  try {
    // HOLD MİKTARINI AL
    const holdRes = await fetch(
      `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${wallet}&tag=latest&apikey=MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ`
    );
    const holdData = await holdRes.json();
    const holdAmount = parseFloat(holdData.result) / 1e18;

    // STAKE MİKTARINI AL
    const stakeRes = await fetch(
      `https://api.basescan.org/api?module=account&action=tokenbalance&contractaddress=${tokenAddress}&address=${stakeAddress}&tag=latest&apikey=MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ`
    );
    const stakeData = await stakeRes.json();
    const stakeAmountRaw = stakeData.result;

    // Kullanıcının stake ettiği miktarı hesapla (filter değil, tokenbalance kullanılıyor)
    const userStakeRes = await fetch(
      `https://api.basescan.org/api?module=account&action=tokentx&address=${wallet}&contractaddress=${tokenAddress}&apikey=MA9MEETHKKBPXMBKSGRYE4E6CBIERXS3EJ`
    );
    const userStakeData = await userStakeRes.json();

    let stakedAmount = 0;
    for (let tx of userStakeData.result) {
      if (tx.to.toLowerCase() === stakeAddress.toLowerCase() &&
          tx.from.toLowerCase() === wallet.toLowerCase()) {
        stakedAmount += parseFloat(tx.value) / 1e18;
      }
    }

    const total = holdAmount + stakedAmount;

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
