import { z } from "zod";

export const phoneSchema = z.string().trim().regex(/^\d{10}$/, "Phone number must be exactly 10 digits");

export const optionalPhoneSchema = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^\d{10}$/.test(v), { message: "Phone number must be exactly 10 digits" });

export const emailSchema = z.string().trim().min(1, "Email is required").email("Enter a valid email address");

export const passwordSchema = z.string().min(8, "Password must be at least 8 characters");

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .refine((v) => !v || /^https?:\/\/.+/.test(v), { message: "Enter a valid URL starting with http:// or https://" });

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
});

export const setPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Please confirm your new password")
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "New passwords do not match",
    path: ["confirmPassword"]
  });

export const createEmployeeSchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: emailSchema,
  phone: optionalPhoneSchema,
  position: z.string().trim().optional(),
  department: z.string().trim().optional()
});

export const departmentSchema = z.object({
  name: z.string().trim().min(1, "Department name is required"),
  description: z.string().trim().optional()
});

export const requestDocumentsSchema = z.object({
  labels: z.array(z.string().trim().min(1)).min(1, "Enter at least one document to request")
});

export const interviewSchema = z.object({
  round: z.number({ invalid_type_error: "Enter a round number" }).int().min(1, "Round must be 1 or more"),
  date: z.string().trim().min(1, "Date is required"),
  time: z.string().trim().min(1, "Time is required"),
  durationMinutes: z
    .number({ invalid_type_error: "Enter a duration" })
    .int()
    .min(5, "Duration must be at least 5 minutes")
});

export const payslipDetailsSchema = z
  .object({
    periodMonth: z.number().int().min(1, "Select a month").max(12, "Select a month"),
    periodYear: z.number().int().min(2000, "Enter a valid year").max(2100, "Enter a valid year"),
    lopDays: z.number().int().min(0, "Loss-of-pay days cannot be negative").max(31).optional().nullable(),
    mode: z.enum(["auto", "manual"]).default("auto"),
    amount: z.number().positive("Enter a valid amount").optional().nullable()
  })
  .refine((data) => data.mode !== "manual" || (data.amount && data.amount > 0), {
    message: "Amount is required for manual payslips",
    path: ["amount"]
  });

export const appraisalDetailsSchema = z.object({
  newCtc: z.string().trim().min(1, "New CTC is required"),
  effectiveDate: z.string().trim().min(1, "Effective date is required"),
  remarks: z.string().trim().optional()
});

export const offerDetailsSchema = z.object({
  position: z.string().trim().min(1, "Position is required"),
  ctc: z.string().trim().min(1, "CTC is required"),
  workLocation: z.string().trim().min(1, "Work location is required"),
  joiningDate: z.string().trim().min(1, "Joining date is required"),
  probationMonths: z.number().int().min(0).max(24).optional().nullable(),
  reportingManagerName: z.string().trim().optional()
});

export const calendarEventSchema = z.object({
  date: z.string().trim().min(1, "Date is required"),
  type: z.enum(["holiday", "wfh"], { errorMap: () => ({ message: "Select a type" }) }),
  title: z.string().trim().min(1, "Title is required"),
  description: z.string().trim().optional()
});

export const taskSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  assignedTo: z.string().trim().min(1, "Please select an employee"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().trim().optional(),
  description: z.string().trim().optional()
});

export const leaveTypeSchema = z.object({
  name: z.string().trim().min(1, "Leave type name is required"),
  defaultDaysPerYear: z
    .number({ invalid_type_error: "Enter a number of days" })
    .min(0, "Days per year must be 0 or more"),
  paid: z.boolean()
});

export const leaveRequestSchema = z
  .object({
    leaveType: z.string().trim().min(1, "Select a leave type"),
    startDate: z.string().trim().min(1, "Start date is required"),
    endDate: z.string().trim().min(1, "End date is required"),
    halfDay: z.boolean().optional(),
    reason: z.string().trim().min(1, "Reason is required")
  })
  .refine((data) => new Date(data.startDate) <= new Date(data.endDate), {
    message: "Start date must be before or equal to end date",
    path: ["endDate"]
  });

export const careerApplySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: emailSchema,
  phone: phoneSchema,
  yearsExperience: z.string().trim().optional(),
  linkedIn: optionalUrl,
  portfolioUrl: optionalUrl,
  resumeUrl: optionalUrl,
  coverLetter: z.string().trim().min(1, "Cover letter is required")
});

export const contactInquirySchema = z.object({
  fullName: z.string().trim().min(1, "Full name is required"),
  email: emailSchema,
  phone: optionalPhoneSchema,
  company: z.string().trim().optional(),
  topic: z.string().trim().min(1, "Please select a project type"),
  message: z.string().trim().min(1, "Project details are required")
});
