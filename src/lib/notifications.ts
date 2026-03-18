import nodemailer from 'nodemailer';
import dbConnect from './mongodb';
import Notification from '@/models/Notification';
import { NotificationType } from '@/types';
import { Types } from 'mongoose';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

interface NotificationParams {
  userId: string | Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  bookingId?: string | Types.ObjectId | null;
  email?: string;
  sendEmail?: boolean;
}

export async function createNotification(params: NotificationParams) {
  await dbConnect();

  const notification = await Notification.create({
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    bookingId: params.bookingId || null,
    isRead: false,
    channels: {
      inApp: true,
      email: params.sendEmail ?? false,
      sms: false,
    },
    sentAt: new Date(),
  });

  if (params.sendEmail && params.email) {
    try {
      await sendEmail(params.email, params.title, params.message);
    } catch (error) {
      console.error('Failed to send email notification:', error);
    }
  }

  return notification;
}

export async function sendEmail(to: string, subject: string, htmlBody: string) {
  const mailOptions = {
    from: `"Court Marketplace" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html: getEmailTemplate(subject, htmlBody),
  };

  return transporter.sendMail(mailOptions);
}

function getEmailTemplate(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0;padding:0;background-color:#f6f7f8;font-family:'Inter',Arial,sans-serif;">
      <div style="max-width:600px;margin:0 auto;padding:20px;">
        <div style="background-color:#1f7a4b;padding:20px;text-align:center;border-radius:12px 12px 0 0;">
          <h1 style="color:white;margin:0;font-size:24px;">🏸 Court Marketplace</h1>
        </div>
        <div style="background-color:white;padding:30px;border-radius:0 0 12px 12px;box-shadow:0 2px 4px rgba(0,0,0,0.1);">
          <h2 style="color:#185f3a;margin-top:0;">${title}</h2>
          <div style="color:#374151;line-height:1.6;">
            ${content}
          </div>
        </div>
        <div style="text-align:center;padding:20px;color:#6b7280;font-size:12px;">
          <p>Court Marketplace - Book Your Court Instantly</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function sendBookingConfirmation(booking: {
  bookingCode: string;
  date: Date;
  startTime: string;
  endTime: string;
  totalAmount: number;
  customerEmail: string;
  customerName: string;
  customerId: string;
  venueName: string;
  courtName: string;
  bookingId: string;
}) {
  const dateStr = new Date(booking.date).toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const message = `
    <p>Hai ${booking.customerName},</p>
    <p>Booking Anda telah dikonfirmasi! 🎉</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Kode Booking</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${booking.bookingCode}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Venue</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${booking.venueName}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Court</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${booking.courtName}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Tanggal</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${dateStr}</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Waktu</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">${booking.startTime} - ${booking.endTime} WIB</td></tr>
      <tr><td style="padding:8px;border-bottom:1px solid #e5e7eb;font-weight:bold;">Total</td><td style="padding:8px;border-bottom:1px solid #e5e7eb;">Rp ${booking.totalAmount.toLocaleString('id-ID')}</td></tr>
    </table>
    <p>Tunjukkan kode booking Anda saat check-in.</p>
  `;

  await createNotification({
    userId: booking.customerId,
    type: 'booking_confirmed',
    title: 'Booking Dikonfirmasi! 🎉',
    message,
    bookingId: booking.bookingId,
    email: booking.customerEmail,
    sendEmail: true,
  });
}

export async function sendBookingReminder(booking: {
  bookingCode: string;
  date: Date;
  startTime: string;
  customerEmail: string;
  customerName: string;
  customerId: string;
  venueName: string;
  courtName: string;
  bookingId: string;
  venueAddress?: string;
}) {
  const message = `
    <p>Hai ${booking.customerName},</p>
    <p>Permainan Anda dimulai dalam 1 jam! 🏸</p>
    <p><strong>${booking.venueName}</strong> - ${booking.courtName}</p>
    <p>Jam: ${booking.startTime} WIB</p>
    ${booking.venueAddress ? `<p>Alamat: ${booking.venueAddress}</p>` : ''}
    <p>Kode Booking: <strong>${booking.bookingCode}</strong></p>
  `;

  await createNotification({
    userId: booking.customerId,
    type: 'booking_reminder',
    title: 'Permainan Dimulai 1 Jam Lagi! 🏸',
    message,
    bookingId: booking.bookingId,
    email: booking.customerEmail,
    sendEmail: true,
  });
}

export async function sendBookingCancellation(booking: {
  bookingCode: string;
  customerEmail: string;
  customerName: string;
  customerId: string;
  bookingId: string;
  refundInfo?: string;
}) {
  const message = `
    <p>Hai ${booking.customerName},</p>
    <p>Booking Anda dengan kode <strong>${booking.bookingCode}</strong> telah dibatalkan.</p>
    ${booking.refundInfo ? `<p>${booking.refundInfo}</p>` : ''}
  `;

  await createNotification({
    userId: booking.customerId,
    type: 'booking_cancelled',
    title: 'Booking Dibatalkan',
    message,
    bookingId: booking.bookingId,
    email: booking.customerEmail,
    sendEmail: true,
  });
}
