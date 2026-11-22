// Only the new Academy flow opts into returning after login. Existing entry
// points keep their /home destination; external URLs are never accepted.
export function getLoginDestination(returnTo) {
  return returnTo === "/academy" ? "/academy" : "/home";
}
