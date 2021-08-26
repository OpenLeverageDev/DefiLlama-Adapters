const sdk = require('@defillama/sdk');
const { sumTokensAndLPsSharedOwners } = require('../helper/unwrapLPs')

const aUSDC = "0xbcca60bb61934080951369a648fb03df4f96263c"
const cDAI = "0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643"
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48"
const SUSHI = "0x6B3595068778DD592e39A122f4f5a5cF09C90fE2"
const COMP = "0xc00e94Cb662C3520282E6f5717214004A7f26888"
const PENDLE = "0x808507121b80c02388fad14726482e061b8da827"
const SLP_ETHUSDC = "0x397FF1542f962076d0BFE58eA045FfA2d347ACa0"
const SLP_PENDLEETH = "0x37922c69b08babcceae735a31235c81f1d1e8e43"

const SLP_OT_aUSDC_21 = "0x8B758d7fD0fC58FCA8caA5e53AF2c7Da5F5F8De1"
const SLP_OT_aUSDC_22 = "0x0D8a21f2Ea15269B7470c347083ee1f85e6A723B"
const SLP_OT_cDAI_21 = "0x2C80D72af9AB0bb9D98F607C817c6F512dd647e6"
const SLP_OT_cDAI_22 = "0x4556C4488CC16D5e9552cC1a99a529c1392E4fe9"
const SLP_OT_ETHUSDC_22 = "0x72972b21ce425cfd67935e07c68e84300ce3f40f"
const SLP_OT_PEP_22 = "0xb124c4e18a282143d362a066736fd60d22393ef4"


const contracts = Object.keys({
    "0x33d3071cfa7404a406edB5826A11620282021745": "PendleAaveV2YieldTokenHolder",
    "0xb0aa68d8A0D56ae7276AB9E0E017965a67320c60": "PendleCompoundYieldTokenHolder",
    "0xa06634BE609153b77355BFD09F9d59345939C59b": "PendleSushiswapComplexYieldTokenHolder",

    "0x9e382E5f78B06631E4109b5d48151f2b3f326df0": "PendleAaveUSDCDec21Market",
    "0x8315BcBC2c5C1Ef09B71731ab3827b0808A2D6bD": "PendleAaveUSDCDec22Market",
    "0x944d1727d0b656f497e74044ff589871c330334f": "PendleCompoundDAIDec21Market",
    "0xB26C86330FC7F97533051F2F8cD0a90C2E82b5EE": "PendleCompoundDAIDec22Market",
    "0x79c05Da47dC20ff9376B2f7DbF8ae0c994C3A0D0": "PendleSLP-ETHUSDC/USDC22Market",

    "0x3483194Ac09097463CB426D8c0fc31c1476212f9": "PendleLpHolder_AaveUSDCDec21",
    "0x76A16d9325E9519Ef1819A4e7d16B168956f325F": "PendleLpHolder_AaveUSDCDec22",
    "0x5444070C9252BC6162A78fcFf66CF8Dcc3e729B8": "PendleLpHolder_CompoundDAIDec21",
    "0x2F16B22C839FA995375602562ba5dD15A22d349d": "PendleLpHolder_CompoundDAIDec22",
    "0xb69DA28b6B5DdF0fd4Fee4823A3Ffd2243A13C92": "PendleLpHolder_SLP-ETHUSDC/USDC22"
})
const stakingContracts = Object.keys({
    "0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5": "SingleStaking",

    "0x07C87cfE096c417212eAB4152d365F0F7dC6FCe4": "OldSushiOTAaveUSDCDec21Staking",
    "0xFb0e378b3eD6D7F8b73230644D945E28fd7F7b03": "OldSushiOTAaveUSDCDec22Staking",
    "0x071dc669Be57C1b3053F746Db20cb3Bf54383aeA": "OldSushiOTCompoundDAIDec21Staking",
    "0xa660c9aAa46b696Df01768E1D2d88CE2d5293778": "OldSushiOTCompoundDAIDec22Staking",

    "0xa26Da78fE6c8D4ba2f1779Fd36aEd994a8A50bee": "NewSushiOTAaveUSDCDec21Staking",
    "0x94A7432B811E29128964fba993f159928744e7C7": "NewSushiOTAaveUSDCDec22Staking",
    "0x31fC01529419Ee9623AFC5b65D7D72102D116e90": "NewSushiOTCompoundDAIDec21Staking",
    "0xfc3468Da89cb5bDF893242ece0324b51EA6482c6": "NewSushiOTCompoundDAIDec22Staking",

    "0x529c513DDE7968E19E79e38Ff94D36e4C3c21Eb7": "SushiOTSLP-ETHUSDC/USDC22Staking",
    "0x309d8Cf8f7C3340b50ff0ef457075A3c5792203f": "SushiOTSLP-PENDLEETH/PENDLE22Staking"
})
const OTTokens = Object.keys({
    "0x010a0288af52ed61e32674d82bbc7ddbfa9a1324": "OTAaveUSDCDec21",
    "0x8fcb1783bF4b71A51F702aF0c266729C4592204a": "OTAaveUSDCDec22",
    "0xe55e3b62005a2035d48ac0c41a5a9c799f04892c": "OTCompoundDAIDec21",
    "0x3D4e7F52efaFb9E0C70179B688FC3965a75BCfEa": "OTCompoundDAIDec22",
    "0x322D6c69048330247165231EB7848A5C80a48878": "OTSLP-ETHUSDC/USDC22Staking",
    "0xbF682bd31a615123D28d611b38b0aE3d2b675C2C": "OTSLP-PENDLEETH/PENDLE22Staking" 
})
const pool2Contracts = Object.keys({
    "0x685d32f394a5F03e78a1A0F6A91B4E2bf6F52cfE": "PendleSLP-PENDLEETH/PENDLE22Market",
    "0xab30397316d06572968d068d16f1e611c46474e2": "PendleLpHolder_SLP-PENDLEETH/PENDLE22",
    "0xbFD6b497dCa3e5D1fA4BbD52996d400980C29Eb7": "PendleSushiswapComplexYieldTokenHolder"
})
async function tvl(timestamp, block) {
    const balances = {}
    await sumTokensAndLPsSharedOwners(balances, [
        [USDC, false],
        [aUSDC, false],
        [cDAI, false],
        [SLP_ETHUSDC, true],
        [SLP_PENDLEETH, true],
        [SUSHI, false],
        [COMP, false]
    ], contracts, block)
    delete balances[PENDLE]
    return balances
}
async function staking(timestamp, block) {
    const staking = {}
    await sumTokensAndLPsSharedOwners(staking, [
        [USDC, false],
        [PENDLE, false],
        [SLP_OT_aUSDC_21, true],
        [SLP_OT_aUSDC_22, true],
        [SLP_OT_cDAI_21, true], 
        [SLP_OT_cDAI_22, true],
        [SLP_OT_ETHUSDC_22, true],
        [SLP_OT_PEP_22, true],
    ], stakingContracts, block)
    for (token of OTTokens) {
        delete staking[token.toLowerCase()]
    }
    return staking
}
async function pool2(timestamp, block) {
    const pool2 = {}
    await sumTokensAndLPsSharedOwners(pool2, [
        [SLP_PENDLEETH, true],
        [PENDLE, false],
        [SUSHI, false]
    ], pool2Contracts, block)

    return pool2
}
// node test.js projects/pendle/index.js
module.exports = {
    tvl,
    staking:{
        tvl: staking
    },
    pool2:{
        tvl: pool2
    },
    methodology: "Counts the collateral backing the yield tokens and USDC in the pendle markets. Staking TVL is just staked PENDLE on 0x07282F2CEEbD7a65451Fcd268b364300D9e6D7f5. Pool2 refers to the Pe,P pool at 0x685d32f394a5F03e78a1A0F6A91B4E2bf6F52cfE",
}
