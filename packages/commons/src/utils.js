export function stripSlashes(name) {
  return name.replace(/^(\/*)|(\/*)$/g, '');
}
