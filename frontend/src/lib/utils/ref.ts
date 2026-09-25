// Crockford base32: no I, L, O or U, so a reference read aloud over the radio can't be misheard.
const ALPHABET = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Short, stable reference for an incident ("INC-K7Q2MX"), shown in the UI in place of its UUID.
 * The UUID stays the real key (URLs, API calls, exports); this is a 30-bit FNV-1a hash of it.
 * ponytail: ~1 in 2,000 chance of two refs clashing across 1,000 incidents; lengthen past 6
 * characters if the incident count gets into the tens of thousands. */
export function incidentRef(id: string): string {
  if (!UUID.test(id)) return id; // mock ids are already short ("INC-2291")
  let hash = 0x811c9dc5;
  for (let i = 0; i < id.length; i++) {
    hash ^= id.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  let ref = "";
  for (let i = 0; i < 6; i++) {
    ref += ALPHABET[hash & 31];
    hash >>>= 5;
  }
  return `INC-${ref}`;
}
