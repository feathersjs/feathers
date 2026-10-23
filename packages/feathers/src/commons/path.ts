// Removes all leading and trailing slashes from a path
export function stripSlashes(name: string) {
  return name.replace(/^(\/+)|(\/+)$/g, '')
}
