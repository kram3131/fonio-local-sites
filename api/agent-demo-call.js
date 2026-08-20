export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { agentId, phone } = req.body;
  if (!agentId || !phone) return res.status(400).json({ error: 'Missing agentId or phone' });

  try {
    const r = await fetch(`https://app.fonio.ai/api/agent-demo/${agentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      // name = the agent's name (not the lead's). Lauren = American female voice.
      body: JSON.stringify({ name: 'Lauren', toNumber: phone, voiceId: 'DODLEQrClDo8wCz460ld' }),
    });
    return res.status(r.ok ? 200 : 500).json({ success: r.ok });
  } catch (err) {
    return res.status(500).json({ error: 'Call trigger failed' });
  }
}
