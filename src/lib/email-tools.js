import sgMail from "@sendgrid/mail";

const key = process.env.SENDGRID_KEY;
console.log(key);
sgMail.setApiKey(key);

export const sendRegistrationEmail = async (recipientAddress) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: "Blog successfully created",
    text: "Your blog was successfully created",
    html: "<strong>Your blog was successfully created</strong>",
  };
  await sgMail.send(msg);
};
