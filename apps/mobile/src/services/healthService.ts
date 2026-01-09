import { HealthCheck } from "@ultimate-sf/shared";
import { apiClient } from "./api";

export const checkHealth = async (): Promise<HealthCheck> => {
  return apiClient.get<HealthCheck>("/health");
};
