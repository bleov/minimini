import PocketBase from "pocketbase";

import type { MiniCrossword, BasicArchiveRecord } from "../src/lib/types";
import fs from "fs";

const REQUIRED_VARS = ["LOCAL_POCKETBASE_URL", "PB_SUPERUSER_EMAIL", "PB_SUPERUSER_PASSWORD"];
for (const variable of REQUIRED_VARS) {
  if (!process.env[variable]) {
    console.error(`Error: Missing required environment variable ${variable}`);
    process.exit(1);
  }
}

console.log("Logging into PocketBase...");
const pb = new PocketBase(process.env.LOCAL_POCKETBASE_URL);
await pb.collection("_superusers").authWithPassword(process.env.PB_SUPERUSER_EMAIL as string, process.env.PB_SUPERUSER_PASSWORD as string);
const archive = pb.collection("archive");

console.log("Fetching archive records...");
const records = (await archive.getFullList({ fields: "publication_date", filter: "mini_id != 0" })) as BasicArchiveRecord[];
console.log(`Found ${records.length} pre-existing records.`);

console.log("Finding files to import...");
let files = fs.readdirSync("bot/import/mini");
const dateFilter = /\d{4}-\d{2}-\d{2}/;
files = files.filter((file) => {
  const date = file.split(".")[0];
  if (records.find((r) => r.publication_date === date)) {
    return false;
  }
  if (!dateFilter.test(date)) {
    console.warn(`Skipping file with invalid name: ${file}`);
    return false;
  }
  return true;
});
console.log(`Found ${files.length.toLocaleString()} files to import.`);

console.log("Continue? (y/n)");
const userInput = await new Promise<string>((resolve) => {
  process.stdin.once("data", (data) => resolve(data.toString().trim()));
});

if (userInput.toLowerCase() !== "y") {
  console.log("Aborting.");
  process.exit(0);
}

console.log("Sorting by date...");
files.sort((a, b) => {
  const dateA = a.split(".")[0];
  const dateB = b.split(".")[0];
  return dateA.localeCompare(dateB);
});

let errors = 0;

for (const file of files) {
  const date = file.split(".")[0];
  console.log(`Importing ${file}...`);
  const content = fs.readFileSync(`bot/import/mini/${file}`, "utf-8");
  const data = JSON.parse(content) as MiniCrossword;
  data.body[0].SVG = {};
  try {
    await archive.create({
      publication_date: date,
      mini_id: data.id,
      mini: data
    });
  } catch (err) {
    console.error(`Error importing ${file}:`, err);
    errors++;
  }
}

console.log(`Import complete with ${errors} error(s).`);
process.exit(0);
