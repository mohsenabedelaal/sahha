"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const ACTIVITY_LEVELS = [
  { value: "sedentary", label: "Sedentary", desc: "Little or no exercise" },
  { value: "lightly_active", label: "Lightly Active", desc: "Exercise 1-3 days/week" },
  { value: "moderately_active", label: "Moderately Active", desc: "Exercise 3-5 days/week" },
  { value: "very_active", label: "Very Active", desc: "Exercise 6-7 days/week" },
  { value: "extra_active", label: "Extra Active", desc: "Very intense exercise daily" },
];

const GOAL_TYPES = [
  { value: "cut", label: "Lose Weight", desc: "-500 cal/day deficit" },
  { value: "maintain", label: "Maintain Weight", desc: "Stay at current weight" },
  { value: "bulk", label: "Gain Weight", desc: "+300 cal/day surplus" },
];

const DIET_PREFERENCES = [
  "No preference",
  "Vegetarian",
  "Vegan",
  "Keto",
  "Paleo",
  "Mediterranean",
  "Halal",
  "Gluten-free",
];

const COMMON_ALLERGIES = [
  "Dairy",
  "Eggs",
  "Peanuts",
  "Tree nuts",
  "Soy",
  "Wheat",
  "Fish",
  "Shellfish",
  "Sesame",
];

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Form state
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [goalType, setGoalType] = useState("");
  const [dietPreference, setDietPreference] = useState("No preference");
  const [allergies, setAllergies] = useState<string[]>([]);

  function canContinue() {
    switch (step) {
      case 1: return name && age && sex;
      case 2: return heightCm && weightKg;
      case 3: return activityLevel;
      case 4: return goalType;
      case 5: return true;
      case 6: return true;
      default: return false;
    }
  }

  function toggleAllergy(allergy: string) {
    setAllergies((prev) =>
      prev.includes(allergy)
        ? prev.filter((a) => a !== allergy)
        : [...prev, allergy],
    );
  }

  async function handleSubmit() {
    setLoading(true);
    setError("");

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        age: Number(age),
        sex,
        height_cm: Number(heightCm),
        weight_kg: Number(weightKg),
        activity_level: activityLevel,
        goal_type: goalType,
        diet_preference: dietPreference === "No preference" ? null : dietPreference,
        allergies: allergies.length > 0 ? allergies.join(",") : null,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong");
      return;
    }

    router.push("/dashboard");
    router.refresh();
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Progress bar */}
      <div className="w-full bg-surface-2 rounded-full h-2">
        <div
          className="bg-mint h-2 rounded-full transition-all duration-300"
          style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
        />
      </div>
      <p className="text-sm text-muted text-center">Step {step} of {TOTAL_STEPS}</p>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="flex flex-col gap-4"
        >
          {step === 1 && (
            <>
              <h2 className="text-xl font-semibold">About You</h2>
              <Input id="name" label="Name" placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
              <Input id="age" label="Age" type="number" placeholder="25" value={age} onChange={(e) => setAge(e.target.value)} min="13" max="120" />
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-muted">Sex</label>
                <div className="flex gap-3">
                  {["male", "female"].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setSex(s)}
                      className={`flex-1 rounded-xl py-3 text-center capitalize transition-colors ${sex === s ? "bg-mint text-background" : "bg-surface-2 text-foreground"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-xl font-semibold">Body Stats</h2>
              <Input id="height" label="Height (cm)" type="number" placeholder="170" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} min="100" max="250" />
              <Input id="weight" label="Weight (kg)" type="number" placeholder="70" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} min="30" max="300" />
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-xl font-semibold">Activity Level</h2>
              <div className="flex flex-col gap-2">
                {ACTIVITY_LEVELS.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setActivityLevel(level.value)}
                    className={`rounded-xl p-3 text-left transition-colors ${activityLevel === level.value ? "bg-mint text-background" : "bg-surface-2 text-foreground"}`}
                  >
                    <div className="font-medium">{level.label}</div>
                    <div className={`text-sm ${activityLevel === level.value ? "text-background/70" : "text-muted"}`}>{level.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h2 className="text-xl font-semibold">Your Goal</h2>
              <div className="flex flex-col gap-2">
                {GOAL_TYPES.map((goal) => (
                  <button
                    key={goal.value}
                    type="button"
                    onClick={() => setGoalType(goal.value)}
                    className={`rounded-xl p-3 text-left transition-colors ${goalType === goal.value ? "bg-mint text-background" : "bg-surface-2 text-foreground"}`}
                  >
                    <div className="font-medium">{goal.label}</div>
                    <div className={`text-sm ${goalType === goal.value ? "text-background/70" : "text-muted"}`}>{goal.desc}</div>
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 5 && (
            <>
              <h2 className="text-xl font-semibold">Diet Preference</h2>
              <select
                value={dietPreference}
                onChange={(e) => setDietPreference(e.target.value)}
                className="w-full rounded-xl bg-surface-2 px-4 py-3 text-foreground focus:border-mint focus:ring-2 focus:ring-mint/20 focus:outline-none"
              >
                {DIET_PREFERENCES.map((pref) => (
                  <option key={pref} value={pref}>{pref}</option>
                ))}
              </select>
            </>
          )}

          {step === 6 && (
            <>
              <h2 className="text-xl font-semibold">Allergies</h2>
              <p className="text-sm text-muted">Select any that apply (optional)</p>
              <div className="flex flex-wrap gap-2">
                {COMMON_ALLERGIES.map((allergy) => (
                  <button
                    key={allergy}
                    type="button"
                    onClick={() => toggleAllergy(allergy)}
                    className={`rounded-full px-4 py-2 text-sm transition-colors ${allergies.includes(allergy) ? "bg-mint text-background" : "bg-surface-2 text-foreground"}`}
                  >
                    {allergy}
                  </button>
                ))}
              </div>
            </>
          )}
        </motion.div>
      </AnimatePresence>

      {error && <p className="text-sm text-red">{error}</p>}

      <div className="flex gap-3 mt-2">
        {step > 1 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < TOTAL_STEPS ? (
          <Button onClick={() => setStep(step + 1)} disabled={!canContinue()} className="flex-1">
            Continue
          </Button>
        ) : (
          <Button onClick={handleSubmit} loading={loading} disabled={!canContinue()} className="flex-1">
            Complete Setup
          </Button>
        )}
      </div>
    </div>
  );
}
