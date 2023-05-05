const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SGMAIL_API_KEY);
const sendWelcomeMail = (email, name) => {
  const str = name.charAt(0).toUpperCase() + name.slice(1);
  sgMail
    .send({
      to: email, // Change to your recipient
      from: "yassineghanmi841@gmail.com", // Change to your verified sender
      subject: "Sending with SendGrid is Fun",
      text: `Welcome To The App, ${str}`,
    })
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      console.error(error);
    });
};
module.exports = {
  sendWelcomeMail,
};
