import { describe, expect, it } from "vitest";
import { normalizeURL } from "./crawl";

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
