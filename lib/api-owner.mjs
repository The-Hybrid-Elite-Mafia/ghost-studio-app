// Server-only allowlist, verified against the Site owner access policy.
// Sites supplies these authenticated headers; never accept owner flags from request JSON.
export const API_OWNER_EMAIL = 'steve.reliford@gmail.com';
export function isApiOwner(request) {
 return !!request.headers.get('oai-authenticated-user-id') &&
  request.headers.get('oai-authenticated-user-email')?.trim().toLowerCase() === API_OWNER_EMAIL;
}
