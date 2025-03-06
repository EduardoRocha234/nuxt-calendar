import type { IUser } from "~/interfaces";

export const useUser = (): Ref<IUser | null> =>
	useState<IUser | null>('user', () => null)
