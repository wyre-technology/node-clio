import { http, HttpResponse } from 'msw';
import * as fixtures from '../fixtures/index.js';
import { BASE_URL } from './constants.js';

/**
 * Default ("happy path") handlers for every resource endpoint this SDK calls.
 * Individual tests override specific endpoints with `server.use(...)` to exercise
 * error paths (401/404/429/422) without duplicating the whole handler set.
 */
export const handlers = [
  // Matters
  http.get(`${BASE_URL}/matters.json`, () => HttpResponse.json(fixtures.matterListResponse)),
  http.get(`${BASE_URL}/matters/:id.json`, () => HttpResponse.json(fixtures.matterSingleResponse)),
  http.post(`${BASE_URL}/matters.json`, () => HttpResponse.json(fixtures.matterSingleResponse, { status: 201 })),
  http.patch(`${BASE_URL}/matters/:id.json`, () => HttpResponse.json(fixtures.matterSingleResponse)),

  // Contacts
  http.get(`${BASE_URL}/contacts.json`, () => HttpResponse.json(fixtures.contactListResponse)),
  http.get(`${BASE_URL}/contacts/:id.json`, () => HttpResponse.json(fixtures.contactSingleResponse)),
  http.post(`${BASE_URL}/contacts.json`, () => HttpResponse.json(fixtures.contactSingleResponse, { status: 201 })),
  http.patch(`${BASE_URL}/contacts/:id.json`, () => HttpResponse.json(fixtures.contactSingleResponse)),

  // Activities
  http.get(`${BASE_URL}/activities.json`, () => HttpResponse.json(fixtures.activityListResponse)),
  http.get(`${BASE_URL}/activities/:id.json`, () => HttpResponse.json(fixtures.activitySingleResponse)),
  http.post(`${BASE_URL}/activities.json`, () => HttpResponse.json(fixtures.activitySingleResponse, { status: 201 })),

  // Communications (read-only)
  http.get(`${BASE_URL}/communications.json`, () => HttpResponse.json(fixtures.communicationListResponse)),
  http.get(`${BASE_URL}/communications/:id.json`, () => HttpResponse.json(fixtures.communicationSingleResponse)),

  // Tasks
  http.get(`${BASE_URL}/tasks.json`, () => HttpResponse.json(fixtures.taskListResponse)),
  http.get(`${BASE_URL}/tasks/:id.json`, () => HttpResponse.json(fixtures.taskSingleResponse)),
  http.post(`${BASE_URL}/tasks.json`, () => HttpResponse.json(fixtures.taskSingleResponse, { status: 201 })),
  http.patch(`${BASE_URL}/tasks/:id.json`, () => HttpResponse.json(fixtures.taskSingleResponse)),

  // Documents (metadata only, read-only)
  http.get(`${BASE_URL}/documents.json`, () => HttpResponse.json(fixtures.documentListResponse)),
  http.get(`${BASE_URL}/documents/:id.json`, () => HttpResponse.json(fixtures.documentSingleResponse)),

  // Calendar Entries (read-only)
  http.get(`${BASE_URL}/calendar_entries.json`, () => HttpResponse.json(fixtures.calendarEntryListResponse)),
  http.get(`${BASE_URL}/calendar_entries/:id.json`, () => HttpResponse.json(fixtures.calendarEntrySingleResponse)),

  // Bills (read-only)
  http.get(`${BASE_URL}/bills.json`, () => HttpResponse.json(fixtures.billListResponse)),
  http.get(`${BASE_URL}/bills/:id.json`, () => HttpResponse.json(fixtures.billSingleResponse)),
];
