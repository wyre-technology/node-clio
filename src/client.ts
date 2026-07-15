import { API_BASE_URLS, DEFAULT_TIMEOUT_MS, type ClioClientConfig } from './config.js';
import { HttpClient } from './http.js';
import { OAuthTokenRefresher } from './auth.js';
import { MattersResource } from './resources/matters.js';
import { ContactsResource } from './resources/contacts.js';
import { ActivitiesResource } from './resources/activities.js';
import { CommunicationsResource } from './resources/communications.js';
import { TasksResource } from './resources/tasks.js';
import { DocumentsResource } from './resources/documents.js';
import { CalendarEntriesResource } from './resources/calendar-entries.js';
import { BillsResource } from './resources/bills.js';

/**
 * The main entry point for the Clio API client.
 *
 * ```ts
 * const client = new ClioClient({
 *   accessToken: 'xxx',
 *   refreshToken: 'yyy',
 *   clientId: process.env.CLIO_CLIENT_ID,
 *   clientSecret: process.env.CLIO_CLIENT_SECRET,
 *   region: 'us',
 * });
 *
 * const matters = await client.matters.list({ status: 'open' });
 * ```
 */
export class ClioClient {
  private readonly http: HttpClient;
  private accessToken: string;

  readonly matters: MattersResource;
  readonly contacts: ContactsResource;
  readonly activities: ActivitiesResource;
  readonly communications: CommunicationsResource;
  readonly tasks: TasksResource;
  readonly documents: DocumentsResource;
  readonly calendarEntries: CalendarEntriesResource;
  readonly bills: BillsResource;

  constructor(config: ClioClientConfig) {
    if (!config.accessToken) {
      throw new Error('ClioClient requires an accessToken');
    }

    this.accessToken = config.accessToken;
    const region = config.region ?? 'us';
    const baseUrl = config.baseUrl ?? API_BASE_URLS[region];

    const canRefresh = Boolean(config.refreshToken && config.clientId && config.clientSecret);
    const tokenRefresher = canRefresh
      ? new OAuthTokenRefresher(
          { clientId: config.clientId!, clientSecret: config.clientSecret!, region, oauthBaseUrl: config.oauthBaseUrl },
          config.refreshToken!,
          (tokens) => {
            this.accessToken = tokens.accessToken;
            config.onTokenRefresh?.(tokens);
          }
        )
      : undefined;

    this.http = new HttpClient({
      baseUrl,
      getAccessToken: () => this.accessToken,
      setAccessToken: (token) => {
        this.accessToken = token;
      },
      tokenRefresher,
      timeoutMs: config.timeoutMs ?? DEFAULT_TIMEOUT_MS,
    });

    this.matters = new MattersResource(this.http);
    this.contacts = new ContactsResource(this.http);
    this.activities = new ActivitiesResource(this.http);
    this.communications = new CommunicationsResource(this.http);
    this.tasks = new TasksResource(this.http);
    this.documents = new DocumentsResource(this.http);
    this.calendarEntries = new CalendarEntriesResource(this.http);
    this.bills = new BillsResource(this.http);
  }
}
