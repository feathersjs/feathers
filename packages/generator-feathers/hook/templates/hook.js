export default function(hook, next) {
  hook.data.ran = true;
  next();
}
