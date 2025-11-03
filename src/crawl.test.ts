import { describe, expect, it } from "vitest";
import {
  getFirstParagraphFromHTML,
  getH1FromHtml,
  normalizeURL,
} from "./crawl";

describe("normalizeURL", () => {
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

describe("getH1FromHtml", () => {
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

describe("getFirstParagraphFromHTML", () => {
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
