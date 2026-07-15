export { ClioClient } from './client.js';
export type { ClioClientConfig, ClioRegion } from './config.js';
export { API_BASE_URLS, OAUTH_BASE_URLS } from './config.js';

export {
  ServiceError,
  AuthenticationError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
} from './errors.js';

export {
  buildAuthorizationUrl,
  exchangeAuthorizationCode,
  refreshAccessToken,
  OAuthTokenRefresher,
} from './auth.js';
export type { OAuthCredentials, TokenResponse } from './auth.js';

export type { Page } from './pagination.js';
export type {
  ClioListParams,
  ClioListMeta,
  ClioListResponse,
  ClioSingleResponse,
  ClioErrorResponse,
} from './types/common.js';

export { MattersResource } from './resources/matters.js';
export { ContactsResource } from './resources/contacts.js';
export { ActivitiesResource } from './resources/activities.js';
export { CommunicationsResource } from './resources/communications.js';
export { TasksResource } from './resources/tasks.js';
export { DocumentsResource } from './resources/documents.js';
export { CalendarEntriesResource } from './resources/calendar-entries.js';
export { BillsResource } from './resources/bills.js';

export type * from './types/matters.js';
export type * from './types/contacts.js';
export type * from './types/activities.js';
export type * from './types/communications.js';
export type * from './types/tasks.js';
export type * from './types/documents.js';
export type * from './types/calendar-entries.js';
export type * from './types/bills.js';
