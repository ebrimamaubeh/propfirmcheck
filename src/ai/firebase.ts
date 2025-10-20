import { initializeApp, getApp, getApps, type App } from 'firebase-admin/app';

const APP_NAME = 'firebase-admin-app';

export function getFirebaseAdminApp(): App {
  if (getApps().some(app => app.name === APP_NAME)) {
    return getApp(APP_NAME);
  }
  
  // If running in a managed environment (like Cloud Functions or App Engine),
  // initializeApp() can be called without arguments.
  // Otherwise, you would need to provide credentials.
  return initializeApp({}, APP_NAME);
}
