import { Octokit } from "@octokit/rest";
import dotenv from "dotenv";

dotenv.config();

const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

const REPO = "Decentralized-Health-Data-Vault";

async function main() {
  const user = await octokit.users.getAuthenticated();

  const contents =
    await octokit.repos.getContent({
      owner: user.data.login,
      repo: REPO,
      path: "",
    });

  if (Array.isArray(contents.data)) {
    console.log(
      contents.data.map(file => file.name)
    );
  }
}

main().catch(console.error);