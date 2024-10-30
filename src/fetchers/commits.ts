import axios from "axios";

const getCommits = async ({ GH_TOKEN}: { GH_TOKEN: KVNamespace}) => {
  let commitsResponse = await axios.get('https://api.github.com/search/commits?q=author:Im-Fran', {
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      "User-Agent": "FranciscoSolis-Portfolio-Api/1.0",
    }
  })


  let commitsCount = 0;
  if(commitsResponse.status === 200) {
    commitsCount = commitsResponse.data.total_count;
  }

  return commitsCount;
}

export default getCommits;