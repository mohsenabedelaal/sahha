import { db } from "./index";
import { educationContent, quizQuestions } from "./schema";

const LESSONS = [
  {
    title: "Why Protein Matters",
    category: "macronutrients",
    difficulty_level: "beginner",
    xp_reward: 100,
    order_index: 1,
    content: `# Why Protein Matters

Protein is one of three macronutrients your body needs in large amounts. It's made up of amino acids — the building blocks of muscle, skin, enzymes, and hormones.

## Key Benefits
- **Muscle repair & growth**: After exercise, protein repairs micro-tears in muscle fibers, making them stronger.
- **Satiety**: Protein keeps you fuller longer than carbs or fat, reducing overall calorie intake.
- **Thermic effect**: Your body burns ~25% of protein calories just digesting it (vs 5-10% for carbs).

## How Much Do You Need?
- **Sedentary adults**: 0.8g per kg body weight
- **Active individuals**: 1.2-1.6g per kg
- **Strength training**: 1.6-2.2g per kg

## Best Sources
Chicken breast, eggs, Greek yogurt, lentils, tofu, fish, whey protein.

> **Pro tip**: Spread protein across meals (25-40g per meal) for optimal muscle protein synthesis.`,
  },
  {
    title: "Fiber: Your Gut's Best Friend",
    category: "micronutrients",
    difficulty_level: "beginner",
    xp_reward: 100,
    order_index: 2,
    content: `# Fiber: Your Gut's Best Friend

Fiber is a carbohydrate your body can't digest — and that's exactly why it's so valuable.

## Two Types
- **Soluble fiber**: Dissolves in water, forms a gel. Slows digestion, lowers cholesterol. Found in oats, beans, apples.
- **Insoluble fiber**: Doesn't dissolve. Adds bulk to stool, prevents constipation. Found in whole grains, vegetables, nuts.

## Benefits
- Stabilizes blood sugar by slowing glucose absorption
- Feeds beneficial gut bacteria (prebiotic effect)
- Reduces risk of heart disease and type 2 diabetes
- Promotes healthy weight management

## Daily Target
Women: 25g | Men: 38g — Most people only get about 15g.

## Easy Wins
Add berries to breakfast, swap white rice for brown, snack on raw vegetables.`,
  },
  {
    title: "The Hydration Equation",
    category: "basics",
    difficulty_level: "beginner",
    xp_reward: 100,
    order_index: 3,
    content: `# The Hydration Equation

Water makes up about 60% of your body weight and is involved in virtually every bodily function.

## Why Hydration Matters
- **Metabolism**: Even mild dehydration (1-2%) can reduce metabolic rate by 3%
- **Appetite control**: Thirst is often mistaken for hunger
- **Exercise performance**: 2% dehydration can decrease performance by 25%
- **Cognitive function**: Dehydration impairs concentration and mood

## How Much?
General guideline: ~35ml per kg of body weight per day. More if exercising or in hot climates.

## Signs of Dehydration
- Dark yellow urine (aim for pale straw color)
- Headaches
- Fatigue and difficulty concentrating
- Dry mouth

## Tips
- Start your day with a glass of water
- Keep a water bottle visible at your desk
- Eat water-rich foods: cucumber, watermelon, oranges`,
  },
  {
    title: "Understanding Calories",
    category: "basics",
    difficulty_level: "beginner",
    xp_reward: 100,
    order_index: 4,
    content: `# Understanding Calories

A calorie is simply a unit of energy. Your body needs energy to breathe, think, move, and digest food.

## Energy Balance
- **Caloric surplus** (eat more than you burn) → weight gain
- **Caloric deficit** (eat less than you burn) → weight loss
- **Maintenance** (eat roughly what you burn) → stable weight

## Components of Daily Energy Expenditure
1. **BMR (60-70%)**: Basal Metabolic Rate — energy for basic life functions
2. **NEAT (15-30%)**: Non-Exercise Activity Thermogenesis — fidgeting, walking, standing
3. **TEF (8-15%)**: Thermic Effect of Food — energy to digest food
4. **EAT (5-10%)**: Exercise Activity Thermogenesis — intentional exercise

## Macronutrient Calories
- Protein: 4 kcal/g
- Carbohydrates: 4 kcal/g
- Fat: 9 kcal/g
- Alcohol: 7 kcal/g

## Key Takeaway
Not all calories are equal in terms of satiety, nutrition, and hormonal response. Quality matters alongside quantity.`,
  },
  {
    title: "Healthy Fats Explained",
    category: "macronutrients",
    difficulty_level: "intermediate",
    xp_reward: 150,
    order_index: 5,
    content: `# Healthy Fats Explained

Fat is essential — your brain is ~60% fat, and you need it for hormone production, vitamin absorption, and cell membrane integrity.

## Types of Fat
- **Monounsaturated**: Olive oil, avocados, almonds. Heart-protective.
- **Polyunsaturated**: Omega-3 (salmon, walnuts) and Omega-6 (vegetable oils). Essential — your body can't make them.
- **Saturated**: Butter, coconut oil, red meat. Moderate amounts are fine.
- **Trans fats**: Avoid entirely. Found in hydrogenated oils, some processed foods.

## Omega-3 Focus
Most people don't get enough omega-3:
- EPA & DHA (fish, algae): anti-inflammatory, brain health
- ALA (flaxseed, chia): must be converted to EPA/DHA (inefficient)

## How Much Fat?
20-35% of total calories. Minimum ~0.5g per kg body weight.

## Practical Tips
- Cook with olive oil instead of vegetable oil
- Eat fatty fish 2x per week
- Add nuts/seeds to salads and snacks`,
  },
];

const QUIZZES = [
  {
    lesson_index: 0,
    question: "How many calories does 1 gram of protein provide?",
    options: JSON.stringify(["2 kcal", "4 kcal", "7 kcal", "9 kcal"]),
    correct_index: 1,
    explanation: "Protein provides 4 kcal per gram, same as carbohydrates.",
    xp_reward: 25,
  },
  {
    lesson_index: 0,
    question: "What percentage of protein calories does your body burn during digestion?",
    options: JSON.stringify(["5%", "10%", "25%", "50%"]),
    correct_index: 2,
    explanation: "The thermic effect of protein is about 25%, much higher than carbs (5-10%) or fat (0-3%).",
    xp_reward: 25,
  },
  {
    lesson_index: 1,
    question: "Which type of fiber dissolves in water and forms a gel?",
    options: JSON.stringify(["Insoluble fiber", "Soluble fiber", "Cellulose", "Starch"]),
    correct_index: 1,
    explanation: "Soluble fiber dissolves in water to form a gel-like substance, slowing digestion.",
    xp_reward: 25,
  },
  {
    lesson_index: 2,
    question: "What percentage of your body weight is water?",
    options: JSON.stringify(["30%", "45%", "60%", "80%"]),
    correct_index: 2,
    explanation: "Water makes up approximately 60% of your body weight.",
    xp_reward: 25,
  },
  {
    lesson_index: 3,
    question: "Which component accounts for the largest portion of daily energy expenditure?",
    options: JSON.stringify(["Exercise", "BMR", "NEAT", "Thermic Effect of Food"]),
    correct_index: 1,
    explanation: "BMR (Basal Metabolic Rate) accounts for 60-70% of total daily energy expenditure.",
    xp_reward: 25,
  },
  {
    lesson_index: 3,
    question: "How many calories does 1 gram of fat provide?",
    options: JSON.stringify(["4 kcal", "7 kcal", "9 kcal", "12 kcal"]),
    correct_index: 2,
    explanation: "Fat is the most calorie-dense macronutrient at 9 kcal per gram.",
    xp_reward: 25,
  },
  {
    lesson_index: 4,
    question: "Which type of fat should be avoided entirely?",
    options: JSON.stringify(["Monounsaturated", "Polyunsaturated", "Saturated", "Trans fats"]),
    correct_index: 3,
    explanation: "Trans fats (found in hydrogenated oils) have no safe level of consumption and should be avoided.",
    xp_reward: 25,
  },
];

export async function seedEducation() {
  const insertedLessons = [];
  for (const lesson of LESSONS) {
    const [inserted] = await db
      .insert(educationContent)
      .values(lesson)
      .onConflictDoNothing()
      .returning({ id: educationContent.id });
    if (inserted) insertedLessons.push(inserted);
  }

  for (const quiz of QUIZZES) {
    const lessonId = insertedLessons[quiz.lesson_index]?.id;
    if (!lessonId) continue;

    await db
      .insert(quizQuestions)
      .values({
        education_content_id: lessonId,
        question: quiz.question,
        options: quiz.options,
        correct_index: quiz.correct_index,
        explanation: quiz.explanation,
        xp_reward: quiz.xp_reward,
      })
      .onConflictDoNothing();
  }

  console.log(`Seeded ${LESSONS.length} lessons and ${QUIZZES.length} quiz questions`);
}
