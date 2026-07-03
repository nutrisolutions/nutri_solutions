import { ConfidentialClientApplication } from "@azure/msal-node";

const GRAPH_BASE = "https://graph.microsoft.com/v1.0";

const isConfigured = () =>
  Boolean(process.env.MS_TENANT_ID && process.env.MS_CLIENT_ID && process.env.MS_CLIENT_SECRET && process.env.MS_ORGANIZER_USER_ID);

let msalClient = null;

const getMsalClient = () => {
  if (msalClient) return msalClient;
  msalClient = new ConfidentialClientApplication({
    auth: {
      clientId: process.env.MS_CLIENT_ID,
      authority: `https://login.microsoftonline.com/${process.env.MS_TENANT_ID}`,
      clientSecret: process.env.MS_CLIENT_SECRET
    }
  });
  return msalClient;
};

const getAccessToken = async () => {
  const client = getMsalClient();
  const result = await client.acquireTokenByClientCredential({
    scopes: ["https://graph.microsoft.com/.default"]
  });
  if (!result?.accessToken) {
    throw new Error("Failed to acquire Microsoft Graph access token");
  }
  return result.accessToken;
};

/**
 * Creates a Teams online meeting via Microsoft Graph (application permissions,
 * client-credentials flow) organized by the mailbox in MS_ORGANIZER_USER_ID.
 * Requires an Azure AD app registration with the OnlineMeetings.ReadWrite.All
 * application permission and admin consent — see docs/HRMS_EMPLOYEE_LIFECYCLE.md
 * for setup steps. Throws a descriptive error if not configured or if Graph
 * rejects the request (e.g. missing consent, invalid organizer).
 */
export const createTeamsMeeting = async ({ subject, startDateTime, endDateTime }) => {
  if (!isConfigured()) {
    throw new Error(
      "Microsoft Teams integration is not configured. Set MS_TENANT_ID, MS_CLIENT_ID, MS_CLIENT_SECRET, and MS_ORGANIZER_USER_ID in server/.env (see docs/HRMS_EMPLOYEE_LIFECYCLE.md for the Azure AD app registration steps)."
    );
  }

  const accessToken = await getAccessToken();
  const organizerId = process.env.MS_ORGANIZER_USER_ID;

  const response = await fetch(`${GRAPH_BASE}/users/${encodeURIComponent(organizerId)}/onlineMeetings`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      subject,
      startDateTime,
      endDateTime
    })
  });

  if (!response.ok) {
    const errorBody = await response.text().catch(() => "");
    throw new Error(`Microsoft Graph rejected the meeting request (${response.status}): ${errorBody || response.statusText}`);
  }

  const data = await response.json();
  return {
    teamsMeetingId: data.id,
    teamsJoinUrl: data.joinWebUrl
  };
};

export const isTeamsConfigured = isConfigured;
