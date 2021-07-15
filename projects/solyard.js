const retry = require('./helper/retry')
const axios = require("axios");

async function fetch() {
  var response = await retry(async bail => await axios.get('https://solyard.finance/tvl'))

  return response.tvl || 0;
}

module.exports = {
  fetch
}
