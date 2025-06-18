addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get the origin of the request
  const origin = request.headers.get('Origin')
  const allowedOrigins = [
    'https://hayesandsons.co.uk',
    'https://www.hayesandsons.co.uk',
    'https://hayesandsons.pages.dev'
  ]
  
  const corsOrigin = allowedOrigins.includes(origin) ? origin : 'https://hayesandsons.co.uk'

  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Credentials': 'true',
      },
    })
  }

  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 })
  }

  try {
    const formData = await request.formData()
    
    // Extract form fields
    const firstName = formData.get('firstName')
    const lastName = formData.get('lastName')
    const email = formData.get('email')
    const phone = formData.get('phone')
    const company = formData.get('company')
    const projectType = formData.get('projectType')
    const plotCount = formData.get('plotCount')
    const location = formData.get('location')
    const timeline = formData.get('timeline')
    const message = formData.get('message')
    const consent = formData.get('consent')

    // Validate required fields
    if (!firstName || !lastName || !email || !phone || !projectType || !location || !message || !consent) {
      return new Response('Missing required fields', { status: 400 })
    }

    // Create email content
    const emailSubject = `New Contact Form Submission from ${firstName} ${lastName}`
    const emailBody = `
New contact form submission from Hayes & Sons Construction website:

Contact Information:
- Name: ${firstName} ${lastName}
- Email: ${email}
- Phone: ${phone}
- Company: ${company || 'Not provided'}

Project Details:
- Project Type: ${projectType}
- Number of Plots: ${plotCount || 'Not specified'}
- Location: ${location}
- Timeline: ${timeline || 'Not specified'}

Message:
${message}

Consent: User has consented to being contacted and data storage.

Submitted at: ${new Date().toISOString()}
    `.trim()

    // Send email using Cloudflare's send API
    const emailResponse = await fetch('https://api.mailchannels.net/tx/v1/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: 'darrangoulding@gmail.com', name: 'Darran Goulding' }],
            dkim_domain: 'hayesandsons.co.uk',
            dkim_selector: 'mailchannels',
            dkim_private_key: DKIM_PRIVATE_KEY, // This will be set as an environment variable
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

    if (!emailResponse.ok) {
      console.error('Failed to send email:', await emailResponse.text())
      return new Response('Failed to send email', { status: 500 })
    }

    // Return success response with CORS headers
    return new Response(JSON.stringify({ success: true, message: 'Form submitted successfully' }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': corsOrigin,
        'Access-Control-Allow-Credentials': 'true',
      },
    })

  } catch (error) {
    console.error('Error processing form:', error)
    return new Response('Internal server error', { status: 500 })
  }
} 