// auth ke emails ka content — text (simple mail apps ke liye) + html (Gmail etc. ke liye) dono
export const verificationEmail = ({ name, link }) => ({
    subject: "Verify your email — MockMate",
    text: `Hi ${name},\n\nClick this link to verify your email and start practising:\n${link}\n\nThis link expires in 24 hours. If you didn't sign up, ignore this email.`,
    html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f2540">
            <h2 style="margin:0 0 16px">Verify your email</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>Click the button below to verify your email and start practising with MockMate.</p>
            <p style="margin:24px 0">
                <a href="${link}" style="background:#f75c2f;color:#0a1a2e;font-weight:bold;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block">Verify email</a>
            </p>
            <p style="font-size:13px;color:#4a5a6e">This link expires in 24 hours. If you didn't sign up, ignore this email.</p>
        </div>`,
});

export const passwordResetEmail = ({ name, link }) => ({
    subject: "Reset your password — MockMate",
    text: `Hi ${name},\n\nSomeone (hopefully you) asked to reset your password. Click this link to choose a new one:\n${link}\n\nThis link expires in 1 hour. If you didn't ask for this, ignore this email — your password won't change.`,
    html: `
        <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto;padding:24px;color:#0f2540">
            <h2 style="margin:0 0 16px">Reset your password</h2>
            <p>Hi ${escapeHtml(name)},</p>
            <p>Someone (hopefully you) asked to reset your password. Click the button below to choose a new one.</p>
            <p style="margin:24px 0">
                <a href="${link}" style="background:#f75c2f;color:#0a1a2e;font-weight:bold;padding:12px 20px;border-radius:999px;text-decoration:none;display:inline-block">Reset password</a>
            </p>
            <p style="font-size:13px;color:#4a5a6e">This link expires in 1 hour. If you didn't ask for this, ignore this email — your password won't change.</p>
        </div>`,
});

// name user ne type kiya hai — "<script>" jaisa kuch ho to HTML me as text dikhe, code na bane
const escapeHtml = (str) =>
    str.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
