<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# BloodConnect & IncidentPulse AI

This workspace includes the BloodConnect donor platform and an IncidentPulse AI
demo for correlating application errors with third-party service signals.

## Run Locally

**Prerequisites:** Node.js and npm

1. Install dependencies with `npm install`.
2. Copy `.env.example` to `.env.local` and set `GEMINI_API_KEY` for
   Gemini-powered diagnosis, code correction, incident briefs, and grounded search.
   Set `VITE_GOOGLE_MAPS_API_KEY` to a browser key restricted to your site's
   HTTP referrers and only the Google Maps APIs this app needs. Never commit
   `.env.local` or put server-side secrets in `VITE_` variables.
3. Run `npm run dev` and open `http://localhost:3000`.

Open the **IncidentPulse AI** tab to enter incident logs, run the demo scenarios,
inspect vendor signals, view an evidence-backed verdict, generate a code
correction, or create an incident brief. The included TinyFish sweep feed is
demo data; connect a TinyFish provider to replace the simulated sweep results
with live vendor monitoring.

Use `npm run build` to create the production frontend bundle.

## Deploy to Vercel

1. Push this project to a GitHub repository and import it in the Vercel dashboard.
2. Vercel detects the Vite app and the catch-all Express API function. Use
   `npm run build` as the build command and `dist` as the output directory.
3. Add `GEMINI_API_KEY` and `VITE_GOOGLE_MAPS_API_KEY` in the Vercel project's
   Environment Variables, then redeploy. Restrict the Maps browser key by
   deployment-domain referrer and API; rotate any key that was previously
   committed or shared publicly.
