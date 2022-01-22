const {
  sumTokensAndLPsSharedOwners,
  sumTokens,
} = require("../helper/unwrapLPs");
const { chainExports } = require("../helper/exports");
const { getBlock } = require("../helper/getBlock");
const { requery } = require("../helper/requery");
const sdk = require("@defillama/sdk");

// Used to represent nUSD.
const TUSD = "0x0000000000085d4780b73119b644ae5ecd22b376";
// Used to represent nETH.
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const NFD = "0xdfdb7f72c1f195c5951a234e8db9806eb0635346";
const FRAX = "0x853d955acef822db058eb8505911ed77f175b99e";
const USDC = "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48";
const USDT = "0xdac17f958d2ee523a2206206994597c13d831ec7";
const GOHM = "0x0ab87046fbb341d058f17cbc4c1133f25a20a52f";
const SOLAR = "moonriver:0x6bd193ee6d2104f14f94e2ca6efefae561a4334b";

const DATA = {
  bsc: {
    stables: [
      "0xe9e7cea3dedca5984780bafc599bd69add087d56", // BUSD
      "0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d", // USDC
      "0x55d398326f99059ff775485246999027b3197955", // USDT
    ],
    nusd: "0x23b891e5c62e0955ae2bd185990103928ab817b3",
    pool: "0x28ec0B36F0819ecB5005cAB836F4ED5a2eCa4D13",
    legacy: {
      metapool: "0x930d001b7efb225613aC7F35911c52Ac9E111Fa9",
      basepool: "0x938aFAFB36E8B1AB3347427eb44537f543475cF9",
    },
    tokens: [
      "0xaa88c603d142c371ea0eac8756123c5805edee03", // DOG
      "0x5f4bde007dc06b867f86ebfe4802e34a1ffeed63", // HIGH
      "0x130025ee738a66e691e6a7a62381cb33c6d9ae83", // JUMP
      "0x0fe9778c005a5a6115cbe12b0568a2d50b765a51", // NFD
    ],
  },
  harmony: {
    stables: [
      "0xef977d2f931c1978db5f6747666fa1eacb0d0339", // DAI
      "0x985458e523db3d53125813ed68c274899e9dfab4", // USDC
      "0x3c2b8be99c50593081eaa2a724f0b8285f5aba8f", // USDT
    ],
    ethPool: "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
    neth: "0x0b5740c6b4a97f90ef2f0220651cca420b868ffb",
    // 1ETH
    weth: "0x6983d1e6def3690c4d616b13597a09e6193ea013",
    nusd: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    pool: "0x3ea9B0ab55F34Fb188824Ee288CeaEfC63cf908e",
    legacy: {
      metapool: "0x555982d2E211745b96736665e19D9308B615F78e",
      basepool: "0x080f6aed32fc474dd5717105dba5ea57268f46eb",
    },
    tokens: [
      "0x1852f70512298d56e9c8fdd905e02581e04ddb2a", // synFRAX
      "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00", // gOHM
      "0x0b5740c6b4a97f90ef2f0220651cca420b868ffb", // nETH
    ],
  },
  ethereum: {
    stables: [
      "0x6b175474e89094c44da98b954eedeac495271d0f", // DAI
      "0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48", // USDC
      "0xdac17f958d2ee523a2206206994597c13d831ec7", // USDT
    ],
    pool: "0x1116898DdA4015eD8dDefb84b6e8Bc24528Af2d8",
  },
  polygon: {
    stables: [
      "0x8f3cf7ad23cd3cadbd9735aff958023239c6a063", // DAI
      "0x2791bca1f2de4661ed88a30c99a7a9449aa84174", // USDC
      "0xc2132d05d31c914a87c6611c10748aeb04b58e8f", // USDT
    ],
    nusd: "0xb6c473756050de474286bed418b77aeac39b02af",
    pool: "0x85fCD7Dd0a1e1A9FCD5FD886ED522dE8221C3EE5",
    legacy: {
      basepool: "0x3f52E42783064bEba9C1CFcD2E130D156264ca77",
      metapool: "0x96cf323e477ec1e17a4197bdcc6f72bb2502756a",
    },
    tokens: [
      "0xb6c473756050de474286bed418b77aeac39b02af", // nUSD
      "0xd8ca34fd379d9ca3c6ee3b3905678320f5b45195", // gOHM
      "0xeee3371b89fc43ea970e908536fcddd975135d8a", // DOG
      "0x48a34796653afdaa1647986b33544c911578e767", // synFRAX
    ],
  },
  avax: {
    stables: [
      "0xd586E7F844cEa2F87f50152665BCbc2C279D8d70", // DAI
      "0xA7D7079b0FEaD91F3e65f86E8915Cb59c1a4C664", // USDC
      "0xc7198437980c041c805a1edcba50c1ce5db95118", // USDT
    ],
    nusd: "0xCFc37A6AB183dd4aED08C204D1c2773c0b1BDf46",
    pool: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    neth: "0x19e1ae0ee35c0404f835521146206595d37981ae",
    legacy: {
      basepool: "0xE55e19Fb4F2D85af758950957714292DAC1e25B2",
      metapool: "0xf44938b0125a6662f9536281ad2cd6c499f22004",
    },
    ethPool: "0x77a7e60555bC18B4Be44C181b2575eee46212d44",
    // Well this is really Aave Avalanche Market WETH
    weth: "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21",
    tokens: [
      "0xf1293574ee43950e7a8c9f1005ff097a9a713959", // NFD
      "0x321e7092a180bb43555132ec53aaa65a5bf84251", // gOHM
      "0xcc5672600b948df4b665d9979357bef3af56b300", // synFRAX
      "0x62edc0692bd897d2295872a9ffcac5425011c661", // GMX
    ],
  },
  fantom: {
    stables: [
      "0x82f0b8b456c1a451378467398982d4834b6829c1", // MIM
      "0x04068da6c83afcfa0e13ba15a6696662335d5b75", // USDC
      "0x049d68029688eabf473097a2fc38ef61633a3c7a", // USDT
    ],
    nusd: "0xED2a7edd7413021d440b09D654f3b87712abAB66",
    weth: "0x74b23882a30290451A17c44f4F05243b6b58C76d",
    neth: "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00",
    ethPool: "0x8D9bA570D6cb60C7e3e0F31343Efe75AB8E65FB1",
    pool: "0x2913E812Cf0dcCA30FB28E6Cac3d2DCFF4497688",
    legacy: {
      basepool: "0x080F6AEd32Fc474DD5717105Dba5ea57268F46eb",
      metapool: "0x1f6a0656ff5061930076bf0386b02091e0839f9f",
    },
    tokens: [
      "0x91fa20244fb509e8289ca630e5db3e9166233fdc", // gOHM
      "0x1852f70512298d56e9c8fdd905e02581e04ddb2a", // synFRAX
    ],
  },
  arbitrum: {
    stables: [
      "0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9", // USDT
      "0xff970a61a04b1ca14834a43f5de4533ebddb5cc8", // USDC
      "0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a", // MIM
    ],
    nusd: "0x2913e812cf0dcca30fb28e6cac3d2dcff4497688",
    neth: "0x3ea9b0ab55f34fb188824ee288ceaefc63cf908e",
    weth: "0x82af49447d8a07e3bd95bd0d56f35241523fbab1",
    pool: "0x0Db3FE3B770c95A0B99D1Ed6F2627933466c0Dd8",
    ethPool: "0xa067668661C84476aFcDc6fA5D758C4c01C34352",
    legacy: {
      basepool: "0xbafc462d00993ffcd3417abbc2eb15a342123fda",
      metapool: "0x84cd82204c07c67df1c2c372d8fd11b3266f76a3",
    },
    tokens: [
      "0x8d9ba570d6cb60c7e3e0f31343efe75ab8e65fb1", // gOHM
      "0x85662fd123280827e11c59973ac9fcbe838dc3b4", // synFRAX
    ],
  },
  boba: {
    stables: [
      "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35", // DAI
      "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc", // USDC
      "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d", // USDT
    ],
    nusd: "0x6B4712AE9797C199edd44F897cA09BC57628a1CF",
    neth: "0x96419929d7949D6A801A6909c145C8EEf6A40431",
    weth: "0xd203De32170130082896b4111eDF825a4774c18E",
    pool: "0x75FF037256b36F15919369AC58695550bE72fead",
    ethPool: "0x753bb855c8fe814233d26Bb23aF61cb3d2022bE5",
  },
  optimism: {
    neth: "0x809DC529f07651bD43A172e8dB6f4a7a0d771036",
    weth: "0x121ab82b49B2BC4c7901CA46B8277962b4350204",
    ethPool: "0xE27BFf97CE92C3e1Ff7AA9f86781FDd6D48F5eE9",
  },
  moonriver: {
    tokens: [
      "0xe96ac70907fff3efee79f502c985a7a21bce407d", // synFRAX
      "0x3bf21ce864e58731b6f28d68d5928bcbeb0ad172", // gOHM
    ],
  },
  aurora: {
    stables: [
      "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802", // USDC
      "0x4988a896b1227218e4A686fdE5EabdcAbd91571f", // USDT
    ],
    nusd: "0x07379565cD8B0CaE7c60Dc78e7f601b34AF2A21c",
    pool: "0xcEf6C2e20898C2604886b888552CA6CcF66933B0",
    tokens: [],
  },
  moonbeam: {
    tokens: [
      "0x0db6729c03c85b0708166ca92801bcb5cac781fc", // veSOLAR
      "0xd2666441443daa61492ffe0f37717578714a4521", // gOHM
      "0xdd47a348ab60c61ad6b60ca8c31ea5e00ebfab4f", // synFRAX
      "0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E", // MOVR
      "0xA1f8890E39b4d8E33efe296D698fe42Fb5e59cC3", // AVAX
    ],
  },
};

const misrepresentedTokensMap = {
  // MIM (FTM) -> MIM (ARB)
  "0x82f0b8b456c1a451378467398982d4834b6829c1":
    "arbitrum:0xfea7a6a0b346362bf88a9e4a88416b77a57d6c2a",
  // fUSDT (FTM) -> USDT (ETH)
  "0x049d68029688eabf473097a2fc38ef61633a3c7a": USDT,
  // DAI (BOBA) -> DAI (ETH)
  "0xf74195Bb8a5cf652411867c5C2C5b8C2a402be35":
    "0x6b175474e89094c44da98b954eedeac495271d0f",
  // USDC (BOBA) -> USDC (ETH)
  "0x66a2A913e447d6b4BF33EFbec43aAeF87890FBbc": USDC,
  // USDT (BOBA) -> USDT (ETH)
  "0x5DE1677344D3Cb0D7D465c10b72A8f60699C062d": USDT,
  // WETH (BOBA) -> WETH (ETH)
  "0xd203De32170130082896b4111eDF825a4774c18E": WETH,
  // WETH (OPTIMISM) -> WETH (ETH)
  "0x121ab82b49B2BC4c7901CA46B8277962b4350204": WETH,
  // NFD (BSC) -> NFD (ETH)
  "0x0fe9778c005a5a6115cbe12b0568a2d50b765a51": NFD,
  // NFD (POLYGON) -> NFD (ETH)
  "0x0a5926027d407222f8fe20f24cb16e103f617046": NFD,
  // NFD (AVAX) -> NFD (ETH)
  "0xf1293574ee43950e7a8c9f1005ff097a9a713959": NFD,
  // WONE (ONE)
  "0xcf664087a5bb0237a0bad6742852ec6c8d69a27a": "wrapped-one",
  // synFRAX (MOVR) -> FRAX (ETH)
  "0xe96ac70907fff3efee79f502c985a7a21bce407d": FRAX,
  // gOHM (MOVR) -> gOHM (ETH)
  "0x3bf21ce864e58731b6f28d68d5928bcbeb0ad172": GOHM,
  // avWETH (AVAX) -> WETH (ETH)
  "0x53f7c5869a859f0aec3d334ee8b4cf01e3492f21": WETH,
  // USDC (NEAR) -> USDC (ETH)
  "0xB12BFcA5A55806AaF64E99521918A4bf0fC40802": USDC,
  // veSOLAR (GLMR) -> SOLAR (MOVR)
  "0x0db6729c03c85b0708166ca92801bcb5cac781fc": SOLAR,
  // veSOLAR (MOVR) -> SOLAR (MOVR)
  "0x76906411d07815491a5e577022757ad941fb5066": SOLAR,
  // synFRAX (POLYGON) -> FRAX (ETH):
  "0x48a34796653afdaa1647986b33544c911578e767": FRAX,
  // synFRAX (ONE) -> FRAX (ETH)
  "0x1852f70512298d56e9c8fdd905e02581e04ddb2a": FRAX,
  // synFRAX (AVAX) -> FRAX (ETH)
  "0xcc5672600b948df4b665d9979357bef3af56b300": FRAX,
  // GMX (AVAX) -> GMX (ARB)
  "0x62edc0692bd897d2295872a9ffcac5425011c661":
    "arbitrum:0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a",
  // synFRAX (ARB) -> FRAX (ETH)
  "0x85662fd123280827e11c59973ac9fcbe838dc3b4": FRAX,
  // gOHM (GLMR) -> gOHM (ETH)
  "0xd2666441443daa61492ffe0f37717578714a4521": GOHM,
  // synFRAX (GLMR) -> FRAX (ETH)
  "0xdd47a348ab60c61ad6b60ca8c31ea5e00ebfab4f": FRAX,
  // gOHM (ONE) -> gOHM (ETH)
  "0x67c10c397dd0ba417329543c1a40eb48aaa7cd00": GOHM,
  // MOVR (GLMR) -> MOVR (MOVR)
  "0x1d4C2a246311bB9f827F4C768e277FF5787B7D7E":
    "moonriver:0x98878b06940ae243284ca214f92bb71a2b032b8a",
  // AVAX (GLMR) -> WAVAX (AVAX)
  "0xA1f8890E39b4d8E33efe296D698fe42Fb5e59cC3":
    "avax:0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7",
};

const sumLegacyPools = async (balances, block, chain, transform) => {
  const data = DATA[chain].legacy;

  for (const pool in data) {
    // sumTokens() doesn't return error out if the token doesn't exist on the
    // pool, so we don't need to check if the tokens exist in the pool.
    const stables = DATA[chain].stables.map((x) => [x, data[pool]]);
    stables.push([DATA[chain].nusd, data[pool]]);

    await sumTokens(balances, stables, block, chain, transform);
  }
};

const mapStables = (data) => {
  let stables = [];

  if (data.stables) stables = data.stables.map((x) => [x, data.pool]);

  if (data.nusd) stables.push([data.nusd, data.pool]);

  if (data.neth && data.ethPool)
    stables.push([data.neth, data.ethPool], [data.weth, data.ethPool]);

  return stables;
};

const bridgeTVL = async (balances, data, block, chain, transform) => {
  if (!data.tokens) return;

  if (chain !== "ethereum") {
    if (data.nusd) data.tokens.push(data.nusd);
    if (data.neth) data.tokens.push(data.neth);
  }

  const ret = await sdk.api.abi.multiCall({
    calls: data.tokens.map((x) => ({
      target: x,
    })),
    abi: "erc20:totalSupply",
    block,
    chain,
  });

  await requery(ret, chain, block, "erc20:totalSupply");

  ret.output.forEach((x) => {
    const token = transform(x.input.target);
    sdk.util.sumSingleBalance(balances, token, x.output);
  });
};

const ethPool2 = async (timestamp, ethBlock, chainBlocks) => {
  const SYN_FEI = [
    "0x0f2d719407fdbeff09d87557abb7232601fd9f29", //SYN
    "0x956F47F50A910163D8BF957Cf5846D573E7f87CA", // FEI
  ];
  const balances = {};

  await sumTokensAndLPsSharedOwners(
    balances,
    [["0x4a86c01d67965f8cb3d0aaa2c655705e64097c31", true]], // SYN/ETH SLP
    ["0xd10eF2A513cEE0Db54E959eF16cAc711470B62cF"], // MiniChefV2
    ethBlock
  );

  await sumTokens(
    balances,
    SYN_FEI.map((x) => [x, "0x9e2336aef4157944f201becd90ccb24e298660cb"]),
    ethBlock
  );

  return balances;
};

const chainTVL = (chain) => {
  const transform = (token) => {
    if (token === DATA[chain].nusd) return TUSD;
    else if (token === DATA[chain]?.neth) return WETH;
    else if (token in misrepresentedTokensMap)
      return misrepresentedTokensMap[token];

    return `${chain}:${token}`;
  };

  return async (timestamp, ethBlock, chainBlocks) => {
    const balances = {};

    const block = await getBlock(timestamp, chain, chainBlocks);
    const data = DATA[chain];

    await sumTokens(balances, mapStables(data), block, chain, transform);
    await bridgeTVL(balances, data, block, chain, transform);

    if (chain !== "ethereum")
      await sumLegacyPools(balances, block, chain, transform);

    return balances;
  };
};

module.exports = chainExports(chainTVL, [
  "ethereum",
  "bsc",
  "polygon",
  "avax",
  "fantom",
  "arbitrum",
  "harmony",
  "boba",
  "optimism",
  "moonriver",
  "aurora",
  "moonbeam",
]);
module.exports.methodology = `Tokens bridged via Synapse Bridge and Synapse AMM pools are counted as TVL`;
module.exports.misrepresentedTokens = true;
module.exports.ethereum.pool2 = ethPool2;
