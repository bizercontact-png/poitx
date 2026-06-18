import express, { Request, Response } from 'express';
import cors from 'cors';

interface Message {
  id: string;
  author: string;
  role: 'host' | 'guest';
  text: string;
  timestamp: string;
}

interface Room {
  code: string;
  host: string;
  guests: string[];
  messages: Message[];
  isLive: boolean;
  createdAt: Date;
}

const rooms = new Map<string, Room>();

function generateCode(): string {
  let code: string;
  do { code = Math.floor(100000 + Math.random() * 900000).toString(); } while (rooms.has(code));
  return code;
}

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

app.post('/api/rooms', (req: Request, res: Response) => {
  const { hostName } = req.body;
  if (!hostName?.trim()) return res.status(400).json({ error: 'نام الزامی است' });
  
  const code = generateCode();
  rooms.set(code, {
    code, host: hostName.trim(), guests: [],
    messages: [{ id: Date.now().toString(), author: 'System', role: 'host', text: `🚀 ${hostName} اتاق را ایجاد کرد`, timestamp: new Date().toISOString() }],
    isLive: false, createdAt: new Date()
  });
  
  console.log(`✅ Room: ${code}`);
  res.status(201).json({ roomCode: code, host: hostName });
});

app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
  const { code } = req.params;
  const { guestName } = req.body;
  if (!guestName?.trim()) return res.status(400).json({ error: 'نام الزامی است' });
  
  const room = rooms.get(code);
  if (!room) return res.status(404).json({ error: 'اتاق یافت نشد' });
  
  room.guests.push(guestName);
  room.messages.push({ id: Date.now().toString(), author: 'System', role: 'host', text: `👋 ${guestName} پیوست`, timestamp: new Date().toISOString() });
  
  res.json({ host: room.host });
});

app.get('/api/rooms/:code/messages', (req: Request, res: Response) => {
  const room = rooms.get(req.params.code);
  if (!room) return res.status(404).json({ error: 'اتاق یافت نشد' });
  res.json(room.messages);
});

app.post('/api/rooms/:code/messages', (req: Request, res: Response) => {
  const room = rooms.get(req.params.code);
  if (!room) return res.status(404).json({ error: 'اتاق یافت نشد' });
  
  const { author, role, text } = req.body;
  if (!text?.trim()) return res.status(400).json({ error: 'متن خالی است' });
  
  const msg: Message = { id: Date.now().toString(), author, role, text: text.trim(), timestamp: new Date().toISOString() };
  room.messages.push(msg);
  res.status(201).json(msg);
});

app.get('/api/health', (req: Request, res: Response) => {
  res.json({ status: 'OK', rooms: rooms.size, uptime: process.uptime() });
});

app.listen(PORT, () => {
  console.log('═'.repeat(50));
  console.log(`🚀 CyberStream Backend`);
  console.log(`📍 http://localhost:${PORT}`);
  console.log(`🔗 API: http://localhost:${PORT}/api`);
  console.log('═'.repeat(50));
});
