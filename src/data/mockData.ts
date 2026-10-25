import { IncidentState, Vendor, AgentSignal } from '../types';

export const INITIAL_VENDORS: Vendor[] = [
  {
    id: 'auth0',
    name: 'Auth0 / Okta',
    category: 'Identity & Auth',
    statusUrl: 'https://status.auth0.com',
    status: 'degraded',
    latencyMs: 1420,
    errorRate: 14.8,
    iconName: 'ShieldCheck',
    lastChecked: 'Just now',
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    category: 'Billing & Checkout',
    statusUrl: 'https://status.stripe.com',
    status: 'degraded',
    latencyMs: 2850,
    errorRate: 22.4,
    iconName: 'CreditCard',
    lastChecked: '2m ago',
  },
  {
    id: 'aws',
    name: 'AWS Cloud (S3/RDS)',
    category: 'Cloud Infrastructure',
    statusUrl: 'https://health.aws.amazon.com',
    status: 'operational',
    latencyMs: 42,
    errorRate: 0.05,
    iconName: 'Cloud',
    lastChecked: '1m ago',
  },
  {
    id: 'openai',
    name: 'OpenAI API',
    category: 'AI Model Inference',
    statusUrl: 'https://status.openai.com',
    status: 'operational',
    latencyMs: 820,
    errorRate: 0.8,
    iconName: 'Cpu',
    lastChecked: '3m ago',
  },
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge',
    category: 'CDN & DNS',
    statusUrl: 'https://www.cloudflarestatus.com',
    status: 'operational',
    latencyMs: 18,
    errorRate: 0.01,
    iconName: 'Globe',
    lastChecked: '4m ago',
  },
  {
    id: 'supabase',
    name: 'Supabase DB',
    category: 'Database & Realtime',
    statusUrl: 'https://status.supabase.com',
    status: 'operational',
    latencyMs: 65,
    errorRate: 0.02,
    iconName: 'Database',
    lastChecked: 'Just now',
  },
];

export const INITIAL_INCIDENT: IncidentState = {
  id: 'inc-auth0-01',
  title: 'Auth0 Token Signature Verification Spike',
  affectedService: 'Auth0 / Okta',
  status: 'Verdict Reached',
  confidenceScore: 86,
  verdict: 'VENDOR_CLOUD',
  blameEntity: 'Vendor Issue: Auth0',
  headline: 'Vendor issue: Auth0 (86% Confidence)',
  startedAt: '14:02 UTC',
  duration: '18 minutes',
  topFinding: 'Third-party API latency & JWKS Endpoint Hang',
  rootCause: 'Auth0 upstream JWKS key retrieval endpoint experienced a 4x latency surge in US-East following an unannounced key rotation rollout. Client authentication calls timed out at the 3000ms threshold.',
  evidenceSnapshot: {
    latencySpike: 'High',
    errorRate: 'High',
    trafficSurge: 'Medium',
    deployChanges: 'Low',
  },
  dominoPath: [
    'Client Initiates Login / Session Refresh',
    'Backend Node Server calls Auth0 /oauth/jwks.json',
    'Auth0 TLS Connection Handshake hangs >3000ms',
    'Worker Threads block -> Domino latency to database pool',
  ],
  evidenceList: [
    'TinyFish Agent verified Auth0 status degradation in US-East region at 14:03 UTC.',
    'Zero code deployments in repository within the last 5 hours (Git SHA b82e71 untouched).',
    'App server CPU at 24%, Memory at 38% — internal capacity completely normal.',
    'Community signal agent detected 42 developer reports on X/Downdetector for Auth0.',
  ],
  circuitBreakerAdvice: 'Activate local cached public key fallback and trip the circuit breaker on /auth/verify until Auth0 latency normalizes.',
  codeSnippet: {
    beforeSnippet: `// ❌ Fragile blocking verification (crashes whole app on vendor latency)
export async function authenticateRequest(req: Request) {
  const token = req.headers.authorization?.split(' ')[1];
  // Blocking remote call on every single API request:
  const client = jwksClient({ jwksUri: 'https://your-tenant.auth0.com/.well-known/jwks.json' });
  const key = await client.getSigningKey(); // Hangs >4000ms when Auth0 lags!
  return jwt.verify(token, key.getPublicKey());
}`,
    afterSnippet: `//  IncidentPulse AI Resilient Patch (Cached + Circuit Breaker + Timeout)
import { CircuitBreaker } from './circuitBreaker';

const authBreaker = new CircuitBreaker({ timeoutMs: 2000, maxFailures: 3 });
const memoryKeyCache = new Map<string, string>();

export async function authenticateRequest(req: Request) {
  const token = req.headers.authorization?.split(' ')[1];
  
  return authBreaker.execute(async () => {
    // 1. Strict AbortController timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 2000);
    try {
      const key = await fetchSigningKeyWithTimeout(token, controller.signal);
      memoryKeyCache.set('last_valid_key', key);
      return jwt.verify(token, key);
    } finally {
      clearTimeout(timeout);
    }
  }, {
    // 2. Graceful offline fallback during vendor cloud outage
    fallback: () => {
      const staleKey = memoryKeyCache.get('last_valid_key');
      if (staleKey) return jwt.verify(token, staleKey, { ignoreExpiration: false });
      throw new Error('Auth0 degraded, please retry shortly.');
    }
  });
}`,
    explanation: 'Original code executed a synchronous, un-cached network request to Auth0 on every incoming API route without a timeout. The corrected code incorporates an in-memory key cache, an AbortController timeout, and a Circuit Breaker with stale key fallback.',
    diffSummary: 'Added Circuit Breaker, 2s AbortController timeout, and local stale JWKS key fallback.',
  },
};

export const PRESET_SCENARIOS: { name: string; description: string; vendor: string; incident: IncidentState }[] = [
  {
    name: 'Auth0 Token Rejection (Slide 3 & 8)',
    description: 'Sudden 401s & JWKS endpoint latency spike after vendor key rotation.',
    vendor: 'Auth0',
    incident: INITIAL_INCIDENT,
  },
  {
    name: 'Stripe 504 Gateway Domino (Slide 7)',
    description: 'Friday 2 AM checkout failure: Stripe API latency causes worker thread pileup.',
    vendor: 'Stripe',
    incident: {
      id: 'inc-stripe-02',
      title: 'Stripe Payment Gateway 504 Timeout & Checkout Domino',
      affectedService: 'Stripe Payments',
      status: 'Verdict Reached',
      confidenceScore: 92,
      verdict: 'VENDOR_CLOUD',
      blameEntity: 'Vendor Issue: Stripe',
      headline: 'Vendor issue: Stripe (92% Confidence)',
      startedAt: '02:04 UTC',
      duration: '9 minutes',
      topFinding: 'Domino Effect detected across payments and worker queues',
      rootCause: 'Stripe /v1/payment_intents confirmation endpoint in US-East experienced elevated P99 latency exceeding 4800ms. Node.js event loop starved waiting for checkout completions.',
      evidenceSnapshot: {
        latencySpike: 'High',
        errorRate: 'High',
        trafficSurge: 'High',
        deployChanges: 'Low',
      },
      dominoPath: [
        'User Submits Cart Checkout ($89.00)',
        'Server calls Stripe API without idempotency timeout',
        'Stripe hangs for 5+ seconds -> Connection pool fills up',
        'Subsequent app requests queue up -> Whole web app stalls',
      ],
      evidenceList: [
        'TinyFish Status Agent parsed Stripe status page: Elevated Latency on API confirmed at 02:02 UTC.',
        '100% of errors are HTTP 504 or ETIMEDOUT targeting api.stripe.com.',
        'Internal database and cache queries responding in <12ms.',
        'Verdict delivered in 10 seconds vs industry average 3 hours manual debugging.',
      ],
      circuitBreakerAdvice: 'Enable queued background payment processing with idempotency keys and return an optimistic "Processing" state to customers.',
      codeSnippet: {
        beforeSnippet: `// ❌ Fragile sync payment handler
export async function checkoutCart(cartId: string, paymentMethod: string) {
  // Awaiting Stripe without timeout or idempotency key:
  const charge = await stripe.paymentIntents.create({
    amount: cart.total,
    currency: 'usd',
    payment_method: paymentMethod,
    confirm: true,
  });
  return charge;
}`,
        afterSnippet: `//  IncidentPulse AI Resilient Patch
export async function checkoutCart(cartId: string, paymentMethod: string) {
  return await stripe.paymentIntents.create(
    {
      amount: cart.total,
      currency: 'usd',
      payment_method: paymentMethod,
      confirm: true,
    },
    {
      // Resilient options
      idempotencyKey: 'cart_' + cartId + '_' + Date.now().toString(36),
      maxNetworkRetries: 2,
      timeout: 3500, // strictly reject hangs
    }
  );
}`,
        explanation: 'Enforces idempotency keys so network retries do not double-bill customers, sets strict 3.5s timeout, and enables automatic SDK retries with jitter.',
        diffSummary: 'Added idempotency key, maxNetworkRetries, and 3500ms timeout.',
      },
    },
  },
  {
    name: 'Your Code: Unhandled Rejection & Sync Loop',
    description: 'Internal developer mistake: synchronous file read & memory leak under load.',
    vendor: 'Internal Backend',
    incident: {
      id: 'inc-code-03',
      title: 'Memory Leak & Sync Event Loop Blocking in Handler',
      affectedService: 'Internal App Code',
      status: 'Verdict Reached',
      confidenceScore: 95,
      verdict: 'YOUR_CODE',
      blameEntity: 'Your Code: src/services/export.ts:42',
      headline: 'Code issue: Your Code (95% Confidence)',
      startedAt: '10:15 UTC',
      duration: '4 minutes',
      topFinding: 'All external vendor status pages 100% Operational',
      rootCause: 'Recent commit (SHA 4f91a) introduced synchronous fs.readFileSync within an express route handler, blocking the single-threaded Node.js event loop during CSV exports.',
      evidenceSnapshot: {
        latencySpike: 'High',
        errorRate: 'High',
        trafficSurge: 'Low',
        deployChanges: 'High',
      },
      dominoPath: [
        'Deploy executed 12 minutes ago (commit 4f91a)',
        'User requests large data export',
        'fs.readFileSync blocks Node.js event loop for 1800ms',
        'Health checks fail -> Container restarts repeatedly',
      ],
      evidenceList: [
        'All 7 vendor status pages (Stripe, Auth0, AWS, Cloudflare) report 100% green operational status.',
        'Direct correlation with Git commit timestamp (deployed 12m ago).',
        'Event loop lag metric spiked from 2ms to 2400ms.',
        'Diagnostic trace pinpoints exact line in src/services/export.ts:42.',
      ],
      circuitBreakerAdvice: 'Roll back deploy 4f91a or immediately switch synchronous file operations to streams.',
      codeSnippet: {
        beforeSnippet: `// ❌ Buggy code blocking event loop
app.get('/api/export', (req, res) => {
  // Blocks the entire Node.js single thread for all users:
  const rawData = fs.readFileSync('/tmp/large_dataset.json', 'utf-8');
  res.json(JSON.parse(rawData));
});`,
        afterSnippet: `//  IncidentPulse AI Corrected Code (Async Streaming)
import { createReadStream } from 'fs';
import { pipeline } from 'stream/promises';

app.get('/api/export', async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  const stream = createReadStream('/tmp/large_dataset.json');
  // Non-blocking streaming pipeline
  await pipeline(stream, res);
});`,
        explanation: 'Synchronous fs.readFileSync halts the entire server process. Moving to streams allows Node.js to serve other concurrent traffic without blocking.',
        diffSummary: 'Replaced fs.readFileSync with non-blocking stream pipeline.',
      },
    },
  },
];

export const TEAM_MEMBERS = [
  {
    name: 'Chandan Kaushik',
    role: 'Team Leader',
    avatar: 'CK',
    focus: 'Architecture & Full-Stack Engine',
    color: 'from-[#556B2F] to-[#3B4D14]',
  },
  {
    name: 'Kavya Khurana',
    role: 'Core Engineer',
    avatar: 'KK',
    focus: 'TinyFish Scraper Agents & Data Normalizer',
    color: 'from-[#6B8E23] to-[#556B2F]',
  },
  {
    name: 'Vaishali Chauhan',
    role: 'Core Engineer',
    avatar: 'VC',
    focus: 'Correlation Engine & Gemini LLM Reasoning',
    color: 'from-[#87A93A] to-[#6B8E23]',
  },
  {
    name: 'Shivangi Singh',
    role: 'Core Engineer',
    avatar: 'SS',
    focus: 'Claymorphic UI & 3D Telemetry Mesh',
    color: 'from-[#556B2F] to-[#455A24]',
  },
];

export const MATRIX_COMPARISON = [
  {
    feature: 'Vendor Status Ingestion',
    statusAggregators: true,
    apmTools: false,
    incidentPulse: true,
  },
  {
    feature: 'Your Real App Data & Logs',
    statusAggregators: false,
    apmTools: true,
    incidentPulse: true,
  },
  {
    feature: 'Automated Verdict (You vs Them)',
    statusAggregators: false,
    apmTools: false,
    incidentPulse: true,
  },
  {
    feature: 'Doc & API Changelog Warnings',
    statusAggregators: false,
    apmTools: false,
    incidentPulse: true,
  },
  {
    feature: 'Instant Resilient Code Correction',
    statusAggregators: false,
    apmTools: false,
    incidentPulse: true,
  },
  {
    feature: 'One-Click Stakeholder Incident Brief',
    statusAggregators: false,
    apmTools: false,
    incidentPulse: true,
  },
];
