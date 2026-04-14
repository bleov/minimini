import PocketBase from "pocketbase";

import type { ConnectionsGame, MiniCrossword } from "../src/lib/types";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const HOST = atob("aHR0cHM6Ly9ueXRpbWVzLmNvbQ==");
const MINI_URL = [HOST, "svc", "crosswords", "v6", "puzzle", "mini.json"].join("/");
const DAILY_URL = [HOST, "svc", "crosswords", "v6", "puzzle", "daily.json"].join("/");
const MIDI_URL = [HOST, "svc", "crosswords", "v6", "puzzle", "midi.json"].join("/");

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

console.log("Fetching mini data...");
const miniData: MiniCrossword = await fetchJSON(MINI_URL);

if (!miniData || !miniData.body) {
  console.error(miniData);
  process.exit(1);
}
miniData.body[0].SVG = {};

console.log("Fetching daily data...");
const dailyData: MiniCrossword = await fetchJSON(DAILY_URL);
dailyData.body[0].SVG = {};

console.log("Fetching midi data...");
const midiData: MiniCrossword = await fetchJSON(MIDI_URL);
midiData.body[0].SVG = {};

console.log("Fetching connections data...");
const connectionsDate = miniData.publicationDate;
const connectionsData: ConnectionsGame = await fetchJSON([HOST, "svc", "connections", "v2", `${connectionsDate}.json`].join("/"));

console.log("Creating archive record...");

const data = {
  publication_date: miniData.publicationDate,
  mini_id: miniData.id,
  mini: miniData,
  daily_id: dailyData.id,
  daily: dailyData,
  midi_id: midiData.id,
  midi: midiData,
  connections_id: connectionsData.id,
  connections: connectionsData
};

const oldRecord = await archive.getFirstListItem(`publication_date="${miniData.publicationDate}"`).catch(() => null);
if (oldRecord) {
  console.log("Updating older record...");
  await archive.update(oldRecord.id, data);
} else {
  await archive.create(data);
}

console.log(miniData.publicationDate);

async function fetchJSON(url: string): Promise<any> {
  const requestHeaders = new Headers();
  requestHeaders.set(["X", "Games", "Auth", "Bypass"].join("-"), "true");
  const res = await fetch(url, {
    headers: requestHeaders
  });
  const json = await res.json();
  return json;
}
