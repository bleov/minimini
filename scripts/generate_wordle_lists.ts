import fs from "node:fs";
import path from "node:path";

const MAX_LENGTH = 12;
const MIN_LENGTH = 2;

const response = await fetch("https://gist.githubusercontent.com/bleov/749c8b7bb43ea38f6b02c0a84f016616/raw/12of12inf.txt");
const data = await response.text();
const words: string[] = data.split("\n");

let filteredWords = words.filter((word: string) => word.length >= MIN_LENGTH && word.length <= MAX_LENGTH && /^[a-zA-Z]+$/.test(word));

for (let i = MIN_LENGTH; i <= MAX_LENGTH; i++) {
  if (i === 5) continue;
  const wordList = filteredWords.filter((word: string) => word.length === i).sort();
  console.log(`${i}-letter words: ${wordList.length.toLocaleString()}`);
  fs.writeFileSync(path.resolve("src", "routes", "wordle", "data", `${i}-letter.json`), JSON.stringify(wordList));
}
