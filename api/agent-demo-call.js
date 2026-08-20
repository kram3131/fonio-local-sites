export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { agentId, phone, name } = req.body;
  if (!agentId || !phone) return res.status(400).json({ error: 'Missing agentId or phone' });

  try {
    const r = await fetch(`https://app.fonio.ai/api/agent-demo/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: name || 'Demo', toNumber: phone, voiceId: '1' }),
    });
    return res.status(r.ok ? 200 : 500).json({ success: r.ok });
  } catch (err) {
    return res.status(500).json({ error: 'Call trigger failed' });
  }
}
