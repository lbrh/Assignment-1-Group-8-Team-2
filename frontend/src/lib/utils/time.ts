/** Live "N min ago" formatting — reads the store's clockTick so display updates without
 * every row running its own interval (see useClock in the store). */
export function relativeTime(iso: string, _tick?: number): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const diffMs = Math.max(0, now - then);
  const mins = Math.floor(diffMs / 60000);

  if (mins < 1) return "just now";
  if (mins === 1) return "1 min ago";
  if (mins < 60) return `${mins} min ago`;

  const hrs = Math.floor(mins / 60);
  const remMins = mins % 60;
  if (hrs < 24) {
    return remMins > 0 ? `${hrs} hr ${remMins} min ago` : `${hrs} hr ago`;
  }

  const days = Math.floor(hrs / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}

export function shortRelativeTime(iso: string, _tick?: number): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.floor(Math.max(0, now - then) / 60000);
  if (mins < 1) return "0m";
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

export function formatClock(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}
