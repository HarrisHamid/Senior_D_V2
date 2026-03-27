import { Request, Response, NextFunction } from "express";

type RateLimitRecord = {
  count: number;
  resetAt: number;
};

type LimiterStore = Map<string, RateLimitRecord>;

const TOO_MANY_REQUESTS_RESPONSE = {
  success: false,
  error: "Too many requests",
};

const stores: LimiterStore[] = [];

const createRateLimiter = (maxRequests: number, windowMs: number) => {
  const requests: LimiterStore = new Map();
  stores.push(requests);

  return (req: Request, res: Response, next: NextFunction): void => {
    const now = Date.now();
    const key = `${req.ip || "unknown"}:${req.path}`;
    const existing = requests.get(key);

    if (!existing || now >= existing.resetAt) {
      requests.set(key, {
        count: 1,
        resetAt: now + windowMs,
      });
      next();
      return;
    }

    if (existing.count >= maxRequests) {
      res.status(429).json(TOO_MANY_REQUESTS_RESPONSE);
      return;
    }

    existing.count += 1;
    requests.set(key, existing);
    next();
  };
};

export const authLimiter = createRateLimiter(10, 15 * 60 * 1000);
export const verificationLimiter = createRateLimiter(5, 15 * 60 * 1000);
export const generalLimiter = createRateLimiter(100, 15 * 60 * 1000);

export const resetRateLimiters = () => {
  stores.forEach((store) => store.clear());
};
