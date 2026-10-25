import type { IncomingMessage, ServerResponse } from 'http';
import { bloodStore, DEFAULT_MAP_CENTER, BloodRequest } from './src/server/store.js';
import { askBloodAssistant } from './src/server/ai.js';
import { BloodGroup, BloodComponent } from './src/server/compatibility.js';

const GOOGLE_MAPS_KEY = process.env.GOOGLE_MAPS_DEMO_KEY || process.env.VITE_GOOGLE_MAPS_API_KEY || '';

const sendJson = (res: ServerResponse, data: any, status = 200) => {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  });
  res.end(JSON.stringify(data));
};

const parseBody = (req: IncomingMessage): Promise<any> => {
  if ('body' in req || req.readableEnded) {
    const parsedBody = (req as IncomingMessage & { body?: unknown }).body;
    return Promise.resolve(parsedBody ?? {});
  }

  return new Promise((resolve) => {
    let body = '';
    req.on('data', (chunk) => (body += chunk));
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch {
        resolve({});
      }
    });
  });
};

export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const parsedUrl = new URL(req.url || '', 'http://localhost:3000');
  const pathname = parsedUrl.pathname;

  if (!pathname.startsWith('/api/')) return false;

  // Handle CORS Preflight
  if (req.method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    });
    res.end();
    return true;
  }

  try {
    // 1. Google Maps & Platform Config
    if (pathname === '/api/config/maps' && req.method === 'GET') {
      sendJson(res, {
        success: true,
        apiKey: GOOGLE_MAPS_KEY,
        defaultCenter: DEFAULT_MAP_CENTER,
      });
      return true;
    }

    // 2. Platform Stats
    if (pathname === '/api/stats' && req.method === 'GET') {
      const stats = bloodStore.getPlatformStats();
      sendJson(res, { success: true, stats });
      return true;
    }

    // 3. Auth Endpoints
    if (pathname === '/api/auth/login' && req.method === 'POST') {
      const body = await parseBody(req);
      const email = body.email || '';
      const password = body.password || '';

      const user = bloodStore.getUserByEmail(email);
      if (!user) {
        sendJson(res, { success: false, error: 'Invalid email or password' }, 401);
        return true;
      }

      // Check donor profile if applicable
      const donorProfile = user.role === 'donor' ? bloodStore.getDonorByUserId(user.id) : undefined;

      sendJson(res, {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          bloodGroup: user.bloodGroup,
          donorProfile,
        },
        token: `bctoken_${user.id}_${Date.now()}`,
      });
      return true;
    }

    if (pathname === '/api/auth/register' && req.method === 'POST') {
      const body = await parseBody(req);
      const { name, email, password, role = 'recipient', phone, bloodGroup, address, lat, lng } = body;

      if (!name || !email) {
        sendJson(res, { success: false, error: 'Name and email are required' }, 400);
        return true;
      }

      const existing = bloodStore.getUserByEmail(email);
      if (existing) {
        sendJson(res, { success: false, error: 'Email already registered' }, 400);
        return true;
      }

      const newUser = bloodStore.createUser({
        name,
        email,
        passwordHash: '$2a$10$hasheddemo' + Math.random().toString(36),
        role,
        phone: phone || '(415) 555-0100',
        bloodGroup: bloodGroup as BloodGroup,
      });

      let donorProfile;
      if (role === 'donor' && bloodGroup) {
        donorProfile = bloodStore.createOrUpdateDonor({
          id: 'donor-' + Date.now(),
          userId: newUser.id,
          name: newUser.name,
          bloodGroup: bloodGroup as BloodGroup,
          phone: newUser.phone,
          email: newUser.email,
          lat: lat || 37.7749,
          lng: lng || -122.4194,
          address: address || 'San Francisco, CA',
          city: 'San Francisco, CA',
          isAvailable: true,
          lastDonationDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 70).toISOString().split('T')[0],
          totalDonations: 1,
          verified: true,
          emergencyOnCall: true,
          badge: 'First Timer',
        });
      }

      sendJson(res, {
        success: true,
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          phone: newUser.phone,
          bloodGroup: newUser.bloodGroup,
          donorProfile,
        },
        token: `bctoken_${newUser.id}_${Date.now()}`,
      });
      return true;
    }

    if (pathname === '/api/auth/me' && req.method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-recipient-demo';
      const user = bloodStore.getUserById(userId);
      if (!user) {
        sendJson(res, { success: false, error: 'User not found' }, 404);
        return true;
      }
      const donorProfile = user.role === 'donor' ? bloodStore.getDonorByUserId(user.id) : undefined;
      sendJson(res, {
        success: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          bloodGroup: user.bloodGroup,
          donorProfile,
        },
      });
      return true;
    }

    // 4. Blood Requests
    if (pathname === '/api/requests' && req.method === 'GET') {
      const all = bloodStore.getAllRequests();
      const status = parsedUrl.searchParams.get('status');
      const urgency = parsedUrl.searchParams.get('urgency');
      const bloodGroup = parsedUrl.searchParams.get('bloodGroup');

      let filtered = all;
      if (status) filtered = filtered.filter((r) => r.status === status);
      if (urgency) filtered = filtered.filter((r) => r.urgency === urgency);
      if (bloodGroup) filtered = filtered.filter((r) => r.bloodGroup === bloodGroup);

      sendJson(res, { success: true, requests: filtered });
      return true;
    }

    if (pathname === '/api/requests' && req.method === 'POST') {
      const body = await parseBody(req);
      const {
        recipientId = 'user-recipient-demo',
        recipientName = 'Anonymous Recipient',
        patientName,
        patientAge = 35,
        bloodGroup,
        component = 'Whole Blood',
        unitsRequired = 1,
        urgency = 'URGENT',
        hospitalName,
        hospitalAddress,
        lat = 37.7749,
        lng = -122.4194,
        contactPhone,
        notes = '',
      } = body;

      if (!patientName || !bloodGroup || !hospitalName) {
        sendJson(res, { success: false, error: 'patientName, bloodGroup, and hospitalName are required' }, 400);
        return true;
      }

      const created = bloodStore.createBloodRequest({
        recipientId,
        recipientName,
        patientName,
        patientAge: Number(patientAge),
        bloodGroup: bloodGroup as BloodGroup,
        component: component as BloodComponent,
        unitsRequired: Number(unitsRequired),
        urgency,
        hospitalName,
        hospitalAddress: hospitalAddress || 'San Francisco, CA',
        lat: Number(lat),
        lng: Number(lng),
        contactPhone: contactPhone || '(415) 555-0199',
        notes,
        status: 'OPEN',
      });

      sendJson(res, { success: true, request: created });
      return true;
    }

    // Single Request operations
    const reqMatch = pathname.match(/^\/api\/requests\/([^/]+)$/);
    if (reqMatch && req.method === 'GET') {
      const id = reqMatch[1];
      const request = bloodStore.getRequestById(id);
      if (!request) {
        sendJson(res, { success: false, error: 'Request not found' }, 404);
        return true;
      }
      sendJson(res, { success: true, request });
      return true;
    }

    const respondMatch = pathname.match(/^\/api\/requests\/([^/]+)\/respond$/);
    if (respondMatch && req.method === 'POST') {
      const id = respondMatch[1];
      const body = await parseBody(req);
      const { donorId, donorName, bloodGroup, phone, etaMinutes } = body;

      const updated = bloodStore.respondToRequest(id, {
        id: donorId || 'donor-demo',
        name: donorName || 'Voluntary Donor',
        bloodGroup: (bloodGroup as BloodGroup) || 'O-',
        phone: phone || '(415) 555-0192',
        etaMinutes: etaMinutes || 15,
      });

      if (!updated) {
        sendJson(res, { success: false, error: 'Request not found' }, 404);
        return true;
      }

      sendJson(res, { success: true, request: updated });
      return true;
    }

    const statusMatch = pathname.match(/^\/api\/requests\/([^/]+)\/status$/);
    if (statusMatch && req.method === 'PATCH') {
      const id = statusMatch[1];
      const body = await parseBody(req);
      const { status } = body;

      const updated = bloodStore.updateRequestStatus(id, status);
      if (!updated) {
        sendJson(res, { success: false, error: 'Request not found' }, 404);
        return true;
      }

      sendJson(res, { success: true, request: updated });
      return true;
    }

    // 5. Donors Search & Availability
    if (pathname === '/api/donors' && req.method === 'GET') {
      const lat = parseFloat(parsedUrl.searchParams.get('lat') || '37.7749');
      const lng = parseFloat(parsedUrl.searchParams.get('lng') || '-122.4194');
      const radiusKm = parseFloat(parsedUrl.searchParams.get('radius') || '50');
      const bloodGroup = (parsedUrl.searchParams.get('bloodGroup') as BloodGroup) || undefined;
      const component = (parsedUrl.searchParams.get('component') as BloodComponent) || 'Whole Blood';

      const results = bloodStore.findNearbyDonors(lat, lng, radiusKm, bloodGroup, component);
      sendJson(res, { success: true, donors: results });
      return true;
    }

    const availMatch = pathname.match(/^\/api\/donors\/([^/]+)\/availability$/);
    if (availMatch && req.method === 'PATCH') {
      const donorId = availMatch[1];
      const body = await parseBody(req);
      const { isAvailable } = body;

      const updated = bloodStore.toggleDonorAvailability(donorId, Boolean(isAvailable));
      if (!updated) {
        sendJson(res, { success: false, error: 'Donor not found' }, 404);
        return true;
      }
      sendJson(res, { success: true, donor: updated });
      return true;
    }

    // 6. Blood Banks & Live Inventory
    if (pathname === '/api/blood-banks' && req.method === 'GET') {
      const lat = parseFloat(parsedUrl.searchParams.get('lat') || '37.7749');
      const lng = parseFloat(parsedUrl.searchParams.get('lng') || '-122.4194');
      const radiusKm = parseFloat(parsedUrl.searchParams.get('radius') || '100');
      const bloodGroup = (parsedUrl.searchParams.get('bloodGroup') as BloodGroup) || undefined;

      const banks = bloodStore.findNearbyBloodBanks(lat, lng, radiusKm, bloodGroup);
      sendJson(res, { success: true, bloodBanks: banks });
      return true;
    }

    const inventoryMatch = pathname.match(/^\/api\/blood-banks\/([^/]+)\/inventory$/);
    if (inventoryMatch && req.method === 'PATCH') {
      const bankId = inventoryMatch[1];
      const body = await parseBody(req);
      const { bloodGroup, units, plateletUnits, plasmaUnits } = body;

      const updated = bloodStore.updateBloodBankInventory(bankId, {
        bloodGroup,
        units,
        plateletUnits,
        plasmaUnits,
      });

      if (!updated) {
        sendJson(res, { success: false, error: 'Blood bank not found' }, 404);
        return true;
      }
      sendJson(res, { success: true, bloodBank: updated });
      return true;
    }

    // 7. Notifications & Audit Logs
    if (pathname === '/api/notifications' && req.method === 'GET') {
      const userId = parsedUrl.searchParams.get('userId') || 'user-donor-demo';
      const items = bloodStore.getNotificationsForUser(userId);
      sendJson(res, { success: true, notifications: items });
      return true;
    }

    const notifReadMatch = pathname.match(/^\/api\/notifications\/([^/]+)\/read$/);
    if (notifReadMatch && req.method === 'POST') {
      const notifId = notifReadMatch[1];
      const userId = parsedUrl.searchParams.get('userId') || 'user-donor-demo';
      bloodStore.markNotificationRead(userId, notifId);
      sendJson(res, { success: true });
      return true;
    }

    if (pathname === '/api/audit-logs' && req.method === 'GET') {
      const logs = bloodStore.getAuditLogs();
      sendJson(res, { success: true, logs });
      return true;
    }

    // 8. AI Blood Assistant
    if (pathname === '/api/ai/chat' && req.method === 'POST') {
      const body = await parseBody(req);
      const { message, context } = body;

      if (!message) {
        sendJson(res, { success: false, error: 'Message is required' }, 400);
        return true;
      }

      const answer = await askBloodAssistant(message, context);
      sendJson(res, { success: true, ...answer });
      return true;
    }

    sendJson(res, { success: false, error: 'Route not found' }, 404);
    return true;
  } catch (err: any) {
    console.error('API Error:', err);
    sendJson(res, { success: false, error: err.message || 'Internal server error' }, 500);
    return true;
  }
}
