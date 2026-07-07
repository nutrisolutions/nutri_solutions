import Team from "../models/Team.js";
import Employee from "../models/Employee.js";

const EMPLOYEE_FIELDS = "fullName email onboardingLevel isTeamLead employmentType";

const validateLead = async (leadId) => {
  const lead = await Employee.findById(leadId);
  if (!lead) throw new Error("Selected team lead not found");
  if (!lead.isTeamLead) throw new Error(`${lead.fullName} is not marked as a Team Lead yet`);
  return lead;
};

const validateMembers = async (memberIds) => {
  const members = await Employee.find({ _id: { $in: memberIds } });
  if (members.length !== memberIds.length) throw new Error("One or more selected members were not found");
  const ineligible = members.find((m) => m.onboardingLevel !== 3 || m.employmentType !== "permanent");
  if (ineligible) {
    throw new Error(`${ineligible.fullName} must be a permanent, Level 3 employee to join a team`);
  }
  return members;
};

const assertNotAlreadyAssigned = async (employeeIds, excludeTeamId) => {
  const filter = { $or: [{ lead: { $in: employeeIds } }, { members: { $in: employeeIds } }] };
  if (excludeTeamId) filter._id = { $ne: excludeTeamId };
  const clash = await Team.findOne(filter);
  if (clash) throw new Error(`One or more employees already belong to the team "${clash.name}"`);
};

export const listTeams = async (req, res) => {
  try {
    const teams = await Team.find().populate("lead", EMPLOYEE_FIELDS).populate("members", EMPLOYEE_FIELDS).sort({ createdAt: -1 });
    return res.json({ teams });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const createTeam = async (req, res) => {
  try {
    const name = (req.body.name || "").trim();
    const { leadId, memberIds = [] } = req.body;
    if (!name || !leadId) {
      return res.status(400).json({ message: "Team name and a team lead are required" });
    }

    await validateLead(leadId);
    await validateMembers(memberIds);
    await assertNotAlreadyAssigned([leadId, ...memberIds]);

    const team = await Team.create({ name, lead: leadId, members: memberIds });
    const populated = await team.populate([
      { path: "lead", select: EMPLOYEE_FIELDS },
      { path: "members", select: EMPLOYEE_FIELDS }
    ]);
    return res.status(201).json({ team: populated });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const updateTeam = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    const name = typeof req.body.name === "string" ? req.body.name.trim() : team.name;
    const leadId = req.body.leadId || team.lead;
    const memberIds = Array.isArray(req.body.memberIds) ? req.body.memberIds : team.members;

    await validateLead(leadId);
    await validateMembers(memberIds);
    await assertNotAlreadyAssigned([leadId, ...memberIds], team._id);

    team.name = name;
    team.lead = leadId;
    team.members = memberIds;
    await team.save();

    const populated = await team.populate([
      { path: "lead", select: EMPLOYEE_FIELDS },
      { path: "members", select: EMPLOYEE_FIELDS }
    ]);
    return res.json({ team: populated });
  } catch (error) {
    return res.status(400).json({ message: error.message });
  }
};

export const deleteTeam = async (req, res) => {
  try {
    const team = await Team.findByIdAndDelete(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });
    return res.json({ ok: true });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
