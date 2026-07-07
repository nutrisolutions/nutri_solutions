import CalendarEvent from "../models/CalendarEvent.js";

export const listCalendarEvents = async (req, res) => {
  try {
    const { month, year } = req.query;
    const filter = {};
    if (month && year) {
      const start = new Date(Number(year), Number(month) - 1, 1);
      const end = new Date(Number(year), Number(month), 1);
      filter.date = { $gte: start, $lt: end };
    }
    const events = await CalendarEvent.find(filter).sort({ date: 1 });
    return res.json({ events });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createCalendarEvent = async (req, res) => {
  try {
    const { date, type, title, description } = req.body;
    if (!date || !type || !title) {
      return res.status(400).json({ message: "date, type, and title are required" });
    }
    if (!["holiday", "wfh"].includes(type)) {
      return res.status(400).json({ message: "type must be 'holiday' or 'wfh'" });
    }
    const event = await CalendarEvent.create({
      date,
      type,
      title: title.trim(),
      description: description?.trim(),
      createdBy: req.admin.id
    });
    return res.status(201).json({ event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateCalendarEvent = async (req, res) => {
  try {
    const { date, type, title, description } = req.body;
    if (type && !["holiday", "wfh"].includes(type)) {
      return res.status(400).json({ message: "type must be 'holiday' or 'wfh'" });
    }
    const event = await CalendarEvent.findById(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });

    if (date) event.date = date;
    if (type) event.type = type;
    if (title) event.title = title.trim();
    if (description !== undefined) event.description = description?.trim();

    await event.save();
    return res.json({ event });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteCalendarEvent = async (req, res) => {
  try {
    const event = await CalendarEvent.findByIdAndDelete(req.params.id);
    if (!event) return res.status(404).json({ message: "Event not found" });
    return res.json({ message: "Event deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
