const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_EMAIL,
    pass: process.env.GMAIL_PASSWORD,
  },
});

const sendContactEmail = async ({ listing, buyerName, buyerEmail, message }) => {
  await transporter.sendMail({
    from: `HW Marketplace <${process.env.GMAIL_EMAIL}>`,
    to: listing.seller.email,
    replyTo: buyerEmail,
    subject: `Someone is interested in your listing: ${listing.title}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px;">
        <h2>Listing Inquiry</h2>
        <p><strong>${buyerName}</strong> is interested in your listing:</p>
        <blockquote style="background:#f5f5f5;padding:12px;border-left:4px solid #ccc;">
          <strong>${listing.title}</strong><br/>
          Listed at: $${listing.price}
        </blockquote>
        <h3>Their message:</h3>
        <p>${message.replace(/\n/g, '<br/>')}</p>
        <hr/>
        <p>Reply directly to this email to respond to ${buyerName} at <a href="mailto:${buyerEmail}">${buyerEmail}</a>.</p>
      </div>
    `,
  });
};

module.exports = { sendContactEmail };
