import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@3.2.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));
const adminEmail = Deno.env.get("ADMIN_EMAIL");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { name, email, phone, room_category, checkin, checkout, guests } = await req.json();

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
      to: [adminEmail || ""],
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
        </div>
      `,
    });

    return new Response(JSON.stringify({ success: true, customerRes, adminRes }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
