import { BloodGroup, BloodComponent, calculateHaversineDistanceKm, getCompatibleDonorGroups } from './compatibility.js';

export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: 'recipient' | 'donor' | 'bloodBankStaff' | 'admin';
  phone: string;
  bloodGroup?: BloodGroup;
  createdAt: string;
}

export interface DonorProfile {
  id: string;
  userId: string;
  name: string;
  bloodGroup: BloodGroup;
  phone: string;
  email: string;
  lat: number;
  lng: number;
  address: string;
  city: string;
  isAvailable: boolean;
  lastDonationDate: string;
  totalDonations: number;
  verified: boolean;
  emergencyOnCall: boolean;
  badge: 'Gold Hero' | 'Silver Lifesaver' | 'Bronze Guardian' | 'First Timer';
}

export interface BloodInventoryItem {
  bloodGroup: BloodGroup;
  units: number;
  status: 'OPTIMAL' | 'ADEQUATE' | 'LOW' | 'CRITICAL';
  lastUpdated: string;
}

export interface BloodBank {
  id: string;
  name: string;
  licenseNumber: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  phone: string;
  email: string;
  operatingHours: string;
  emergencyHotline: string;
  verified: boolean;
  rating: number;
  inventory: Record<BloodGroup, number>;
  plateletUnits: number;
  plasmaUnits: number;
  lastInventoryAudit: string;
}

export interface DonorResponse {
  id: string;
  donorId: string;
  donorName: string;
  bloodGroup: BloodGroup;
  status: 'ACCEPTED' | 'EN_ROUTE' | 'DONATED' | 'DECLINED';
  responseTime: string;
  etaMinutes?: number;
  phone: string;
}

export interface BloodRequest {
  id: string;
  recipientId: string;
  recipientName: string;
  patientName: string;
  patientAge: number;
  bloodGroup: BloodGroup;
  component: BloodComponent;
  unitsRequired: number;
  urgency: 'CRITICAL' | 'URGENT' | 'STANDARD';
  hospitalName: string;
  hospitalAddress: string;
  lat: number;
  lng: number;
  contactPhone: string;
  notes: string;
  status: 'OPEN' | 'MATCHED' | 'IN_TRANSIT' | 'FULFILLED' | 'CANCELLED';
  matchedDonorCount: number;
  responses: DonorResponse[];
  createdAt: string;
  fulfilledAt?: string;
}

export interface NotificationItem {
  id: string;
  recipientUserId: string;
  title: string;
  message: string;
  type: 'emergency' | 'match' | 'inventory' | 'status';
  isRead: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  severity: 'info' | 'warning' | 'critical';
}

// Default Geo Center: San Francisco Medical District (37.7749, -122.4194)
// High density of world-class medical centers (UCSF, CPMC, Kaiser, SF General)
export const DEFAULT_MAP_CENTER = {
  lat: 37.7749,
  lng: -122.4194,
  zoom: 12,
};

// Realistic Seed Blood Banks
const INITIAL_BLOOD_BANKS: BloodBank[] = [
  {
    id: 'bb-ucsf-parnassus',
    name: 'UCSF Medical Center Blood & Platelet Donor Center',
    licenseNumber: 'CA-BB-99214',
    address: '505 Parnassus Ave, M-294',
    city: 'San Francisco, CA',
    lat: 37.7631,
    lng: -122.4578,
    phone: '(415) 353-1596',
    email: 'blooddonor@ucsf.edu',
    operatingHours: '24/7 Emergency Dispatch (Public donor walk-in: 7:30 AM - 6:00 PM)',
    emergencyHotline: '(415) 353-9000',
    verified: true,
    rating: 4.9,
    inventory: {
      'O-': 4, // Critical low!
      'O+': 18,
      'A+': 24,
      'A-': 8,
      'B+': 15,
      'B-': 6,
      'AB+': 12,
      'AB-': 3,
    },
    plateletUnits: 14,
    plasmaUnits: 28,
    lastInventoryAudit: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'bb-vitalant-sf',
    name: 'Vitalant Regional Blood Bank - Downtown Center',
    licenseNumber: 'CA-BB-41829',
    address: '270 Masonic Ave',
    city: 'San Francisco, CA',
    lat: 37.7785,
    lng: -122.4468,
    phone: '(877) 258-4825',
    email: 'dispatch@vitalant.org',
    operatingHours: 'Mon-Sat 7:00 AM - 7:00 PM (Emergency Delivery On-Call 24/7)',
    emergencyHotline: '(415) 750-6100',
    verified: true,
    rating: 4.8,
    inventory: {
      'O-': 7,
      'O+': 32,
      'A+': 38,
      'A-': 11,
      'B+': 19,
      'B-': 9,
      'AB+': 14,
      'AB-': 5,
    },
    plateletUnits: 22,
    plasmaUnits: 34,
    lastInventoryAudit: new Date(Date.now() - 1000 * 60 * 90).toISOString(),
  },
  {
    id: 'bb-sf-general',
    name: 'Zuckerberg SF General Hospital Trauma Blood Reserve',
    licenseNumber: 'CA-BB-10294',
    address: '1001 Potrero Ave, Bldg 5',
    city: 'San Francisco, CA',
    lat: 37.7558,
    lng: -122.4048,
    phone: '(415) 206-8000',
    email: 'trauma-bank@sfdph.org',
    operatingHours: '24 Hours / 7 Days (Level 1 Trauma Center)',
    emergencyHotline: '(415) 206-8361',
    verified: true,
    rating: 4.9,
    inventory: {
      'O-': 2, // Severe emergency low
      'O+': 12,
      'A+': 18,
      'A-': 5,
      'B+': 10,
      'B-': 4,
      'AB+': 8,
      'AB-': 2,
    },
    plateletUnits: 9,
    plasmaUnits: 16,
    lastInventoryAudit: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
  },
  {
    id: 'bb-cpmc-van-ness',
    name: 'CPMC Van Ness Campus Blood Depot',
    licenseNumber: 'CA-BB-87431',
    address: '1101 Van Ness Ave',
    city: 'San Francisco, CA',
    lat: 37.7876,
    lng: -122.4215,
    phone: '(415) 600-6000',
    email: 'cpmc-blood@sutterhealth.org',
    operatingHours: '6:00 AM - 10:00 PM (Emergency Night Shift Available)',
    emergencyHotline: '(415) 600-6911',
    verified: true,
    rating: 4.7,
    inventory: {
      'O-': 9,
      'O+': 28,
      'A+': 30,
      'A-': 12,
      'B+': 22,
      'B-': 8,
      'AB+': 16,
      'AB-': 6,
    },
    plateletUnits: 18,
    plasmaUnits: 25,
    lastInventoryAudit: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
  {
    id: 'bb-stanford-outreach',
    name: 'Stanford Health Care Blood Center - Peninsula Satellite',
    licenseNumber: 'CA-BB-55912',
    address: '3373 Hillview Ave',
    city: 'Palo Alto / Bay Area, CA',
    lat: 37.4089,
    lng: -122.1487,
    phone: '(650) 723-7831',
    email: 'stanfordbloodcenter@stanford.edu',
    operatingHours: 'Mon-Sun 7:00 AM - 8:00 PM',
    emergencyHotline: '(650) 723-7000',
    verified: true,
    rating: 5.0,
    inventory: {
      'O-': 14,
      'O+': 45,
      'A+': 52,
      'A-': 18,
      'B+': 29,
      'B-': 12,
      'AB+': 21,
      'AB-': 8,
    },
    plateletUnits: 35,
    plasmaUnits: 48,
    lastInventoryAudit: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
];

// Realistic Seed Donors with precise coordinates in SF/Bay Area
const INITIAL_DONORS: DonorProfile[] = [
  {
    id: 'donor-1',
    userId: 'user-donor-1',
    name: 'Elena Rostova',
    bloodGroup: 'O-', // Universal Donor!
    phone: '(415) 555-0192',
    email: 'elena.rostova@gmail.com',
    lat: 37.7725,
    lng: -122.4312,
    address: 'Hayes Valley, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-08-15',
    totalDonations: 14,
    verified: true,
    emergencyOnCall: true,
    badge: 'Gold Hero',
  },
  {
    id: 'donor-2',
    userId: 'user-donor-2',
    name: 'Marcus Chen',
    bloodGroup: 'A+',
    phone: '(415) 555-0381',
    email: 'mchen.dev@outlook.com',
    lat: 37.7891,
    lng: -122.4014,
    address: 'Financial District, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-09-02',
    totalDonations: 9,
    verified: true,
    emergencyOnCall: true,
    badge: 'Silver Lifesaver',
  },
  {
    id: 'donor-3',
    userId: 'user-donor-3',
    name: 'Aisha Al-Mansoor',
    bloodGroup: 'B+',
    phone: '(415) 555-0723',
    email: 'aisha.m@ucsf.edu',
    lat: 37.7612,
    lng: -122.4632,
    address: 'Inner Sunset, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-07-20',
    totalDonations: 18,
    verified: true,
    emergencyOnCall: true,
    badge: 'Gold Hero',
  },
  {
    id: 'donor-4',
    userId: 'user-donor-4',
    name: 'David K. Vance',
    bloodGroup: 'O+',
    phone: '(415) 555-0455',
    email: 'david.vance99@gmail.com',
    lat: 37.7501,
    lng: -122.4182,
    address: 'Mission District, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-09-18',
    totalDonations: 6,
    verified: true,
    emergencyOnCall: false,
    badge: 'Bronze Guardian',
  },
  {
    id: 'donor-5',
    userId: 'user-donor-5',
    name: 'Sarah Jenkins',
    bloodGroup: 'AB+', // Universal Recipient
    phone: '(415) 555-0819',
    email: 'sjenkins.nurse@sfdph.org',
    lat: 37.7645,
    lng: -122.4089,
    address: 'Potrero Hill, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-06-10',
    totalDonations: 11,
    verified: true,
    emergencyOnCall: true,
    badge: 'Silver Lifesaver',
  },
  {
    id: 'donor-6',
    userId: 'user-donor-6',
    name: 'Carlos Mendez',
    bloodGroup: 'A-',
    phone: '(415) 555-0964',
    email: 'carlos.mendez@baytech.io',
    lat: 37.8012,
    lng: -122.4345,
    address: 'Marina District, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-08-28',
    totalDonations: 8,
    verified: true,
    emergencyOnCall: true,
    badge: 'Silver Lifesaver',
  },
  {
    id: 'donor-7',
    userId: 'user-donor-7',
    name: 'Dr. Priya Patel',
    bloodGroup: 'O-', // Rare Universal
    phone: '(415) 555-0612',
    email: 'priya.patel@stanfordalumni.org',
    lat: 37.7834,
    lng: -122.4167,
    address: 'Nob Hill, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: true,
    lastDonationDate: '2026-09-11',
    totalDonations: 22,
    verified: true,
    emergencyOnCall: true,
    badge: 'Gold Hero',
  },
  {
    id: 'donor-8',
    userId: 'user-donor-8',
    name: 'Lucas Dupont',
    bloodGroup: 'B-',
    phone: '(415) 555-0551',
    email: 'lucas.dupont@gmail.com',
    lat: 37.7699,
    lng: -122.4462,
    address: 'Buena Vista, San Francisco',
    city: 'San Francisco, CA',
    isAvailable: false, // Currently on deferral window
    lastDonationDate: '2026-10-05',
    totalDonations: 5,
    verified: true,
    emergencyOnCall: false,
    badge: 'Bronze Guardian',
  },
];

// Active Emergency Blood Requests
const INITIAL_REQUESTS: BloodRequest[] = [
  {
    id: 'req-em-101',
    recipientId: 'user-rec-1',
    recipientName: 'Maria Gonzales',
    patientName: 'Sophia Gonzales',
    patientAge: 8,
    bloodGroup: 'O-',
    component: 'Packed Red Cells',
    unitsRequired: 3,
    urgency: 'CRITICAL',
    hospitalName: 'UCSF Benioff Children’s Hospital',
    hospitalAddress: '1975 4th St, San Francisco, CA 94158',
    lat: 37.7681,
    lng: -122.3912,
    contactPhone: '(415) 555-8841',
    notes: 'Pediatric emergency trauma surgery following acute injury. Immediate O- negative required within 90 minutes.',
    status: 'MATCHED',
    matchedDonorCount: 2,
    responses: [
      {
        id: 'resp-1',
        donorId: 'donor-1',
        donorName: 'Elena Rostova',
        bloodGroup: 'O-',
        status: 'EN_ROUTE',
        responseTime: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
        etaMinutes: 18,
        phone: '(415) 555-0192',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
  },
  {
    id: 'req-em-102',
    recipientId: 'user-rec-2',
    recipientName: 'Robert Sterling',
    patientName: 'Robert Sterling',
    patientAge: 64,
    bloodGroup: 'A+',
    component: 'Whole Blood',
    unitsRequired: 2,
    urgency: 'URGENT',
    hospitalName: 'CPMC Van Ness Campus',
    hospitalAddress: '1101 Van Ness Ave, San Francisco, CA',
    lat: 37.7876,
    lng: -122.4215,
    contactPhone: '(415) 555-4920',
    notes: 'Scheduled cardiovascular bypass procedure. Family donors unavailable, verified blood bank reserves needed.',
    status: 'OPEN',
    matchedDonorCount: 5,
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 65).toISOString(),
  },
  {
    id: 'req-em-103',
    recipientId: 'user-rec-3',
    recipientName: 'Fatima Zahra',
    patientName: 'Amir Zahra',
    patientAge: 32,
    bloodGroup: 'B-',
    component: 'Platelets',
    unitsRequired: 4,
    urgency: 'CRITICAL',
    hospitalName: 'Zuckerberg San Francisco General Hospital',
    hospitalAddress: '1001 Potrero Ave, San Francisco, CA',
    lat: 37.7558,
    lng: -122.4048,
    contactPhone: '(415) 555-7319',
    notes: 'Oncology patient experiencing severe thrombocytopenia after chemotherapy cycle. Platelet count critically low (<15,000/μL).',
    status: 'OPEN',
    matchedDonorCount: 2,
    responses: [],
    createdAt: new Date(Date.now() - 1000 * 60 * 110).toISOString(),
  },
  {
    id: 'req-em-100',
    recipientId: 'user-rec-4',
    recipientName: 'James Taylor',
    patientName: 'Hannah Taylor',
    patientAge: 27,
    bloodGroup: 'AB+',
    component: 'Fresh Frozen Plasma',
    unitsRequired: 2,
    urgency: 'STANDARD',
    hospitalName: 'Kaiser Permanente San Francisco Medical Center',
    hospitalAddress: '2425 Geary Blvd, San Francisco, CA',
    lat: 37.7824,
    lng: -122.4435,
    contactPhone: '(415) 555-3210',
    notes: 'Post-partum hemorrhage management. Plasma safely administered.',
    status: 'FULFILLED',
    matchedDonorCount: 6,
    responses: [
      {
        id: 'resp-prev',
        donorId: 'donor-5',
        donorName: 'Sarah Jenkins',
        bloodGroup: 'AB+',
        status: 'DONATED',
        responseTime: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
        phone: '(415) 555-0819',
      },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 16).toISOString(),
    fulfilledAt: new Date(Date.now() - 1000 * 60 * 60 * 13).toISOString(),
  },
];

// Seed Users
const INITIAL_USERS: User[] = [
  {
    id: 'user-recipient-demo',
    name: 'Emily Davis',
    email: 'recipient@bloodconnect.org',
    passwordHash: '$2a$10$demoHashedPasswordRecipient1234567890',
    role: 'recipient',
    phone: '(415) 555-0101',
    bloodGroup: 'O+',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
  },
  {
    id: 'user-donor-demo',
    name: 'Elena Rostova',
    email: 'donor@bloodconnect.org',
    passwordHash: '$2a$10$demoHashedPasswordDonor1234567890',
    role: 'donor',
    phone: '(415) 555-0192',
    bloodGroup: 'O-',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 60).toISOString(),
  },
  {
    id: 'user-bank-demo',
    name: 'Dr. Michael Hayes (UCSF Lead)',
    email: 'staff@bloodconnect.org',
    passwordHash: '$2a$10$demoHashedPasswordBankStaff123456',
    role: 'bloodBankStaff',
    phone: '(415) 353-1596',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 90).toISOString(),
  },
  {
    id: 'user-admin-demo',
    name: 'Admin Coordinator',
    email: 'admin@bloodconnect.org',
    passwordHash: '$2a$10$demoHashedPasswordAdmin123456789',
    role: 'admin',
    phone: '(415) 555-0000',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 120).toISOString(),
  },
];

const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    actor: 'Elena Rostova (Donor)',
    action: 'DISPATCH_ACCEPTED',
    details: 'Accepted critical request req-em-101 for UCSF Children’s Hospital. En route with ETA 18m.',
    severity: 'info',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 1000 * 60 * 28).toISOString(),
    actor: 'Maria Gonzales (Recipient)',
    action: 'EMERGENCY_REQUEST_CREATED',
    details: 'Initiated Level 1 CRITICAL broadcast for Sophia Gonzales (O- Packed Red Cells, 3 units).',
    severity: 'critical',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    actor: 'UCSF Blood Center Automated Telemetry',
    action: 'INVENTORY_THRESHOLD_WARNING',
    details: 'O- Negative inventory fell to 4 units (< 5 units critical threshold). Triggered voluntary donor outreach.',
    severity: 'warning',
  },
];

// Persistent In-Memory Data Store (with MongoDB integration fallback)
class BloodStore {
  private users: Map<string, User> = new Map();
  private donors: Map<string, DonorProfile> = new Map();
  private bloodBanks: Map<string, BloodBank> = new Map();
  private requests: Map<string, BloodRequest> = new Map();
  private auditLogs: AuditLog[] = [...INITIAL_AUDIT_LOGS];
  private notifications: Map<string, NotificationItem[]> = new Map();

  constructor() {
    this.seed();
  }

  private seed() {
    INITIAL_USERS.forEach((u) => this.users.set(u.id, u));
    INITIAL_DONORS.forEach((d) => this.donors.set(d.id, d));
    INITIAL_BLOOD_BANKS.forEach((b) => this.bloodBanks.set(b.id, b));
    INITIAL_REQUESTS.forEach((r) => this.requests.set(r.id, r));

    // Seed sample notifications for demo users
    this.notifications.set('user-donor-demo', [
      {
        id: 'notif-1',
        recipientUserId: 'user-donor-demo',
        title: '🚨 CRITICAL MATCH: Pediatric Trauma at UCSF',
        message: 'A patient with O- Negative blood urgently needs 3 units of Packed Red Cells 2.4 km away.',
        type: 'emergency',
        isRead: false,
        timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
      },
      {
        id: 'notif-2',
        recipientUserId: 'user-donor-demo',
        title: 'Badge Unlocked: Gold Hero 🏆',
        message: 'Thank you for reaching 14 verified donations. You have directly helped preserve 42 lives!',
        type: 'status',
        isRead: true,
        timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ]);
  }

  // --- Auth & Users ---
  getUserByEmail(email: string): User | undefined {
    return Array.from(this.users.values()).find((u) => u.email.toLowerCase() === email.toLowerCase());
  }

  getUserById(id: string): User | undefined {
    return this.users.get(id);
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const id = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 5);
    const newUser: User = {
      ...userData,
      id,
      createdAt: new Date().toISOString(),
    };
    this.users.set(id, newUser);
    return newUser;
  }

  // --- Donors ---
  getAllDonors(): DonorProfile[] {
    return Array.from(this.donors.values());
  }

  getDonorById(id: string): DonorProfile | undefined {
    return this.donors.get(id);
  }

  getDonorByUserId(userId: string): DonorProfile | undefined {
    return Array.from(this.donors.values()).find((d) => d.userId === userId);
  }

  createOrUpdateDonor(donor: DonorProfile): DonorProfile {
    this.donors.set(donor.id, donor);
    return donor;
  }

  toggleDonorAvailability(donorId: string, isAvailable: boolean): DonorProfile | undefined {
    const donor = this.donors.get(donorId);
    if (!donor) return undefined;
    donor.isAvailable = isAvailable;
    this.donors.set(donorId, donor);

    this.logAudit({
      actor: donor.name,
      action: 'AVAILABILITY_CHANGED',
      details: `Donor toggled status to ${isAvailable ? 'AVAILABLE (On Call)' : 'OFFLINE (Temporarily unavailable)'}`,
      severity: 'info',
    });
    return donor;
  }

  // --- Blood Banks ---
  getAllBloodBanks(): BloodBank[] {
    return Array.from(this.bloodBanks.values());
  }

  getBloodBankById(id: string): BloodBank | undefined {
    return this.bloodBanks.get(id);
  }

  updateBloodBankInventory(
    bankId: string,
    updates: { bloodGroup?: BloodGroup; units?: number; plateletUnits?: number; plasmaUnits?: number }
  ): BloodBank | undefined {
    const bank = this.bloodBanks.get(bankId);
    if (!bank) return undefined;

    if (updates.bloodGroup && typeof updates.units === 'number') {
      bank.inventory[updates.bloodGroup] = Math.max(0, updates.units);
    }
    if (typeof updates.plateletUnits === 'number') {
      bank.plateletUnits = Math.max(0, updates.plateletUnits);
    }
    if (typeof updates.plasmaUnits === 'number') {
      bank.plasmaUnits = Math.max(0, updates.plasmaUnits);
    }

    bank.lastInventoryAudit = new Date().toISOString();
    this.bloodBanks.set(bankId, bank);

    this.logAudit({
      actor: bank.name,
      action: 'INVENTORY_AUDIT_UPDATED',
      details: `Updated stock levels. Group ${updates.bloodGroup || 'General'}: ${updates.units ?? bank.plateletUnits} units.`,
      severity: 'info',
    });
    return bank;
  }

  // --- Blood Requests ---
  getAllRequests(): BloodRequest[] {
    return Array.from(this.requests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getRequestById(id: string): BloodRequest | undefined {
    return this.requests.get(id);
  }

  createBloodRequest(reqData: Omit<BloodRequest, 'id' | 'createdAt' | 'matchedDonorCount' | 'responses'>): BloodRequest {
    const id = 'req-' + Date.now().toString().slice(-6);
    // Find compatible donors
    const compatibleGroups = getCompatibleDonorGroups(reqData.bloodGroup, reqData.component);
    const matchedDonors = Array.from(this.donors.values()).filter(
      (d) => d.isAvailable && compatibleGroups.includes(d.bloodGroup)
    );

    const newRequest: BloodRequest = {
      ...reqData,
      id,
      matchedDonorCount: matchedDonors.length,
      responses: [],
      createdAt: new Date().toISOString(),
    };

    this.requests.set(id, newRequest);

    // Notify matching donors
    matchedDonors.forEach((donor) => {
      const userNotifs = this.notifications.get(donor.userId) || [];
      userNotifs.unshift({
        id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 4),
        recipientUserId: donor.userId,
        title: `🚨 EMERGENCY BROADCAST: ${reqData.bloodGroup} Needed`,
        message: `Patient ${reqData.patientName} at ${reqData.hospitalName} requires ${reqData.unitsRequired} units of ${reqData.component}.`,
        type: 'emergency',
        isRead: false,
        timestamp: new Date().toISOString(),
      });
      this.notifications.set(donor.userId, userNotifs);
    });

    this.logAudit({
      actor: reqData.recipientName,
      action: 'NEW_BLOOD_REQUEST',
      details: `Created ${reqData.urgency} request for ${reqData.unitsRequired} units of ${reqData.bloodGroup} at ${reqData.hospitalName}. Dispatched alerts to ${matchedDonors.length} matching donors.`,
      severity: reqData.urgency === 'CRITICAL' ? 'critical' : 'warning',
    });

    return newRequest;
  }

  respondToRequest(
    requestId: string,
    donor: { id: string; name: string; bloodGroup: BloodGroup; phone: string; etaMinutes?: number }
  ): BloodRequest | undefined {
    const req = this.requests.get(requestId);
    if (!req) return undefined;

    const existingIdx = req.responses.findIndex((r) => r.donorId === donor.id);
    const responseItem: DonorResponse = {
      id: 'resp-' + Date.now(),
      donorId: donor.id,
      donorName: donor.name,
      bloodGroup: donor.bloodGroup,
      status: 'EN_ROUTE',
      responseTime: new Date().toISOString(),
      etaMinutes: donor.etaMinutes || 20,
      phone: donor.phone,
    };

    if (existingIdx >= 0) {
      req.responses[existingIdx] = responseItem;
    } else {
      req.responses.push(responseItem);
    }

    if (req.status === 'OPEN') {
      req.status = 'MATCHED';
    }

    this.requests.set(requestId, req);

    this.logAudit({
      actor: donor.name,
      action: 'DONOR_DISPATCH_EN_ROUTE',
      details: `Donor responded to request ${requestId}. Status: En route (ETA ~${donor.etaMinutes || 20}m).`,
      severity: 'info',
    });

    return req;
  }

  updateRequestStatus(requestId: string, status: BloodRequest['status']): BloodRequest | undefined {
    const req = this.requests.get(requestId);
    if (!req) return undefined;
    req.status = status;
    if (status === 'FULFILLED') {
      req.fulfilledAt = new Date().toISOString();
    }
    this.requests.set(requestId, req);

    this.logAudit({
      actor: 'System / Coordinator',
      action: 'REQUEST_STATUS_UPDATED',
      details: `Request ${requestId} status transitioned to ${status}.`,
      severity: status === 'FULFILLED' ? 'info' : 'warning',
    });

    return req;
  }

  // --- Proximity Search Functions ---
  findNearbyDonors(
    lat: number,
    lng: number,
    radiusKm = 25,
    bloodGroupFilter?: BloodGroup,
    component: BloodComponent = 'Whole Blood'
  ) {
    const all = Array.from(this.donors.values());
    const compatibleGroups = bloodGroupFilter
      ? getCompatibleDonorGroups(bloodGroupFilter, component)
      : undefined;

    return all
      .map((donor) => {
        const distanceKm = calculateHaversineDistanceKm(lat, lng, donor.lat, donor.lng);
        return {
          ...donor,
          distanceKm,
          isCompatible: compatibleGroups ? compatibleGroups.includes(donor.bloodGroup) : true,
        };
      })
      .filter((d) => {
        if (radiusKm && d.distanceKm > radiusKm) return false;
        if (compatibleGroups && !d.isCompatible) return false;
        return true;
      })
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  findNearbyBloodBanks(lat: number, lng: number, radiusKm = 50, bloodGroupFilter?: BloodGroup) {
    const all = Array.from(this.bloodBanks.values());
    return all
      .map((bank) => {
        const distanceKm = calculateHaversineDistanceKm(lat, lng, bank.lat, bank.lng);
        const groupUnits = bloodGroupFilter ? bank.inventory[bloodGroupFilter] || 0 : 0;
        return {
          ...bank,
          distanceKm,
          filteredGroupUnits: groupUnits,
          hasStock: bloodGroupFilter ? groupUnits > 0 : true,
        };
      })
      .filter((b) => (radiusKm ? b.distanceKm <= radiusKm : true))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // --- Notifications & Audit ---
  getNotificationsForUser(userId: string): NotificationItem[] {
    return this.notifications.get(userId) || [];
  }

  markNotificationRead(userId: string, notificationId: string) {
    const list = this.notifications.get(userId) || [];
    const item = list.find((n) => n.id === notificationId);
    if (item) item.isRead = true;
    this.notifications.set(userId, list);
  }

  getAuditLogs(limit = 30): AuditLog[] {
    return this.auditLogs.slice(0, limit);
  }

  logAudit(log: Omit<AuditLog, 'id' | 'timestamp'>) {
    this.auditLogs.unshift({
      ...log,
      id: 'log-' + Date.now(),
      timestamp: new Date().toISOString(),
    });
    if (this.auditLogs.length > 200) {
      this.auditLogs.pop();
    }
  }

  // Aggregate stats
  getPlatformStats() {
    const requests = Array.from(this.requests.values());
    const donors = Array.from(this.donors.values());
    const banks = Array.from(this.bloodBanks.values());

    let totalBankUnits = 0;
    banks.forEach((b) => {
      Object.values(b.inventory).forEach((count) => (totalBankUnits += count));
    });

    const activeRequests = requests.filter((r) => r.status === 'OPEN' || r.status === 'MATCHED').length;
    const fulfilledRequests = requests.filter((r) => r.status === 'FULFILLED').length;
    const availableDonors = donors.filter((d) => d.isAvailable).length;

    return {
      activeRequests,
      fulfilledRequests,
      livesSavedEstimate: fulfilledRequests * 3 + 248, // 1 unit saves up to 3 lives
      availableDonors,
      totalRegisteredDonors: donors.length,
      certifiedBloodBanks: banks.length,
      totalInventoryUnits: totalBankUnits,
      emergencyAverageResponseMinutes: 14,
    };
  }
}

export const bloodStore = new BloodStore();
