const trimTrailingSlash = (value: string) => value.replace(/\/+$/, '');

export const apiConfig = {
  baseUrl: trimTrailingSlash('http://localhost:5020'),
  authTokenHeader: 'X-Auth-Token',
  authorizationHeader: 'Authorization',
  bearerPrefix: 'Bearer '
} as const;

export type ApiConfig = typeof apiConfig;
