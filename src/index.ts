import { argv, exit } from "node:process";
import { crawlPage } from "./crawl";

async function main() {
  const args = argv.slice(2); // 0 - node, 1 - start

  if (args.length === 0) {
    console.error("Argument Error: url is missing.");
    exit(1);
  }

  if (args.length > 1) {
    console.error("Argumnet Error: too many arguments.");
    exit(1);
  }

  console.log(`Starting to crawl the ${args[0]} page...`);
  const result = await crawlPage(args[0], args[0]);
  console.log(result);
  exit(0);
}

main();
