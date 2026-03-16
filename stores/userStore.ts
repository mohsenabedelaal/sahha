import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserProfile {
  id: number | null;
  name: string;
  email: string;
  age: number | null;
  sex: string | null;
  height_cm: number | null;
  weight_kg: number | null;
  activity_level: string | null;
  goal_type: string | null;
  diet_preference: string | null;
  allergies: string | null;
  daily_calorie_target: number | null;
  protein_target_g: number | null;
  carbs_target_g: number | null;
  fat_target_g: number | null;
  onboarding_complete: boolean;
}

interface UserStore {
  profile: UserProfile;
  setProfile: (profile: Partial<UserProfile>) => void;
  clearProfile: () => void;
}

const defaultProfile: UserProfile = {
  id: null,
  name: "",
  email: "",
  age: null,
  sex: null,
  height_cm: null,
  weight_kg: null,
  activity_level: null,
  goal_type: null,
  diet_preference: null,
  allergies: null,
  daily_calorie_target: null,
  protein_target_g: null,
  carbs_target_g: null,
  fat_target_g: null,
  onboarding_complete: false,
};

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: defaultProfile,
      setProfile: (updates) =>
        set((state) => ({
          profile: { ...state.profile, ...updates },
        })),
      clearProfile: () => set({ profile: defaultProfile }),
    }),
    { name: "sahha-user" },
  ),
);
