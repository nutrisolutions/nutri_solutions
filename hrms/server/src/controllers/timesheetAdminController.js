import ExcelJS from "exceljs";
import Timesheet from "../models/Timesheet.js";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const monthRange = (month, year) => {
  const start = `${year}-${String(month).padStart(2, "0")}-01`;
  const lastDay = new Date(Number(year), Number(month), 0).getDate();
  const end = `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
  return { start, end };
};

const buildTimesheetData = async ({ month, year, employeeId }) => {
  const { start, end } = monthRange(month, year);
  const filter = { date: { $gte: start, $lte: end } };
  if (employeeId) filter.employee = employeeId;

  const entries = await Timesheet.find(filter).populate("employee", "fullName email").sort({ date: 1 });

  const byEmployee = new Map();
  for (const entry of entries) {
    const empId = String(entry.employee?._id);
    if (!byEmployee.has(empId)) {
      byEmployee.set(empId, { employee: entry.employee, entries: [] });
    }
    byEmployee.get(empId).entries.push(entry);
  }

  const employees = Array.from(byEmployee.values()).sort((a, b) =>
    (a.employee?.fullName || "").localeCompare(b.employee?.fullName || "")
  );

  return { start, end, employees };
};

export const listTimesheet = async (req, res) => {
  try {
    const month = Number(req.query.month) || new Date().getMonth() + 1;
    const year = Number(req.query.year) || new Date().getFullYear();
    const { employeeId } = req.query;

    const { employees } = await buildTimesheetData({ month, year, employeeId });
    return res.json({
      month,
      year,
      employees: employees.map((e) => ({
        employee: e.employee,
        daysLogged: e.entries.length,
        entries: e.entries
      }))
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// Excel sheet names can't contain : \ / ? * [ ] and are capped at 31 chars.
const safeSheetName = (name) => name.replace(/[:\\/?*[\]]/g, "-").slice(0, 31);

const styleHeaderRow = (sheet) => {
  const row = sheet.getRow(1);
  row.font = { bold: true };
  row.eachCell((cell) => {
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFEEE9F8" } };
  });
};

const addWorkUpdateColumn = (sheet, key = "workUpdate") => {
  sheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return;
    row.getCell(key).alignment = { wrapText: true, vertical: "top" };
  });
};

const buildMonthlyWorkbook = async (month, year) => {
  const { employees } = await buildTimesheetData({ month, year });

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nutri Solutions HRMS";
  workbook.created = new Date();

  const overview = workbook.addWorksheet("Overview");
  overview.columns = [
    { header: "Employee", key: "name", width: 28 },
    { header: "Email", key: "email", width: 30 },
    { header: "Days logged", key: "daysLogged", width: 14 }
  ];
  styleHeaderRow(overview);
  for (const e of employees) {
    overview.addRow({
      name: e.employee?.fullName || "Unknown",
      email: e.employee?.email || "",
      daysLogged: e.entries.length
    });
  }
  overview.autoFilter = { from: "A1", to: "C1" };

  const byDate = new Map();
  for (const e of employees) {
    for (const entry of e.entries) {
      if (!byDate.has(entry.date)) byDate.set(entry.date, []);
      byDate.get(entry.date).push({ employee: e.employee, workUpdate: entry.workUpdate });
    }
  }

  const sortedDates = Array.from(byDate.keys()).sort();
  for (const date of sortedDates) {
    const sheet = workbook.addWorksheet(safeSheetName(date));
    sheet.columns = [
      { header: "Employee", key: "name", width: 28 },
      { header: "Email", key: "email", width: 30 },
      { header: "Work update", key: "workUpdate", width: 80 }
    ];
    styleHeaderRow(sheet);
    for (const row of byDate.get(date)) {
      sheet.addRow({
        name: row.employee?.fullName || "Unknown",
        email: row.employee?.email || "",
        workUpdate: row.workUpdate
      });
    }
    addWorkUpdateColumn(sheet);
    sheet.autoFilter = { from: "A1", to: "C1" };
  }

  return workbook;
};

const buildAnnualWorkbook = async (year) => {
  const entries = await Timesheet.find({ date: { $gte: `${year}-01-01`, $lte: `${year}-12-31` } })
    .populate("employee", "fullName email")
    .sort({ date: 1 });

  const byMonth = new Map();
  for (const entry of entries) {
    const monthIndex = Number(entry.date.slice(5, 7)) - 1;
    if (!byMonth.has(monthIndex)) byMonth.set(monthIndex, []);
    byMonth.get(monthIndex).push(entry);
  }

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Nutri Solutions HRMS";
  workbook.created = new Date();

  const sortedMonths = Array.from(byMonth.keys()).sort((a, b) => a - b);
  for (const monthIndex of sortedMonths) {
    const sheet = workbook.addWorksheet(safeSheetName(MONTH_NAMES[monthIndex]));
    sheet.columns = [
      { header: "Employee", key: "name", width: 28 },
      { header: "Email", key: "email", width: 30 },
      { header: "Date", key: "date", width: 14 },
      { header: "Work update", key: "workUpdate", width: 80 }
    ];
    styleHeaderRow(sheet);
    for (const entry of byMonth.get(monthIndex)) {
      sheet.addRow({
        name: entry.employee?.fullName || "Unknown",
        email: entry.employee?.email || "",
        date: entry.date,
        workUpdate: entry.workUpdate
      });
    }
    addWorkUpdateColumn(sheet);
    sheet.autoFilter = { from: "A1", to: "D1" };
  }

  return workbook;
};

export const exportTimesheet = async (req, res) => {
  try {
    const type = req.query.type === "annual" ? "annual" : "monthly";
    const year = Number(req.query.year) || new Date().getFullYear();
    const month = Number(req.query.month) || new Date().getMonth() + 1;

    const workbook =
      type === "annual" ? await buildAnnualWorkbook(year) : await buildMonthlyWorkbook(month, year);

    if (workbook.worksheets.length === 0) {
      workbook.addWorksheet("Overview").addRow(["No timesheet entries found for this period"]);
    }

    const filename =
      type === "annual" ? `timesheet-annual-${year}.xlsx` : `timesheet-${year}-${String(month).padStart(2, "0")}.xlsx`;

    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);

    await workbook.xlsx.write(res);
    return res.end();
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
