const { GraphQLClient, gql } = require("graphql-request");
const retry = require("async-retry");

async function fetch() {
  var endpoint =
    "https://api.thegraph.com/subgraphs/name/hectordao-hec/hector-dao";
  var graphQLClient = new GraphQLClient(endpoint);

  var query = gql`
    query {
      protocolMetrics(first: 1, orderBy: timestamp, orderDirection: desc) {
        treasuryMarketValue
      }
    }
  `;
  const results = await retry(
    async (bail) => await graphQLClient.request(query)
  );
  return results.protocolMetrics[0].treasuryMarketValue;
}

module.exports = {
  fetch,
};
