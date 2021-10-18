const retry = require('async-retry')
const axios = require("axios");

async function fetch() {
    const response = (
      await retry(async () => await axios.get("https://api.synthetify.io/stats/mainnet"))
    ).data;
    const index = response.length - 1
    return response[index].collateralAll + response[index].synthetic
  }

  const tvl = fetch()

  module.exports = {
      tvl,
      methodology:
        'To obtain TVL of Synthetify we must add all colaterals which was deposited.'
  }