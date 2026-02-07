import EventEmitter from "node:events";
import Mail from "nodemailer/lib/mailer";
import { sendEmail } from "../email/sendEmail";

export let Emailevent = new EventEmitter();

interface EmailEvent extends Mail.Options {
  otp: number;
  username: string;
}

Emailevent.on("confirmEmail", async (data: EmailEvent) => {
  try {
    data.subject = "Confirm your Email";
    data.text = `Hello ${data.username}, your OTP is ${data.otp},your email is ${data.to}`;

    await sendEmail(data);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Fail to send email:", error);
  }
});

Emailevent.on("forgetPassword", async (data: EmailEvent) => {
  try {
    data.subject = "Confirm your password";
    data.text = `Hello ${data.username}, your OTP is ${data.otp},your email is ${data.to}`;

    await sendEmail(data);
    console.log("Email sent successfully");
  } catch (error) {
    console.log("Fail to send email:", error);
  }
});
