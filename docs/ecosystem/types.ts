export type PackageInput = {
  npm: string
  repo: string
}

export type PackagesInput = Record<string, PackageInput>

export type PackageOutput = {
  id: string
  name: string
  description: string
  keywords: string[]
  /** npm license */
  license: string
  /** npm version */
  version: string
  /** npm monthly downloads */
  downloads: number
  /** npm last published Date */
  lastPublish: Date
  /** npm last published Date as unix */
  lastPublishUnix: number
  /** github: stars count */
  stars: number
  /** github: open issues count */
  issues: number
  /** github: age of repo */
  createdAt: Date
  /** github: name of the owner */
  ownerName: string
  /** github: url of the users avatar */
  ownerAvatar: string
  /** github: url of the repo */
  ghLink: string
  hasNPM: boolean
  /** npm: url of the package */
  npmLink: string
  repository: {
    name: string
    directory: string
  }
}
