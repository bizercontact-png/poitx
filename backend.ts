import express, { Request, Response } from 'express';
import cors from 'cors';

// Types
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

// In-memory database (Vercel serverless friendly)
const rooms = new Map<string, Room>();

function generateCode(): string {
  let code: string;
  do { 
    code = Math.floor(100000 + Math.random() * 900000).toString(); 
  } while (rooms.has(code));
  return code;
}

const app = express();

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use((req, res, next) => {
  console.log(`📡 ${req.method} ${req.url}`);
  next();
});

// Create Room
app.post('/api/rooms', (req: Request, res: Response) => {
  const { hostName } = req.body;
  if (!hostName?.trim()) {
    return res.status(400).json({ error: 'نام الزامی است' });
  }
  
  const code = generateCode();
  rooms.set(code, {
    code, 
    host: hostName.trim(), 
    guests: [],
    messages: [{ 
      id: Date.now().toString(), 
      author: 'System', 
      role: 'host', 
      text: `🚀 ${hostName} اتاق را ایجاد کرد`, 
      timestamp: new Date().toISOString() 
    }],
    isLive: false, 
    createdAt: new Date()
  });
  
  console.log(`✅ Room created: ${code}`);
  res.status(201).json({ roomCode: code, host: hostName });
});

// Join Room
app.post('/api/rooms/:code/join', (req: Request, res: Response) => {
  const { code } = req.params;
  const { guestName } = req.body;
  
  if (!guestName?.trim()) {
    return res.status(400).json({ error: 'نام الزامی است' });
  }
  
  const room = rooms.get(code);
  if (!room) {
    return res.status(404).json({ error: 'اتاق یافت نشد' });
  }
  
  room.guests.push(guestName);
  room.messages.push({ 
    id: Date.now().toString(), 
    author: 'System', 
    role: 'host', 
    text: `👋 ${guestName} پیوست`, 
    timestamp: new Date().toISOString() 
  });
  
  res.json({ host: room.host });
});

// Get Messages
app.get('/api/rooms/:code/messages', (req: Request, res: Response) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'اتاق یافت نشد' });
  }
  res.json(room.messages);
});

// Send Message
app.post('/api/rooms/:code/messages', (req: Request, res: Response) => {
  const room = rooms.get(req.params.code);
  if (!room) {
    return res.status(404).json({ error: 'اتاق یافت نشد' });
  }
  
  const { author, role, text } = req.body;
  if (!text?.trim()) {
    return res.status(400).json({ error: 'متن خالی است' });
  }
  
  const msg: Message = { 
    id: Date.now().toString(), 
    author, 
    role, 
    text: text.trim(), 
    timestamp: new Date().toISOString() 
  };
  room.messages.push(msg);
  res.status(201).json(msg);
});

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'OK', 
    rooms: rooms.size, 
    uptime: process.uptime(),
    timestamp: new Date().toISOString()
  });
});

// Export for Vercel serverless
export default app;

// Local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log('═'.repeat(50));
    console.log('🚀 CyberStream Backend');
    console.log(`📍 http://localhost:${PORT}`);
    console.log('═'.repeat(50));
  });
}
