import { argv, exit } from "node:process";
import { crawlSiteAsync } from "./crawl";
import { writeCSVReport } from "./report";

async function main() {
  const args = argv.slice(2); // 0 - node, 1 - start

  if (args.length === 0) {
    console.error("Argument Error: url is missing.");
    exit(1);
  }

  if (args.length > 3) {
    console.error("Argument Error: too many arguments.");
    exit(1);
  }

  let maxConcurrency = 10;
  let maxPages = 20;

  if (args[1]) {
    const parsedArg = parseInt(args[1]);
    if (Number.isNaN(parsedArg)) {
      console.error("Argument Error: maxConcurrency should be a number.");
      exit(1);
    }
    maxConcurrency = parsedArg;
  }

  if (args[2]) {
    const parsedArg = parseInt(args[2]);
    if (Number.isNaN(parsedArg)) {
      console.error("Argument Error: maxPages should be a number.");
      exit(1);
    }
    maxPages = parsedArg;
  }

  console.log(`Starting to crawl the ${args[0]} page...`);
  const result = await crawlSiteAsync(args[0], maxConcurrency, maxPages);
  writeCSVReport(result);
}

main();
