import { z } from 'zod'

export const teamMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(30, 'Name must be 30 characters or fewer'),
  role: z.string().min(1, 'Role is required').max(25, 'Role must be 25 characters or fewer'),
  photoUrl: z.string().url('Must be a valid URL').nullable(),
  blurb: z.string().max(200, 'Blurb must be 200 characters or fewer').nullable(),
  order: z.number().int().nonnegative(),
})

export type TeamMemberInput = z.infer<typeof teamMemberSchema>
