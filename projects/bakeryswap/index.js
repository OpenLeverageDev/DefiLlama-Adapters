const {calculateUniTvl} = require("../helper/calculateUniTvl");

const factory = "0x01bF7C66c6BD861915CdaaE475042d3c4BaE16A7";

const bscTvl = async (timestamp, ethBlock, chainBlocks) => {
  return calculateUniTvl(addr=>`bsc:${addr}`, chainBlocks.bsc, "bsc", factory, 0, true);
};

module.exports = {
  tvl: bscTvl
};
