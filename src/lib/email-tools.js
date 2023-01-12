import sgMail from "@sendgrid/mail";

const key = process.env.SENDGRID_API_KEY;
console.log(key);
sgMail.setApiKey(key);

export const sendRegistrationEmail = async (data, recipientAddress) => {
  const msg = {
    to: recipientAddress,
    from: process.env.SENDER_EMAIL,
    subject: "Blog successfully created",
    text: "Your blog was successfully created",
    html: "<strong>Your blog was successfully created</strong>",
    attachments: [
      {
        content: data.toString("base64"),
        filename: "some-attachment.pdf",
        type: "application/pdf",
        disposition: "attachment",
        content_id: "mytext",
      },
    ],
  };
  console.log(msg);
  await sgMail.send(msg);
};
