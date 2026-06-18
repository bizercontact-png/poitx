// CyberStream Backend - Vercel Serverless
const rooms = new Map();

function generateCode() {
  let code;
  do { code = Math.floor(100000 + Math.random() * 900000).toString(); } while (rooms.has(code));
  return code;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();

  const url = new URL(req.url, 'http://localhost');
  const path = url.pathname;

  try {
    // Create Room
    if (path === '/api/rooms' && req.method === 'POST') {
      const { hostName } = req.body;
      if (!hostName?.trim()) return res.status(400).json({ error: 'نام الزامی است' });
      const code = generateCode();
      rooms.set(code, {
        code, host: hostName, guests: [], isLive: false,
        messages: [{ id: Date.now().toString(), author: 'System', role: 'host', text: `🚀 ${hostName} اتاق را ایجاد کرد`, timestamp: new Date().toISOString() }]
      });
      return res.status(201).json({ roomCode: code, host: hostName });
    }

    // Join Room
    const joinMatch = path.match(/^\/api\/rooms\/(\d{6})\/join$/);
    if (joinMatch && req.method === 'POST') {
      const code = joinMatch[1];
      const { guestName } = req.body;
      if (!guestName?.trim()) return res.status(400).json({ error: 'نام الزامی است' });
      const room = rooms.get(code);
      if (!room) return res.status(404).json({ error: 'اتاق یافت نشد' });
      room.guests.push(guestName);
      room.messages.push({ id: Date.now().toString(), author: 'System', role: 'host', text: `👋 ${guestName} پیوست`, timestamp: new Date().toISOString() });
      return res.json({ host: { name: room.host } });
    }

    // Messages
    const msgMatch = path.match(/^\/api\/rooms\/(\d{6})\/messages$/);
    if (msgMatch) {
      const code = msgMatch[1];
      const room = rooms.get(code);
      if (!room) return res.status(404).json({ error: 'اتاق یافت نشد' });
      
      if (req.method === 'GET') return res.json({ messages: room.messages });
      
      if (req.method === 'POST') {
        const { author, content, type } = req.body;
        if (!content?.trim()) return res.status(400).json({ error: 'متن خالی است' });
        const msg = { id: Date.now().toString(), author, content, type: type || 'text', timestamp: new Date().toISOString() };
        room.messages.push(msg);
        return res.status(201).json(msg);
      }
    }

    return res.status(404).json({ error: 'Not found' });
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
};
