import admin from "firebase-admin";
import { config } from "../config/env.js";

let firebaseApp: admin.app.App | null = null;

/**
 * Initialize Firebase Admin SDK if credentials are configured
 */
export const initializeFirebase = (): void => {
  if (!config.firebase.isConfigured) {
    console.warn(
      "Firebase credentials not configured. Firebase authentication will be disabled."
    );
    return;
  }

  try {
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: config.firebase.projectId!,
        clientEmail: config.firebase.clientEmail!,
        privateKey: config.firebase.privateKey!,
      }),
    });
    console.log("Firebase Admin SDK initialized successfully");
  } catch (error) {
    console.error("Failed to initialize Firebase Admin SDK:", error);
    firebaseApp = null;
  }
};

/**
 * Get Firebase Admin instance
 */
export const getFirebaseAdmin = (): admin.app.App => {
  if (!firebaseApp) {
    throw new Error("Firebase Admin SDK is not initialized");
  }
  return firebaseApp;
};

/**
 * Check if Firebase is configured
 */
export const isFirebaseConfigured = (): boolean => {
  return firebaseApp !== null;
};

/**
 * Verify Firebase ID token
 */
export const verifyIdToken = async (
  idToken: string
): Promise<admin.auth.DecodedIdToken> => {
  if (!firebaseApp) {
    throw new Error("Firebase Admin SDK is not initialized");
  }
  return admin.auth().verifyIdToken(idToken);
};
