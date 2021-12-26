const BigNumber = require("bignumber.js");
const { fetchURL } = require("../helper/utils");
const {
  getUniqStartOfTodayTimestamp,
} = require("../helper/getUniSubgraphVolume");

const endpoints = {
  ethereum: (date) =>
    `https://api-v2.bancor.network/history/volume?interval=hour&start_date=${date}`,
};

const graphs = (chain) => async () => {
  let res;
  switch (chain) {
    case "ethereum":
      res = await fetchURL(
        endpoints.ethereum(getUniqStartOfTodayTimestamp() * 86400)
      );
    default:
      res = await fetchURL(
        endpoints.ethereum(getUniqStartOfTodayTimestamp() * 86400)
      );
  }

  const todayHourlyData = res?.data?.data;

  return {
    dailyVolume: todayHourlyData
      .reduce((acc, { usd }) => acc.plus(BigNumber(usd)), new BigNumber(0))
      .toNumber(),
    hourlyVolume: new BigNumber(
      todayHourlyData[todayHourlyData.length - 1]?.usd
    ).toNumber(),
  };
};

module.exports = {
  ethereum: graphs("ethereum"),
};
