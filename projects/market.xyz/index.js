const sdk = require("@defillama/sdk");
const abi = require("./abi");
const { default: BigNumber } = require("bignumber.js");
const { getCompoundV2Tvl } = require('../helper/compound')
const { getBlock } = require('../helper/getBlock.js')
const { transformPolygonAddress, transformFantomAddress } = require('../helper/portedTokens');

const fusePoolLensAddress = {
  polygon: '0x5a8A67541C024916B83943F4a1CEc372f3826DAa',
  fantom: '0x8e4129141bE6fFfAa6C1E520Fa407A0d022DD97e'
};
const fusePoolDirectoryAddress = {
  polygon: '0xA2a1cb88D86A939A37770FE5E9530E8700DEe56b',
  fantom: '0x0E7d754A8d1a82220432148C10715497a0569BD7'
};
const gasToken = '0x0000000000000000000000000000000000000000';
// node test.js projects/rari/onchain.js
async function getFusePools(timestamp, block, balances, borrowed, chain, transform = a => a) {
  const fusePools = (await sdk.api.abi.call({
    target: fusePoolDirectoryAddress[chain],
    block,
    abi: abi['getPublicPools'],
    chain
  })).output['1']

  const poolSummaries = (await sdk.api.abi.multiCall({
    target: fusePoolLensAddress[chain],
    abi: abi['getPoolSummary'],
    block,
    calls: fusePools.map((poolInfo) => ({
      params: [poolInfo[2]]
    })),
    chain
  })).output

  for (let summaryResult of poolSummaries) {
    if (summaryResult.success) {
      const summary = summaryResult.output
      // https://docs.rari.capital/fuse/#get-pools-by-account-with-data
      let amount;
      if(borrowed){
        amount = BigNumber(summary['1'])
      } else {
        amount = BigNumber(summary['0']).minus(summary['1'])
      }
      sdk.util.sumSingleBalance(balances, transform(gasToken), amount.toFixed(0))
    } else {
      const newBalances = await getCompoundV2Tvl(summaryResult.input.params[0], chain, a => a, undefined, undefined, borrowed)(timestamp, block, {})
      Object.entries(newBalances).forEach(entry => sdk.util.sumSingleBalance(balances, transform(entry[0]), entry[1]))
    }
  }
}
async function polygonTvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transform = await transformPolygonAddress()
  block = getBlock(timestamp, 'polygon', chainBlocks)
  await getFusePools(timestamp, block, balances, false, 'polygon', transform)
  return balances
}
async function polygonBorrowed(timestamp, block, chainBlocks) {
  const balances = {}
  const transform = await transformPolygonAddress()
  block = getBlock(timestamp, 'polygon', chainBlocks)
  await getFusePools(timestamp, block, balances, true, 'polygon', transform)
  return balances
}
async function fantomTvl(timestamp, block, chainBlocks) {
  const balances = {}
  const transform = await transformFantomAddress()
  block = getBlock(timestamp, 'fantom', chainBlocks)
  await getFusePools(timestamp, block, balances, false, 'fantom', transform)
  return balances
}
async function fantomBorrowed(timestamp, block, chainBlocks) {
  const balances = {}
  const transform = await transformFantomAddress()
  block = getBlock(timestamp, 'fantom', chainBlocks)
  await getFusePools(timestamp, block, balances, true, 'fantom', transform)
  return balances
}
module.exports = {
  timetravel: true,
  misrepresentedTokens: true,
  polygon: {
    tvl: polygonTvl,
    borrowed: polygonBorrowed
  },
  fantom: {
    tvl: fantomTvl,
    borrowed: fantomBorrowed
  }
};
