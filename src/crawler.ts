import { type LimitFunction } from "p-limit";
import { extractPageData, normalizeURL } from "./crawl";

export class ConcurrentCrawler {
  baseUrl: string;
  baseHost: string;
  pages: Record<string, number>;
  limit: LimitFunction;

  constructor(baseUrl: string, limit: LimitFunction) {
    this.baseUrl = normalizeURL(baseUrl);
    this.baseHost = new URL(this.baseUrl).host;
    this.pages = {};
    this.limit = limit;
  }

  #addPageVisit(normalizedUrl: string): boolean {
    if (normalizedUrl in this.pages) {
      this.pages[normalizedUrl]++;
      return false;
    } else {
      this.pages[normalizedUrl] = 1;
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
    // return pages obj if hosts are different
    if (this.baseHost !== new URL(currentUrl).host) {
      return;
    }

    const normalizedCurrentUrl = normalizeURL(currentUrl);

    // return if current page already in pages obj
    if (!this.#addPageVisit(normalizedCurrentUrl)) return;

    // get html of current page
    console.log(`Crawling page: ${normalizedCurrentUrl}...`);

    const html = await this.#getHTML(normalizedCurrentUrl);
    if (!html) return;
    const pageData = extractPageData(html, normalizedCurrentUrl);

    const promises = pageData.outgoing_links.map((link) =>
      this.#crawlPage(link)
    );
    await Promise.all(promises);
  }

  async crawl() {
    await this.#crawlPage(this.baseUrl);
    return this.pages;
  }
}
