import type { ResultType } from "@/lib/questions";

export type ResultContent = {
  headline: string;
  intro: string;
  fiveHabitReset: string[];
  firstSevenDays: string[];
  closing: string;
};

// DRAFT copy pending Sonali Surve's (DTR) review — habits condensed from her
// Mission 50 scripts and blogs, in her words. Her edits replace this verbatim.
// Voice rules (sonawell/CLAUDE.md):
//   - No medical claims, no ROI promises
//   - Preserve Sonali's exact words when she provides them
//   - Credibility before monetization
export const RESULT_CONTENT: Record<ResultType, ResultContent> = {
  "not-myself": {
    headline: "“I don’t feel myself.”",
    intro:
      "Perimenopause and menopause shift the rules. The patterns you're noticing — sleep disruption, cycle changes, hot flashes, weight that won't move even when you eat the same — aren't a willpower problem. They're a hormonal one.",
    fiveHabitReset: [
      "Morning sunlight, 2–3 minutes (Mission 50 · Habit #23). Step out, look at the sky — not the sun directly — and let nature do the rest. Your body is a clock, and morning light is the “ON” switch that aligns your energy, hormones, mood, and sleep.",
      "Sun Salutations — start with 4 rounds (Habit #5). Twelve postures, one flowing sequence, moving with your breath. It stimulates the thyroid, adrenal, and reproductive glands — genuinely useful support through perimenopause and menopause.",
      "The five-minute warm-water ritual (Habits #1 + #2). Warm water on an empty stomach, then sit with it: five minutes, five deep breaths, one intention. One clear intention gives the day a direction before the day tries to hand you one.",
      "A sleep ritual with a shutdown alarm (Habit #38). Not your sleep time — your ritual start time. Sleep is like landing a plane: your body needs a runway. That consistency trains your circadian rhythm.",
      "Speak kindly about your body, out loud — one sentence daily (Habit #40). Your brain rewires itself around repeated words. Kind words switch on the healing mode: digestion improves, cravings calm down, stress comes down.",
    ],
    firstSevenDays: [
      "Days 1–2: Just the morning pair — warm water with five quiet minutes, then 2–3 minutes of sunlight. Attach them to waking up; nothing else changes.",
      "Days 3–4: Add the shutdown alarm at night. Same bedtime ritual, every night — your body clock starts finding its rhythm from both ends of the day.",
      "Days 5–7: Add 4 rounds of Sun Salutations after your sunlight, and one kind sentence about your body — out loud — before bed. Small votes, every day, for the woman who feels like herself again.",
    ],
    closing:
      "This is exactly the kind of pattern I walk women through every week. Drop your email and I'll send you a week of gentle coaching to get these five habits sticking — no overhaul, just one small shift at a time.",
  },
  "always-tired": {
    headline: "“I always feel tired.”",
    intro:
      "Wired-but-tired, can't switch off, weight settling around the middle — your body is running a stress program 24/7. The fix isn't more discipline. It's giving the system permission to come down.",
    fiveHabitReset: [
      "Protein first, even before tea or coffee (Mission 50 · Habit #26). One bite of protein — a few soaked almonds, a cube of paneer, half a boiled egg — before the first cup. Caffeine on an empty stomach leaves you wired but tired. This isn't lack of willpower — it's biology asking for a different order.",
      "The 3-breath reset between tasks (Habit #28). Before switching tasks, three slow breaths — or two short inhales and one long sighing exhale. You're not resting; you're closing mental tabs.",
      "Phone-free first 15 minutes (Habit #20). The day starts on your terms, not your inbox's. Your worries will still be there at minute 16 — but you'll meet them from steadier ground.",
      "Fix the 4 PM crash snack (Habit #19). Swap the sugar pull for protein and fiber so the afternoon doesn't run on borrowed energy.",
      "Start your day with a win (Habit #12). One small, completable thing, first. Momentum is an energy source discipline can't match.",
    ],
    firstSevenDays: [
      "Days 1–2: Only the morning order changes: one bite of protein before your tea or coffee, and the phone stays down for the first 15 minutes.",
      "Days 3–4: Add the 3-breath reset — practice it between tasks, not only when stressed. Before opening your phone, email, or the next meeting.",
      "Days 5–7: Add the 4 PM snack swap and one small morning win. Notice which moment of the day feels different first — that's your system starting to come down.",
    ],
    closing:
      "Tired isn't a character flaw — it's a signal. Drop your email and I'll send you a week of coaching to help your system come down, one small habit at a time.",
  },
  "overweight-and-bloated": {
    headline: "“I feel overweight and bloated.”",
    intro:
      "The afternoon crash, the sugar pull, the bloat that comes and goes — those are signs your blood sugar is on a rollercoaster. Cutting calories harder doesn't fix it. Steady blood sugar does.",
    fiveHabitReset: [
      "Warm water every morning, on an empty stomach (Mission 50 · Habit #1). Before coffee, before tea — about eight ounces, warm. It supports digestion, gives your metabolism a gentle boost, and helps your system feel lighter. It sounds too simple to matter; that's exactly why most people skip it.",
      "Eat in the right order: veggies → protein → carbs → dessert (Habit #17). Same plate, different order. Fiber and protein first blunt the blood-sugar spike that drives the crash-and-crave cycle.",
      "Chew each bite 20–25 times (Habit #14). Digestion starts in the mouth. Slowing down reduces bloat and gives your fullness signal time to arrive before the second helping does.",
      "Three days a week, no packaged food (Habit #3). Any three days you choose. You just remove the package, and better choices show up almost on their own. Most people notice steadier energy and easier digestion within days.",
      "Stop snacking standing up (Habit #34). Sit. Plate it. Even for one bite. Standing snacks are invisible eating — the plate makes it a decision instead of a reflex.",
    ],
    firstSevenDays: [
      "Days 1–2: Warm water first thing, and re-order today's biggest meal: veggies first, carbs last. That's it.",
      "Days 3–4: Add the chewing habit at one meal a day — 20–25 chews per bite. Pick your first no-package day.",
      "Days 5–7: Run your first full no-package day, plate every snack, and notice: less bloat, steadier afternoons. That's your blood sugar getting off the rollercoaster.",
    ],
    closing:
      "The bloat isn't a discipline problem — it's a pattern, and patterns can be changed. Drop your email and I'll coach you through your first week of steadying it.",
  },
  // The open-ended result. She lands here two ways: her answers pointed
  // quietly at strength/muscle loss, or no single pattern clearly led.
  // The copy serves both — honest about the mixed read, then bridges to
  // strength as the most fixable starting point.
  "dont-know-how-i-feel": {
    headline: "“I just don’t know how I feel.”",
    intro:
      "Your answers didn't land on one loud pattern — and that's a real result, not a failure of the quiz. When everything feels a little off but nothing screams, the quiet driver is often strength: the slow loss of muscle and tone after midlife that muddies sleep, energy, and weight all at once. The good news — it's the most fixable place to start, and the change shows up fast.",
    fiveHabitReset: [
      "The one-leg sock test (Mission 50 · Habit #44). Tomorrow morning, put on your socks standing on one leg. No wall, no hopping. It isn't a sock test — it's a test of how well your balance, ankles, hips, core, and brain-body coordination are working together. When you don't know how you feel, start by measuring.",
      "Sit on the floor once a day (Habit #29). Just sit down, get up. No phone. Your ability to get up off the floor predicts how long — and how well — you live. Better than cardio, better than step count.",
      "One strength move while brushing your teeth (Habit #27). Calf raises, squats, lunges, side leg lifts, or single-leg balancing — until brushing ends. Two minutes, twice a day. That's muscle insurance.",
      "Hold something heavy daily (Habit #39). Grocery bags, a water jug, the big cooking pot — 30–60 seconds each hand. Stronger grip is linked with longer life and better brain health. Stronger hands, stronger body systems.",
      "100 tiny jumps a day (Habit #33). Small bounces, spread through the day. Gentle impact is the signal your bones and muscles have been waiting for.",
    ],
    firstSevenDays: [
      "Days 1–2: Take your baseline: the sock test and one floor sit. Don't judge the result — just meet it. Now you know something about how you feel.",
      "Days 3–4: Attach one strength move to brushing your teeth — morning and night. No counting, no perfect form. Just move until brushing ends.",
      "Days 5–7: Add a daily heavy hold and your first tiny jumps. Retry the sock test on day 7 — most women feel the difference before they see it. That's the fog starting to lift.",
    ],
    closing:
      "Not knowing how you feel is where almost every woman I work with started. Drop your email and I'll send you a week of coaching to help you find your signal — starting with strength, the most fixable place there is.",
  },
};
