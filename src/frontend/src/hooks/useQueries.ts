import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  AnalyticsEntry,
  Lead,
  UserProfile,
  Variant_desktop_mobile_unknown,
  Variant_qr_nfc_direct,
} from "../backend";
import { useActor } from "./useActor";

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();
  const query = useQuery<UserProfile | null>({
    queryKey: ["currentUserProfile"],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });
  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useGetPublicProfile(username: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<UserProfile>({
    queryKey: ["publicProfile", username],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getPublicProfile(username);
    },
    enabled: !!actor && !actorFetching && !!username,
    retry: false,
  });
}

export function useGetLeads(username: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<Lead[]>({
    queryKey: ["leads", username],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getLeads(username);
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useGetAnalytics(username: string) {
  const { actor, isFetching: actorFetching } = useActor();
  return useQuery<AnalyticsEntry[]>({
    queryKey: ["analytics", username],
    queryFn: async () => {
      if (!actor) throw new Error("Actor not available");
      return actor.getAnalytics(username);
    },
    enabled: !!actor && !actorFetching && !!username,
  });
}

export function useSaveProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error("Actor not available");
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["currentUserProfile"] });
    },
  });
}

export function useSubmitLead() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async ({
      username,
      name,
      phone,
      email,
    }: {
      username: string;
      name: string;
      phone: string;
      email: string;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.submitLead(username, name, phone, email);
    },
  });
}

export function useLogProfileView() {
  const { actor } = useActor();
  return useMutation({
    mutationFn: async (params: {
      username: string;
      deviceType: Variant_desktop_mobile_unknown;
      country: string;
      source: Variant_qr_nfc_direct;
    }) => {
      if (!actor) throw new Error("Actor not available");
      return actor.logProfileView(
        params.username,
        params.deviceType,
        params.country,
        params.source,
      );
    },
  });
}
