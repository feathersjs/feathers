import hashPassword from './hooks/hash-password';
import protect from './hooks/protect';

export const hooks = { hashPassword, protect };
export { LocalStrategy } from './strategy';
