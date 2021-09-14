const axios = require('axios')

async function fetch() {
    let a = await axios.get('https://pnetwork.watch/api/datasources/proxy/1/query?db=pnetwork-volumes-1&q=SELECT%20%22tvl%22%20FROM%20%22tvl%22%20WHERE%20time%20%3E%3D%20now()%20-%201d&epoch=ms')
    return a.data.results[0].series[0].values.slice(-1)[0][1]
}

module.exports = {
    fetch,
    methodology: 'Queries the pNetwork database, using the same API endpoint as their own UI. TVL is based on the amount of assets “locked” in the system and that therefore has a 1:1 tokenisation on a host blockchain, including all of the assets and all of the blockchains supported by pNetwork.'
  };
