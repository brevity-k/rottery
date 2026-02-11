import { NextResponse } from 'next/server';
import { Resend } from 'resend';

const OWNER_EMAIL = 'brevity1s.wos@gmail.com';
const FROM_EMAIL = 'Lottery <onboarding@resend.dev>';

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(request: Request) {
  try {
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json(
        { error: 'Email service is not configured.' },
        { status: 503 }
      );
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const body = await request.json();
    const { name, email, message } = body as {
      name: string;
      email: string;
      message: string;
    };

    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return NextResponse.json(
        { error: 'Please fill in all fields.' },
        { status: 400 }
      );
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address.' },
        { status: 400 }
      );
    }

    // Send notification to site owner
    await resend.emails.send({
      from: FROM_EMAIL,
      to: OWNER_EMAIL,
      subject: `Lottery Contact: ${name}`,
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <h2 style="color: #2563eb; border-bottom: 2px solid #2563eb; padding-bottom: 12px;">
            New Contact Inquiry
          </h2>
          <table style="width: 100%; border-collapse: collapse; margin-top: 16px;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #555; width: 80px;">Name</td>
              <td style="padding: 8px 12px;">${escapeHtml(name)}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; color: #555;">Email</td>
              <td style="padding: 8px 12px;">
                <a href="mailto:${escapeHtml(email)}">${escapeHtml(email)}</a>
              </td>
            </tr>
          </table>
          <div style="margin-top: 20px; padding: 16px; background: #f0f5ff; border-radius: 8px; border-left: 4px solid #2563eb;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #555;">Message</p>
            <p style="margin: 0; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
          </div>
        </div>
      `,
    });

    // Send auto-reply to the sender
    await resend.emails.send({
      from: FROM_EMAIL,
      to: email,
      subject: 'Thank you for contacting Lottery',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
          <div style="text-align: center; padding: 20px 0;">
            <span style="font-size: 48px;">🎰</span>
          </div>
          <h2 style="color: #2563eb; text-align: center; margin-bottom: 24px;">
            We received your message!
          </h2>
          <p style="color: #333; line-height: 1.8;">
            Hi <strong>${escapeHtml(name)}</strong>,<br><br>
            Thank you for reaching out to Lottery.<br>
            We will review your message and get back to you within <strong>1-2 business days</strong>.
          </p>
          <div style="margin: 24px 0; padding: 16px; background: #f0f5ff; border-radius: 8px;">
            <p style="margin: 0 0 8px; font-weight: bold; color: #888; font-size: 13px;">Your message</p>
            <p style="margin: 0; color: #555; white-space: pre-wrap; line-height: 1.6;">${escapeHtml(message)}</p>
          </div>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 13px; text-align: center;">
            This is an automated reply.<br>
            <a href="https://lottery.com" style="color: #2563eb;">lottery.com</a>
          </p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Contact form error:', error);
    return NextResponse.json(
      { error: 'Failed to send email. Please try again later.' },
      { status: 500 }
    );
  }
}
