// ===================================================================
// CYBERSTREAM PRO - Full Stack Single File for Vercel Deployment
// Version: 4.0.0 | Lines: 3000+ | Architecture: Serverless-Ready
// ===================================================================

// =========================== TYPES ===========================
interface User {
  id: string;
  name: string;
  role: 'host' | 'guest';
  avatar: string;
  joinedAt: string;
  isOnline: boolean;
  isMuted: boolean;
  isVideoOff: boolean;
}

interface Message {
  id: string;
  roomCode: string;
  author: User;
  content: string;
  type: 'text' | 'system' | 'reaction' | 'file' | 'stream_event';
  timestamp: string;
  editedAt?: string;
  deletedAt?: string;
  replyTo?: string;
}

interface Room {
  code: string;
  host: User;
  guests: User[];
  messages: Message[];
  isLive: boolean;
  startedAt?: string;
  endedAt?: string;
  maxParticipants: number;
  settings: RoomSettings;
  stats: RoomStats;
}

interface RoomSettings {
  allowGuests: boolean;
  requireApproval: boolean;
  maxDuration: number;
  recordingEnabled: boolean;
  chatEnabled: boolean;
  reactionsEnabled: boolean;
}

interface RoomStats {
  totalMessages: number;
  peakViewers: number;
  currentViewers: number;
  duration: number;
  reactions: Record<string, number>;
}

interface CreateRoomRequest {
  hostName: string;
  settings?: Partial<RoomSettings>;
}

interface JoinRoomRequest {
  guestName: string;
  password?: string;
}

interface SendMessageRequest {
  author: User;
  content: string;
  type: 'text' | 'reaction' | 'file';
  replyTo?: string;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
  requestId: string;
}

// =========================== CONSTANTS ===========================
const CONSTANTS = {
  ROOM_CODE_LENGTH: 6,
  MAX_PARTICIPANTS: 50,
  MAX_MESSAGE_LENGTH: 1000,
  MAX_ROOM_DURATION: 86400000, // 24 hours
  RATE_LIMIT_WINDOW: 60000, // 1 minute
  RATE_LIMIT_MAX_REQUESTS: 100,
  MESSAGE_PAGINATION: 50,
  CLEANUP_INTERVAL: 3600000, // 1 hour
  ROOM_EXPIRY: 86400000, // 24 hours
  CORS_ORIGINS: ['*'],
  ALLOWED_METHODS: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  ALLOWED_HEADERS: ['Content-Type', 'Authorization', 'X-Request-ID'],
  CACHE_TTL: 5000, // 5 seconds
  MAX_BODY_SIZE: '10mb',
  COMPRESSION_THRESHOLD: 1024,
  LOG_LEVEL: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  VERSION: '4.0.0',
  BUILD_ID: 'cyberstream-pro-' + Date.now().toString(36),
  REGION: process.env.VERCEL_REGION || 'unknown',
  ENVIRONMENT: process.env.NODE_ENV || 'development',
  IS_VERCEL: !!process.env.VERCEL,
  IS_PRODUCTION: process.env.NODE_ENV === 'production',
  DATABASE_URL: process.env.DATABASE_URL || ':memory:',
  REDIS_URL: process.env.REDIS_URL || '',
  JWT_SECRET: process.env.JWT_SECRET || 'cyberstream-secret-key',
  ENCRYPTION_KEY: process.env.ENCRYPTION_KEY || 'cyberstream-encryption',
};

// =========================== UTILITIES ===========================
class Utils {
  static generateId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 10);
    const entropy = Math.floor(Math.random() * 1000000).toString(36);
    return `${timestamp}-${random}-${entropy}`;
  }

  static generateRoomCode(): string {
    const chars = '0123456789';
    let code = '';
    for (let i = 0; i < CONSTANTS.ROOM_CODE_LENGTH; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    // Ensure first digit is not 0
    if (code.charAt(0) === '0') {
      code = '1' + code.substring(1);
    }
    return code;
  }

  static sanitizeText(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
      .replace(/`/g, '&#96;')
      .replace(/\$/g, '&#36;')
      .replace(/\\/g, '&#92;')
      .replace(/\//g, '&#47;')
      .trim();
  }

  static isValidRoomCode(code: string): boolean {
    return /^\d{6}$/.test(code) && parseInt(code) >= 100000;
  }

  static isValidName(name: string): boolean {
    return name.length >= 2 && name.length <= 50 && /^[\u0600-\u06FF\w\s\.\-]+$/.test(name);
  }

  static formatDate(date: Date | string): string {
    const d = new Date(date);
    return d.toISOString();
  }

  static formatDuration(ms: number): string {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  static getTimeAgo(date: Date | string): string {
    const now = Date.now();
    const then = new Date(date).getTime();
    const diff = now - then;
    
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (seconds < 60) return 'همین الان';
    if (minutes < 60) return `${minutes} دقیقه پیش`;
    if (hours < 24) return `${hours} ساعت پیش`;
    if (days < 7) return `${days} روز پیش`;
    
    return new Date(date).toLocaleDateString('fa-IR');
  }

  static generateAvatar(name: string): string {
    const colors = ['#00f0ff', '#b400ff', '#ff2d95', '#00ff88', '#ff6600', '#ffee00'];
    const charCode = name.charCodeAt(0);
    const colorIndex = charCode % colors.length;
    return colors[colorIndex];
  }

  static parseJSON<T>(str: string, fallback: T): T {
    try {
      return JSON.parse(str) as T;
    } catch {
      return fallback;
    }
  }

  static async hashString(str: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  static generateToken(userId: string): string {
    const payload = {
      userId,
      iat: Date.now(),
      exp: Date.now() + 86400000, // 24 hours
    };
    return btoa(JSON.stringify(payload));
  }

  static verifyToken(token: string): { userId: string } | null {
    try {
      const payload = JSON.parse(atob(token));
      if (payload.exp < Date.now()) return null;
      return { userId: payload.userId };
    } catch {
      return null;
    }
  }
}

// =========================== VALIDATOR ===========================
class Validator {
  static validateCreateRoom(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.hostName || typeof data.hostName !== 'string') {
      errors.push('نام میزبان الزامی است');
    } else if (!Utils.isValidName(data.hostName)) {
      errors.push('نام میزبان نامعتبر است (۲-۵۰ کاراکتر، حروف فارسی و انگلیسی)');
    }
    
    if (data.settings && typeof data.settings !== 'object') {
      errors.push('تنظیمات نامعتبر است');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateJoinRoom(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.guestName || typeof data.guestName !== 'string') {
      errors.push('نام مهمان الزامی است');
    } else if (!Utils.isValidName(data.guestName)) {
      errors.push('نام مهمان نامعتبر است');
    }
    
    return { valid: errors.length === 0, errors };
  }

  static validateMessage(data: any): { valid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data.content || typeof data.content !== 'string') {
      errors.push('متن پیام الزامی است');
    } else if (data.content.length > CONSTANTS.MAX_MESSAGE_LENGTH) {
      errors.push(`حداکثر طول پیام ${CONSTANTS.MAX_MESSAGE_LENGTH} کاراکتر است`);
    }
    
    if (!data.author || !data.author.id) {
      errors.push('اطلاعات فرستنده ناقص است');
    }
    
    return { valid: errors.length === 0, errors };
  }
}

// =========================== RATE LIMITER ===========================
class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();

  checkLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    const now = Date.now();
    const record = this.requests.get(ip);
    
    if (!record || now > record.resetTime) {
      this.requests.set(ip, {
        count: 1,
        resetTime: now + CONSTANTS.RATE_LIMIT_WINDOW,
      });
      return {
        allowed: true,
        remaining: CONSTANTS.RATE_LIMIT_MAX_REQUESTS - 1,
        resetTime: now + CONSTANTS.RATE_LIMIT_WINDOW,
      };
    }
    
    if (record.count >= CONSTANTS.RATE_LIMIT_MAX_REQUESTS) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: record.resetTime,
      };
    }
    
    record.count++;
    return {
      allowed: true,
      remaining: CONSTANTS.RATE_LIMIT_MAX_REQUESTS - record.count,
      resetTime: record.resetTime,
    };
  }

  cleanup(): void {
    const now = Date.now();
    for (const [ip, record] of this.requests.entries()) {
      if (now > record.resetTime) {
        this.requests.delete(ip);
      }
    }
  }
}

// =========================== IN-MEMORY DATABASE ===========================
class Database {
  private rooms: Map<string, Room> = new Map();
  private users: Map<string, User> = new Map();
  private messages: Map<string, Message[]> = new Map();
  private rateLimiter: RateLimiter;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.rateLimiter = new RateLimiter();
    this.startCleanup();
  }

  // Room Operations
  createRoom(hostName: string, settings?: Partial<RoomSettings>): Room {
    const code = this.generateUniqueCode();
    const host: User = {
      id: Utils.generateId(),
      name: Utils.sanitizeText(hostName),
      role: 'host',
      avatar: Utils.generateAvatar(hostName),
      joinedAt: Utils.formatDate(new Date()),
      isOnline: true,
      isMuted: false,
      isVideoOff: false,
    };

    const room: Room = {
      code,
      host,
      guests: [],
      messages: [],
      isLive: false,
      maxParticipants: CONSTANTS.MAX_PARTICIPANTS,
      settings: {
        allowGuests: true,
        requireApproval: false,
        maxDuration: CONSTANTS.MAX_ROOM_DURATION,
        recordingEnabled: false,
        chatEnabled: true,
        reactionsEnabled: true,
        ...settings,
      },
      stats: {
        totalMessages: 0,
        peakViewers: 1,
        currentViewers: 1,
        duration: 0,
        reactions: {},
      },
    };

    this.rooms.set(code, room);
    this.users.set(host.id, host);
    this.messages.set(code, []);

    this.addSystemMessage(code, `🚀 ${host.name} اتاق را ایجاد کرد`);
    
    console.log(`[Database] Room created: ${code} by ${hostName}`);
    return room;
  }

  joinRoom(code: string, guestName: string): Room | null {
    const room = this.rooms.get(code);
    if (!room) return null;
    
    if (room.guests.length >= room.maxParticipants) {
      throw new Error('ظرفیت اتاق تکمیل است');
    }

    if (!room.settings.allowGuests) {
      throw new Error('ورود مهمان به این اتاق مجاز نیست');
    }

    const guest: User = {
      id: Utils.generateId(),
      name: Utils.sanitizeText(guestName),
      role: 'guest',
      avatar: Utils.generateAvatar(guestName),
      joinedAt: Utils.formatDate(new Date()),
      isOnline: true,
      isMuted: false,
      isVideoOff: false,
    };

    room.guests.push(guest);
    this.users.set(guest.id, guest);
    room.stats.currentViewers = 1 + room.guests.length;
    
    if (room.stats.currentViewers > room.stats.peakViewers) {
      room.stats.peakViewers = room.stats.currentViewers;
    }

    this.addSystemMessage(code, `👋 ${guest.name} به اتاق پیوست`);
    
    console.log(`[Database] ${guestName} joined room ${code}`);
    return room;
  }

  leaveRoom(code: string, userId: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    if (room.host.id === userId) {
      // Host leaving - end room
      this.endRoom(code);
    } else {
      // Guest leaving
      const guest = room.guests.find(g => g.id === userId);
      if (guest) {
        room.guests = room.guests.filter(g => g.id !== userId);
        room.stats.currentViewers = 1 + room.guests.length;
        this.addSystemMessage(code, `👋 ${guest.name} از اتاق خارج شد`);
      }
    }
  }

  endRoom(code: string): void {
    const room = this.rooms.get(code);
    if (!room) return;

    room.isLive = false;
    room.endedAt = Utils.formatDate(new Date());
    
    if (room.startedAt) {
      room.stats.duration = Date.now() - new Date(room.startedAt).getTime();
    }

    this.addSystemMessage(code, '🔴 پخش زنده به پایان رسید');
    
    console.log(`[Database] Room ${code} ended`);
  }

  getRoom(code: string): Room | undefined {
    return this.rooms.get(code);
  }

  getRoomByHostId(hostId: string): Room | undefined {
    for (const room of this.rooms.values()) {
      if (room.host.id === hostId) return room;
    }
    return undefined;
  }

  getUserRooms(userId: string): Room[] {
    const rooms: Room[] = [];
    for (const room of this.rooms.values()) {
      if (room.host.id === userId || room.guests.some(g => g.id === userId)) {
        rooms.push(room);
      }
    }
    return rooms;
  }

  getAllActiveRooms(): Room[] {
    return Array.from(this.rooms.values()).filter(room => room.isLive);
  }

  // Message Operations
  addMessage(code: string, message: Omit<Message, 'id'>): Message {
    const msg: Message = {
      id: Utils.generateId(),
      ...message,
    };

    const roomMessages = this.messages.get(code) || [];
    roomMessages.push(msg);
    this.messages.set(code, roomMessages);

    const room = this.rooms.get(code);
    if (room) {
      room.messages.push(msg);
      room.stats.totalMessages++;
    }

    return msg;
  }

  addSystemMessage(code: string, text: string): Message {
    return this.addMessage(code, {
      roomCode: code,
      author: {
        id: 'system',
        name: 'System',
        role: 'host',
        avatar: '#666',
        joinedAt: Utils.formatDate(new Date()),
        isOnline: true,
        isMuted: false,
        isVideoOff: false,
      },
      content: text,
      type: 'system',
      timestamp: Utils.formatDate(new Date()),
    });
  }

  getMessages(code: string, limit: number = CONSTANTS.MESSAGE_PAGINATION, before?: string): Message[] {
    const messages = this.messages.get(code) || [];
    
    let filtered = messages;
    if (before) {
      const beforeIndex = messages.findIndex(m => m.id === before);
      if (beforeIndex !== -1) {
        filtered = messages.slice(0, beforeIndex);
      }
    }
    
    return filtered.slice(-limit);
  }

  deleteMessage(code: string, messageId: string): boolean {
    const messages = this.messages.get(code);
    if (!messages) return false;

    const index = messages.findIndex(m => m.id === messageId);
    if (index === -1) return false;

    messages[index].deletedAt = Utils.formatDate(new Date());
    return true;
  }

  editMessage(code: string, messageId: string, newContent: string): boolean {
    const messages = this.messages.get(code);
    if (!messages) return false;

    const message = messages.find(m => m.id === messageId);
    if (!message) return false;

    message.content = Utils.sanitizeText(newContent);
    message.editedAt = Utils.formatDate(new Date());
    return true;
  }

  // Reaction Operations
  addReaction(code: string, messageId: string, reaction: string): void {
    const room = this.rooms.get(code);
    if (!room || !room.settings.reactionsEnabled) return;

    if (!room.stats.reactions[reaction]) {
      room.stats.reactions[reaction] = 0;
    }
    room.stats.reactions[reaction]++;
  }

  // User Operations
  getUser(userId: string): User | undefined {
    return this.users.get(userId);
  }

  updateUserStatus(userId: string, updates: Partial<User>): void {
    const user = this.users.get(userId);
    if (user) {
      Object.assign(user, updates);
    }
  }

  // Stats & Analytics
  getGlobalStats(): any {
    let totalMessages = 0;
    let totalViewers = 0;
    let activeRooms = 0;

    for (const room of this.rooms.values()) {
      totalMessages += room.stats.totalMessages;
      totalViewers += room.stats.currentViewers;
      if (room.isLive) activeRooms++;
    }

    return {
      totalRooms: this.rooms.size,
      activeRooms,
      totalMessages,
      totalViewers,
      totalUsers: this.users.size,
      uptime: process.uptime(),
      timestamp: Utils.formatDate(new Date()),
    };
  }

  // Cleanup
  private generateUniqueCode(): string {
    let code: string;
    let attempts = 0;
    do {
      code = Utils.generateRoomCode();
      attempts++;
      if (attempts > 100) {
        throw new Error('Unable to generate unique room code');
      }
    } while (this.rooms.has(code));
    return code;
  }

  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredRooms();
      this.rateLimiter.cleanup();
    }, CONSTANTS.CLEANUP_INTERVAL);
  }

  private cleanupExpiredRooms(): void {
    const now = Date.now();
    for (const [code, room] of this.rooms.entries()) {
      if (!room.isLive && room.endedAt) {
        const endedAt = new Date(room.endedAt).getTime();
        if (now - endedAt > CONSTANTS.ROOM_EXPIRY) {
          this.rooms.delete(code);
          this.messages.delete(code);
          console.log(`[Database] Expired room ${code} cleaned up`);
        }
      }
      
      if (room.startedAt) {
        const duration = now - new Date(room.startedAt).getTime();
        if (duration > room.settings.maxDuration) {
          this.endRoom(code);
          console.log(`[Database] Room ${code} ended due to max duration`);
        }
      }
    }
  }

  checkRateLimit(ip: string): { allowed: boolean; remaining: number; resetTime: number } {
    return this.rateLimiter.checkLimit(ip);
  }

  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.rooms.clear();
    this.users.clear();
    this.messages.clear();
  }
}

// =========================== MIDDLEWARE ===========================
class Middleware {
  static cors(req: Request): Record<string, string> {
    return {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': CONSTANTS.ALLOWED_METHODS.join(', '),
      'Access-Control-Allow-Headers': CONSTANTS.ALLOWED_HEADERS.join(', '),
      'Access-Control-Max-Age': '86400',
      'Vary': 'Origin',
    };
  }

  static securityHeaders(): Record<string, string> {
    return {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'X-XSS-Protection': '1; mode=block',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'X-Powered-By': 'CyberStream Pro',
      'X-Version': CONSTANTS.VERSION,
      'X-Region': CONSTANTS.REGION,
    };
  }

  static async parseBody(req: Request): Promise<any> {
    const contentType = req.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      return req.json();
    }
    
    if (contentType.includes('application/x-www-form-urlencoded')) {
      const text = await req.text();
      const params = new URLSearchParams(text);
      const data: any = {};
      params.forEach((value, key) => {
        data[key] = value;
      });
      return data;
    }
    
    if (contentType.includes('multipart/form-data')) {
      return req.formData();
    }
    
    return req.text();
  }

  static getClientIP(req: Request): string {
    const forwarded = req.headers.get('x-forwarded-for');
    if (forwarded) {
      return forwarded.split(',')[0].trim();
    }
    
    const realIP = req.headers.get('x-real-ip');
    if (realIP) return realIP;
    
    return '127.0.0.1';
  }

  static createResponse(data: any, status: number = 200, extraHeaders: Record<string, string> = {}): Response {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json; charset=utf-8',
      ...Middleware.cors(new Request('http://localhost')),
      ...Middleware.securityHeaders(),
      ...extraHeaders,
    };

    const body = JSON.stringify({
      success: status >= 200 && status < 300,
      data: status >= 200 && status < 300 ? data : undefined,
      error: status >= 400 ? data : undefined,
      timestamp: Utils.formatDate(new Date()),
      requestId: Utils.generateId(),
      version: CONSTANTS.VERSION,
    });

    return new Response(body, {
      status,
      headers,
    });
  }

  static createErrorResponse(message: string, status: number = 400): Response {
    return Middleware.createResponse({ error: message }, status);
  }
}

// =========================== API HANDLERS ===========================
class APIHandlers {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  async handleCreateRoom(req: Request): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const validation = Validator.validateCreateRoom(body);
      
      if (!validation.valid) {
        return Middleware.createErrorResponse(validation.errors.join(', '), 400);
      }

      const room = this.db.createRoom(body.hostName, body.settings);
      
      return Middleware.createResponse({
        roomCode: room.code,
        host: room.host,
        settings: room.settings,
        createdAt: room.host.joinedAt,
      }, 201);
    } catch (error: any) {
      console.error('[API] Create room error:', error);
      return Middleware.createErrorResponse(error.message || 'خطا در ایجاد اتاق', 500);
    }
  }

  async handleJoinRoom(req: Request, code: string): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const validation = Validator.validateJoinRoom(body);
      
      if (!validation.valid) {
        return Middleware.createErrorResponse(validation.errors.join(', '), 400);
      }

      if (!Utils.isValidRoomCode(code)) {
        return Middleware.createErrorResponse('کد اتاق نامعتبر است', 400);
      }

      const room = this.db.joinRoom(code, body.guestName);
      
      if (!room) {
        return Middleware.createErrorResponse('اتاق یافت نشد', 404);
      }

      return Middleware.createResponse({
        roomCode: room.code,
        host: { name: room.host.name },
        guest: { name: body.guestName, id: room.guests[room.guests.length - 1].id },
        participantCount: room.stats.currentViewers,
        settings: room.settings,
      });
    } catch (error: any) {
      console.error('[API] Join room error:', error);
      return Middleware.createErrorResponse(error.message || 'خطا در ورود به اتاق', 500);
    }
  }

  async handleGetRoom(req: Request, code: string): Promise<Response> {
    try {
      if (!Utils.isValidRoomCode(code)) {
        return Middleware.createErrorResponse('کد اتاق نامعتبر است', 400);
      }

      const room = this.db.getRoom(code);
      
      if (!room) {
        return Middleware.createErrorResponse('اتاق یافت نشد', 404);
      }

      return Middleware.createResponse({
        code: room.code,
        host: { name: room.host.name, avatar: room.host.avatar },
        isLive: room.isLive,
        participantCount: room.stats.currentViewers,
        peakViewers: room.stats.peakViewers,
        totalMessages: room.stats.totalMessages,
        duration: room.stats.duration,
        startedAt: room.startedAt,
        settings: room.settings,
      });
    } catch (error: any) {
      console.error('[API] Get room error:', error);
      return Middleware.createErrorResponse('خطا در دریافت اطلاعات اتاق', 500);
    }
  }

  async handleLeaveRoom(req: Request, code: string): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const userId = body.userId;

      if (!userId) {
        return Middleware.createErrorResponse('شناسه کاربر الزامی است', 400);
      }

      this.db.leaveRoom(code, userId);
      
      return Middleware.createResponse({ message: 'با موفقیت خارج شدید' });
    } catch (error: any) {
      console.error('[API] Leave room error:', error);
      return Middleware.createErrorResponse('خطا در خروج از اتاق', 500);
    }
  }

  async handleEndRoom(req: Request, code: string): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const userId = body.userId;

      const room = this.db.getRoom(code);
      if (!room) {
        return Middleware.createErrorResponse('اتاق یافت نشد', 404);
      }

      if (room.host.id !== userId) {
        return Middleware.createErrorResponse('فقط میزبان می‌تواند اتاق را ببندد', 403);
      }

      this.db.endRoom(code);
      
      return Middleware.createResponse({ message: 'اتاق با موفقیت بسته شد' });
    } catch (error: any) {
      console.error('[API] End room error:', error);
      return Middleware.createErrorResponse('خطا در بستن اتاق', 500);
    }
  }

  async handleGetMessages(req: Request, code: string): Promise<Response> {
    try {
      const url = new URL(req.url);
      const before = url.searchParams.get('before') || undefined;
      const limit = parseInt(url.searchParams.get('limit') || String(CONSTANTS.MESSAGE_PAGINATION));

      if (!Utils.isValidRoomCode(code)) {
        return Middleware.createErrorResponse('کد اتاق نامعتبر است', 400);
      }

      const messages = this.db.getMessages(code, Math.min(limit, 100), before);
      
      return Middleware.createResponse({
        messages,
        hasMore: messages.length === limit,
        total: this.db.getRoom(code)?.stats.totalMessages || 0,
      });
    } catch (error: any) {
      console.error('[API] Get messages error:', error);
      return Middleware.createErrorResponse('خطا در دریافت پیام‌ها', 500);
    }
  }

  async handleSendMessage(req: Request, code: string): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const validation = Validator.validateMessage(body);
      
      if (!validation.valid) {
        return Middleware.createErrorResponse(validation.errors.join(', '), 400);
      }

      if (!Utils.isValidRoomCode(code)) {
        return Middleware.createErrorResponse('کد اتاق نامعتبر است', 400);
      }

      const room = this.db.getRoom(code);
      if (!room) {
        return Middleware.createErrorResponse('اتاق یافت نشد', 404);
      }

      if (!room.settings.chatEnabled) {
        return Middleware.createErrorResponse('چت در این اتاق غیرفعال است', 403);
      }

      const message = this.db.addMessage(code, {
        roomCode: code,
        author: body.author,
        content: Utils.sanitizeText(body.content),
        type: body.type || 'text',
        timestamp: Utils.formatDate(new Date()),
        replyTo: body.replyTo,
      });

      return Middleware.createResponse(message, 201);
    } catch (error: any) {
      console.error('[API] Send message error:', error);
      return Middleware.createErrorResponse('خطا در ارسال پیام', 500);
    }
  }

  async handleDeleteMessage(req: Request, code: string, messageId: string): Promise<Response> {
    try {
      const success = this.db.deleteMessage(code, messageId);
      
      if (!success) {
        return Middleware.createErrorResponse('پیام یافت نشد', 404);
      }

      return Middleware.createResponse({ message: 'پیام با موفقیت حذف شد' });
    } catch (error: any) {
      console.error('[API] Delete message error:', error);
      return Middleware.createErrorResponse('خطا در حذف پیام', 500);
    }
  }

  async handleEditMessage(req: Request, code: string, messageId: string): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const newContent = body.content;

      if (!newContent || typeof newContent !== 'string') {
        return Middleware.createErrorResponse('متن جدید الزامی است', 400);
      }

      const success = this.db.editMessage(code, messageId, newContent);
      
      if (!success) {
        return Middleware.createErrorResponse('پیام یافت نشد', 404);
      }

      return Middleware.createResponse({ message: 'پیام با موفقیت ویرایش شد' });
    } catch (error: any) {
      console.error('[API] Edit message error:', error);
      return Middleware.createErrorResponse('خطا در ویرایش پیام', 500);
    }
  }

  async handleAddReaction(req: Request, code: string, messageId: string): Promise<Response> {
    try {
      const body = await Middleware.parseBody(req);
      const reaction = body.reaction;

      if (!reaction) {
        return Middleware.createErrorResponse('نوع واکنش الزامی است', 400);
      }

      this.db.addReaction(code, messageId, reaction);
      
      return Middleware.createResponse({ message: 'واکنش با موفقیت ثبت شد' });
    } catch (error: any) {
      console.error('[API] Add reaction error:', error);
      return Middleware.createErrorResponse('خطا در ثبت واکنش', 500);
    }
  }

  async handleGetStats(req: Request): Promise<Response> {
    try {
      const stats = this.db.getGlobalStats();
      return Middleware.createResponse(stats);
    } catch (error: any) {
      console.error('[API] Get stats error:', error);
      return Middleware.createErrorResponse('خطا در دریافت آمار', 500);
    }
  }

  async handleHealthCheck(req: Request): Promise<Response> {
    return Middleware.createResponse({
      status: 'healthy',
      version: CONSTANTS.VERSION,
      uptime: process.uptime(),
      timestamp: Utils.formatDate(new Date()),
      environment: CONSTANTS.ENVIRONMENT,
      region: CONSTANTS.REGION,
    });
  }
}

// =========================== ROUTER ===========================
class Router {
  private db: Database;
  private handlers: APIHandlers;

  constructor() {
    this.db = new Database();
    this.handlers = new APIHandlers(this.db);
  }

  async route(req: Request): Promise<Response> {
    const url = new URL(req.url);
    const path = url.pathname;
    const method = req.method.toUpperCase();

    // Rate limiting
    const clientIP = Middleware.getClientIP(req);
    const rateLimit = this.db.checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return Middleware.createErrorResponse(
        'تعداد درخواست‌ها بیش از حد مجاز است. لطفاً کمی صبر کنید',
        429
      );
    }

    // CORS preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: Middleware.cors(req),
      });
    }

    // Add rate limit headers to all responses
    const rateLimitHeaders = {
      'X-RateLimit-Limit': String(CONSTANTS.RATE_LIMIT_MAX_REQUESTS),
      'X-RateLimit-Remaining': String(rateLimit.remaining),
      'X-RateLimit-Reset': String(rateLimit.resetTime),
    };

    try {
      // Health Check
      if (path === '/api/health' || path === '/api/ping') {
        return this.handlers.handleHealthCheck(req);
      }

      // Stats
      if (path === '/api/stats' && method === 'GET') {
        return this.handlers.handleGetStats(req);
      }

      // Create Room
      if (path === '/api/rooms' && method === 'POST') {
        return this.handlers.handleCreateRoom(req);
      }

      // Join Room
      const joinMatch = path.match(/^\/api\/rooms\/(\d{6})\/join$/);
      if (joinMatch && method === 'POST') {
        return this.handlers.handleJoinRoom(req, joinMatch[1]);
      }

      // Leave Room
      const leaveMatch = path.match(/^\/api\/rooms\/(\d{6})\/leave$/);
      if (leaveMatch && method === 'POST') {
        return this.handlers.handleLeaveRoom(req, leaveMatch[1]);
      }

      // End Room
      const endMatch = path.match(/^\/api\/rooms\/(\d{6})\/end$/);
      if (endMatch && method === 'POST') {
        return this.handlers.handleEndRoom(req, endMatch[1]);
      }

      // Get Room
      const getRoomMatch = path.match(/^\/api\/rooms\/(\d{6})$/);
      if (getRoomMatch && method === 'GET') {
        return this.handlers.handleGetRoom(req, getRoomMatch[1]);
      }

      // Get Messages
      const getMsgsMatch = path.match(/^\/api\/rooms\/(\d{6})\/messages$/);
      if (getMsgsMatch && method === 'GET') {
        return this.handlers.handleGetMessages(req, getMsgsMatch[1]);
      }

      // Send Message
      if (getMsgsMatch && method === 'POST') {
        return this.handlers.handleSendMessage(req, getMsgsMatch[1]);
      }

      // Delete Message
      const deleteMsgMatch = path.match(/^\/api\/rooms\/(\d{6})\/messages\/([a-zA-Z0-9\-]+)$/);
      if (deleteMsgMatch && method === 'DELETE') {
        return this.handlers.handleDeleteMessage(req, deleteMsgMatch[1], deleteMsgMatch[2]);
      }

      // Edit Message
      if (deleteMsgMatch && method === 'PUT') {
        return this.handlers.handleEditMessage(req, deleteMsgMatch[1], deleteMsgMatch[2]);
      }

      // Add Reaction
      const reactMatch = path.match(/^\/api\/rooms\/(\d{6})\/messages\/([a-zA-Z0-9\-]+)\/reactions$/);
      if (reactMatch && method === 'POST') {
        return this.handlers.handleAddReaction(req, reactMatch[1], reactMatch[2]);
      }

      // Serve Frontend for all other routes
      return this.serveFrontend(req);
    } catch (error: any) {
      console.error('[Router] Unhandled error:', error);
      return Middleware.createErrorResponse('خطای داخلی سرور', 500);
    }
  }

  private serveFrontend(req: Request): Response {
    const html = this.generateFrontendHTML();
    return new Response(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=0, must-revalidate',
        ...Middleware.securityHeaders(),
      },
    });
  }

  private generateFrontendHTML(): string {
    return `<!DOCTYPE html>
<html lang="fa" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="CyberStream Pro - Live Streaming Platform">
    <meta name="theme-color" content="#0a0a1a">
    <title>CyberStream Pro</title>
    <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
    <style>
:root{--neon-blue:#00f0ff;--neon-purple:#b400ff;--neon-pink:#ff2d95;--neon-red:#ff1744;--neon-green:#00ff88;--neon-yellow:#ffee00;--bg-void:#030308;--bg-deep:#0a0a1f;--bg-surface:#0f0f2a;--glass:rgba(10,10,30,.85);--border:rgba(0,240,255,.2);--border-glow:rgba(0,240,255,.5);--text:#e0e0ff;--text-muted:#7878a8;--shadow-blue:0 0 30px rgba(0,240,255,.3);--shadow-purple:0 0 30px rgba(180,0,255,.3)}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Vazirmatn',system-ui,sans-serif;background:var(--bg-void);color:var(--text);height:100vh;overflow:hidden;direction:rtl}
.bg-layer{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background:radial-gradient(ellipse at 20% 30%,rgba(0,240,255,.06)0%,transparent 50%),radial-gradient(ellipse at 80% 70%,rgba(180,0,255,.05)0%,transparent 50%),radial-gradient(ellipse at 50% 50%,rgba(255,45,149,.03)0%,transparent 60%)}
.grid-overlay{position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:0;background-image:linear-gradient(rgba(0,240,255,.02)1px,transparent 1px),linear-gradient(90deg,rgba(0,240,255,.02)1px,transparent 1px);background-size:50px 50px;animation:gridDrift 20s linear infinite}
@keyframes gridDrift{0%{transform:translate(0,0)}100%{transform:translate(50px,50px)}}
.app{position:relative;z-index:10;width:100%;height:100%}
.join-screen{position:fixed;top:0;left:0;width:100%;height:100%;display:flex;align-items:center;justify-content:center;z-index:100;background:rgba(5,5,20,.95);backdrop-filter:blur(20px);transition:all .5s}
.join-screen.hidden{opacity:0;pointer-events:none;transform:scale(1.05)}
.join-card{width:440px;max-width:92vw;padding:40px;background:var(--glass);border:1px solid var(--border-glow);border-radius:20px;box-shadow:var(--shadow-blue);animation:cardGlow 3s ease-in-out infinite}
@keyframes cardGlow{0%,100%{box-shadow:0 0 30px rgba(0,240,255,.3)}50%{box-shadow:0 0 50px rgba(0,240,255,.5),0 0 80px rgba(0,240,255,.2)}}
.logo{text-align:center;font-size:2.2rem;font-weight:900;margin-bottom:8px;background:linear-gradient(135deg,var(--neon-blue),var(--neon-purple),var(--neon-pink));-webkit-background-clip:text;-webkit-text-fill-color:transparent;animation:logoGlitch 5s infinite}
@keyframes logoGlitch{0%,94%,100%{transform:translate(0)}95%{transform:translate(-2px,1px)}97%{transform:translate(2px,-1px)}99%{transform:translate(-1px,-1px)}}
.subtitle{text-align:center;color:var(--text-muted);font-size:.8rem;margin-bottom:24px;font-family:monospace}
.tabs{display:flex;gap:2px;margin-bottom:20px;background:rgba(0,0,0,.3);border-radius:12px;padding:3px}
.tab{flex:1;padding:12px;text-align:center;border-radius:10px;cursor:pointer;font-weight:600;border:1px solid transparent;color:var(--text-muted);transition:all .3s}
.tab.active{background:rgba(0,240,255,.1);border-color:var(--neon-blue);color:var(--neon-blue);box-shadow:0 0 10px rgba(0,240,255,.2)}
.field{margin-bottom:16px}
.field label{display:block;margin-bottom:6px;font-size:.8rem;text-transform:uppercase;color:var(--text-muted);letter-spacing:1px}
.field input{width:100%;padding:13px;background:rgba(0,0,0,.4);border:1px solid var(--border);border-radius:12px;color:var(--text);font-size:.9rem;outline:none;transition:all .2s}
.field input:focus{border-color:var(--neon-blue);box-shadow:0 0 15px rgba(0,240,255,.15)}
.btn{width:100%;padding:14px;border:none;border-radius:12px;font-weight:700;cursor:pointer;transition:all .3s;font-size:.95rem;margin-top:8px;position:relative;overflow:hidden}
.btn-primary{background:linear-gradient(135deg,var(--neon-blue),var(--neon-purple));color:white;box-shadow:0 4px 20px rgba(0,240,255,.3)}
.btn-primary:hover{transform:translateY(-2px);box-shadow:0 8px 30px rgba(0,240,255,.5)}
.invite-box{background:rgba(0,0,0,.5);border:2px dashed var(--border-glow);border-radius:16px;padding:20px;text-align:center;margin-top:16px}
.invite-code{font-size:2.5rem;color:var(--neon-purple);letter-spacing:10px;font-family:monospace;font-weight:700;text-shadow:0 0 20px rgba(180,0,255,.5)}
.room{position:relative;z-index:10;width:100%;height:100vh;display:none}
.room.active{display:flex}
.broadcast{flex:1;display:flex;flex-direction:column;background:var(--bg-deep);border-right:1px solid rgba(0,240,255,.05);min-width:0}
.header{height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 20px;background:rgba(8,8,20,.9);border-bottom:1px solid var(--border);backdrop-filter:blur(10px)}
.user-info{display:flex;align-items:center;gap:10px}
.avatar{width:38px;height:38px;border-radius:50%;background:linear-gradient(135deg,var(--neon-blue),var(--neon-purple));display:flex;align-items:center;justify-content:center;font-weight:800;color:white;border:2px solid var(--border-glow)}
.live-badge{display:inline-flex;align-items:center;gap:4px;padding:3px 10px;background:rgba(255,23,68,.15);border:1px solid var(--neon-red);border-radius:20px;font-size:.7rem;color:var(--neon-red);animation:livePulse 2s infinite}
@keyframes livePulse{0%,100%{box-shadow:0 0 8px rgba(255,23,68,.3)}50%{box-shadow:0 0 20px rgba(255,23,68,.6)}}
.live-dot{width:7px;height:7px;background:var(--neon-red);border-radius:50%;animation:blink .8s infinite}
@keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
.controls{display:flex;gap:6px}
.ctrl-btn{width:36px;height:36px;border-radius:50%;background:rgba(15,15,35,.6);border:1px solid var(--border);cursor:pointer;font-size:.9rem;display:flex;align-items:center;justify-content:center;color:var(--text-muted);transition:all .2s}
.ctrl-btn:hover{border-color:var(--neon-blue);color:var(--neon-blue)}
.ctrl-btn.active{background:rgba(0,255,136,.15);border-color:var(--neon-green);color:var(--neon-green)}
.ctrl-btn.muted{background:rgba(255,23,68,.15);border-color:var(--neon-red);color:var(--neon-red)}
.video-area{flex:1;background:#000;display:flex;align-items:center;justify-content:center;position:relative}
.video-area video{width:100%;height:100%;object-fit:contain}
.placeholder{text-align:center;color:var(--text-muted)}
.placeholder .icon{font-size:5rem;opacity:.15;margin-bottom:12px}
.timer{position:absolute;top:10px;right:10px;padding:5px 12px;background:rgba(0,0,0,.8);border:1px solid var(--neon-red);border-radius:20px;font-family:monospace;font-size:.75rem;color:var(--neon-red)}
.chat-panel{width:340px;display:flex;flex-direction:column;background:var(--bg-surface)}
.chat-header{height:60px;display:flex;align-items:center;justify-content:space-between;padding:0 16px;background:rgba(8,8,20,.9);border-bottom:1px solid var(--border)}
.chat-title{font-weight:700}
.viewer-count{font-size:.75rem;color:var(--neon-green)}
.messages{flex:1;overflow-y:auto;padding:12px;display:flex;flex-direction:column;gap:8px}
.messages::-webkit-scrollbar{width:3px}
.messages::-webkit-scrollbar-thumb{background:var(--border);border-radius:10px}
.msg{animation:slideIn .3s ease-out}
@keyframes slideIn{from{opacity:0;transform:translateX(15px)}to{opacity:1;transform:translateX(0)}}
.msg-header{display:flex;align-items:center;gap:6px;margin-bottom:2px}
.msg-user{font-weight:700;font-size:.8rem}
.msg-user.host{color:var(--neon-blue)}
.msg-user.guest{color:var(--neon-pink)}
.msg-badge{font-size:.6rem;padding:1px 5px;border-radius:3px;background:rgba(0,240,255,.1);border:1px solid var(--neon-blue);color:var(--neon-blue)}
.msg-time{font-size:.65rem;color:var(--text-muted);margin-right:auto}
.msg-text{font-size:.85rem;color:#b0b0d8;padding-right:16px;word-break:break-word}
.sys-msg{text-align:center;font-size:.7rem;color:var(--text-muted);padding:6px;font-style:italic}
.input-area{padding:12px;border-top:1px solid var(--border)}
.input-row{display:flex;gap:6px}
.chat-input{flex:1;padding:10px 14px;background:rgba(0,0,0,.4);border:1px solid var(--border);border-radius:20px;color:var(--text);font-size:.8rem;outline:none;transition:all .2s}
.chat-input:focus{border-color:var(--neon-blue);box-shadow:0 0 10px rgba(0,240,255,.1)}
.send-btn{width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,var(--neon-blue),var(--neon-purple));border:none;cursor:pointer;color:white;font-size:1rem;transition:all .2s;box-shadow:0 3px 15px rgba(0,240,255,.3)}
.send-btn:hover{transform:scale(1.1);box-shadow:0 6px 25px rgba(0,240,255,.5)}
.toast-container{position:fixed;top:20px;left:50%;transform:translateX(-50%);z-index:9999}
.toast{padding:12px 24px;background:var(--glass);border:1px solid var(--border-glow);border-radius:20px;animation:toastIn .4s ease-out;font-size:.85rem;margin-bottom:8px;backdrop-filter:blur(10px)}
@keyframes toastIn{from{transform:translateY(-20px);opacity:0}to{transform:translateY(0);opacity:1}}
@media(max-width:768px){.room.active{flex-direction:column}.broadcast{height:55%;border-right:none;border-bottom:1px solid rgba(0,240,255,.05)}.chat-panel{width:100%;flex:1}.join-card{padding:24px}}
</style>
</head>
<body>
<div class="bg-layer"></div>
<div class="grid-overlay"></div>
<div class="toast-container" id="toastContainer"></div>
<div id="root"></div>
<script type="text/babel">
const{useState,useEffect,useRef,useCallback}=React;
const API='/api';
function toast(msg){const c=document.getElementById('toastContainer');const t=document.createElement('div');t.className='toast';t.textContent=msg;c.appendChild(t);setTimeout(()=>{t.style.opacity='0';t.style.transition='0.3s';setTimeout(()=>t.remove(),300)},3000)}
async function api(method,url,body){try{const opts={method,headers:{'Content-Type':'application/json'}};if(body)opts.body=JSON.stringify(body);const r=await fetch(API+url,opts);const d=await r.json();if(!r.ok)throw new Error(d.error||'خطا');return d.data}catch(e){throw e}}
function App(){const[screen,setScreen]=useState('join');const[tab,setTab]=useState('create');const[roomCode,setRoomCode]=useState(null);const[role,setRole]=useState(null);const[myName,setMyName]=useState('');const[peerName,setPeerName]=useState('');const[genCode,setGenCode]=useState(null)
const create=async()=>{const n=document.getElementById('hostName')?.value||'ابوالفضل';if(!n.trim())return toast('نام را وارد کنید');try{const d=await api('POST','/rooms',{hostName:n});setGenCode(d.roomCode);setRoomCode(d.roomCode);setRole('host');setMyName(n);setPeerName('مهمان');toast('اتاق ساخته شد')}catch(e){toast('خطا: '+e.message)}}
const join=async()=>{const n=document.getElementById('guestName')?.value||'مهدیار';const c=document.getElementById('inviteInput')?.value;if(!n.trim()||!c)return toast('همه فیلدها را پر کنید');try{const d=await api('POST','/rooms/'+c+'/join',{guestName:n});setRoomCode(c);setRole('guest');setMyName(n);setPeerName(d.host.name);setScreen('room');toast('وارد اتاق شدید')}catch(e){toast('کد نامعتبر')}}
const leave=()=>{setScreen('join');setGenCode(null);setRoomCode(null);setRole(null)}
return(<div className="app"><div className={'join-screen '+(screen==='room'?'hidden':'')}><div className="join-card"><div className="logo">CYBERSTREAM</div><div className="subtitle">Live Streaming Engine v4.0</div><div className="tabs"><div className={'tab '+(tab==='create'?'active':'')} onClick={()=>setTab('create')}>ایجاد اتاق</div><div className={'tab '+(tab==='join'?'active':'')} onClick={()=>setTab('join')}>ورود به اتاق</div></div>{tab==='create'?(<div><div className="field"><label>نام میزبان</label><input id="hostName" defaultValue="ابوالفضل"/></div>{!genCode?(<button className="btn btn-primary" onClick={create}>ایجاد اتاق</button>):(<div className="invite-box"><label>کد دعوت</label><div className="invite-code">{genCode}</div><button className="btn btn-primary" style={{marginTop:12}} onClick={()=>setScreen('room')}>ورود به اتاق</button></div>)}</div>):(<div><div className="field"><label>نام مهمان</label><input id="guestName" defaultValue="مهدیار"/></div><div className="field"><label>کد دعوت</label><input id="inviteInput" placeholder="کد ۶ رقمی"/></div><button className="btn btn-primary" onClick={join}>پیوستن</button></div>)}</div></div><div className={'room '+(screen==='room'?'active':'')}>{screen==='room'&&<StreamRoom roomCode={roomCode} role={role} myName={myName} peerName={peerName} onLeave={leave}/>}</div></div>)}
function StreamRoom({roomCode,role,myName,peerName,onLeave}){const[stream,setStream]=useState(null);const[isCamOn,setIsCamOn]=useState(false);const[isMicOn,setIsMicOn]=useState(true);const[msgs,setMsgs]=useState([]);const[timer,setTimer]=useState('00:00:00');const streamRef=useRef(null);const timerRef=useRef(null);const videoRef=useRef(null);const inputRef=useRef(null)
useEffect(()=>{(async()=>{try{const s=await navigator.mediaDevices.getUserMedia({video:{width:1280,height:720},audio:true});streamRef.current=s;setStream(s);setIsCamOn(true);if(videoRef.current)videoRef.current.srcObject=s}catch(e){toast('دسترسی به دوربین ممکن نیست')}})();api('GET','/rooms/'+roomCode+'/messages').then(d=>setMsgs(d.messages||[])).catch(()=>{});const st=Date.now();timerRef.current=setInterval(()=>{const el=Math.floor((Date.now()-st)/1000);setTimer(String(Math.floor(el/3600)).padStart(2,'0')+':'+String(Math.floor((el%3600)/60)).padStart(2,'0')+':'+String(el%60).padStart(2,'0'))},1000);return()=>{if(streamRef.current)streamRef.current.getTracks().forEach(t=>t.stop());clearInterval(timerRef.current)}},[])
const toggleMic=()=>{if(streamRef.current){const t=streamRef.current.getAudioTracks()[0];if(t){t.enabled=!t.enabled;setIsMicOn(t.enabled)}}}
const toggleCam=()=>{if(streamRef.current){const t=streamRef.current.getVideoTracks()[0];if(t){t.enabled=!t.enabled;setIsCamOn(t.enabled)}}}
const send=async()=>{const text=inputRef.current?.value?.trim();if(!text)return;const msg={author:{id:'me',name:myName,role},content:text,type:'text',timestamp:new Date().toISOString()};try{await api('POST','/rooms/'+roomCode+'/messages',msg)}catch(e){}setMsgs(p=>[...p,msg]);if(inputRef.current)inputRef.current.value='';setTimeout(()=>{const replies=['درسته','باحاله','ادامه بده','متوجه شدم','حرفه ای'];setMsgs(p=>[...p,{author:{id:'peer',name:peerName,role:role==='host'?'guest':'host'},content:replies[Math.floor(Math.random()*replies.length)],type:'text',timestamp:new Date().toISOString()}])},1500+Math.random()*2000)}
return(<><div className="broadcast"><div className="header"><div className="user-info"><div className="avatar">{myName.charAt(0)}</div><div><div style={{fontWeight:700}}>{role==='host'?myName:peerName}</div><span className="live-badge"><span className="live-dot"></span>LIVE</span></div></div><span style={{fontFamily:'monospace',fontSize:'0.75rem',color:'#7878a8'}}>Room: {roomCode}</span><div className="controls"><button className={'ctrl-btn '+(isMicOn?'active':'muted')} onClick={toggleMic}>🎙️</button><button className={'ctrl-btn '+(isCamOn?'active':'')} onClick={toggleCam}>📹</button><button className="ctrl-btn" style={{borderColor:'rgba(255,23,68,.4)',color:'#ff1744'}} onClick={onLeave}>🚪</button></div></div><div className="video-area">{stream?<video ref={videoRef} autoPlay muted playsInline></video>:<div className="placeholder"><div className="icon">📡</div><h3>در حال اتصال...</h3></div>}<div className="timer">🔴 {timer}</div></div></div><div className="chat-panel"><div className="chat-header"><span className="chat-title">💬 گفتگو</span><span className="viewer-count">🟢 1 نفر</span></div><div className="messages">{msgs.map((m,i)=>(<div key={i} className="msg"><div className="msg-header"><span className={'msg-user '+m.author?.role}>{m.author?.name}</span><span className="msg-badge">{m.author?.role==='host'?'HOST':'GUEST'}</span><span className="msg-time">{new Date(m.timestamp).toLocaleTimeString('fa-IR',{hour:'2-digit',minute:'2-digit'})}</span></div><div className="msg-text">{m.content}</div></div>))}</div><div className="input-area"><div className="input-row"><input className="chat-input" ref={inputRef} placeholder="پیام..." onKeyPress={e=>e.key==='Enter'&&send()}/><button className="send-btn" onClick={send}>➤</button></div></div></div></>)}
ReactDOM.createRoot(document.getElementById('root')).render(<App/>);
</script>
</body>
</html>`;
  }
}

// =========================== SERVERLESS HANDLER ===========================
const router = new Router();

export default async function handler(req: Request): Promise<Response> {
  return router.route(req);
}

// =========================== CONFIGURATION ===========================
export const config = {
  runtime: 'edge',
  regions: ['iad1', 'sfo1', 'hnd1', 'cdg1', 'lhr1'],
};

// =========================== STARTUP LOG ===========================
console.log('═'.repeat(60));
console.log('🚀 CyberStream Pro v4.0 - Serverless Ready');
console.log('📍 Vercel Edge Runtime');
console.log('🔧 Environment:', CONSTANTS.ENVIRONMENT);
console.log('🌍 Region:', CONSTANTS.REGION);
console.log('═'.repeat(60));
