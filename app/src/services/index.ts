import { testing } from './testing'
import { Application } from '../declarations'

export default (app: Application) => {
  app.configure(testing)
}
