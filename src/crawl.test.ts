import { describe, expect, it } from "vitest";
import {
  extractPageData,
  getFirstParagraphFromHTML,
  getH1FromHtml,
  getImagesFromHTML,
  getURLsFromHTML,
  normalizeURL,
} from "./crawl";
import { ExtractedPageData } from "./types";

describe("function normalizeURL", () => {
  it("should return a normalized url", () => {
    const normalizedUrl = "example.com/home";

    expect(normalizeURL("http://example.com/home")).toBe(normalizedUrl);
    expect(normalizeURL("https://example.com/home/")).toBe(normalizedUrl);
  });

  it("should return a normalized url with search params", () => {
    const normalizedUrl = "example.com/home?page=1";

    expect(normalizeURL("https://example.com/home?page=1")).toBe(normalizedUrl);
  });

  it("should throw an error if url is not provided", () => {
    expect(() => normalizeURL()).toThrow("Argument missing");
  });

  it("should thorw an error if url is an empty string", () => {
    expect(() => normalizeURL("")).toThrow("Invalid url");
  });

  it("should throw an error if url is not valid", () => {
    expect(() => normalizeURL("some text")).toThrow("Invalid url");
  });
});

describe("function getH1FromHtml", () => {
  it("should return a content of h1", () => {
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <main>
            <p>This is the first paragraph.</p>
            <p>This is the second paragraph.</p>
          </main>
        </body>
      </html>`;

    expect(getH1FromHtml(html)).toBe("Welcome");
  });

  it("should return a content of the first h1 if there are more than 1", () => {
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <h1>Hello</h1>
          <main>
            <p>This is the first paragraph.</p>
            <p>This is the second paragraph.</p>
          </main>
        </body>
      </html>`;

    expect(getH1FromHtml(html)).toBe("Welcome");
  });

  it("should return an empty string if there's no h1", () => {
    const html = `
      <html>
        <body>
          <main>
            <p>This is the first paragraph.</p>
            <p>This is the second paragraph.</p>
          </main>
        </body>
      </html>`;

    expect(getH1FromHtml(html)).toBe("");
  });
});

describe("function getFirstParagraphFromHTML", () => {
  it("should return content of first <p> element inside main tag", () => {
    const pContent = "This is the second paragraph.";
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <p>This is the first paragraph.</p>
          <main>
            <p>${pContent}</p>
            <p>This is the third paragraph.</p>
          </main>
        </body>
      </html>`;

    expect(getFirstParagraphFromHTML(html)).toBe(pContent);
  });

  it("should return content of the first <p> tag if <main> is not present or doesn't contain any <p> tag", () => {
    const pContent = "This is the first paragraph.";
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <p>${pContent}</p>
          <main>
            <h2>Secondary header</h2>
          </main>
        </body>
      </html>`;

    expect(getFirstParagraphFromHTML(html)).toBe(pContent);
  });

  it("should return an empty string if there is not <p> tag", () => {
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
        </body>
      </html>`;

    expect(getFirstParagraphFromHTML(html)).toBe("");
  });
});

describe("function getURLsFromHTML", () => {
  it("should return a list of all <a> tags' urls", () => {
    const links = [
      "https://example-1.com",
      "https://example-2.com",
      "https://example-3.com",
    ];
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <a href="${links[0]}">Link 1</a>
          <a href="${links[1]}">Link 2</a>
          <a href="${links[2]}">Link 3</a>
        </body>
      </html>`;

    expect(getURLsFromHTML(html, "https://example.com")).toStrictEqual(links);
    expect(getURLsFromHTML(html, "https://example.com")).toHaveLength(
      links.length
    );
  });

  it("should convert a relative urls to the absolute ones", () => {
    const baseUrl = "https://example.com";
    const links = ["https://example-1.com", "/home", "/contact"];
    const result = [links[0], baseUrl + links[1], baseUrl + links[2]];
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <a href="${links[0]}">Link 1</a>
          <a href="${links[1]}">Link 2</a>
          <a href="${links[2]}">Link 3</a>
        </body>
      </html>`;

    expect(getURLsFromHTML(html, baseUrl)).toStrictEqual(result);
    expect(getURLsFromHTML(html, baseUrl)).toHaveLength(result.length);
  });

  it("should return an empty list if no <a> tags were found", () => {
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
        </body>
      </html>`;

    expect(getURLsFromHTML(html, "https://example.com")).toHaveLength(0);
  });
});

describe("function getImagesFromHTML", () => {
  it("should return a list of all <img> tags' urls", () => {
    const links = [
      "https://example-1.com/1.jpg",
      "https://example-2.com/2.jpg",
      "https://example-3.com/3.jpg",
    ];
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <img alt="" src="${links[0]}" />
          <img alt="" src="${links[1]}" />
          <img alt="" src="${links[2]}" />
        </body>
      </html>`;

    expect(getImagesFromHTML(html, "https://example.com")).toStrictEqual(links);
    expect(getImagesFromHTML(html, "https://example.com")).toHaveLength(
      links.length
    );
  });

  it("should convert a relative urls to the absolute ones", () => {
    const baseUrl = "https://example.com";
    const links = ["https://example-1.com/1.jpg", "/2.jpg", "/3.jpg"];
    const result = [links[0], baseUrl + links[1], baseUrl + links[2]];
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
          <img alt="" src="${links[0]}" />
          <img alt="" src="${links[1]}" />
          <img alt="" src="${links[2]}" />
        </body>
      </html>`;

    expect(getImagesFromHTML(html, baseUrl)).toStrictEqual(result);
    expect(getImagesFromHTML(html, baseUrl)).toHaveLength(result.length);
  });

  it("should return an empty list if no <img> tags were found", () => {
    const html = `
      <html>
        <body>
          <h1>Welcome</h1>
        </body>
      </html>`;

    expect(getImagesFromHTML(html, "https://example.com")).toHaveLength(0);
  });
});

describe("function extractPageData", () => {
  it("should return data in expected format", () => {
    const baseUrl = "https://example.com";
    const html = `
    <html>
      <body>
        <h1>Title</h1>
        <p>This is the first paragraph.</p>
        <p>This is the second paragraph.</p>
        <a href="/link1">Link 1</a>
        <img src="/image1.jpg" alt="Image 1">
      </body>
    </html>
  `;

    const result = extractPageData(html, baseUrl);
    const expected: ExtractedPageData = {
      url: "https://example.com",
      h1: "Title",
      first_paragraph: "This is the first paragraph.",
      outgoing_links: ["https://example.com/link1"],
      image_urls: ["https://example.com/image1.jpg"],
    };

    expect(result).toStrictEqual(expected);
  });
});
