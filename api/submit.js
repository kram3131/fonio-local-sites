const FONIO_BASE = 'https://app.fonio.ai/api';
const FONIO_AC = '5K3KRA816N';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, business, type, phone, website, town } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

  const digits = phone.replace(/\D/g, '');
  const e164 = digits.startsWith('1') ? `+${digits}` : `+1${digits}`;

  // Save to GHL (non-blocking on duplicate)
  try {
    const ghlRes = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.GHL_API_KEY}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        locationId: process.env.GHL_LOCATION_ID,
        firstName: name.split(' ')[0],
        lastName: name.split(' ').slice(1).join(' ') || '',
        phone: e164,
        companyName: business || '',
        tags: ['fonio-lead', `town-${(town || 'unknown').toLowerCase().replace(/\s+/g, '-')}`],
        customFields: [
          { key: 'business_type', field_value: type || '' },
          { key: 'lead_source', field_value: `Fonio Local Site - ${town || ''}` },
        ],
      }),
    });
    if (!ghlRes.ok) {
      const errText = await ghlRes.text();
      console.error('GHL error:', errText);
      if (!errText.includes('duplicated')) {
        return res.status(500).json({ error: 'Failed to create contact' });
      }
    }
  } catch (err) {
    console.error('GHL handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }

  // Create fonio demo agent from their website URL
  if (website) {
    try {
      const createRes = await fetch(`${FONIO_BASE}/agent-demo`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: website, language: 'en', affiliateCode: FONIO_AC }),
      });
      if (createRes.ok) {
        const { id } = await createRes.json();
        return res.status(200).json({ success: true, agentId: id, phone: e164, name, business });
      }
      console.error('Fonio agent-demo create failed:', await createRes.text());
    } catch (err) {
      console.error('Fonio create error:', err);
    }
  }

  // Fallback: generic landing page call if no URL or agent creation failed
  try {
    await fetch(`${FONIO_BASE}/landing-page-agent/call?ac=${FONIO_AC}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toNumber: e164, locale: 'en-US' }),
    });
  } catch (err) {
    console.error('Fonio fallback call error:', err);
  }

  return res.status(200).json({ success: true });
}
