/* eslint-disable prettier/prettier */
import * as nodemailer from 'nodemailer';
export async function sendMail(userEmail:string, subject:string, html:string) {
  const transporter = nodemailer.createTransport({
    service: 'gmail', 
    auth: {
      user: process.env.APP_EMAIL_ADDRESS,
      pass: process.env.APP_PASSWORD
    },
  });
  const info = await transporter.sendMail({
    from: process.env.APP_EMAIL_ADDRESS,
    to: userEmail,
    subject,
    html,
  });
  return info;
}
