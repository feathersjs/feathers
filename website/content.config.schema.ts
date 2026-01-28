import { z } from 'zod'

// Menus
export type MenuItem = {
  title: string
  path: string
  stem?: string
  icon?: string
  iconClasses?: string
  noDivider?: boolean
  meta?: {
    new?: boolean
  }
  children?: MenuItem[]
}

// Using a non-recursive schema for Nuxt Content compatibility
// The full recursive type is maintained via the TypeScript type above
export const menuItemSchema = z.object({
  title: z.string(),
  path: z.string(),
  stem: z.string().optional(),
  icon: z.string().optional(),
  iconClasses: z.string().optional(),
  noDivider: z.boolean().optional(),
  meta: z
    .object({
      new: z.boolean().optional()
    })
    .optional(),
  children: z.array(z.any()).optional()
})

export const menuSchema = z.object({
  title: z.string(),
  icon: z.string().optional(),
  iconClasses: z.string().optional(),
  items: z.array(menuItemSchema)
})
export type Menu = z.infer<typeof menuSchema>

// Product
export interface Product {
  title: string
  published: boolean
  highlight: boolean
  shortName: string
  description: string
  longDescription: string
  menuDescription: string
  slug: string
  icon: string
  logo: string
  link: string
  meta: {
    docLink: string
    birdImage: string
    planetImage: string
  }
}
