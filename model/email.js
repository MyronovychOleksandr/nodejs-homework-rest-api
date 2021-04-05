const sgMail = require("@sendgrid/mail");
const Mailgen = require("mailgen");
require("dotenv").config;

class EmailServise {
  #sender = sgMail;
  #GenerateTemplate = Mailgen;
  #createTemplate(verifyToken, name) {
    const mailGenerator = new this.#GenerateTemplate({
      theme: "default",
      product: {
        name: "NodeGoIt",
        link: process.env.MAILERGEN_LINK,
      },
    });
    const template = {
      body: {
        name,
        intro: "Welcome to NodeGoIt! We're very excited to have you on board.",
        action: {
          instructions: "To get started with NodeGoIt, please click here:",
          button: {
            color: "#22BC66",
            text: "Confirm your account",
            link: `${process.env.MAILERGEN_LINK}api/users/verify/${verifyToken}`,
          },
        },
        outro:
          "Need help, or have questions? Just reply to this email, we'd love to help.",
      },
    };
    const emailBody = mailGenerator.generate(template);
    return emailBody;
  }
  async sendEmail(verifyToken, email, name) {
    const emailBody = this.#createTemplate(verifyToken, name);
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: email,
      from: process.env.MAILERGEN_SENDER,
      subject: "Sending with SendGrid is Fun",
      html: emailBody,
    };

    await this.#sender.send(msg);
  }
}

module.exports = EmailServise;
