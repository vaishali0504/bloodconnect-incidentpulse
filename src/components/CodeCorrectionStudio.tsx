import React, { useState } from 'react';
import { 
  Code2, 
  Sparkles, 
  Check, 
  Copy, 
  RefreshCw, 
  ShieldCheck, 
  AlertCircle, 
  FileCode, 
  ArrowRight,
  Terminal,
  Zap,
  BookOpen
} from 'lucide-react';
import { CodeCorrectionResponse } from '../types';

interface CodeCorrectionStudioProps {
  initialCode?: string;
  initialError?: string;
  vendorName?: string;
}

export const CodeCorrectionStudio: React.FC<CodeCorrectionStudioProps> = ({
  initialCode,
  initialError,
  vendorName = 'Auth0',
}) => {
  const [selectedVendor, setSelectedVendor] = useState<string>(vendorName);
  const [framework, setFramework] = useState<string>('TypeScript / Node.js');
  
  const [inputCode, setInputCode] = useState<string>(
    initialCode ||
`// ❌ Fragile integration: synchronous blocking network call without timeout
import jwksClient from 'jwks-rsa';
import jwt from 'jsonwebtoken';

export async function verifyUserToken(token: string) {
  const client = jwksClient({
    jwksUri: 'https://dev-tenant.auth0.com/.well-known/jwks.json',
  });
  
  // Hangs indefinitely when Auth0 experiences elevated latency:
  const key = await client.getSigningKey();
  const signingKey = key.getPublicKey();
  
  return jwt.verify(token, signingKey);
}`
  );

  const [errorLog, setErrorLog] = useState<string>(
    initialError ||
`Error: ETIMEDOUT connect 104.16.248.249:443 (api.auth0.com)
  at TCPConnectWrap.afterConnect [as oncomplete] (net.js:1146:16)
  at JwksClient.getSigningKey (node_modules/jwks-rsa/lib/JwksClient.js:112:14)
HTTP 504 Gateway Timeout while verifying bearer token.`
  );

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [correctionResult, setCorrectionResult] = useState<CodeCorrectionResponse | null>(null);
  const [activeCodeView, setActiveCodeView] = useState<'after' | 'before' | 'diff'>('after');
  const [copied, setCopied] = useState<boolean>(false);

  // Pre-load common brittle integration templates
  const loadTemplate = (type: 'auth0' | 'stripe' | 'aws' | 'openai') => {
    if (type === 'auth0') {
      setSelectedVendor('Auth0');
      setInputCode(`// Auth0 verification without circuit breaker or cache
export async function authenticateRequest(req: Request) {
  const token = req.headers.authorization?.split(' ')[1];
  const client = jwksClient({ jwksUri: 'https://tenant.auth0.com/.well-known/jwks.json' });
  const key = await client.getSigningKey();
  return jwt.verify(token, key.getPublicKey());
}`);
      setErrorLog(`JsonWebTokenError: jwt signature is invalid (Key rotation unannounced header change)\nJWKS retrieval timed out at 3000ms`);
    } else if (type === 'stripe') {
      setSelectedVendor('Stripe');
      setInputCode(`// Stripe Payment Intent without Idempotency or Retry Jitter
export async function processCheckout(userId: string, amount: number) {
  const payment = await stripe.paymentIntents.create({
    amount,
    currency: 'usd',
    customer: userId,
    confirm: true
  });
  return payment;
}`);
      setErrorLog(`StripeConnectionError: An error occurred with our connection to Stripe. Request timed out after 5000ms.`);
    } else if (type === 'aws') {
      setSelectedVendor('AWS S3');
      setInputCode(`// AWS S3 upload without exponential backoff
export async function uploadAsset(buffer: Buffer, key: string) {
  return await s3.putObject({
    Bucket: 'production-assets',
    Key: key,
    Body: buffer
  }).promise();
}`);
      setErrorLog(`SlowDown: Please reduce your request rate. HTTP 503 Slow Down from s3.us-east-1.amazonaws.com`);
    } else if (type === 'openai') {
      setSelectedVendor('OpenAI');
      setInputCode(`// OpenAI streaming call without client abort
export async function generateSummary(text: string) {
  const completion = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [{ role: "user", content: text }],
    stream: true,
  });
  return completion;
}`);
      setErrorLog(`RateLimitError: 429 Too Many Requests - Client hung after 15000ms`);
    }
  };

  const handleCorrectCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/gemini/correct-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: inputCode,
          errorLog,
          vendor: selectedVendor,
          framework,
        }),
      });
      const data = await response.json();
      if (data.success && data.data) {
        setCorrectionResult(data.data);
      }
    } catch (err) {
      console.error('Code correction error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (correctionResult?.correctedCode) {
      navigator.clipboard.writeText(correctionResult.correctedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Studio Banner */}
      <div className="clay-card p-6 md:p-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#6B8E23]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[#6B8E23]">
                Gemini-Powered Code Diagnostic & Resilience Studio
              </span>
            </div>
            <h2 className="text-2xl font-bold text-[#1F271B] tracking-tight">
              Instant Cloud Integration Code Correction
            </h2>
            <p className="text-sm text-[#4A5D29]">
              Turn brittle, blocking API integrations into fault-tolerant, circuit-broken architectures that survive vendor downtime.
            </p>
          </div>

          {/* Quick Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-[#556B2F]">Sample Presets:</span>
            <button
              onClick={() => loadTemplate('auth0')}
              className="clay-btn px-3 py-1.5 text-xs text-[#3B4D14]"
            >
              Auth0 JWKS
            </button>
            <button
              onClick={() => loadTemplate('stripe')}
              className="clay-btn px-3 py-1.5 text-xs text-[#3B4D14]"
            >
              Stripe 504
            </button>
            <button
              onClick={() => loadTemplate('aws')}
              className="clay-btn px-3 py-1.5 text-xs text-[#3B4D14]"
            >
              AWS S3 SlowDown
            </button>
            <button
              onClick={() => loadTemplate('openai')}
              className="clay-btn px-3 py-1.5 text-xs text-[#3B4D14]"
            >
              OpenAI 429
            </button>
          </div>
        </div>
      </div>

      {/* Editor Grid: Inputs on Left, Output & Diff on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code & Log Input */}
        <div className="lg:col-span-5 space-y-4">
          <div className="clay-card p-5 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#556B2F] flex items-center gap-1.5">
                <FileCode className="w-4 h-4" />
                Integration Code Under Test
              </span>
              <div className="flex items-center gap-2">
                <select
                  value={selectedVendor}
                  onChange={(e) => setSelectedVendor(e.target.value)}
                  className="bg-[#EDF0E6] text-xs font-semibold px-2.5 py-1 rounded-lg border border-[#556B2F]/20 text-[#3B4D14] focus:outline-none"
                >
                  <option value="Auth0">Auth0</option>
                  <option value="Stripe">Stripe</option>
                  <option value="AWS S3">AWS S3</option>
                  <option value="OpenAI">OpenAI</option>
                  <option value="Cloudflare">Cloudflare</option>
                  <option value="Supabase">Supabase</option>
                </select>
              </div>
            </div>

            {/* Code Input Area */}
            <div className="neu-inset-dark p-3 rounded-xl font-mono text-xs">
              <textarea
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                rows={10}
                className="w-full bg-transparent text-[#E2E8F0] focus:outline-none resize-none leading-relaxed"
                placeholder="// Paste breaking integration code here..."
              />
            </div>

            {/* Error Log Input Area */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold uppercase tracking-wider text-[#991B1B] flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" />
                Production Error Log / Stacktrace
              </span>
              <div className="neu-inset p-3 rounded-xl font-mono text-[11px] text-[#7F1D1D] bg-[#FDF2F2]">
                <textarea
                  value={errorLog}
                  onChange={(e) => setErrorLog(e.target.value)}
                  rows={4}
                  className="w-full bg-transparent focus:outline-none resize-none leading-relaxed"
                  placeholder="Paste error logs or timeout messages..."
                />
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleCorrectCode}
              disabled={isLoading}
              className="w-full clay-btn-olive py-3 text-sm font-bold gap-2 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Gemini Reasoning & Patching Code...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Generate Resilient Code Correction</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Corrected Code & Architecture Patches */}
        <div className="lg:col-span-7 space-y-4">
          <div className="clay-card p-5 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#EDF0E6] pb-3">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#556B2F]" />
                <h3 className="text-sm font-bold text-[#1F271B] uppercase tracking-wider">
                  Corrected Production Code
                </h3>
              </div>

              {correctionResult && (
                <div className="flex items-center gap-2">
                  <div className="bg-[#EDF0E6] p-0.5 rounded-lg flex text-xs font-semibold">
                    <button
                      onClick={() => setActiveCodeView('after')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        activeCodeView === 'after' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29]'
                      }`}
                    >
                      Corrected Code
                    </button>
                    <button
                      onClick={() => setActiveCodeView('before')}
                      className={`px-3 py-1 rounded-md transition-all ${
                        activeCodeView === 'before' ? 'bg-[#556B2F] text-white shadow-xs' : 'text-[#4A5D29]'
                      }`}
                    >
                      Original
                    </button>
                  </div>

                  <button
                    onClick={handleCopy}
                    className="clay-btn px-3 py-1 text-xs gap-1.5 text-[#3B4D14]"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-[#556B2F]" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Code'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* Code Output Display */}
            <div className="neu-inset-dark p-4 rounded-xl font-mono text-xs overflow-x-auto min-h-[280px]">
              {correctionResult ? (
                <pre className="text-[#A7C957] leading-relaxed whitespace-pre font-mono">
                  {activeCodeView === 'after'
                    ? correctionResult.correctedCode
                    : activeCodeView === 'before'
                    ? inputCode
                    : `// Diff Summary:\n${correctionResult.explanation}\n\n// Corrected Code:\n${correctionResult.correctedCode}`}
                </pre>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-[#64748B] text-center space-y-3">
                  <Code2 className="w-10 h-10 text-[#556B2F]/40" />
                  <p className="text-xs">
                    Click <strong className="text-[#A7C957]">Generate Resilient Code Correction</strong> to analyze the integration with Gemini API and inject circuit breakers, strict timeouts, and fallback caching.
                  </p>
                </div>
              )}
            </div>

            {/* Analysis & Architecture Patches */}
            {correctionResult && (
              <div className="space-y-4 pt-2">
                {/* Explanation */}
                <div className="bg-[#FAFBF7] border border-[#556B2F]/20 p-4 rounded-xl text-xs space-y-1.5">
                  <div className="font-bold text-[#556B2F] uppercase tracking-wider flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5" />
                    Root Diagnostic & Fault Isolation
                  </div>
                  <p className="text-[#2F3E1A] leading-relaxed">
                    {correctionResult.explanation}
                  </p>
                  {correctionResult.vendorDocUpdate && (
                    <div className="mt-2 text-[11px] text-[#87A93A] font-semibold bg-[#EBF1E3] px-2.5 py-1 rounded-md">
                      Vendor SDK Warning: {correctionResult.vendorDocUpdate}
                    </div>
                  )}
                </div>

                {/* Specific Applied Patches List */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#556B2F]">
                    Applied Reliability Patterns ({correctionResult.patches.length}):
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {correctionResult.patches.map((patch, idx) => (
                      <div
                        key={idx}
                        className="bg-white p-2.5 rounded-xl border border-[#EDF0E6] text-xs flex items-start gap-2 shadow-xs"
                      >
                        <Zap className="w-3.5 h-3.5 text-[#556B2F] shrink-0 mt-0.5" />
                        <span className="text-[#1F271B] font-medium">{patch}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
