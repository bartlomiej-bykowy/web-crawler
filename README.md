# Web Crawler

This **Web Crawler** is a multithreaded tool for crawling websites, collecting key information from any specified domain, and generating a clean CSV report with the results.

## What is this project?

This project is written in Node.js. It:

- recursively traverses all subpages within a single domain
- fetches and analyzes multiple pages in parallel (with configurable concurrency limit)
- for each discovered page, it saves:
  - the page URL
  - the H1 header
  - the first paragraph
  - all internal and external links
  - all images on the page

Its output is a `report.csv` file containing readable, structured data.

## Features

- configurable maximum number of simultaneous requests (`maxConcurrency`)
- optionally limit the total number of crawled pages (`maxPages`)
- gathers data from many subpages concurrently
- automatically ignores links that lead outside the domain
- exports all results to a CSV file

## Requirements

- Node.js >= 22.x (recommended: 22.15.0)
- pnpm (or any compatible package manager)
- Internet access

## Installation

1. Clone the repository:

   ```bash
   git clone <repo_url>
   cd web-crawler
   ```

2. Install the dependencies:
   ```bash
   pnpm install
   ```

## Usage

Run the crawler with the URL of your starting page and optional parameters:

```bash
pnpm start <url> [maxConcurrency] [maxPages]
```

- **url** _(string, required)_ – the starting URL to crawl, e.g. `https://example.com`
- **maxConcurrency** _(number, optional)_ – the maximum number of concurrent network requests (default: 1)
- **maxPages** _(number, optional)_ – the maximum number of pages to crawl (default: unlimited)

**Examples:**

- Crawl an entire website with default settings:

  ```bash
  pnpm start https://example.com
  ```

- Crawl up to 50 subpages with up to 5 parallel requests:
  ```bash
  pnpm start https://example.com 5 50
  ```

When crawling finishes, a `report.csv` file is created in the project directory, containing detailed data for every visited page.

## Report Format (`report.csv`)

Each row represents one page with the following columns:

- `page_url` – Page address (URL)
- `h1` – Main header (H1)
- `first_paragraph` – First paragraph of text
- `internal_links` – All links leading to the same domain (semicolon-separated)
- `external_links` – All external links (semicolon-separated)
- `image_urls` – All images found on the page (semicolon-separated)

When inporting the file to programs like Excel or Google's Sheets, you may need to specify `comma` as separator type.

## Notes

- the crawler is polite by default (it sets a proper User-Agent and limits requests), but some server-side blockades (such as CORS, robots.txt, or rate limits) may impact crawling
- handles HTTP errors and network problems — skips problematic subpages and continues

## Development & Tests

To run tests:

```bash
pnpm test
```
