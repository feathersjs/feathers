import hashPassword from './hooks/hash-password.ts';
import protect from './hooks/protect.ts';

export const hooks = { hashPassword, protect };
export { LocalStrategy } from './strategy.ts';
