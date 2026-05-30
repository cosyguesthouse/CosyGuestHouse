import { Handler } from "@netlify/functions";
import { Resend } from "resend";

const handler: Handler = async (event, context) => {
  console.log("NETLIFY FUNCTION HIT");
  
  const resend = new Resend(process.env.RESEND_API_KEY);
  const adminEmail = process.env.ADMIN_EMAIL || "yourgmail@gmail.com";

  // Only allow POST
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { name, email, phone, room_category, checkin, checkout, guests } = JSON.parse(event.body || "{}");

    // 1. Send to Customer
    const customerRes = await resend.emails.send({
      from: "Cosy Guest House <noreply@cosyguesthouse.com>",
      to: [email],
      subject: "Booking Confirmed - Cosy Guest House",
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; color: #1e293b;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0f172a; margin-bottom: 8px; font-size: 24px;">Booking Confirmed!</h1>
            <div style="height: 4px; width: 60px; background: #3b82f6; margin: auto; border-radius: 2px;"></div>
          </div>
          
          <p style="font-size: 16px; line-height: 1.6;">Hello <strong>\${name}</strong>,</p>
          <p style="font-size: 16px; line-height: 1.6;">Thank you for choosing our guest house for your stay! We are delighted to confirm your booking. Your comfort and satisfaction are very important to us, and we look forward to hosting you.</p>
          
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 25px 0;">
            <h3 style="margin-top: 0; color: #334155; font-size: 14px; text-transform: uppercase; letter-spacing: 0.05em;">Booking Details</h3>
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Room:</td>
                <td style="padding: 8px 0; font-weight: 600;">\${room_category}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Check-in:</td>
                <td style="padding: 8px 0; font-weight: 600;">\${checkin}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Check-out:</td>
                <td style="padding: 8px 0; font-weight: 600;">\${checkout}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; color: #64748b;">Guests:</td>
                <td style="padding: 8px 0; font-weight: 600;">\${guests}</td>
              </tr>
            </table>
          </div>

          <h3 style="color: #334155; font-size: 16px; margin-top: 20px;">Check-in & Check-out:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            <li>Check-in time: 10:00 AM</li>
            <li>Check-out time: 10:00 AM</li>
          </ul>
          <p style="font-size: 15px; line-height: 1.6; margin-top: 5px;"><em>Early check-in or late check-out is subject to availability.</em></p>

          <h3 style="color: #334155; font-size: 16px; margin-top: 20px;">Our Services Include:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            <li>Roof top restaurant</li>
            <li>Free Wi-Fi</li>
            <li>24/7 assistance</li>
            <li>Housekeeping services</li>
            <li>Clean and comfy rooms</li>
            <li>Village safari & camel safari</li>
          </ul>

          <h3 style="color: #334155; font-size: 16px; margin-top: 20px;">Guest Guidelines & Terms:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            <li>Please carry a valid ID proof at the time of check-in.</li>
            <li>Smoking is not allowed (designated areas only).</li>
            <li>Any damage to property will be chargeable.</li>
            <li>Outside visitors are not allowed in rooms as per policy.</li>
            <li>Maintain peace and respect other guests, especially during night hours.</li>
            <li>Full payment/advance payment must be completed as per booking policy.</li>
          </ul>

          <h3 style="color: #334155; font-size: 16px; margin-top: 20px;">Cancellation Policy:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            <li>Cancellations made 48 hours before check-in will receive a full refund.</li>
            <li>Cancellations made within 48 hours of check-in will be charged one night's stay.</li>
            <li>No-shows will be charged the full booking amount.</li>
          </ul>

          <h3 style="color: #334155; font-size: 16px; margin-top: 20px;">Important Information:</h3>
          <ul style="margin: 0; padding-left: 20px; font-size: 15px; line-height: 1.6;">
            <li>For any special requests, feel free to contact us in advance.</li>
            <li>In case of any assistance during your stay, our team is always ready to help.</li>
          </ul>

          <p style="font-size: 16px; line-height: 1.6; margin-top: 20px;">If you have any questions or need help before your arrival, please don't hesitate to contact us. We look forward to welcoming you and making your stay comfortable and memorable!</p>
          
          <div style="margin-top: 40px; border-top: 1px solid #f1f5f9; padding-top: 20px; color: #475569; font-size: 14px; line-height: 1.6;">
            <p style="margin: 0;">Warm regards,</p>
            <p style="font-weight: 600; font-size: 16px; margin: 5px 0 0 0;">Cosy Guest House</p>
            <p style="margin: 0;">MR JOSHI</p>
            <p style="margin: 0;">📞 8306562776, 9829023390</p>
            <p style="margin: 0;">✉️ cosyguesthouse@gmail.com</p>
          </div>
        </div>
      `,
    });

    // 2. Send to Admin
    const adminRes = await resend.emails.send({
      from: "Cosy Guest House <noreply@cosyguesthouse.com>",
      to: [adminEmail],
      subject: "New Booking Confirmed",
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h2 style="color: #333;">A booking has been confirmed.</h2>
          <p><strong>Customer Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Phone:</strong> ${phone}</p>
          <hr/>
          <h3>Room Details:</h3>
          <p><strong>Room:</strong> ${room_category}</p>
          <p><strong>Check-in:</strong> ${checkin}</p>
          <p><strong>Check-out:</strong> ${checkout}</p>
          <p><strong>Guests:</strong> ${guests}</p>
          <p style="color: blue;">Please prepare for guest arrival.</p>
        </div>
      `,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ success: true, customerRes, adminRes }),

    };
  } catch (error: any) {
    console.error("Email Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};

export { handler };
