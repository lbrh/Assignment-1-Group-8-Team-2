const CONCURRENT = 4;

/** Warms the browser cache with images the UI is about to need. Preview URLs are cached for a
 * year (an image never changes once stored), so this pays off across visits, not just this one.
 * Waits for an idle moment and fetches at low priority, a few at a time, so it never competes
 * with what the page is loading for itself.
 * ponytail: preloads every URL it's given; cap or prioritise by viewport if incidents number in
 * the hundreds (each 800px preview is ~30 KB). */
export function preloadImages(urls: (string | null)[]): void {
  const queue = urls.filter((url): url is string => !!url);
  const next = () => {
    const url = queue.shift();
    if (!url) return;
    const img = new Image();
    img.fetchPriority = "low";
    img.onload = img.onerror = next;
    img.src = url;
  };
  const start = () => {
    for (let i = 0; i < CONCURRENT; i++) next();
  };
  if ("requestIdleCallback" in window) requestIdleCallback(start, { timeout: 3000 });
  else setTimeout(start, 1000);
}
