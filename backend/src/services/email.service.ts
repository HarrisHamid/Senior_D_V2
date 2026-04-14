import fs from "fs";
import { env } from "../config/env";

interface SendEmailInput {
  to: string;
  subject: string;
  text: string;
}

interface EmailProvider {
  send(input: SendEmailInput): Promise<void>;
}

class ConsoleEmailProvider implements EmailProvider {
  async send(input: SendEmailInput): Promise<void> {
    // Extract the first URL from the text body for easy copying
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

const resolveEmailProvider = (): EmailProvider => {
  switch (env.EMAIL_PROVIDER) {
    case "disabled":
      return new DisabledEmailProvider();
    case "console":
    default:
      return new ConsoleEmailProvider();
  }
};

const provider = resolveEmailProvider();

export const sendPasswordResetEmail = async (
  recipientEmail: string,
  resetLink: string,
  expiresInMinutes: number,
): Promise<void> => {
  await provider.send({
    to: recipientEmail,
    subject: "Reset your password",
    text: `You requested a password reset. Use the link below to set a new password. It expires in ${expiresInMinutes} minutes.\n\n${resetLink}\n\nIf you did not request this, ignore this email.`,
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
  });
};
