// Pre-launch scoring simulation for the SonaWell Midlife Quiz.
//
// Enumerates EVERY possible combination of scored answers (Q2-Q7) through the
// scoring table and tie-break logic, and reports the archetype win-share, the
// margin distribution between #1 and #2, and how often the tie-break decides
// the result. Mirrors lib/questions.ts -- KEEP IN SYNC.
//
// Run with:
//   node scripts/simulate-scoring.mjs

// Index order: [H = hormone, C = cortisol, I = insulin, M = muscle-loss]
const Q = {
  q2: [ [0,1,1,0], [2,0,0,0], [2,0,0,0], [0,0,0,2], [0,0,0,0] ], // regular, irregular, stopped, post5+, untracked
  q3: [ [0,0,2,0], [0,2,0,0], [2,0,0,0], [0,0,0,2] ],            // afterlunch, wiredtired, wakeexhausted, stamina
  q4: [ [0,2,0,0], [2,0,0,0], [0,0,2,0], [0,0,0,2] ],            // belly, unchanged, bloating, lesstone
  q5: [ [1,1,0,0], [0,2,0,0], [2,0,0,0], [1,0,0,1] ],            // wake3am, racing, sweaty, unrested
  q6: [ [0,0,2,0], [0,2,0,0], [2,0,0,0], [0,0,0,2] ],            // sugar, salty, cyclecravings, nothungry
  q7: [ [1,0,0,1], [0,2,0,0], [0,0,2,0], [0,0,0,2] ],            // sore, wipedout, noresults, havent
};

// Tie-break order: hormone, cortisol, insulin, muscle-loss (same as lib/questions.ts TIE_BREAKER).
const NAMES = ["hormone", "cortisol", "insulin", "muscle-loss"];

let total = 0;
const winCounts = [0, 0, 0, 0];
const uniqueWins = [0, 0, 0, 0];
const tieBreakWins = [0, 0, 0, 0];
const lostTieBreak = [0, 0, 0, 0];
const marginHist = {};
const maxScore = [0, 0, 0, 0];

for (const a2 of Q.q2)
 for (const a3 of Q.q3)
  for (const a4 of Q.q4)
   for (const a5 of Q.q5)
    for (const a6 of Q.q6)
     for (const a7 of Q.q7) {
       const s = [0, 0, 0, 0];
       for (const o of [a2, a3, a4, a5, a6, a7]) for (let i = 0; i < 4; i++) s[i] += o[i];
       total++;
       for (let i = 0; i < 4; i++) if (s[i] > maxScore[i]) maxScore[i] = s[i];

       // winner: iterate H, C, I, M and replace only on strict greater (matches scoring.ts).
       let best = 0;
       for (let i = 1; i < 4; i++) if (s[i] > s[best]) best = i;
       winCounts[best]++;

       const sorted = [...s].sort((x, y) => y - x);
       const margin = sorted[0] - sorted[1];
       marginHist[margin] = (marginHist[margin] || 0) + 1;

       const top = sorted[0];
       const topIdx = [];
       for (let i = 0; i < 4; i++) if (s[i] === top) topIdx.push(i);
       if (topIdx.length === 1) {
         uniqueWins[best]++;
       } else {
         for (const i of topIdx) {
           if (i === best) tieBreakWins[i]++;
           else lostTieBreak[i]++;
         }
       }
     }

const pct = (n) => (100 * n / total).toFixed(1) + "%";
console.log("=== SonaWell Quiz -- Scoring Simulation ===");
console.log("Total answer combinations enumerated (Q2-Q7, uniform):", total);
console.log("(Uniform enumeration measures STRUCTURAL fairness, not predicted real-world mix.)\n");

console.log("--- Win share per archetype (tie-break applied) ---");
for (let i = 0; i < 4; i++)
  console.log(`  ${NAMES[i].padEnd(12)} ${String(winCounts[i]).padStart(5)}  ${pct(winCounts[i]).padStart(7)}   (max reachable score: ${maxScore[i]})`);

console.log("\n--- How each archetype wins ---");
for (let i = 0; i < 4; i++)
  console.log(`  ${NAMES[i].padEnd(12)} outright(unique max): ${String(uniqueWins[i]).padStart(5)}   won via tie-break: ${String(tieBreakWins[i]).padStart(5)}   LOST a tie-break: ${String(lostTieBreak[i]).padStart(5)}`);

console.log("\n--- Margin between #1 and #2 archetype ---");
const margins = Object.keys(marginHist).map(Number).sort((a, b) => a - b);
let cum0 = 0, cum1 = 0, cum2 = 0;
for (const m of margins) {
  console.log(`  margin ${m}: ${String(marginHist[m]).padStart(5)}  ${pct(marginHist[m]).padStart(7)}`);
  if (m === 0) cum0 += marginHist[m];
  if (m <= 1) cum1 += marginHist[m];
  if (m <= 2) cum2 += marginHist[m];
}
console.log(`\n  exact tie at the top (margin 0, decided purely by tie-break): ${pct(cum0)}`);
console.log(`  margin <= 1 (one different answer flips the result):         ${pct(cum1)}`);
console.log(`  margin <= 2 (a near-tie):                                    ${pct(cum2)}`);
