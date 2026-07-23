if (typeof window === "undefined") {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async function (input: RequestInfo | URL, init?: RequestInit) {
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
        ? input.toString()
        : input.url;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";
    if (apiUrl && url.startsWith(apiUrl)) {
      const headers = new Headers(init?.headers);
      const secret = process.env.INTERNAL_API_SECRET || "dev-internal-secret-key-12345";
      headers.set("x-internal-secret", secret);
      return originalFetch(input, {
        ...init,
        headers,
      });
    }
    return originalFetch(input, init);
  };
}
