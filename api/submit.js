export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, business, type, phone, town } = req.body;

  if (!name || !phone) {
    return res.status(400).json({ error: 'Name and phone are required' });
  }

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
        phone,
        companyName: business || '',
        tags: ['fonio-lead', `town-${(town || 'unknown').toLowerCase().replace(/\s+/g, '-')}`],
        customFields: [
          { key: 'business_type', field_value: type || '' },
          { key: 'lead_source', field_value: `Fonio Local Site - ${town || ''}` },
        ],
      }),
    });

    if (!ghlRes.ok) {
      const err = await ghlRes.text();
      console.error('GHL error:', err);
      return res.status(500).json({ error: 'Failed to create contact' });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('Handler error:', err);
    return res.status(500).json({ error: 'Server error' });
  }
}
