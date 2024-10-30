import { Hono } from 'hono'
import axios from "axios";
import {cache} from "hono/cache";
import { cors } from 'hono/cors'
import getStars from "./fetchers/stars";
import getCommits from "./fetchers/commits";
import getPRs from "./fetchers/pull_requests";

type Bindings = {
  GH_TOKEN: KVNamespace
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('*', cache({
  cacheName: 'franciscosolis-portfolio-api',
  cacheControl: 'max-age=3600',
}))

app.get('*', cors({
  origin: '*',
  allowMethods: ['GET'],
  allowHeaders: ['Content-Type, Access-Control-Allow-Origin'],
  exposeHeaders: ['Content-Type, Access-Control-Allow-Origin'],
  maxAge: 600,
  credentials: true,
}))
app.get('/', (c) => c.json({
  message: 'Hello, World!',
  endpoints: [
    {
      path: '/github',
      description: 'Get my github profile data (avatar, repos, followers, location)'
    },
    {
      path: '/github/stats',
      description: 'Get my github stats (stars, commits, prs)'
    }
  ]
}));

app.get('/github', async (c) => {
  const GH_TOKEN = c.env.GH_TOKEN

  let response = await axios.get('https://api.github.com/users/Im-Fran', {
    headers: {
      Authorization: `token ${GH_TOKEN}`,
      Accept: 'application/vnd.github+json',
      "User-Agent": "FranciscoSolis-Portfolio-Api/1.0"
    }
  });

  if(response.status !== 200) {
    return c.json({
      error: 'Error fetching data from github'
    })
  }

  const data = response.data;

  return c.json({
    avatar: data.avatar_url,
    profile_url: data.html_url,
    repos: {
      public: data.public_repos,
      private: data.total_private_repos,
      total: data.public_repos + data.total_private_repos,
    },
    followers: data.followers,
    location: data.location,
  })
})

app.get('/github/stats', async (c) => {
  const GH_TOKEN = c.env.GH_TOKEN

  const starsEarned = await getStars({ GH_TOKEN });
  const totalCommits = await getCommits({ GH_TOKEN });
  const prs = await getPRs({ GH_TOKEN })

  return c.json({
    starsEarned,
    totalCommits,
    prs,
  })
})


export default app
