export const APP_ROUTES = {
  root: '/',
  ads: '/ads',
  adDetails: '/ads/:id',
  adEdit: '/ads/:id/edit',
  notFound: '*',
} as const;

export const buildAdDetailsPath = (id: string | number): string => `/ads/${id}`;
export const buildAdEditPath = (id: string | number): string => `/ads/${id}/edit`;
