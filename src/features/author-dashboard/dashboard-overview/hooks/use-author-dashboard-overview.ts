"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthorDashboardOverview } from "../api/get-author-dashboard-overview";

export function useAuthorDashboardOverview(accessToken?: string) {
  return useQuery({
    queryKey: ["author-dashboard-overview", accessToken],
    queryFn: () => getAuthorDashboardOverview(accessToken ?? ""),
    enabled: Boolean(accessToken),
  });
}
