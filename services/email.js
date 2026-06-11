const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendContactEmail = async ({ listing, buyerName, buyerEmail, message }) => {
  const msg = {
    to: listing.seller.email,
    from: process.env.EMAIL_FROM,
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
  };

  await sgMail.send(msg);
};

module.exports = { sendContactEmail };
