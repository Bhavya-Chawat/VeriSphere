/**
 * @file use-store.ts
 * @package apps/web
 * @purpose Defines the Zustand store managing global layout states, active candidate listings, and UI status filters.
 * @dependencies zustand
 * @security None
 * @future_implementation Sync state filters with URL search parameters (using next/navigation) to support back-button states.
 */

import { create } from "zustand";
import { Candidate, VerificationJob } from "@verisphere/shared-types";

interface VerisphereState {
  // Candidate listings
  candidates: Candidate[];
  activeJob: VerificationJob | null;
  
  // Dashboard UI Filters
  searchQuery: string;
  statusFilter: string; // "ALL", "COMPLETED", "FAILED", "ANALYZING"
  
  // Actions
  setCandidates: (candidates: Candidate[]) => void;
  setActiveJob: (job: VerificationJob | null) => void;
  setSearchQuery: (query: string) => void;
  setStatusFilter: (filter: string) => void;
  resetFilters: () => void;
}

export const useVerisphereStore = create<VerisphereState>((set) => ({
  candidates: [],
  activeJob: null,
  searchQuery: "",
  statusFilter: "ALL",

  setCandidates: (candidates) => set({ candidates }),
  setActiveJob: (activeJob) => set({ activeJob }),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setStatusFilter: (statusFilter) => set({ statusFilter }),
  resetFilters: () => set({ searchQuery: "", statusFilter: "ALL" })
}));
