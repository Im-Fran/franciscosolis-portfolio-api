import axios from "axios";

const getStars = async ({ GH_TOKEN }: { GH_TOKEN: KVNamespace }) => {
  const graphql = `
    query getAllStars($login: String!, $after: String) {
      user(login: $login) {
        repositories(first: 100, after: $after, ownerAffiliations: OWNER, orderBy: {direction: DESC, field: STARGAZERS}) {
          totalCount
          nodes {
            name
            stargazers {
              totalCount
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

  let starsResponse = await axios.post('https://api.github.com/graphql', {
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

  let stars_earned = 0;
  while(starsResponse.status === 200 && starsResponse.data.data.user.repositories.pageInfo.hasNextPage) {
    starsResponse.data.data.user.repositories.nodes.forEach((repo: any) => stars_earned += repo.stargazers.totalCount)

    starsResponse = await axios.post('https://api.github.com/graphql', {
      query: graphql,
      variables: {
        login: "Im-Fran",
        after: starsResponse.data.data.user.repositories.pageInfo.endCursor
      }
    }, {
      headers: {
        Authorization: `token ${GH_TOKEN}`,
        Accept: 'application/vnd.github+json',
        "User-Agent": "FranciscoSolis-Portfolio-Api/1.0"
      },
    });
  }

  return stars_earned;
}

export default getStars;