/**
 * In-memory login attempt limiter with CAPTCHA challenge generation.
 * - Tracks failed attempts per email.
 * - After 5 failures within a 15-minute window the account is temporarily locked.
 * - Generates server-verified math CAPTCHAs after 3 failures.
 */

const attempts = new Map(); // email -> { count, firstAttempt, lockedUntil, captcha }

const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const WINDOW_MS = 15 * 60 * 1000; // rolling window
const CAPTCHA_THRESHOLD = 3; // require CAPTCHA after this many failures

function getRecord(email) {
  const key = email.toLowerCase();
  if (!attempts.has(key)) {
    return null;
  }
  const record = attempts.get(key);

  // If the rolling window expired, reset
  if (Date.now() - record.firstAttempt > WINDOW_MS && !record.lockedUntil) {
    attempts.delete(key);
    return null;
  }

  // If lockout has expired, reset
  if (record.lockedUntil && Date.now() > record.lockedUntil) {
    attempts.delete(key);
    return null;
  }

  return record;
}

/**
 * Generate a simple math captcha and store its answer.
 */
function generateCaptcha(email) {
  const key = email.toLowerCase();
  const a = Math.floor(Math.random() * 20) + 1;
  const b = Math.floor(Math.random() * 20) + 1;
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let answer;
  switch (op) {
    case '+': answer = a + b; break;
    case '-': answer = a - b; break;
    case '×': answer = a * b; break;
  }

  const captcha = { question: `${a} ${op} ${b} = ?`, answer };

  const record = attempts.get(key);
  if (record) {
    record.captcha = captcha;
  }

  return captcha.question;
}

/**
 * Check if this email is currently locked out.
 * Returns { locked, remaining, requiresCaptcha, captchaQuestion }
 */
export function checkLoginStatus(email) {
  const record = getRecord(email);
  if (!record) {
    return { locked: false, requiresCaptcha: false, attemptsLeft: MAX_ATTEMPTS };
  }

  if (record.lockedUntil && Date.now() < record.lockedUntil) {
    const remaining = Math.ceil((record.lockedUntil - Date.now()) / 1000);
    return { locked: true, remaining, requiresCaptcha: false, attemptsLeft: 0 };
  }

  const requiresCaptcha = record.count >= CAPTCHA_THRESHOLD;
  let captchaQuestion = null;
  if (requiresCaptcha) {
    captchaQuestion = generateCaptcha(email);
  }

  return {
    locked: false,
    requiresCaptcha,
    captchaQuestion,
    attemptsLeft: MAX_ATTEMPTS - record.count,
  };
}

/**
 * Verify the CAPTCHA answer for a given email.
 */
export function verifyCaptcha(email, userAnswer) {
  const key = email.toLowerCase();
  const record = attempts.get(key);
  if (!record || !record.captcha) return true; // no captcha required
  return parseInt(userAnswer, 10) === record.captcha.answer;
}

/**
 * Record a failed login attempt. Returns current status after failure.
 */
export function recordFailedAttempt(email) {
  const key = email.toLowerCase();
  let record = getRecord(email);

  if (!record) {
    record = { count: 0, firstAttempt: Date.now(), lockedUntil: null, captcha: null };
    attempts.set(key, record);
  }

  record.count += 1;

  if (record.count >= MAX_ATTEMPTS) {
    record.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    const remaining = Math.ceil(LOCKOUT_DURATION_MS / 1000);
    return { locked: true, remaining, requiresCaptcha: false, attemptsLeft: 0 };
  }

  const requiresCaptcha = record.count >= CAPTCHA_THRESHOLD;
  let captchaQuestion = null;
  if (requiresCaptcha) {
    captchaQuestion = generateCaptcha(email);
  }

  return {
    locked: false,
    requiresCaptcha,
    captchaQuestion,
    attemptsLeft: MAX_ATTEMPTS - record.count,
  };
}

/**
 * Clear attempts on successful login.
 */
export function clearAttempts(email) {
  attempts.delete(email.toLowerCase());
}
