import Task from "../models/Task.js";
import Employee from "../models/Employee.js";
import EmployeeNotification from "../models/EmployeeNotification.js";

export const listTasks = async (req, res) => {
  try {
    const { employee, department, status } = req.query;
    const filter = {};
    if (employee) filter.assignedTo = employee;
    if (department) filter.department = department;
    if (status) filter.status = status;

    if (req.admin.role === "manager") {
      const teamIds = await Employee.find({ manager: req.admin.id }).distinct("_id");
      filter.assignedTo = filter.assignedTo ? filter.assignedTo : { $in: teamIds };
    }

    const tasks = await Task.find(filter).populate("assignedTo", "fullName email").sort({ createdAt: -1 });
    return res.json({ tasks });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTask = async (req, res) => {
  try {
    const employee = await Employee.findById(req.body.assignedTo);
    if (!employee) return res.status(404).json({ message: "Employee not found" });

    if (req.admin.isHrEmployee && String(employee._id) === String(req.admin.id)) {
      return res.status(403).json({ message: "You cannot assign a task to yourself." });
    }

    if (req.admin.role === "manager" && String(employee.manager) !== String(req.admin.id)) {
      return res.status(403).json({ message: "You can only assign tasks to your own team" });
    }

    const task = await Task.create({
      title: req.body.title,
      description: req.body.description || "",
      assignedTo: employee._id,
      assignedBy: req.admin.id,
      department: employee.department || null,
      priority: req.body.priority || "medium",
      dueDate: req.body.dueDate || null
    });

    await EmployeeNotification.create({
      employee: employee._id,
      audience: "employee",
      type: "task_assigned",
      message: `New task assigned: "${task.title}"`
    });

    return res.status(201).json({ task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateTask = async (req, res) => {
  try {
    const updates = {
      title: req.body.title,
      description: req.body.description,
      priority: req.body.priority,
      dueDate: req.body.dueDate,
      status: req.body.status
    };
    if (updates.status === "done") updates.completedAt = new Date();

    const task = await Task.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ task });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteTask = async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: "Task not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
