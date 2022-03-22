const sdk = require("@defillama/sdk");
const axios = require("axios");
const apiInfo = require("./apiInfo.json");
const { stakings } = require("../helper/staking");
const { pool2s } = require("../helper/pool2");

const addresses = {
  elfi: "0x4da34f8264cb33a5c9f17081b9ef5ff6091116f4",
  el: "0x2781246fe707bb15cee3e5ea354e2154a2877b16",
  elStaking: "0xd804e198d25a1920522ca0094a670184a9c972d7",
  dai: "0x6b175474e89094c44da98b954eedeac495271d0f",
  usdt: "0xdac17f958d2ee523a2206206994597c13d831ec7",
  busd: "0x4fabb145d64652a948d72533023f6e7a623c7c53",
  elfiStaking: [
    "0xb41bcd480fbd986331eeed516c52e447b50dacb4",
    "0xCD668B44C7Cf3B63722D5cE5F655De68dD8f2750",
  ],
  bscElfi: "0x6C619006043EaB742355395690c7b42d3411E8c0",
  bscElfiStaking: ["0x73653254ED0F28D6E5A59191bbB38B06C899fBcA"],
  ethereumLPContracts: ["0x1f98407aaB862CdDeF78Ed252D6f557aA5b0f00d"],
  ethereumLPTokens: [
    "0xbde484db131bd2ae80e44a57f865c1dfebb7e31f",
    "0xc311faebe8802f9cfc91284016d1de9537ec66b7",
  ],
};
let prices;
let uniswapV3SubgraphCacheResponse, coinGeckoCacheResponse;

(async () => {
  [uniswapV3SubgraphCacheResponse, coinGeckoCacheResponse] = await Promise.all([
    axios.post(
      apiInfo["uniswap-v3-subgraph"].endpoint,
      apiInfo["uniswap-v3-subgraph"].body
    ),
    axios.get(apiInfo["coin-gecko"].endpoint),
  ]);

  prices = coinGeckoCacheResponse.data;
  prices.elfi = {};
  prices.elfi.usd = Number(
    uniswapV3SubgraphCacheResponse.data.data.daiPool.poolDayData[0].token1Price
  );
})();

async function getEthereumTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const reserves = (
    await axios.post(
      apiInfo["elyfi-subgraph"].endpoint,
      apiInfo["elyfi-subgraph"].body
    )
  ).data.data.reserves;

  const elStakingValue = (
    await sdk.api.abi.call({
      target: addresses.el,
      params: addresses.elStaking,
      abi: "erc20:balanceOf",
      block,
    })
  ).output;

  sdk.util.sumSingleBalance(balances, addresses.el, elStakingValue);
  console.log(`balances ${JSON.stringify(balances)}`);
  sdk.util.sumSingleBalance(balances, addresses.dai, reserves[0].totalDeposit);
  console.log(`balances ${JSON.stringify(balances)}`);
  sdk.util.sumSingleBalance(balances, addresses.usdt, reserves[1].totalDeposit);
  console.log(`balances ${JSON.stringify(balances)}`);

  return balances;
}

async function getBscTvl(timestamp, block, chainBlocks) {
  const balances = {};

  const reserves = (
    await axios.post(
      apiInfo["elyfi-subgraph-bsc"].endpoint,
      apiInfo["elyfi-subgraph-bsc"].body
    )
  ).data.data.reserves;

  sdk.util.sumSingleBalance(balances, addresses.busd, reserves[0].totalDeposit);

  return balances;
}

module.exports = {
  timetravel: false,
  ethereum: {
    tvl: getEthereumTvl, // el staking + dai deposit + usdt deposit
    staking: stakings(addresses.elfiStaking, addresses.elfi),
    pool2: pool2s(addresses.ethereumLPContracts, addresses.ethereumLPTokens),
  },
  bsc: {
    tvl: getBscTvl,
    staking: stakings(addresses.bscElfiStaking, addresses.bscElfi, "bsc"),
  },
}; // node test.js projects/elysia/index.js
