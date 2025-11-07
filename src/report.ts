import * as fs from "node:fs";
import * as path from "node:path";
import { ExtractedPageData } from "./types";

export function writeCSVReport(
  pageData: Record<string, ExtractedPageData>,
  fileName = "report.csv"
): void {
  const headers = [
    "page_url",
    "h1",
    "first_paragraph",
    "internal_links",
    "external_links",
    "image_urls",
  ];
  const rows: string[] = [headers.join(",")];

  for (const page of Object.values(pageData)) {
    const { url, h1, firstParagraph, externalLinks, internalLinks, imageUrls } =
      page;
    const values = [
      url,
      h1,
      firstParagraph,
      internalLinks,
      externalLinks,
      imageUrls,
    ].map((value) => {
      if (Array.isArray(value)) {
        if (value.length === 0) {
          return csvEscape("");
        }
        return csvEscape(value.join(";"));
      }
      return csvEscape(value);
    });

    rows.push(values.join(","));
  }

  const filePath = path.resolve(process.cwd(), fileName);

  try {
    fs.writeFileSync(filePath, rows.join("\n"), { flag: "w" });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error("Unexpected error occured.");
    }
  }
}

function csvEscape(field: string) {
  const str = field ?? "";
  const needsQuoting = /[",\n]/.test(str);
  const escaped = str.replace(/"/g, '""');
  return needsQuoting ? `"${escaped}"` : escaped;
}
