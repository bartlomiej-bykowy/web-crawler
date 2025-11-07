import { type LimitFunction } from "p-limit";
import { extractPageData, normalizeURL } from "./crawl";
import { ExtractedPageData } from "./types";

export class ConcurrentCrawler {
  baseUrl: string;
  baseHost: string;
  pages: Set<string>;
  pageData: Record<string, ExtractedPageData>;
  limit: LimitFunction;
  maxPages: number | undefined;
  shouldStop: boolean;
  allTasks: Set<Promise<void>>;

  constructor(
    baseUrl: string,
    limit: LimitFunction,
    maxPages: number | undefined
  ) {
    this.baseUrl = normalizeURL(baseUrl);
    this.baseHost = new URL(this.baseUrl).host;
    this.pages = new Set();
    this.pageData = {};
    this.limit = limit;
    this.maxPages = maxPages;
    this.shouldStop = false;
    this.allTasks = new Set();
  }

  #addPageVisit(normalizedUrl: string): boolean {
    if (this.shouldStop) return false;
    if (normalizedUrl in this.pageData) {
      return false;
    } else {
      if (this.maxPages && this.pages.size >= this.maxPages) {
        this.shouldStop = true;
        console.log("Reached maximum number of pages to crawl.");
        return false;
      }
      this.pages.add(normalizedUrl);
      return true;
    }
  }

  async #getHTML(url: string): Promise<string> {
    return await this.limit(async () => {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent": "WebCrawler/1.0",
          },
        });
        if (response.status > 300 && response.status < 500) {
          throw new Error(
            `Client error [${response.status}]: ${response.statusText}.`
          );
        }
        if (response.status >= 500) {
          throw new Error(
            `Server error [${response.status}]: ${response.statusText}.`
          );
        }
        if (!response.headers.get("content-type")?.includes("text/html")) {
          throw new Error(
            `Invalid content type: ${response.headers.get("content-type")}.`
          );
        }
        const html = await response.text();
        return html;
      } catch (error) {
        if (error instanceof Error) {
          console.error(error.message);
        } else {
          console.error("Unexpected error occured.");
        }
        return "";
      }
    });
  }

  async #crawlPage(currentUrl: string): Promise<void> {
    console.log("Number of unique links: ", this.pages.size);
    if (this.shouldStop) return;
    if (this.baseHost !== new URL(currentUrl).host) {
      return;
    }

    const normalizedCurrentUrl = normalizeURL(currentUrl);

    // return if current page already in pages obj
    if (!this.#addPageVisit(normalizedCurrentUrl)) return;

    // get html of current page
    console.log(`Crawling page: ${normalizedCurrentUrl}...`);

    const html = await this.#getHTML(currentUrl);
    if (!html) return;

    this.pageData[normalizedCurrentUrl] = extractPageData(
      html,
      normalizedCurrentUrl
    );

    let promises: Promise<void>[] = [];
    for (const link of this.pageData[normalizedCurrentUrl].internalLinks) {
      if (this.shouldStop) break;
      const promise = this.#crawlPage(link);
      this.allTasks.add(promise);
      promise.finally(() => this.allTasks.delete(promise));
      promises.push(promise);
    }
    await Promise.all(promises);
  }

  async crawl() {
    const promise = this.#crawlPage(this.baseUrl);
    this.allTasks.add(promise);
    promise.finally(() => this.allTasks.delete(promise));
    await promise;
    await Promise.allSettled(Array.from(this.allTasks));

    return this.pageData;
  }
}
