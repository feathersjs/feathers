// noinspection ES6PreferShortImport: IntelliJ IDE hint to avoid warning to use `~/contributors`, will fail on build if changed

/* Texts */
export const feathersName = 'feathers'
export const feathersShortName = 'feathers'
export const feathersDescription = 'The API & Real-time Application Framework'

/* CDN fonts and styles */
export const googleapis = 'https://fonts.googleapis.com'
export const gstatic = 'https://fonts.gstatic.com'
export const font = `${googleapis}/css2?family=Readex+Pro:wght@200;400;600&display=swap`

/* vitepress head */
export const ogUrl = 'https://feathersjs.com/'
export const ogImage = `${ogUrl}og.png`

/* GitHub and social links */
export const github = 'https://github.com/feathersjs/feathers'
export const releases = 'https://github.com/feathersjs/feathers/releases'
export const contributing = 'https://github.com/feathersjs/feathers/blob/master/.github/contributing.md'
export const discord = 'https://discord.gg/qa8kez8QBx'
export const twitter = null;

/* Avatar/Image/Sponsors servers */
export const preconnectLinks = [googleapis, gstatic]
export const preconnectHomeLinks = [googleapis, gstatic]

/* PWA runtime caching urlPattern regular expressions */
export const pwaFontsRegex = new RegExp(`^${googleapis}/.*`, 'i')
export const pwaFontStylesRegex = new RegExp(`^${gstatic}/.*`, 'i')
