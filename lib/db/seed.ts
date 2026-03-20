import { seedAchievements } from "./seed-achievements";
import { seedEducation } from "./seed-education";

async function main() {
  console.log("Seeding database...");
  await seedAchievements();
  await seedEducation();
  console.log("Seed complete!");
}

main().catch(console.error);
