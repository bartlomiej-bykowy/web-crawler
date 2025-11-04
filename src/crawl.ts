import { JSDOM } from "jsdom";
import type { ExtractedPageData } from "./types";
import { exit } from "node:process";

export function normalizeURL(url: string): string {
  try {
    if (url === undefined) {
      throw new Error("Argument missing");
    }

    const urlObj = new URL(url);
    let { host, pathname, search } = urlObj;
    pathname = pathname.split("/").filter(Boolean).join("/");

    return `http://${host}/${pathname}${search}`;
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error(`Invalid url: ${error.message}`);
    }
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Unexpected error occured.");
  }
}

export function getH1FromHtml(html: string): string {
  const jsdom = new JSDOM(html);
  const h1 = jsdom.window.document.querySelector("h1");

  return h1 ? h1.textContent : "";
}

export function getFirstParagraphFromHTML(html: string): string {
  const jsdom = new JSDOM(html);
  const main = jsdom.window.document.querySelector("main");
  let pInMain;

  if (main) {
    pInMain = main.querySelector("p");
  }

  if (pInMain?.textContent) {
    return pInMain.textContent;
  }

  const p = jsdom.window.document.querySelector("p");

  return p ? p.textContent : "";
}

export function getURLsFromHTML(html: string, baseUrl: string): string[] {
  const jsdom = new JSDOM(html);
  const links = jsdom.window.document.querySelectorAll("a");

  if (links.length === 0) return [];

  const urls = [...links].map((link) => link.getAttribute("href") || "");
  const absoluteUrls = urls.map((url) =>
    url.startsWith("/") ? baseUrl + url : url
  );

  return absoluteUrls;
}

export function getImagesFromHTML(html: string, baseUrl: string): string[] {
  const jsdom = new JSDOM(html);
  const images = jsdom.window.document.querySelectorAll("img");

  if (images.length === 0) return [];

  const urls = [...images].map((img) => img.getAttribute("src") || "");
  const absoluteUrls = urls.map((url) =>
    url.startsWith("/") ? baseUrl + url : url
  );

  return absoluteUrls;
}

export function extractPageData(
  html: string,
  pageUrl: string
): ExtractedPageData {
  const h1 = getH1FromHtml(html);
  const p = getFirstParagraphFromHTML(html);
  const linkUrls = getURLsFromHTML(html, pageUrl);
  const imgUrl = getImagesFromHTML(html, pageUrl);

  return {
    url: pageUrl,
    h1,
    first_paragraph: p,
    outgoing_links: linkUrls,
    image_urls: imgUrl,
  };
}

export async function getHTML(url: string): Promise<string> {
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
}

export async function crawlPage(
  baseUrl: string,
  currentUrl: string,
  pages: Record<string, number> = {}
) {
  // return pages obj if hosts are different
  const baseHost = new URL(baseUrl).host;
  const currentHost = new URL(currentUrl).host;

  if (baseHost !== currentHost) {
    return pages;
  }

  let normalizedBaseUrl = baseUrl;
  const normalizedCurrentUrl = normalizeURL(currentUrl);

  // first run
  if (baseUrl === currentUrl) {
    normalizedBaseUrl = normalizeURL(baseUrl);
  }

  // return if current page already in pages obj
  if (normalizedCurrentUrl in pages) {
    pages[normalizedCurrentUrl]++;
    return pages;
  } else {
    pages[normalizedCurrentUrl] = 1;
  }

  // get html of current page
  console.log(`Crawling page: ${normalizedCurrentUrl}...`);

  const html = await getHTML(normalizedCurrentUrl);
  if (!html) return pages;
  const pageData = extractPageData(html, normalizedCurrentUrl);

  for (const link of pageData.outgoing_links) {
    await crawlPage(normalizedBaseUrl, link, pages);
  }

  return pages;
}
