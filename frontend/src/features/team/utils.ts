export function toDisplayName(name: string): string {
  if (name.length <= 20) return name

  const parts = name.trim().split(/\s+/)
  const [first, ...rest] = parts
  if (!first || rest.length === 0) return name

  return `${first[0]}. ${rest.join(' ')}`
}
