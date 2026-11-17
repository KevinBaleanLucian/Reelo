export function initials(user) {
  const letters = `${user.firstName?.[0] ?? ''}${user.lastName?.[0] ?? ''}`.toUpperCase();
  return letters || (user.username?.[0] ?? '?').toUpperCase();
}