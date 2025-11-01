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
