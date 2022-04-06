const { calculateUsdUniTvl } = require('../helper/getUsdUniTvl')

const FACTORIES = "0x95f506E72777efCB3C54878bB4160b00Cd11cd84"

const NATIVE_TOKEN_WASTAR = "0xEcC867DE9F5090F55908Aaa1352950b9eed390cD"

const TOKENS = {
    WASTAR: NATIVE_TOKEN_WASTAR,
    WETH: "0x81ECac0D6Be0550A00FF064a4f9dd2400585FE9c",
    WBTC: "0xad543f18cFf85c77E140E3E5E3c3392f6Ba9d5CA",
    WBNB: "0x7f27352D5F83Db87a5A3E00f4B07Cc2138D8ee52",
    WSDN: "0x75364D4F779d0Bd0facD9a218c67f87dD9Aff3b4",
    MATIC: "0xdd90E5E87A2081Dcf0391920868eBc2FFB81a1aF",
    USDC: "0x6a2d262D56735DbA19Dd70682B39F6bE9a931D98",
    USDT: "0x3795C36e7D12A8c252A20C5a7B455f7c57b60283",
    BUSD: "0x4Bf769b05E832FCdc9053fFFBC78Ca889aCb5E1E",
    DAI: "0x6De33698e9e9b787e09d3Bd7771ef63557E148bb",
    ASX: "0x5D1af739FD538D363Fd61a59d3CBb7B70784A3AC",
}

const astarTvl = calculateUsdUniTvl(
    FACTORIES,
    "astar",
    NATIVE_TOKEN_WASTAR,
    [
        ...Object.values(TOKENS)
    ], "astar")

module.exports = {
    methodology: "Astar Exchange Tvl Calculation",
    astar: {
        tvl: astarTvl
        },
}
