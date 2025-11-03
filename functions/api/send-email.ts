export const onRequestPost = async (ctx: {
  env: {
    SENDGRID_API_KEY: string;
    SENDGRID_FROM: string;
    ALLOWED_ORIGIN?: string;
    FORM_NONCES: KVNamespace;
    RATE_LIMIT: KVNamespace;
  };
  request: Request;
}) => {
  try {
    const origin = ctx.request.headers.get('origin') || '';
    if (ctx.env.ALLOWED_ORIGIN && origin !== ctx.env.ALLOWED_ORIGIN) {
      return new Response(JSON.stringify({ error: 'Bad origin' }), { status: 403 });
    }

    const ip = ctx.request.headers.get('cf-connecting-ip') || ctx.request.headers.get('x-forwarded-for') || 'unknown';
    const now = Math.floor(Date.now() / 1000);

    const body = await ctx.request.json().catch(() => ({}));
    const { name, email, phone, message, website, token } = body as any;

    // Email recipient - hardcoded na backendu pro bezpečnost
    const to = 'recepce@pensionrut.cz';

    // 1) Honeypot - musí být prázdné (skryté pole "website")
    if (website) return new Response(JSON.stringify({ error: 'Bot detected (honeypot)' }), { status: 400 });

    // 2) Token present?
    if (!token) return new Response(JSON.stringify({ error: 'Missing token' }), { status: 400 });

    const tokenVal = await ctx.env.FORM_NONCES.get(token);
    if (!tokenVal) return new Response(JSON.stringify({ error: 'Invalid or expired token' }), { status: 400 });

    // optionally delete token to prevent replay
    await ctx.env.FORM_NONCES.delete(token);

    // 3) Simple time-check (token issued recently)
    // If you created timestamp inside token data, check it here. (Our nonce TTL handles expiry.)

    // 4) Rate limiting per IP (sliding window simple)
    const windowSeconds = 60; // window
    const maxPerWindow = 5;
    const rlKey = `rl:${ip}:${Math.floor(now / windowSeconds)}`; // bucketed per minute

    const cur = await ctx.env.RATE_LIMIT.get(rlKey);
    const curCount = cur ? parseInt(cur) : 0;
    if (curCount >= maxPerWindow) {
      return new Response(JSON.stringify({ error: 'Rate limit exceeded' }), { status: 429 });
    }
    await ctx.env.RATE_LIMIT.put(rlKey, String(curCount + 1), { expirationTtl: windowSeconds + 2 });

    // 5) Validace vstupů
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return new Response(JSON.stringify({ error: 'Invalid name' }), { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email' }), { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 2000) {
      return new Response(JSON.stringify({ error: 'Invalid message' }), { status: 400 });
    }

    if (phone && (typeof phone !== 'string' || phone.length > 20 || !/^[0-9\s\+\-\(\)]+$/.test(phone))) {
      return new Response(JSON.stringify({ error: 'Invalid phone' }), { status: 400 });
    }

    // Sanitizace vstupů
    const sanitizedName = name.trim();
    const sanitizedEmail = email.trim().toLowerCase();
    const sanitizedPhone = phone ? phone.trim() : '';
    const sanitizedMessage = message.trim();

    // 6) Vytvořit email obsah
    function escapeHtml(text: string): string {
      const map: Record<string, string> = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;',
      };
      return text.replace(/[&<>"']/g, (m) => map[m]);
    }

    const subject = `Kontakt z webu Pension RUT - ${escapeHtml(sanitizedName)}`;

    const html = `
      <h2>Nový kontakt z formuláře</h2>
      <p><strong>Jméno:</strong> ${escapeHtml(sanitizedName)}</p>
      <p><strong>E-mail:</strong> ${escapeHtml(sanitizedEmail)}</p>
      ${sanitizedPhone ? `<p><strong>Telefon:</strong> ${escapeHtml(sanitizedPhone)}</p>` : ''}
      <p><strong>Zpráva:</strong></p>
      <p>${escapeHtml(sanitizedMessage).replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="color: #666; font-size: 0.9em;">IP: ${ip}</p>
    `;

    const text = `
Nový kontakt z formuláře

Jméno: ${sanitizedName}
E-mail: ${sanitizedEmail}
${sanitizedPhone ? `Telefon: ${sanitizedPhone}\n` : ''}
Zpráva:
${sanitizedMessage}

---
IP: ${ip}
    `.trim();

    // 7) Poslat do SendGrid
    // SendGrid vyžaduje: text/plain první, pak text/html
    const payload: any = {
      personalizations: [{ to: [{ email: to }] }],
      from: { email: ctx.env.SENDGRID_FROM },
      subject,
      content: [
        { type: 'text/plain', value: text },
        { type: 'text/html', value: html }
      ],
    };

    const resp = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${ctx.env.SENDGRID_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!resp.ok) {
      const details = await resp.text();
      return new Response(JSON.stringify({ error: 'SendGrid error', details }), { status: resp.status });
    }

    return new Response(JSON.stringify({ ok: true }), {
      status: 202,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (e: any) {
    console.error('Send email error:', e);
    return new Response(JSON.stringify({ error: e?.message ?? 'Server error' }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  }
};
