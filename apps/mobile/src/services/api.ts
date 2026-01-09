/**
 * API Client for connecting to backend server
 *
 * Environment Setup:
 * Set EXPO_PUBLIC_API_URL in the monorepo root .env file:
 * - iOS Simulator: EXPO_PUBLIC_API_URL=http://localhost:4000
 * - Android Emulator: EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
 * - Physical Device: EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:4000
 */

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL;

if (!API_BASE_URL) {
  throw new Error(
    "EXPO_PUBLIC_API_URL is not set. Please configure the .env file at monorepo root:\n" +
      "  - iOS Simulator: EXPO_PUBLIC_API_URL=http://localhost:4000\n" +
      "  - Android Emulator: EXPO_PUBLIC_API_URL=http://10.0.2.2:4000\n" +
      "  - Physical Device: EXPO_PUBLIC_API_URL=http://<YOUR_LAN_IP>:4000"
  );
}

export const apiClient = {
  baseURL: API_BASE_URL,

  async get<T>(endpoint: string): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
      const response = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      console.error(`API Error [GET ${endpoint}]:`, error);
      throw error;
    }
  },
};
