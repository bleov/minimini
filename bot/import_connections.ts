import PocketBase from "pocketbase";

import type { ConnectionsGame, BasicArchiveRecord } from "../src/lib/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const HOST = atob("aHR0cHM6Ly9ueXRpbWVzLmNvbQ==");

const REQUIRED_VARS = ["VITE_POCKETBASE_URL", "PB_SUPERUSER_EMAIL", "PB_SUPERUSER_PASSWORD"];
for (const variable of REQUIRED_VARS) {
  if (!process.env[variable]) {
    console.error(`Error: Missing required environment variable ${variable}`);
    process.exit(1);
  }
}

console.log("Logging into PocketBase...");
const pb = new PocketBase(process.env.VITE_POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword(process.env.PB_SUPERUSER_EMAIL as string, process.env.PB_SUPERUSER_PASSWORD as string);
const archive = pb.collection("archive");

console.log("Fetching archive records...");
const missingRecords = (await archive.getFullList({ filter: "connections_id=0" })) as BasicArchiveRecord[];
console.log(`Found ${missingRecords.length} records that need importing.`);
console.log("Continue? (y/n)");
const userInput = await new Promise<string>((resolve) => {
  process.stdin.once("data", (data) => resolve(data.toString().trim()));
});

if (userInput.toLowerCase() !== "y") {
  console.log("Aborting.");
  process.exit(0);
}

for (const record of missingRecords) {
  console.log(`Fetching connections ${record.publication_date}...`);
  const connectionsData: ConnectionsGame = await fetchJSON([HOST, "svc", "connections", "v2", `${record.publication_date}.json`].join("/"));
  console.log(`Updating record for ${record.publication_date}...`);
  await archive.update(record.id, {
    connections_id: connectionsData.id,
    connections: connectionsData
  });
  await sleep(1000);
}

async function fetchJSON(url: string): Promise<any> {
  const requestHeaders = new Headers();
  requestHeaders.set(["X", "Games", "Auth", "Bypass"].join("-"), "true");
  const res = await fetch(url, {
    headers: requestHeaders
  });
  const json = await res.json();
  return json;
}
