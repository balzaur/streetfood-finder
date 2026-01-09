import { Vendor } from "@ultimate-sf/shared";
import { apiClient } from "./api";

export const getVendors = async (): Promise<Vendor[]> => {
  return apiClient.get<Vendor[]>("/api/v1/vendors");
};
