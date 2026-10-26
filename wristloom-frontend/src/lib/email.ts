// ============================================================
// Wristloom — Transactional Email Dispatcher
// Layer 16: Additional SaaS Features (15-Layer SaaS Playbook, p. 34)
// Haute horlogerie email templates powered by Resend
// ============================================================

import { Resend } from 'resend';

const resendApiKey = process.env.RESEND_API_KEY;
const fromEmail = process.env.EMAIL_FROM || 'Wristloom Atelier <concierge@wristloom.luxury>';

const resend = resendApiKey ? new Resend(resendApiKey) : null;

export interface OrderEmailData {
  orderReference: string;
  customerName: string;
  customerEmail: string;
  totalAmount: number;
  items: Array<{ name: string; brand: string; quantity: number; price: number }>;
  shippingCity: string;
  paymentMethod: string;
}

export interface BookingEmailData {
  bookingReference: string;
  customerName: string;
  customerEmail: string;
  serviceType: string;
  watchBrand?: string | null;
  scheduledDate: string;
  scheduledTime: string;
  depositAmount: number;
}

/**
 * Dispatches an order acquisition confirmation email.
 */
export async function sendOrderConfirmationEmail(data: OrderEmailData) {
  if (!resend) {
    console.info(`[Email Dispatch Mock] Order Confirmation #${data.orderReference} to ${data.customerEmail} (Total: ₹${data.totalAmount})`);
    return { success: true, mocked: true };
  }

  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(176,141,87,0.15); color: #EDE6D6;">
          <strong style="color: #B08D57;">${item.brand}</strong> — ${item.name} (x${item.quantity})
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid rgba(176,141,87,0.15); text-align: right; color: #B08D57; font-family: monospace;">
          ₹${(item.price * item.quantity).toLocaleString('en-IN')}
        </td>
      </tr>`
    )
    .join('');

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Acquisition Confirmation — #${data.orderReference}</title>
  </head>
  <body style="background-color: #0E0C0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDE6D6; margin: 0; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #14110F; border: 1px solid rgba(176,141,87,0.30); padding: 40px; border-radius: 4px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B08D57;">Haute Horlogerie Digital Atelier</span>
        <h1 style="color: #EDE6D6; font-size: 24px; margin-top: 10px; font-weight: normal; letter-spacing: 0.05em;">Acquisition Confirmed</h1>
        <p style="color: rgba(237,230,214,0.6); font-size: 13px;">Dossier Reference: <span style="color: #B08D57; font-family: monospace;">#${data.orderReference}</span></p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: rgba(237,230,214,0.85);">
        Dear ${data.customerName},
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: rgba(237,230,214,0.7);">
        Thank you for your acquisition. Our master horologists have begun the white-glove inspection and certification process for your selected timepiece(s).
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 30px 0; font-size: 13px;">
        <thead>
          <tr style="border-bottom: 1px solid rgba(176,141,87,0.30); text-align: left;">
            <th style="padding-bottom: 8px; color: rgba(237,230,214,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em;">Timepiece</th>
            <th style="padding-bottom: 8px; color: rgba(237,230,214,0.4); font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; text-align: right;">Valuation</th>
          </tr>
        </thead>
        <tbody>
          ${itemsHtml}
        </tbody>
        <tfoot>
          <tr>
            <td style="padding-top: 16px; font-weight: bold; color: #EDE6D6;">Total Consideration</td>
            <td style="padding-top: 16px; font-weight: bold; text-align: right; color: #B08D57; font-family: monospace; font-size: 16px;">
              ₹${data.totalAmount.toLocaleString('en-IN')}
            </td>
          </tr>
        </tfoot>
      </table>

      <div style="background-color: #1A1614; border: 1px solid rgba(176,141,87,0.15); padding: 16px; border-radius: 2px; margin-bottom: 30px; font-size: 12px; color: rgba(237,230,214,0.65);">
        <div><strong>Insured Destination:</strong> ${data.shippingCity}, India</div>
        <div style="margin-top: 6px;"><strong>Payment Method:</strong> ${data.paymentMethod.toUpperCase()}</div>
        <div style="margin-top: 6px;"><strong>Transit Insurance:</strong> Fully Insured Up to ₹50,00,000</div>
      </div>

      <p style="font-size: 12px; color: rgba(237,230,214,0.4); text-align: center; margin-top: 40px; border-top: 1px solid rgba(176,141,87,0.10); padding-top: 20px;">
        Wristloom Concierge Atelier · Confidential & Privileged Communication
      </p>
    </div>
  </body>
  </html>
  `;

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [data.customerEmail],
      subject: `Acquisition Confirmed: Dossier #${data.orderReference}`,
      html,
    });
    return { success: true, id: response.data?.id };
  } catch (error: any) {
    console.error('[Resend Email Error]', error);
    return { success: false, error: error.message };
  }
}

/**
 * Dispatches a repair booking confirmation email.
 */
export async function sendBookingConfirmationEmail(data: BookingEmailData) {
  if (!resend) {
    console.info(`[Email Dispatch Mock] Booking Confirmation #${data.bookingReference} to ${data.customerEmail}`);
    return { success: true, mocked: true };
  }

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>Appointment Confirmed — #${data.bookingReference}</title>
  </head>
  <body style="background-color: #0E0C0A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #EDE6D6; margin: 0; padding: 40px 20px;">
    <div style="max-width: 600px; margin: 0 auto; background-color: #14110F; border: 1px solid rgba(176,141,87,0.30); padding: 40px; border-radius: 4px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <span style="font-family: monospace; font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; color: #B08D57;">Haute Horlogerie Care Service</span>
        <h1 style="color: #EDE6D6; font-size: 24px; margin-top: 10px; font-weight: normal;">Appointment Scheduled</h1>
        <p style="color: rgba(237,230,214,0.6); font-size: 13px;">Booking Reference: <span style="color: #B08D57; font-family: monospace;">#${data.bookingReference}</span></p>
      </div>

      <p style="font-size: 14px; line-height: 1.6; color: rgba(237,230,214,0.85);">
        Dear ${data.customerName},
      </p>
      <p style="font-size: 14px; line-height: 1.6; color: rgba(237,230,214,0.7);">
        Your white-glove horological appointment has been confirmed. A certified watchmaker will arrive equipped with diagnostic calibration tools.
      </p>

      <div style="background-color: #1A1614; border: 1px solid rgba(176,141,87,0.15); padding: 20px; border-radius: 2px; margin: 25px 0; font-size: 13px; color: #EDE6D6;">
        <div style="margin-bottom: 8px;"><strong>Service:</strong> <span style="color: #B08D57;">${data.serviceType}</span></div>
        ${data.watchBrand ? `<div style="margin-bottom: 8px;"><strong>Timepiece Brand:</strong> ${data.watchBrand}</div>` : ''}
        <div style="margin-bottom: 8px;"><strong>Scheduled Date:</strong> ${data.scheduledDate}</div>
        <div style="margin-bottom: 8px;"><strong>Time Window:</strong> ${data.scheduledTime}</div>
        <div><strong>Deposit:</strong> <span style="color: #B08D57; font-family: monospace;">₹${data.depositAmount.toLocaleString('en-IN')}</span></div>
      </div>

      <p style="font-size: 12px; color: rgba(237,230,214,0.5); line-height: 1.5;">
        You can track your technician's live radar en-route directly in your personal Atelier dashboard.
      </p>
    </div>
  </body>
  </html>
  `;

  try {
    const response = await resend.emails.send({
      from: fromEmail,
      to: [data.customerEmail],
      subject: `Horological Appointment Confirmed: #${data.bookingReference}`,
      html,
    });
    return { success: true, id: response.data?.id };
  } catch (error: any) {
    console.error('[Resend Email Error]', error);
    return { success: false, error: error.message };
  }
}
