const nodemailer = require("nodemailer");

module.exports.send = async (data) => {
  try {
    let testAccount = await nodemailer.createTestAccount();

    let transporter = nodemailer.createTransport({
      host: "localhost",
      port: 1025,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user, // generated ethereal user
        pass: testAccount.pass, // generated ethereal password
      },
    });

    await transporter.sendMail({
      from: '"Fred Foo 👻" <app@mailhog.local>', // sender address
      to: data.email, // list of receivers
      subject: data.subject, // Subject line
      text: data.content, // plain text body
      html: data.content, // html body
    });
    return true;
  } catch (err) {
    return false;
  }
};
