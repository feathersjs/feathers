import contributorNames from './contributor-names.json'

export interface Contributor {
  name: string
  avatar: string
}

export interface CoreTeam {
  avatar: string
  name: string
  github: string
  twitter?: string
  sponsors?: boolean
  description: string
}

const contributorsAvatars: Record<string, string> = {}

const getAvatarUrl = (name: string) => import.meta.hot ? `https://github.com/${name}.png` : `/user-avatars/${name}.png`

export const contributors = (contributorNames as string[]).reduce((acc, name) => {
  contributorsAvatars[name] = getAvatarUrl(name)
  acc.push({ name, avatar: contributorsAvatars[name] })
  return acc
}, [] as Contributor[])

export const teamMembers: CoreTeam[] = [
  {
    avatar: contributorsAvatars.daffl,
    name: 'David Luecke',
    github: 'daffl',
    // twitter: 'daffl',
    sponsors: true,
    description: 'A fanatical open sourceror<br>Core team member of Vite & Vue<br>Working at NuxtLabs',
  },
  {
    avatar: contributorsAvatars.marshallswain,
    name: 'Marshall Thompson',
    github: 'marshallswain',
    twitter: 'marshallswain',
    sponsors: true,
    description: 'A collaborative being<br>Core team member of Vite<br>Team member of Vue',
  },
  // {
  //   avatar: contributorsAvatars.fratzinger,
  //   name: 'Frederik Schmatz',
  //   github: 'fratzinger',
  //   twitter: 'fratzinger_',
  //   sponsors: false,
  //   description: 'An open source developer<br>Team member of Poimandres and Vike',
  // },
  // {
  //   avatar: contributorsAvatars.vonagam,
  //   name: 'Dmitrii Maganov',
  //   github: 'vonagam',
  //   twitter: 'vonagam',
  //   sponsors: false,
  //   description: 'An open source developer<br>Team member of Poimandres and Vike',
  // },
  // {
  //   avatar: contributorsAvatars.DaddyWarbucks,
  //   name: 'Beau Shaw',
  //   github: 'DaddyWarbucks',
  //   // twitter: 'daddywarbucks',
  //   sponsors: false,
  //   description: 'An open source fullstack developer',
  // },
]
