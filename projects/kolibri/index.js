const axios = require("axios");
const BigNumber = require("bignumber.js");

const tvlUrl = 'https://kolibri-data.s3.amazonaws.com/mainnet/totals.json';

async function tvl() {
    return new BigNumber((await axios.get(tvlUrl)).data.liquidityPoolBalance);
}
async function pool2() {
    return new BigNumber((await axios.get(tvlUrl)).data.quipuswapFarmBalanceUSD);
}
module.exports = {
    methodology: 'TVL counts the XTZ tokens that are deposited to mint kUSD, kUSD in the liquidity pool, and value locked in Kolibri Protocol\'s farms. Borrowed tokens are not counted.',
    fetch: tvl,
    pool2: {
        fetch: pool2
    }
};