import fs from "fs";
import { Resend } from "resend";
import { env } from "../config/env";

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

interface EmailProvider {
  send(input: SendEmailInput): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    const urlMatch = input.text.match(/https?:\/\/\S+/);
    const linkLine = urlMatch ? `\n  LINK → ${urlMatch[0]}\n` : "";
    process.stderr.write(
      `\n[Email] to=${input.to} subject="${input.subject}"${linkLine}\n`,
    );
    if (env.NODE_ENV !== "production") {
      const logLine = `to=${input.to}\nsubject=${input.subject}\n${input.text}\n---\n`;
      fs.appendFileSync("/tmp/dev-emails.log", logLine);
    }
  }
}

class DisabledEmailProvider implements EmailProvider {
  async send(_input: SendEmailInput): Promise<void> {
    return;
  }
}

class ResendEmailProvider implements EmailProvider {
  private client: Resend;

  constructor() {
    if (!env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is required when EMAIL_PROVIDER=resend");
    }
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html:
        input.html ?? `<pre style="font-family:sans-serif">${input.text}</pre>`,
    });
  }
}

const resolveEmailProvider = (): EmailProvider => {
  switch (env.EMAIL_PROVIDER) {
    case "resend":
      return new ResendEmailProvider();
    case "disabled":
      return new DisabledEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
};

const provider = resolveEmailProvider();

// ─── Existing email functions ────────────────────────────────────────────────

export const sendPasswordResetEmail = async (
  recipientEmail: string,
  resetLink: string,
  expiresInMinutes: number,
): Promise<void> => {
  await provider.send({
    to: recipientEmail,
    subject: "Reset your password",
    text: `You requested a password reset. Use the link below to set a new password. It expires in ${expiresInMinutes} minutes.\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
    html: `
      <p>You requested a password reset. Click the link below to set a new password.</p>
      <p>This link expires in <strong>${expiresInMinutes} minutes</strong>.</p>
      <p><a href="${esc(resetLink)}">${esc(resetLink)}</a></p>
      <p>If you did not request this, you can safely ignore this email.</p>
    `,
  });
};

export const sendVerificationCodeEmail = async (
  recipientEmail: string,
  verificationCode: string,
  expiresInMinutes: number,
): Promise<void> => {
  await provider.send({
    to: recipientEmail,
    subject: "Verify your email",
    text: `Your verification code is ${verificationCode}. It expires in ${expiresInMinutes} minutes.`,
    html: `
      <p>Your verification code is:</p>
      <h2 style="letter-spacing:4px;font-family:monospace">${esc(verificationCode)}</h2>
      <p>This code expires in <strong>${expiresInMinutes} minutes</strong>.</p>
    `,
  });
};

// ─── New event-driven email functions ────────────────────────────────────────

/**
 * Notify a course coordinator when a group expresses interest in their project.
 */
export const sendGroupInterestEmail = async (
  coordinatorEmail: string,
  coordinatorName: string,
  projectName: string,
  groupNumber: number,
  memberNames: string[],
): Promise<void> => {
  const memberList = memberNames.map((n) => `• ${n}`).join("\n");
  const memberListHtml = memberNames.map((n) => `<li>${esc(n)}</li>`).join("");

  await provider.send({
    to: coordinatorEmail,
    subject: `Group ${groupNumber} expressed interest in "${projectName}"`,
    text: `Hi ${coordinatorName},\n\nGroup ${groupNumber} has expressed interest in your project "${projectName}".\n\nGroup members:\n${memberList}\n\nLog in to the Senior Design Marketplace to review and manage group assignments.`,
    html: `
      <p>Hi ${esc(coordinatorName)},</p>
      <p><strong>Group ${groupNumber}</strong> has expressed interest in your project <strong>"${esc(projectName)}"</strong>.</p>
      <p>Group members:</p>
      <ul>${memberListHtml}</ul>
      <p>Log in to the Senior Design Marketplace to review and manage group assignments.</p>
    `,
  });
};

/**
 * Notify all members of a group that they have been assigned to a project.
 */
export const sendGroupAssignedEmail = async (
  memberEmails: string[],
  projectName: string,
  coordinatorName: string,
): Promise<void> => {
  await Promise.all(
    memberEmails.map((email) =>
      provider.send({
        to: email,
        subject: `Your group has been assigned to "${projectName}"`,
        text: `Congratulations!\n\nYour group has been assigned to the project "${projectName}" by ${coordinatorName}.\n\nLog in to the Senior Design Marketplace for more details.`,
        html: `
          <p>Congratulations!</p>
          <p>Your group has been assigned to the project <strong>"${esc(projectName)}"</strong> by ${esc(coordinatorName)}.</p>
          <p>Log in to the Senior Design Marketplace for more details.</p>
        `,
      }),
    ),
  );
};

/**
 * Notify all members of a group that they have been unassigned from a project.
 */
export const sendGroupUnassignedEmail = async (
  memberEmails: string[],
  projectName: string,
  coordinatorName: string,
): Promise<void> => {
  await Promise.all(
    memberEmails.map((email) =>
      provider.send({
        to: email,
        subject: `Your group has been unassigned from "${projectName}"`,
        text: `Hi,\n\nYour group has been unassigned from the project "${projectName}" by ${coordinatorName}.\n\nLog in to the Senior Design Marketplace to explore other available projects.`,
        html: `
          <p>Hi,</p>
          <p>Your group has been unassigned from the project <strong>"${esc(projectName)}"</strong> by ${esc(coordinatorName)}.</p>
          <p>Log in to the Senior Design Marketplace to explore other available projects.</p>
        `,
      }),
    ),
  );
};

/**
 * Notify the group leader (first member) when a student requests to join their private group.
 */
export const sendJoinRequestEmail = async (
  leaderEmail: string,
  leaderName: string,
  requesterName: string,
  groupNumber: number,
): Promise<void> => {
  await provider.send({
    to: leaderEmail,
    subject: `${requesterName} wants to join Group ${groupNumber}`,
    text: `Hi ${leaderName},\n\n${requesterName} has requested to join your group (Group ${groupNumber}).\n\nLog in to the Senior Design Marketplace to approve or reject the request.`,
    html: `
      <p>Hi ${esc(leaderName)},</p>
      <p><strong>${esc(requesterName)}</strong> has requested to join your group (<strong>Group ${groupNumber}</strong>).</p>
      <p>Log in to the Senior Design Marketplace to approve or reject the request.</p>
    `,
  });
};

/**
 * Notify a student that their request to join a group was approved or rejected.
 */
export const sendJoinRequestResponseEmail = async (
  requesterEmail: string,
  requesterName: string,
  groupNumber: number,
  approved: boolean,
): Promise<void> => {
  const subject = approved
    ? `Your request to join Group ${groupNumber} was approved`
    : `Your request to join Group ${groupNumber} was declined`;
  const body = approved
    ? `Congratulations! Your request to join Group ${groupNumber} has been approved. Log in to the Senior Design Marketplace to view your group.`
    : `Your request to join Group ${groupNumber} has been declined. You can request to join another group using their group code.`;

  await provider.send({
    to: requesterEmail,
    subject,
    text: `Hi ${requesterName},\n\n${body}`,
    html: `<p>Hi ${esc(requesterName)},</p><p>${esc(body)}</p>`,
  });
};

/**
 * Notify a course coordinator when a student joins their course.
 */
export const sendStudentJoinedCourseEmail = async (
  coordinatorEmail: string,
  coordinatorName: string,
  studentName: string,
  courseName: string,
): Promise<void> => {
  await provider.send({
    to: coordinatorEmail,
    subject: `${studentName} joined your course`,
    text: `Hi ${coordinatorName},\n\n${studentName} has joined your course "${courseName}".\n\nLog in to the Senior Design Marketplace to view your course roster.`,
    html: `
      <p>Hi ${esc(coordinatorName)},</p>
      <p><strong>${esc(studentName)}</strong> has joined your course <strong>"${esc(courseName)}"</strong>.</p>
      <p>Log in to the Senior Design Marketplace to view your course roster.</p>
    `,
  });
};

export const sendProposalConfirmationEmail = async (
  recipientEmail: string,
  submitterName: string,
  proposalId: string,
  proposalTitle: string,
): Promise<void> => {
  await provider.send({
    to: recipientEmail,
    subject: `Proposal received: ${proposalId}`,
    text: `Hi ${submitterName},\n\nWe received your senior design proposal "${proposalTitle}".\n\nProposal ID: ${proposalId}\nStatus: Pending Review\n\nKeep this ID for your records. The Senior Design team will review your submission and follow up if more information is needed.`,
    html: `
      <p>Hi ${esc(submitterName)},</p>
      <p>We received your senior design proposal <strong>"${esc(proposalTitle)}"</strong>.</p>
      <p><strong>Proposal ID:</strong> ${esc(proposalId)}<br/><strong>Status:</strong> Pending Review</p>
      <p>Keep this ID for your records. The Senior Design team will review your submission and follow up if more information is needed.</p>
    `,
  });
};
