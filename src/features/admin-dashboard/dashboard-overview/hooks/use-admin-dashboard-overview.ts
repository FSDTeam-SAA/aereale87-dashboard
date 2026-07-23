"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboardOverview } from "../api/get-admin-dashboard-overview";

export function useAdminDashboardOverview(accessToken?: string) {
  return useQuery({
    queryKey: ["admin-dashboard-overview", accessToken],
    queryFn: () => getAdminDashboardOverview(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
}
