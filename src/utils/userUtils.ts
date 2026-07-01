/**
 * Defensive accessors for user-shaped objects.
 *
 * Production backend currently serializes User without the @JsonProperty-aliased
 * `name` / `email` / `employeeId` fields (those live under `employeeName`,
 * `officialEmail`, `employeeCode` until the jar is redeployed). The frontend
 * historically read only the aliased fields, which caused "Unassigned" and
 * blank avatars everywhere. These helpers fall back to the raw JPA property
 * names so the UI works against either backend shape.
 */

export interface UserLike {
  id?: number;
  name?: string | null;
  email?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  officialEmail?: string | null;
  employeeCode?: string | null;
}

export const getUserName = (u: UserLike | null | undefined): string | undefined =>
  u?.name ?? u?.employeeName ?? undefined;

export const getUserEmail = (u: UserLike | null | undefined): string | undefined =>
  u?.email ?? u?.officialEmail ?? undefined;

export const getUserEmployeeId = (u: UserLike | null | undefined): string | undefined =>
  u?.employeeId ?? u?.employeeCode ?? undefined;

export const getUserInitial = (u: UserLike | null | undefined): string =>
  getUserName(u)?.charAt(0)?.toUpperCase() ?? '?';
