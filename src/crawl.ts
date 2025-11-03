import { JSDOM } from "jsdom";

export function normalizeURL(url: string): string {
  try {
    if (url === undefined) {
      throw new Error("Argument missing");
    }

    const urlObj = new URL(url);
    const { host, pathname, search } = urlObj;

    return `${host}/${pathname.replaceAll("/", "")}${search}`;
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
