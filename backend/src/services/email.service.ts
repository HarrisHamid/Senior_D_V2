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
    console.log("[Email:console]", {
      from: env.EMAIL_FROM,
      ...input,
    });
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
