import axios from "axios";

const getPRs = async ({ GH_TOKEN }: { GH_TOKEN: KVNamespace }) => {
  const graphql = `
    query getAllPullRequests($login: String!, $after: String) {
      user(login: $login) {
        pullRequests(first: 100, after: $after, orderBy: { field: CREATED_AT, direction: DESC }) {
          totalCount
          nodes {
            title
            url
            createdAt
            merged
            mergedAt
            state
            repository {
              nameWithOwner
            }
          }
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
  `

  let response = await axios.post('https://api.github.com/graphql', {
    query: graphql,
    variables: {
      login: "Im-Fran",
      after: null
    }
  }, {
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      "User-Agent": "FranciscoSolis-Portfolio-Api/1.0"
    },
  });

  let prs = 0;
  while(response.status === 200 && response.data.data.user.pullRequests.pageInfo.hasNextPage) {
    prs += response.data.data.user.pullRequests.totalCount;
    response = await axios.post('https://api.github.com/graphql', {
      query: graphql,
      variables: {
        login: "Im-Fran",
        after: response.data.data.user.pullRequests.pageInfo.endCursor
      }
    }, {
      headers: {
        Authorization: `token ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        "User-Agent": "FranciscoSolis-Portfolio-Api/1.0"
      },
    });
  }

  return prs;
}

export default getPRs;