import crypto from "crypto";
import mongoose from "mongoose";
import { env } from "../config/env";
import VerificationCode from "../models/VerificationCode.model";
import { sendVerificationCodeEmail } from "./email.service";

const toPositiveInt = (value: string, fallback: number): number => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    return fallback;
  }

  return parsed;
};

export const getVerificationCodeLength = (): number =>
  toPositiveInt(env.VERIFICATION_CODE_LENGTH, 6);

export const getVerificationCodeTtlMinutes = (): number =>
  toPositiveInt(env.VERIFICATION_CODE_TTL_MINUTES, 10);

export const generateVerificationCode = (): string => {
  const length = getVerificationCodeLength();
  const min = 10 ** (length - 1);
  const max = 10 ** length - 1;
  const randomNumber = crypto.randomInt(min, max + 1);

  return randomNumber.toString();
};

export const hashVerificationCode = (code: string): string => {
  return crypto.createHash("sha256").update(code).digest("hex");
};

export const issueVerificationCode = async (
  userId: mongoose.Types.ObjectId | string,
  email: string,
): Promise<void> => {
  const code = generateVerificationCode();
  const codeHash = hashVerificationCode(code);
  const ttlMinutes = getVerificationCodeTtlMinutes();
  const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

  await VerificationCode.findOneAndUpdate(
    { userId, email },
    {
      userId,
      email,
      codeHash,
      expiresAt,
    },
    { upsert: true, setDefaultsOnInsert: true, new: true },
  );

  await sendVerificationCodeEmail(email, code, ttlMinutes);
};

export const validateVerificationCode = async (
  userId: mongoose.Types.ObjectId | string,
  email: string,
  code: string,
): Promise<boolean> => {
  const record = await VerificationCode.findOne({ userId, email })
    .select("+codeHash")
    .lean();

  if (!record) {
    return false;
  }

  if (record.expiresAt.getTime() < Date.now()) {
    await VerificationCode.deleteOne({ _id: record._id });
    return false;
  }

  const providedHash = hashVerificationCode(code);
  const isMatch = providedHash === record.codeHash;

  if (!isMatch) {
    return false;
  }

  await VerificationCode.deleteOne({ _id: record._id });
  return true;
};
