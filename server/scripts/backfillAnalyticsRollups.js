/**
 * Rebuild rollup collections from raw AnalyticsEvent documents.
 * Run: node scripts/backfillAnalyticsRollups.js
 */
import dotenv from "dotenv";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
import AnalyticsEvent from "../src/models/AnalyticsEvent.js";
import AnalyticsDailySummary from "../src/models/AnalyticsDailySummary.js";
import AnalyticsVisitorDay from "../src/models/AnalyticsVisitorDay.js";
import AnalyticsPageDaily from "../src/models/AnalyticsPageDaily.js";
import AnalyticsSectionDaily from "../src/models/AnalyticsSectionDaily.js";
import AnalyticsTransitionDaily from "../src/models/AnalyticsTransitionDaily.js";
import { applyRollups } from "../src/utils/analyticsRollup.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

const BATCH = 500;

async function main() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("Connected. Clearing rollup collections…");

  await Promise.all([
    AnalyticsDailySummary.deleteMany({}),
    AnalyticsVisitorDay.deleteMany({}),
    AnalyticsPageDaily.deleteMany({}),
    AnalyticsSectionDaily.deleteMany({}),
    AnalyticsTransitionDaily.deleteMany({})
  ]);

  let skip = 0;
  let total = 0;

  while (true) {
    const events = await AnalyticsEvent.find().sort({ createdAt: 1 }).skip(skip).limit(BATCH).lean();
    if (!events.length) break;
    await applyRollups(events);
    total += events.length;
    skip += events.length;
    console.log(`Processed ${total} events…`);
  }

  console.log(`Done. Backfilled rollups from ${total} events.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
