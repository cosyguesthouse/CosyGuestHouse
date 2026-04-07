import { Handler } from "@netlify/functions";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);
const adminEmail = process.env.ADMIN_EMAIL || "yourgmail@gmail.com";

const handler: Handler = async (event, context) => {
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
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; padding: 20px; border-radius: 10px;">
          <h1 style="color: #333;">Booking Confirmed!</h1>
          <p>Hello ${name},</p>
          <p>Your booking has been successfully confirmed. We look forward to hosting you in Jodhpur.</p>
          <div style="background: #f9f9f9; padding: 15px; border-radius: 5px;">
            <h3>Booking Details:</h3>
            <p><strong>Room:</strong> ${room_category}</p>
            <p><strong>Check-in:</strong> ${checkin}</p>
            <p><strong>Check-out:</strong> ${checkout}</p>
            <p><strong>Guests:</strong> ${guests}</p>
          </div>
          <p>Thank you,<br/>Cosy Guest House</p>
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
