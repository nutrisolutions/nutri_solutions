import AnalyticsEvent from "../models/AnalyticsEvent.js";
import AnalyticsDailySummary from "../models/AnalyticsDailySummary.js";
import AnalyticsVisitorDay from "../models/AnalyticsVisitorDay.js";
import AnalyticsPageDaily from "../models/AnalyticsPageDaily.js";
import AnalyticsSectionDaily from "../models/AnalyticsSectionDaily.js";
import AnalyticsTransitionDaily from "../models/AnalyticsTransitionDaily.js";
import { applyRollups } from "../utils/analyticsRollup.js";
import {
  localDateRangeKeys,
  mongoLocalDayExpr,
  startOfLocalDay
} from "../utils/dateKeys.js";

/** Public ingest — stores raw events + MongoDB rollup collections. */
export const collectEvents = async (req, res) => {
  try {
    const { events } = req.body;
    if (!Array.isArray(events) || !events.length) {
      return res.status(400).json({ message: "events array required" });
    }

    const allowed = ["pageview", "section_view", "page_transition"];
    const docs = events
      .slice(0, 25)
      .filter((e) => e && allowed.includes(e.type) && e.visitorId)
      .map((e) => ({
        type: e.type,
        path: String(e.path || "").slice(0, 500),
        sectionId: String(e.sectionId || "").slice(0, 120),
        fromPath: String(e.fromPath || "").slice(0, 500),
        toPath: String(e.toPath || "").slice(0, 500),
        visitorId: String(e.visitorId).slice(0, 120),
        sessionId: String(e.sessionId || "").slice(0, 120),
        createdAt: e.timestamp ? new Date(e.timestamp) : new Date()
      }));

    if (docs.length) {
      await AnalyticsEvent.insertMany(docs, { ordered: false });
      await applyRollups(docs);
    }

    return res.status(202).json({ accepted: docs.length });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/** Admin dashboard aggregates (rollup-first, event fallback). */
export const getAnalyticsSummary = async (req, res) => {
  try {
    const days = Math.min(Math.max(parseInt(req.query.days, 10) || 30, 1), 90);
    const keys = localDateRangeKeys(days);
    const sinceKey = keys[0];
    const since = startOfLocalDay(sinceKey);
    const match = { createdAt: { $gte: since } };

    const [
      dailySummaries,
      dailyVisitorsRollup,
      pageViewsRollup,
      sectionViewsRollup,
      transitionsRollup,
      totals
    ] = await Promise.all([
      AnalyticsDailySummary.find({ date: { $gte: sinceKey } }).sort({ date: 1 }).lean(),
      AnalyticsVisitorDay.aggregate([
        { $match: { date: { $gte: sinceKey } } },
        { $group: { _id: "$date", count: { $sum: 1 } } },
        { $project: { date: "$_id", count: 1, _id: 0 } }
      ]),
      AnalyticsPageDaily.aggregate([
        { $match: { date: { $gte: sinceKey } } },
        { $group: { _id: "$path", count: { $sum: "$count" } } },
        { $sort: { count: -1 } },
        { $limit: 12 },
        { $project: { path: "$_id", count: 1, _id: 0 } }
      ]),
      AnalyticsSectionDaily.aggregate([
        { $match: { date: { $gte: sinceKey } } },
        {
          $group: {
            _id: { sectionId: "$sectionId", path: "$path" },
            count: { $sum: "$count" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 12 },
        {
          $project: {
            sectionId: "$_id.sectionId",
            path: "$_id.path",
            count: 1,
            _id: 0
          }
        }
      ]),
      AnalyticsTransitionDaily.aggregate([
        { $match: { date: { $gte: sinceKey } } },
        {
          $group: {
            _id: { from: "$fromPath", to: "$toPath" },
            count: { $sum: "$count" }
          }
        },
        { $sort: { count: -1 } },
        { $limit: 15 },
        {
          $project: {
            from: "$_id.from",
            to: "$_id.to",
            count: 1,
            _id: 0
          }
        }
      ]),
      AnalyticsEvent.aggregate([
        { $match: match },
        {
          $facet: {
            pageviews: [{ $match: { type: "pageview" } }, { $count: "n" }],
            uniqueVisitors: [{ $group: { _id: "$visitorId" } }, { $count: "n" }],
            sectionViews: [{ $match: { type: "section_view" } }, { $count: "n" }],
            transitions: [{ $match: { type: "page_transition" } }, { $count: "n" }]
          }
        }
      ])
    ]);

    const summaryMap = new Map(dailySummaries.map((r) => [r.date, r]));
    const visitorMap = new Map(dailyVisitorsRollup.map((r) => [r.date, r.count]));

    let pageViews = pageViewsRollup;
    let sectionViews = sectionViewsRollup;
    let transitions = transitionsRollup;

    const rollupHasData =
      dailySummaries.length > 0 ||
      dailyVisitorsRollup.length > 0 ||
      pageViewsRollup.length > 0;

    if (!rollupHasData) {
      const [dailyVisitors, dailyPageViewsEv, pageViewsEv, sectionViewsEv, transitionsEv] =
        await Promise.all([
        AnalyticsEvent.aggregate([
          { $match: { ...match, type: "pageview" } },
          {
            $group: {
              _id: { day: mongoLocalDayExpr() },
              visitors: { $addToSet: "$visitorId" }
            }
          },
          { $project: { date: "$_id.day", count: { $size: "$visitors" } } }
        ]),
        AnalyticsEvent.aggregate([
          { $match: { ...match, type: "pageview" } },
          {
            $group: {
              _id: { day: mongoLocalDayExpr() },
              count: { $sum: 1 }
            }
          },
          { $project: { date: "$_id.day", count: 1, _id: 0 } }
        ]),
        AnalyticsEvent.aggregate([
          { $match: { ...match, type: "pageview" } },
          { $group: { _id: "$path", count: { $sum: 1 } } },
          { $sort: { count: -1 } },
          { $limit: 12 },
          { $project: { path: "$_id", count: 1, _id: 0 } }
        ]),
        AnalyticsEvent.aggregate([
          { $match: { ...match, type: "section_view" } },
          {
            $group: {
              _id: { sectionId: "$sectionId", path: "$path" },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 12 },
          {
            $project: {
              sectionId: "$_id.sectionId",
              path: "$_id.path",
              count: 1,
              _id: 0
            }
          }
        ]),
        AnalyticsEvent.aggregate([
          { $match: { ...match, type: "page_transition" } },
          {
            $group: {
              _id: { from: "$fromPath", to: "$toPath" },
              count: { $sum: 1 }
            }
          },
          { $sort: { count: -1 } },
          { $limit: 15 },
          {
            $project: {
              from: "$_id.from",
              to: "$_id.to",
              count: 1,
              _id: 0
            }
          }
        ])
      ]);

      const visitorMapEv = new Map(dailyVisitors.map((r) => [r.date, r.count]));
      const pageViewMapEv = new Map(dailyPageViewsEv.map((r) => [r.date, r.count]));
      dailyVisitorsRollup.length = 0;
      dailyVisitorsRollup.push(...dailyVisitors);
      pageViews = pageViewsEv;
      sectionViews = sectionViewsEv;
      transitions = transitionsEv;

      keys.forEach((date) => {
        if (!visitorMap.has(date)) visitorMap.set(date, visitorMapEv.get(date) || 0);
        if (!summaryMap.has(date) && pageViewMapEv.has(date)) {
          summaryMap.set(date, { pageViews: pageViewMapEv.get(date) });
        }
      });
    }

    const dailySeries = keys.map((date) => {
      const row = summaryMap.get(date);
      return {
        date,
        label: date.slice(5),
        visitors: visitorMap.get(date) || 0,
        pageViews: row?.pageViews || 0,
        sectionViews: row?.sectionViews || 0,
        transitions: row?.transitions || 0
      };
    });

    const facet = totals[0] || {};
    const pick = (arr) => arr?.[0]?.n || 0;
    const totalPageViews = pick(facet.pageviews);
    const pageViewsWithShare = pageViews.map((row) => ({
      ...row,
      share: totalPageViews ? Math.round((row.count / totalPageViews) * 100) : 0
    }));

    const sectionById = sectionViews.reduce((acc, row) => {
      const id = row.sectionId || "unknown";
      acc[id] = (acc[id] || 0) + row.count;
      return acc;
    }, {});
    const topSections = Object.entries(sectionById)
      .map(([sectionId, count]) => ({ sectionId, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const transitionTotal = transitions.reduce((s, t) => s + t.count, 0);

    return res.json({
      days,
      source: rollupHasData ? "mongodb_rollups" : "mongodb_events",
      summary: {
        uniqueVisitors: pick(facet.uniqueVisitors),
        pageViews: totalPageViews,
        sectionViews: pick(facet.sectionViews),
        transitions: pick(facet.transitions)
      },
      dailySeries,
      pageViews: pageViewsWithShare,
      sectionViews,
      topSections,
      transitions: transitions.map((row) => ({
        ...row,
        share: transitionTotal ? Math.round((row.count / transitionTotal) * 100) : 0
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
