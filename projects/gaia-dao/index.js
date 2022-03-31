const { ohmTvl } = require("../helper/ohm");

const gaia = "0x9f6aEDcA032b1092E08b848FC9D6F29139370837";
const stakingAdd = "0x89884B045Ed93067b28C2554a9CB877a41a8fA73";
const treasury = "0x15E5A559e67Cb6CAB391821635B351D43E2371b2";
const treasuryTokens = [
    ["0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664", false], // USDC
    ["0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7", false], // WAVAX
    ["0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab", false], // WETH
    ["0x6Ca7AAc252FeD4894132Ae6E6d96bFc739d9FC3a", true] // GAIA USDC JLP
];

module.exports = {
    ...ohmTvl(treasury, treasuryTokens, "avax", stakingAdd, gaia)
}