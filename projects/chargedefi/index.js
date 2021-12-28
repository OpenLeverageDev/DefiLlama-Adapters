const sdk = require("@defillama/sdk");
const { transformBscAddress } = require("../helper/portedTokens");
const { unwrapUniswapLPs } = require("../helper/unwrapLPs");

const chargeTokenAddress = "0x1C6bc8e962427dEb4106aE06A7fA2d715687395c";

const staticBUSDLpAddress = "0x69758726b04e527238B261ab00236AFE9F34929D";
const chargeBUSDLpAddress = "0xB73b4eeb4c4912C1d1869219A22660eB478B57eA";

const chargeBoardroomAddress = "0x53D55291c12EF31b3f986102933177815DB72b3A";
const staticBUSDBoardroomAddress = "0x7692bCB5F646abcdFA436658dC02d075856ac33C";

const chargeBUSDFarmStrategyAddress = "0xA1Be11eAB62283E9719021aCB49400F6d5918153";
const staticBUSDFarmStrategyAddress = "0x53eE388f037876850D4fd60307FBA02e203A1C0e";


async function tvl(timestamp, block, chainBlocks) {
  const balances = {};
  let lpPositions = [];
  let transformAddress = await transformBscAddress();

  // Charge Boardroom TVL
  const chargeBoardroomBalance = sdk.api.erc20
    .balanceOf({
      target: chargeTokenAddress,
      owner: chargeBoardroomAddress,
      block: chainBlocks["bsc"],
      chain: "bsc",
    });
  sdk.util.sumSingleBalance(
    balances,
    transformAddress(chargeTokenAddress),
    (await chargeBoardroomBalance).output
  );

  // Static-BUSD Boardroom TVL
  const staticBUSDBoardroomBalance = sdk.api.erc20
    .balanceOf({
      target: staticBUSDLpAddress,
      owner: staticBUSDBoardroomAddress,
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

  lpPositions.push({
    token: staticBUSDLpAddress,
    balance: (await staticBUSDBoardroomBalance).output,
  });

  // Charge Farms Static-BUSD TVL
  const chargeFarmStaticBUSDBalance = sdk.api.erc20
    .balanceOf({
      target: staticBUSDLpAddress,
      owner: staticBUSDFarmStrategyAddress,
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

  lpPositions.push({
    token: staticBUSDLpAddress,
    balance: (await chargeFarmStaticBUSDBalance).output,
  });

  // Charge Farms Charge-BUSD TVL
  const chargeFarmChargeBUSDBalance = sdk.api.erc20
    .balanceOf({
      target: chargeBUSDLpAddress,
      owner: chargeBUSDFarmStrategyAddress,
      block: chainBlocks["bsc"],
      chain: "bsc",
    });

  lpPositions.push({
    token: chargeBUSDLpAddress,
    balance: (await chargeFarmChargeBUSDBalance).output,
  });

  await unwrapUniswapLPs(
    balances,
    lpPositions,
    chainBlocks["bsc"],
    "bsc",
    transformAddress
  );
  return balances;
}

module.exports = {
  methodology: 'The TVL of Charge Defi is calculated using the Pancake LP token deposits (Static/BUSD and Charge/BUSD), and the Charge deposits found in the Boardroom.',
  bsc: {
    tvl,
  },
  tvl,
};
