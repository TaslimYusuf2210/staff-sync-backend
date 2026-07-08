/**
 * In-memory OTP store.
 * Maps email -> { otp, expiresAt }
 * OTPs auto-expire after 5 minutes.
 */
const otpMap = new Map();

// Clean up expired OTPs every 60 seconds
setInterval(() => {
  const now = Date.now();
  for (const [email, record] of otpMap) {
    if (record.expiresAt <= now) {
      otpMap.delete(email);
    }
  }
}, 60_000);

/**
 * Store an OTP for a given email.
 * @param {string} email
 * @param {string} otp - 6-digit code
 * @param {number} ttlMs - time to live in milliseconds (default: 5 min)
 */
function setOtp(email, otp, ttlMs = 5 * 60 * 1000) {
  otpMap.set(email, {
    otp,
    expiresAt: Date.now() + ttlMs,
  });
}

/**
 * Retrieve the stored OTP record for an email.
 * @param {string} email
 * @returns {{ otp: string, expiresAt: number } | undefined}
 */
function getOtp(email) {
  return otpMap.get(email);
}

/**
 * Delete the OTP record for an email.
 * @param {string} email
 */
function deleteOtp(email) {
  otpMap.delete(email);
}

module.exports = { setOtp, getOtp, deleteOtp };
