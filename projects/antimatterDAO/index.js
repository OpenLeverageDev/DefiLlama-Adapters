const sdk = require("@defillama/sdk");
const abi = require("./abi.json");

const antimatterStakingContract = "0xCB8429f22541E8F5cd8ea6c20BFFdcE7cDA65227";
const dualInvestContract = "0x7E45149820Fa33B66DCD3fd57158A0E755A67a16";
const dualInvestManagerAddress = "0x32275702f5A47Dcd89705c1ea4d47E99517b0e1a";
const bscBTCContract = "0x7130d2A12B9BCbFAe4f2634d864A1Ee1Ce3Ead9c";
const bscUSDTContract = "0x55d398326f99059fF775485246999027B3197955";

const factory = "0x90183C741CC13195884B6E332Aa0ac1F7c1E67Fa"

async function bullbearTVL(block, chain, usdToken) {
  const balances = {};
  const contractsLength = await sdk.api.abi.call({
    target:factory,
    abi: abi.bullbear.length,
    block,
    chain,
  })
  const calls = [];
  for(let i=0; i<Number(contractsLength.output); i++){
    calls.push({
      target: factory,
      params: [i]
    })
  }
  const [allCalls, allPuts] = await Promise.all([
    sdk.api.abi.multiCall({
      calls,
      block,
      abi: abi.bullbear.allCalls,
      chain,
    }),
    sdk.api.abi.multiCall({
      calls,
      block,
      abi: abi.bullbear.allPuts,
      chain,
    })
  ])
  const contracts = allCalls.output.concat(allPuts.output).map(result=>result.output)
  const underlying = await sdk.api.abi.multiCall({
    calls: contracts.map(contract=>({
      target: contract
    })),
    block,
    abi: abi.bullbear.underlying,
    chain,
  });
  const underlyingBalances = await sdk.api.abi.multiCall({
    calls: underlying.output.map(call=>[{
      target: call.output,
      params: [call.input.target]
    },{
      target: usdToken,
      params: [call.input.target]
    }]).flat(),
    block,
    abi: "erc20:balanceOf",
    chain,
  });
  sdk.util.sumMultiBalanceOf(balances, underlyingBalances, true)
  console.log('balances', balances)
  return balances
}

async function ethBullbearTVL(block){
  return await bullbearTVL(block, 'ethereum', '0xdac17f958d2ee523a2206206994597c13d831ec7')
}

async function bscBullbearTVL(block){
  return await bullbearTVL(block, 'bsc', '0xe9e7cea3dedca5984780bafc599bd69add087d56')
}

async function arbitrumBullbearTVL(block){
  return await bullbearTVL(block, 'arbitrum', '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9')
}

async function avaxBullbearTVL(block){
  return await bullbearTVL(block, 'avax', '0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664')
}

const dualInvestTVL = async (bscBlock) => {
  const balances = {}
  const usdtValue = await sdk.api.abi.multiCall({
    target: bscUSDTContract,
    calls: [{
      target: bscUSDTContract,
      params: dualInvestContract
    },
      {
        target: bscUSDTContract,
        params: dualInvestManagerAddress
      }],
    params: dualInvestContract,
    abi: "erc20:balanceOf",
    block: bscBlock,
    chain: "bsc"
  });

  const btcValue = await sdk.api.abi.multiCall({
    target: bscUSDTContract,
    calls: [{
      target: bscBTCContract,
      params: dualInvestContract
    },
      {
        target: bscBTCContract,
        params: dualInvestManagerAddress
      }],
    params: dualInvestContract,
    abi: "erc20:balanceOf",
    block: bscBlock,
    chain: "bsc"
  });
  sdk.util.sumMultiBalanceOf(balances, usdtValue, true);
  sdk.util.sumMultiBalanceOf(balances, btcValue, true);

  return balances;
};

const stakingTVL = async (ethBlock) => {
  const { output: staked } = await sdk.api.abi.call({
    target: antimatterStakingContract,
    abi: abi["TVL"],
    block: ethBlock,
    chain: "ethereum"
  });
  return stakingTVL;
};

async function bscTVL(block){
  const dualinvestTVL = await dualInvestTVL(block)
  const bullbearTvl = await bscBullbearTVL(block)
  return Object.assign(dualinvestTVL, bullbearTvl)
}

avaxBullbearTVL('latest')
module.exports = {
  methodology: "Data is retrieved from the api at https://dex-api.adax.pro/",
  ethereum: {
    staking: stakingTVL, // dao staking
    tvl: ethBullbearTVL
  },
  bsc: {
    tvl: bscTVL
  },
  arbitrum: {
    tvl: arbitrumBullbearTVL
  },
  avax: {
    tvl: avaxBullbearTVL
  },
  timetravel: true,
};