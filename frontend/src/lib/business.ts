import "server-only";

import { redirect } from "next/navigation";

import { api } from "./api";
import { requireToken, requireVerifiedUser } from "./auth";
import type { Agreement, CurrentUser, ManagedSpot, Member, Role } from "./types";

/** The signed-in business owner; personal accounts are sent to the dashboard. */
export async function requireBusinessOwner(): Promise<CurrentUser> {
  const user = await requireVerifiedUser();
  if (!user.business) {
    redirect("/dashboard");
  }
  return user;
}

async function list<T>(path: string): Promise<T[]> {
  const response = await api<{ data: T[] }>(path, { token: await requireToken() });
  return response.data;
}

export const businessRoles = () => list<Role>("/me/business/roles");
export const businessAgreements = () => list<Agreement>("/me/business/agreements");
export const businessMembers = () => list<Member>("/me/business/employees");
export const businessSpots = () => list<ManagedSpot>("/me/business/spots");
