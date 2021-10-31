const llama = [
  {
    coingeckoID: "solana",
    account: "4Bo98VrTYkHLbE9zoXx3tCD3qEDcGZFCZFksgyYPKdG9",
  },
  {
    coingeckoID: "msol",
    account: "7n1AmrpywC84MdALohPBipAx1SYhjpSLjYFb2EuTV9wm",
  },
];

async function tvl() {
  return Promise.all(
    llama.map(async ({ coingeckoID, account }) => {
      return {
        coingeckoID,
        amount: await getTokenAccountBalance(account),
      };
    })
  );
}

module.exports = {
  methodology:
    "aSOL TVL is computed by looking at the balances of the accounts holding the tokens backing the aSOL Crate. The data comes from https://asol.so/#/admin.",
  tvl,
};
