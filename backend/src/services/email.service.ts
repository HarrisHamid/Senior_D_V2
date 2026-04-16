import fs from "fs";
import { Resend } from "resend";
import { env } from "../config/env";

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
      throw new Error(
        "RESEND_API_KEY is required when EMAIL_PROVIDER=resend",
      );
    }
    this.client = new Resend(env.RESEND_API_KEY);
  }

  async send(input: SendEmailInput): Promise<void> {
    await this.client.emails.send({
      from: env.EMAIL_FROM,
      to: input.to,
      subject: input.subject,
      html: input.html ?? `<pre style="font-family:sans-serif">${input.text}</pre>`,
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
      <p><a href="${resetLink}">${resetLink}</a></p>
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
      <h2 style="letter-spacing:4px;font-family:monospace">${verificationCode}</h2>
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
  const memberListHtml = memberNames.map((n) => `<li>${n}</li>`).join("");

  await provider.send({
    to: coordinatorEmail,
    subject: `Group ${groupNumber} expressed interest in "${projectName}"`,
    text: `Hi ${coordinatorName},\n\nGroup ${groupNumber} has expressed interest in your project "${projectName}".\n\nGroup members:\n${memberList}\n\nLog in to the Senior Design Marketplace to review and manage group assignments.`,
    html: `
      <p>Hi ${coordinatorName},</p>
      <p><strong>Group ${groupNumber}</strong> has expressed interest in your project <strong>"${projectName}"</strong>.</p>
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
          <p>Your group has been assigned to the project <strong>"${projectName}"</strong> by ${coordinatorName}.</p>
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
          <p>Your group has been unassigned from the project <strong>"${projectName}"</strong> by ${coordinatorName}.</p>
          <p>Log in to the Senior Design Marketplace to explore other available projects.</p>
        `,
      }),
    ),
  );
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
      <p>Hi ${coordinatorName},</p>
      <p><strong>${studentName}</strong> has joined your course <strong>"${courseName}"</strong>.</p>
      <p>Log in to the Senior Design Marketplace to view your course roster.</p>
    `,
  });
};
