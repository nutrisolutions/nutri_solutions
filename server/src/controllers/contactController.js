import ContactInquiry from "../models/ContactInquiry.js";

export const submitInquiry = async (req, res) => {
  try {
    const body = req.body;
    const fullName = body.fullName?.trim();
    const email = body.email?.trim();
    const topic = body.topic?.trim();
    const message = body.message?.trim();

    if (!fullName || !email || !topic || !message) {
      return res.status(400).json({
        message: "Full name, email, project type, and project details are required"
      });
    }

    const inquiry = await ContactInquiry.create({
      fullName,
      email,
      phone: body.phone?.trim() || "",
      company: body.company?.trim() || "",
      topic,
      message
    });

    return res.status(201).json({ ok: true, inquiryId: inquiry._id });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const listInquiries = async (_req, res) => {
  try {
    const inquiries = await ContactInquiry.find().sort({ createdAt: -1 });
    return res.json({ inquiries });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteInquiry = async (req, res) => {
  try {
    const inquiry = await ContactInquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) return res.status(404).json({ message: "Inquiry not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
