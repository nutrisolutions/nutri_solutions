import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatPathLabel, shortDate } from "./pathLabels";

const CHART_COLORS = [
  "#7045c3",
  "#3558c6",
  "#1b60c7",
  "#5a3699",
  "#154fa3",
  "#2d4ab0",
  "#8960d4",
  "#4a73d4"
];

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="admin-chart-tooltip">
      <p className="admin-chart-tooltip-label">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} style={{ color: entry.color }}>
          {entry.name}: <strong>{entry.value}</strong>
        </p>
      ))}
    </div>
  );
};

export const TrafficTrendChart = ({ data }) => (
  <div className="admin-chart-wrap">
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="visitorsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7045c3" stopOpacity={0.35} />
            <stop offset="100%" stopColor="#7045c3" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="pageviewsGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1b60c7" stopOpacity={0.25} />
            <stop offset="100%" stopColor="#1b60c7" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(112, 69, 195, 0.12)" />
        <XAxis
          dataKey="date"
          tickFormatter={shortDate}
          tick={{ fontSize: 11, fill: "#64748b" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} labelFormatter={shortDate} />
        <Legend />
        <Area
          type="monotone"
          dataKey="visitors"
          name="Unique visitors"
          stroke="#7045c3"
          fill="url(#visitorsGrad)"
          strokeWidth={2}
        />
        <Area
          type="monotone"
          dataKey="pageViews"
          name="Page views"
          stroke="#1b60c7"
          fill="url(#pageviewsGrad)"
          strokeWidth={2}
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
);

export const TopPagesBarChart = ({ data }) => {
  const chartData = data.map((row) => ({
    ...row,
    name: formatPathLabel(row.path),
    shortName:
      formatPathLabel(row.path).length > 18
        ? `${formatPathLabel(row.path).slice(0, 16)}…`
        : formatPathLabel(row.path)
  }));

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height={Math.max(220, chartData.length * 36)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(112, 69, 195, 0.1)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="shortName"
            width={100}
            tick={{ fontSize: 11, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload;
              return (
                <div className="admin-chart-tooltip">
                  <p className="admin-chart-tooltip-label">{row.name}</p>
                  <p>
                    Views: <strong>{row.count}</strong>
                  </p>
                  <p>
                    Share: <strong>{row.share}%</strong>
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" name="Views" radius={[0, 6, 6, 0]} fill="#7045c3" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TopPagesPieChart = ({ data }) => {
  const top = data.slice(0, 6).map((r) => ({ ...r, name: formatPathLabel(r.path) }));
  const other = data.slice(6).reduce((s, r) => s + r.count, 0);
  const chartData = other ? [...top, { path: "_other", name: "Other", count: other }] : top;

  return (
    <div className="admin-chart-wrap admin-chart-wrap--pie">
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={56}
            outerRadius={88}
            paddingAngle={2}
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value, _name, props) => [
              value,
              props.payload.name || formatPathLabel(props.payload.path)
            ]}
          />
          <Legend formatter={(value) => (value.length > 22 ? `${value.slice(0, 20)}…` : value)} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export const SectionEngagementChart = ({ data }) => {
  const chartData = data.map((row) => ({
    ...row,
    label: row.sectionId ? `#${row.sectionId}` : "unknown"
  }));

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 48 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(112, 69, 195, 0.1)" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#64748b" }}
            angle={-35}
            textAnchor="end"
            height={56}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="count" name="Section views" fill="#3558c6" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const TransitionsBarChart = ({ data }) => {
  const chartData = data.slice(0, 8).map((row) => ({
    ...row,
    label: `${formatPathLabel(row.from)} → ${formatPathLabel(row.to)}`,
    shortLabel: `${formatPathLabel(row.from).slice(0, 8)}→${formatPathLabel(row.to).slice(0, 8)}`
  }));

  return (
    <div className="admin-chart-wrap">
      <ResponsiveContainer width="100%" height={Math.max(200, chartData.length * 40)}>
        <BarChart data={chartData} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(112, 69, 195, 0.1)" />
          <XAxis type="number" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
          <YAxis
            type="category"
            dataKey="shortLabel"
            width={110}
            tick={{ fontSize: 10, fill: "#475569" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.[0]) return null;
              const row = payload[0].payload;
              return (
                <div className="admin-chart-tooltip">
                  <p className="admin-chart-tooltip-label">{row.label}</p>
                  <p>
                    Navigations: <strong>{row.count}</strong> ({row.share}%)
                  </p>
                </div>
              );
            }}
          />
          <Bar dataKey="count" name="Transitions" fill="#1b60c7" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
