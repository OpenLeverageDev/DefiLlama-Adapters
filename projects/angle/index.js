const sdk = require("@defillama/sdk")
const BigNumber = require('bignumber.js')
const {pool2s} = require('../helper/pool2')

// Registry will be released in next sdk of Angle + graphql endpoint to come
const collaterals = {
    'dai': '0x6b175474e89094c44da98b954eedeac495271d0f', 
    'usdc': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', 
    'frax': '0x853d955acef822db058eb8505911ed77f175b99e', 
    'fei': '0x956F47F50A910163D8BF957Cf5846D573E7f87CA', 
}
const agEUR = {
    contract: '0x1a7e4e63778B4f12a199C062f3eFdD288afCBce8', 
    stableMasterFront: '0x5adDc89785D75C86aB939E9e15bfBBb7Fc086A87',
    poolManagers: {
        'dai': '0xc9daabC677F3d1301006e723bD21C60be57a5915', // DAI
        'usdc': '0xe9f183FC656656f1F17af1F2b0dF79b8fF9ad8eD', // USDC
        'fei': '0x53b981389Cfc5dCDA2DC2e903147B5DD0E985F44', // FEI
        'frax': '0x6b4eE7352406707003bC6f6b96595FD35925af48', // FRAX

    }
}
const agTokens = [agEUR]

const poolManagers_abi = { 
    "getTotalAsset": {
      "inputs": [],
      "name": "getTotalAsset",
      "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
      "stateMutability": "view",
      "type": "function"
    }
}
  
async function tvl(timestamp, block, chainBlocks) {
    // Building the api calls using the poolManager object of each agToken. Could also read the poolManager.token() but abi not yet available
    const poolManagersBalanceOf_calls = agTokens.map(t => {
        return Object.entries(t.poolManagers).map( ([key, value]) => ({ target: collaterals[key], params: value}))
    }).flat()
    /*
    // Call erc20:balanceOf only gets available assets and not those lent to strategies
    let collateralBalances = await sdk.api.abi.multiCall({
        calls: poolManagers_calls,
        abi: 'erc20:balanceOf',
        block: chainBlocks['ethereum'],
        chain: 'ethereum'
    })
    //const balances = {}
    //sdk.util.sumMultiBalanceOf(balances, collateralBalances)
    */
   
    const poolManagersTotalAsset_calls = agTokens.map(t => {
        return Object.entries(t.poolManagers).map( ([key, value]) => ({ target: value}))
    }).flat()
    let collateralBalances = await sdk.api.abi.multiCall({
        calls: poolManagersTotalAsset_calls,
        abi: poolManagers_abi['getTotalAsset'],
        block: chainBlocks['ethereum'],
        chain: 'ethereum'
    })

    // Accumulate collateral to balances
    const balances = {}
    collateralBalances.output.forEach(bal => {
        const token = poolManagersBalanceOf_calls.find(t => bal.input.target == t.params).target
        balances[token] = BigNumber(balances[token] || 0).plus(BigNumber(bal.output)).toFixed();
    })

    return balances
}

// Pool2 staking 
const stk_agEUR_FEI_univ2 = '0xbcb307f590972b1c3188b7916d2969cf75309dc6'
const stk_sanFRAX_EUR = '0xbb9485e2b9b0da40db3874a144700e31bd9c40c2'
const stk_sanFEI_EUR = '0x3d7e670d105e8fbcae3bf2bfc54324302cdb6ad5'
const stk_FRAX_agEUR = '0x4121a258674e507c990cdf390f74d4ef27592114'
const stk_FEI_agEUR  = '0x98fdbc5497599eff830923ea1ee152adb9a4cea5'
const stakingContracts = [stk_agEUR_FEI_univ2, stk_sanFRAX_EUR, stk_sanFEI_EUR, stk_FRAX_agEUR, stk_FEI_agEUR]
const agEUR_FEI_univ2 = '0xf89ce5ed65737da8440411544b0499c9fad323b2 '
const sanFRAX_EUR = '0xb3b209bb213a5da5b947c56f2c770b3e1015f1fe'
const sanFEI_EUR = '0x5d8d3ac6d21c016f9c935030480b7057b21ec804'
const FRAX_agEUR = '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
const FEI_agEUR  = '0x31429d1856ad1377a8a0079410b297e1a9e214c2'
const lpTokens = [agEUR_FEI_univ2, sanFRAX_EUR, sanFEI_EUR, FRAX_agEUR, FEI_agEUR]

module.exports = {
    ethereum: {
        tvl: () => ({}), 
        pool2: pool2s(stakingContracts, lpTokens, "ethereum", undefined),
    },
    methodology: `TVL is retrieved on chain by querying balances of collaterals held by poolManagers of each agToken stablecoin (not only balanceOf which returns available assets, but getTotalAssets which also accounts for assets lent to strategies). Graph endpoint soon available. Otherwise could be approximated by the totalMintedStablecoins, agToken.totalSupply multiplied by the collateral ratio, stableMaster.getCollateralRatio. `, 
}