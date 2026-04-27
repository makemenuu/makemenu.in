import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await req.json();

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: "Name, email, and message are required." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please enter a valid email address." },
        { status: 400 }
      );
    }

    // Email to you (notification)
    await resend.emails.send({
      from: "MakeMenu Contact Form <noreply@makemenu.in>", // change after domain verified
      to: process.env.CONTACT_RECEIVER!,
      replyTo: email,
      subject: `[MakeMenu] New message: ${subject || "General enquiry"}`,
      html: notificationHtml({ name, email, phone, subject, message }),
    });

    // Auto-reply to customer
    await resend.emails.send({
      from:"MakeMenu Support <noreply@makemenu.in>", // change after domain verified
      to: email,
      subject: `We received your message, ${name.trim().split(" ")[0]}! 👋`,
      html: autoReplyHtml({ name, email, subject }),
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[api/contact] Error:", err);
    return NextResponse.json(
      { error: "Failed to send message. Please try again later." },
      { status: 500 }
    );
  }
}

function esc(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function notificationHtml({
  name, email, phone, subject, message,
}: {
  name: string; email: string; phone?: string; subject?: string; message: string;
}) {
  const time = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:#1a1a1a;padding:28px 36px}
  .logo{font-size:1.3rem;font-weight:800;color:#fff}
  .logo span{color:#e63329}
  .badge{display:inline-block;background:rgba(230,51,41,.12);color:#e63329;font-size:.74rem;font-weight:700;padding:5px 14px;border-radius:100px;border:1px solid rgba(230,51,41,.25);margin-top:10px}
  .body{padding:36px}
  .lbl{font-size:.7rem;font-weight:700;text-transform:uppercase;letter-spacing:.08em;color:#9ca3af;margin-bottom:5px}
  .val{font-size:.95rem;color:#1a1a1a;font-weight:500;margin-bottom:22px;word-break:break-word}
  .msg-box{background:#f9fafb;border:1px solid #e5e7eb;border-left:3px solid #e63329;border-radius:8px;padding:18px 20px;margin-bottom:28px;white-space:pre-wrap;font-size:.9rem;color:#374151;line-height:1.7}
  .reply-btn{display:inline-block;background:#e63329;color:#fff;text-decoration:none;padding:12px 28px;border-radius:9px;font-weight:600;font-size:.9rem}
  .ftr{background:#f9fafb;border-top:1px solid #e5e7eb;padding:16px 36px;font-size:.76rem;color:#9ca3af}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <div class="logo">Make<span>Menu</span></div>
    <div class="badge">📬 New Contact Form Submission</div>
  </div>
  <div class="body">
    <div class="lbl">From</div>
    <div class="val">${esc(name)} &lt;${esc(email)}&gt;</div>
    ${phone?.trim() ? `<div class="lbl">Phone</div><div class="val">${esc(phone)}</div>` : ""}
    <div class="lbl">Subject</div>
    <div class="val">${esc(subject || "General enquiry")}</div>
    <div class="lbl">Message</div>
    <div class="msg-box">${esc(message)}</div>
    <a href="mailto:${esc(email)}?subject=Re: ${encodeURIComponent(subject || "Your MakeMenu enquiry")}"
       class="reply-btn">Reply to ${esc(name)} →</a>
  </div>
  <div class="ftr">Submitted via makemenu.in · ${time} IST</div>
</div>
</body></html>`;
}

function autoReplyHtml({
  name, email, subject,
}: {
  name: string; email: string; subject?: string;
}) {
  const firstName = esc(name.trim().split(" ")[0] || "there");
  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8">
<style>
  body{margin:0;padding:0;background:#f3f4f6;font-family:Arial,sans-serif}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .hdr{background:#1a1a1a;padding:32px 36px;text-align:center}
  .logo{font-size:1.5rem;font-weight:800;color:#fff}
  .logo span{color:#e63329}
  .body{padding:40px 36px;text-align:center}
  h2{font-size:1.3rem;color:#1a1a1a;margin:0 0 12px;font-family:Arial,sans-serif}
  p{font-size:.92rem;color:#6b7280;line-height:1.75;max-width:420px;margin:0 auto 16px}
  .summary{background:#fff5f5;border:1.5px solid rgba(230,51,41,.18);border-radius:12px;padding:20px 24px;text-align:left;margin:24px 0}
  .row{display:flex;justify-content:space-between;font-size:.84rem;padding:8px 0;border-bottom:1px solid rgba(230,51,41,.1)}
  .row:last-child{border-bottom:none}
  .rl{color:#9ca3af}
  .rv{color:#1a1a1a;font-weight:600}
  .cta{display:inline-block;background:#e63329;color:#fff;text-decoration:none;padding:13px 32px;border-radius:9px;font-weight:700;font-size:.92rem;margin-top:8px}
  .ftr{background:#f9fafb;border-top:1px solid #e5e7eb;padding:18px 36px;font-size:.76rem;color:#9ca3af;text-align:center}
  .ftr a{color:#e63329;text-decoration:none}
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr"><div class="logo">Make<span>Menu</span></div></div>
  <div class="body">
    <div style="font-size:3rem;margin-bottom:18px">✅</div>
    <h2>Got your message, ${firstName}!</h2>
    <p>Thanks for reaching out to MakeMenu. Our team will get back to you within <strong>24 hours</strong> on working days.</p>
    <div class="summary">
      <div class="row"><span class="rl">Subject</span><span class="rv">${esc(subject || "General enquiry")}</span></div>
      <div class="row"><span class="rl">Submitted by</span><span class="rv">${esc(name)}</span></div>
      <div class="row"><span class="rl">Reply to</span><span class="rv">${esc(email)}</span></div>
    </div>
    <p>While you wait, set up your digital menu for free — takes under 3 minutes.</p>
    <a href="https://makemenu.in/signup" class="cta">Start for Free →</a>
  </div>
  <div class="ftr">
    © 2026 MakeMenu · Chennai, Tamil Nadu, India<br>
    <a href="https://makemenu.in">makemenu.in</a> ·
    <a href="https://makemenu.in/privacy">Privacy Policy</a>
  </div>
</div>
</body></html>`;
}