# Cloudflare Worker Setup for Contact Form

This guide explains how to set up the Cloudflare Worker to handle contact form submissions and send emails to darrangoulding@gmail.com.

## Prerequisites

1. A Cloudflare account with your domain configured
2. Node.js installed on your machine
3. Wrangler CLI installed (`npm install -g wrangler`)

## Setup Instructions

### 1. Install Wrangler CLI

```bash
npm install -g wrangler
```

### 2. Authenticate with Cloudflare

```bash
wrangler login
```

### 3. Configure DKIM (Optional but Recommended)

For better email deliverability, set up DKIM authentication:

1. Generate a DKIM key pair
2. Add the public key as a TXT record in your DNS:
   - Name: `mailchannels._domainkey.hayesandsons.co.uk`
   - Value: `v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY_HERE`

### 4. Deploy the Worker

```bash
wrangler publish --env production
```

### 5. Set Environment Variables

In the Cloudflare dashboard:

1. Go to Workers & Pages
2. Select your worker
3. Go to Settings > Environment Variables
4. Add the following variables:
   - `DKIM_PRIVATE_KEY`: Your DKIM private key (if using DKIM)

### 6. Configure Routes and Domain Handling

The setup handles both your Cloudflare Pages domain (hayesandsons.pages.dev) and your main domain (hayesandsons.co.uk):

**For the main domain (hayesandsons.co.uk):**
- The worker responds to `/api/contact` 
- Routes are configured in `wrangler.toml`

**For Cloudflare Pages (hayesandsons.pages.dev):**
- After deploying the worker, you'll get a worker URL like: `https://hayes-sons-contact-form.YOUR_SUBDOMAIN.workers.dev/`
- Update the JavaScript in `contact.astro` to replace `YOUR_SUBDOMAIN` with your actual worker subdomain
- The form will automatically detect which domain it's on and use the appropriate endpoint

## Alternative: Simplified Version Without DKIM

If you don't want to set up DKIM, you can use a simplified version of the worker. Replace the email sending section in `worker.js` with:

```javascript
// Send email using Cloudflare's send API (without DKIM)
const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    personalizations: [
      {
        to: [{ email: 'darrangoulding@gmail.com', name: 'Darran Goulding' }],
      },
    ],
    from: {
      email: 'noreply@hayesandsons.co.uk',
      name: 'Hayes & Sons Construction Website',
    },
    reply_to: {
      email: email,
      name: `${firstName} ${lastName}`,
    },
    subject: emailSubject,
    content: [
      {
        type: 'text/plain',
        value: emailBody,
      },
    ],
  }),
})
```

## DNS Configuration

Make sure your domain has the following DNS records:

1. MX record pointing to Cloudflare (if using Cloudflare Email Routing)
2. SPF record: `v=spf1 include:_spf.mx.cloudflare.net ~all`
3. DKIM record (if using DKIM): `v=DKIM1; k=rsa; p=YOUR_PUBLIC_KEY`

## Post-Deployment Steps

1. **Get your Worker URL**: After running `wrangler publish`, note the worker URL (e.g., `https://hayes-sons-contact-form.abc123.workers.dev/`)

2. **Update the contact form**: In `src/pages/contact.astro`, replace `YOUR_SUBDOMAIN` with your actual worker subdomain

3. **Deploy your site**: Push the updated contact form to your Cloudflare Pages

## Testing

Test the contact form on both domains:

1. **On hayesandsons.pages.dev**: Form should use the direct worker URL
2. **On hayesandsons.co.uk** (if configured): Form should use `/api/contact`
3. Check that emails are delivered to darrangoulding@gmail.com
4. Verify error handling works properly

## Troubleshooting

- Check the Worker logs in the Cloudflare dashboard for any errors
- Verify that the route is correctly configured
- Ensure all required form fields are being submitted
- Check spam folders if emails aren't being received

## Security Notes

- The worker validates all required fields before processing
- CORS is configured to allow requests from your domain
- Form data is not stored permanently, only used for email sending
- User consent is verified before processing the form 