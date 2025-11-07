import { JSDOM } from "jsdom";
import type { ExtractedPageData, LinksData } from "./types";
import pLimit from "p-limit";
import { ConcurrentCrawler } from "./crawler";

export function normalizeURL(url: string): string {
  try {
    if (url === undefined) {
      throw new Error("Argument missing");
    }

    const urlObj = new URL(url);
    let { protocol, host, pathname, search } = urlObj;
    pathname = pathname.split("/").filter(Boolean).join("/");

    return `${protocol}//${host}/${pathname}${search}`;
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

export function getURLsFromHTML(html: string, baseUrl: string): LinksData {
  const jsdom = new JSDOM(html);
  const links = jsdom.window.document.querySelectorAll("a");

  if (links.length === 0) return { externalLinks: [], internalLinks: [] };

  const urls = [...links].map((link) => link.getAttribute("href") || "");
  // const absoluteUrls = urls.map((url) => new URL(url, baseUrl).href);

  const host = new URL(baseUrl).host;
  // const result: {external_links: string[]; internal_links: string[]} = {
  //   external_links: [],
  //   internal_links: []
  // }

  const absoluteUrls = urls.reduce<LinksData>(
    (acc, val) => {
      const valUrl = new URL(val, baseUrl);
      if (valUrl.host === host) {
        acc.internalLinks.add(valUrl.href);
      } else {
        acc.externalLinks.add(valUrl.href);
      }
      return acc;
    },
    { externalLinks: new Set(), internalLinks: new Set() }
  );

  return absoluteUrls;
}

export function getImagesFromHTML(html: string, baseUrl: string): string[] {
  const jsdom = new JSDOM(html);
  const images = jsdom.window.document.querySelectorAll("img");

  if (images.length === 0) return [];

  const urls = [...images].map((img) => img.getAttribute("src") || "");
  const absoluteUrls = urls.map((url) => new URL(url, baseUrl).href);

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
    firstParagraph: p,
    externalLinks: [...linkUrls.externalLinks],
    internalLinks: [...linkUrls.internalLinks],
    imageUrls: imgUrl,
  };
}

export async function crawlSiteAsync(
  url: string,
  maxConcurrency: number,
  maxPages: number | undefined
) {
  const limit = pLimit(maxConcurrency);
  const crawler = new ConcurrentCrawler(url, limit, maxPages);
  return await crawler.crawl();
}
