export interface MockIncident {
  id: string
  title: string
  latitude: number
  longitude: number
  severity: 1 | 2 | 3 | 4
  tag: 'MOD' | 'HIGH' | 'EXT' | 'CAT' | 'REVIEW'
  timeAgo: string
  confidence: number | null
  status: 'AWAITING' | 'REVIEW'
}
