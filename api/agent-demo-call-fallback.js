export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();
  const { phone } = req.body;
  if (!phone) return res.status(400).json({ error: 'Missing phone' });
  try {
    await fetch('https://app.fonio.ai/api/landing-page-agent/call?ac=5K3KRA816N', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ toNumber: phone, locale: 'en-US' }),
    });
    return res.status(200).json({ success: true });
  } catch {
    return res.status(500).json({ error: 'Call failed' });
  }
}
