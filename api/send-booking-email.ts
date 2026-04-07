import { Resend } from 'resend';

// Configure Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || 'yourgmail@gmail.com';

/**
 * API Route: Send Booking Confirmation Emails
 * Handles POST requests to send emails to both customer and admin
 */
export default async function handler(req: any, res: any) {
  // CORS check (Standard for serverless functions)
  if (req.method === 'OPTIONS') {
    return res.status(200).send('ok');
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  const { name, email, phone, room_category, checkin, checkout, guests } = req.body;

  try {
    // 1. Send Email to Customer
    const customerEmailResponse = await resend.emails.send({
      from: "Cosy Guest House <noreply@cosyguesthouse.com>", // Change to verified domain in production
      to: email,
      subject: 'Booking Confirmed - Cosy Guest House',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin-bottom: 8px; font-size: 24px;">Booking Confirmed</h1>
            <div style="height: 4px; width: 60px; background: #3b82f6; margin: auto; border-radius: 2px;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Your booking at <strong>Cosy Guest House</strong> has been successfully confirmed. We're excited to have you stay with us!</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Reservation Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Room:</td>
                <td style="padding: 8px 0; font-weight: 600;">${room_category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Check-in:</td>
                <td style="padding: 8px 0; font-weight: 600;">${checkin}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Check-out:</td>
                <td style="padding: 8px 0; font-weight: 600;">${checkout}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Guests:</td>
                <td style="padding: 8px 0; font-weight: 600;">${guests}</td>
              </tr>
            </table>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">We look forward to hosting you in Jodhpur. If you have any questions, please feel free to contact us.</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>Thank you,</p>
            <p style="font-weight: 600; font-size: 14px; color: #475569; margin-top: 4px;">Cosy Guest House</p>
            <p>Jodhpur, Rajasthan</p>
          </div>
        </div>
      `,
    });

    // 2. Send Notification to Admin
    const adminEmailResponse = await resend.emails.send({
      from: 'Cosy Guest House <noreply@cosyguesthouse.com>',
      to: adminEmail,
      subject: 'New Booking Confirmed',
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
          <h2 style="color: #0f172a; margin-bottom: 20px; font-size: 20px; border-bottom: 1px solid #f1f5f9; padding-bottom: 15px;">New Booking Confirmed</h2>
          
          <p style="font-size: 16px;">A booking has been confirmed. Below are the guest details:</p>
          
          <div style="margin: 20px 0;">
             <h4 style="color: #334155; margin-bottom: 10px;">Guest Information</h4>
             <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
             <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
             <p style="margin: 5px 0;"><strong>Phone:</strong> ${phone}</p>
          </div>
          
          <div style="background-color: #f1f5f9; padding: 15px; border-radius: 8px;">
             <h4 style="color: #334155; margin-top: 0; margin-bottom: 10px;">Booking Details</h4>
             <p style="margin: 5px 0;"><strong>Room:</strong> ${room_category}</p>
             <p style="margin: 5px 0;"><strong>Dates:</strong> ${checkin} to ${checkout}</p>
             <p style="margin: 5px 0;"><strong>Guests:</strong> ${guests}</p>
          </div>
          
          <p style="margin-top: 25px; font-weight: 600; color: #2563eb;">Please prepare for guest arrival.</p>
        </div>
      `,
    });

    return res.status(200).json({
      success: true,
      customer: customerEmailResponse,
      admin: adminEmailResponse
    });
  } catch (error: any) {
    console.error('Email sending failed:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
}
