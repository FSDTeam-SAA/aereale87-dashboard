"use client";

import { useQuery } from "@tanstack/react-query";

import { getAdminDashboardOverview } from "../api/get-admin-dashboard-overview";

export function useAdminDashboardOverview() {
  return useQuery({
    queryKey: ["admin-dashboard-overview"],
    queryFn: getAdminDashboardOverview,
  });
}
