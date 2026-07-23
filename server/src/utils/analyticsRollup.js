import AnalyticsDailySummary from "../models/AnalyticsDailySummary.js";
import AnalyticsVisitorDay from "../models/AnalyticsVisitorDay.js";
import AnalyticsPageDaily from "../models/AnalyticsPageDaily.js";
import AnalyticsSectionDaily from "../models/AnalyticsSectionDaily.js";
import AnalyticsTransitionDaily from "../models/AnalyticsTransitionDaily.js";

import { toLocalDateKey } from "./dateKeys.js";
export const applyRollups = async (events) => {
  const ops = [];

  for (const event of events) {
    const date = toLocalDateKey(event.createdAt || new Date());

    if (event.type === "pageview") {
      ops.push(
        AnalyticsDailySummary.updateOne({ date }, { $inc: { pageViews: 1 } }, { upsert: true }),
        AnalyticsVisitorDay.updateOne({ date, visitorId: event.visitorId }, {}, { upsert: true }),
        AnalyticsPageDaily.updateOne(
          { date, path: event.path || "/" },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      );
    }

    if (event.type === "section_view") {
      ops.push(
        AnalyticsDailySummary.updateOne({ date }, { $inc: { sectionViews: 1 } }, { upsert: true }),
        AnalyticsSectionDaily.updateOne(
          { date, sectionId: event.sectionId, path: event.path || "" },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      );
    }

    if (event.type === "page_transition") {
      ops.push(
        AnalyticsDailySummary.updateOne({ date }, { $inc: { transitions: 1 } }, { upsert: true }),
        AnalyticsTransitionDaily.updateOne(
          { date, fromPath: event.fromPath || "", toPath: event.toPath || "" },
          { $inc: { count: 1 } },
          { upsert: true }
        )
      );
    }
  }

  if (ops.length) {
    await Promise.all(ops);
  }
};
