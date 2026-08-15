import type { TeamMemberDisplay } from './types'

export const TEAM_MEMBERS: TeamMemberDisplay[] = [
  {
    id: 'aryaveer-singh',
    name: 'Aryaveer Singh',
    role: 'Business Analyst',
    photoUrl: null,
    blurb:
      'Wrote the Sprint 1 requirements doc: the team-page fields, the login styling-only scope, and the edge cases for UX to design around.',
  },
  {
    id: 'benjamin-cosentino',
    name: 'Benjamin Cosentino',
    role: 'UX Designer',
    photoUrl: null,
    blurb:
      'Designed the restyled login page and the team page layout, including the default-avatar and long-blurb edge cases the BA flagged.',
  },
  {
    id: 'htet-myet-aung-win',
    name: 'Htet Myet Aung Win',
    role: 'Developer 1',
    photoUrl: null,
    blurb:
      'Built the team page — member cards with photo, role and blurb — plus the redirect from login and the guard on direct URL access.',
  },
  {
    id: 'liam-robinson-hounsell',
    name: 'Liam Robinson Hounsell',
    role: 'Developer 2',
    photoUrl: null,
    blurb:
      'Applied the approved login styling — colours, layout, branding — with the auth logic, validation and session handling left untouched.',
  },
  {
    id: 'kayd-ho',
    name: 'Kayd Ho',
    role: 'Project Manager',
    photoUrl: null,
    blurb:
      "Reviewed the finished feature against the requirements and design, checked every task's completion, and signed off with the board closed out.",
  },
]
