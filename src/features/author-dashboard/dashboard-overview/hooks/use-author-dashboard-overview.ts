"use client";

import { useQuery } from "@tanstack/react-query";

import { getAuthorDashboardOverview } from "../api/get-author-dashboard-overview";

export function useAuthorDashboardOverview() {
  return useQuery({
    queryKey: ["author-dashboard-overview"],
    queryFn: getAuthorDashboardOverview,
  });
}
