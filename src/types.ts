export type ExtractedPageData = {
  url: string;
  h1: string;
  firstParagraph: string;
  externalLinks: string[];
  internalLinks: string[];
  imageUrls: string[];
};

export type LinksData = {
  externalLinks: Set<string>;
  internalLinks: Set<string>;
};
