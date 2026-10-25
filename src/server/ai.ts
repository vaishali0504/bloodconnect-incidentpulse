import { GoogleGenAI } from '@google/genai';
import { bloodStore } from './store.js';
import { RED_CELL_COMPATIBILITY, PLASMA_COMPATIBILITY } from './compatibility.js';

const apiKey = process.env.GEMINI_API_KEY || '';
const hasValidKey = Boolean(apiKey && apiKey !== 'MY_GEMINI_API_KEY');

const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

const callWithTimeout = async <T>(promise: Promise<T>, timeoutMs = 8000): Promise<T> => {
  let timer: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error('AI generation timed out')), timeoutMs);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
};

export async function askBloodAssistant(userMessage: string, context?: { userRole?: string; userBloodGroup?: string }) {
  const stats = bloodStore.getPlatformStats();
  const activeRequests = bloodStore.getAllRequests().slice(0, 3);
  const bloodBanks = bloodStore.getAllBloodBanks().slice(0, 3);

  const systemContext = `You are "PulseAI", the clinical and emergency triage assistant for BloodConnect, an AI-powered blood bank and voluntary donor coordination platform.
You assist recipients, donors, and clinical coordinators with:
1. Blood Compatibility Guidance (e.g. O- is universal red cell donor; AB+ is universal recipient; Plasma rules are reversed).
2. Donor Eligibility Check (minimum 110 lbs/50 kg, age 16-65+, 56-day gap between whole blood donations, 7 days for platelets, travel & medication rules).
3. Emergency Blood Request Prioritization (guiding recipients to submit urgency level, component type, and hospital location).
4. Preparation before and after donation (hydration, iron-rich meals, resting 15 min, avoiding intense exertion).

CURRENT PLATFORM CONTEXT:
- Active Urgent Requests in Network: ${activeRequests.length} (e.g. ${activeRequests.map((r) => `${r.patientName} needing ${r.bloodGroup} at ${r.hospitalName} [${r.urgency}]`).join('; ')})
- Certified Blood Banks in Network: ${bloodBanks.map((b) => `${b.name} (${b.phone})`).join(', ')}
- Current Live Network Stats: ${stats.availableDonors} donors ready on-call, ${stats.totalInventoryUnits} blood units monitored.
${context?.userRole ? `- User Persona: ${context.userRole}` : ''}
${context?.userBloodGroup ? `- User Blood Group: ${context.userBloodGroup}` : ''}

SAFETY AND TONE:
- Professional, reassuring, clear, and actionable.
- Always clarify that you provide triage decision support and coordination guidance, and in life-threatening scenarios users must also notify attending emergency hospital teams immediately.
- Format responses cleanly with brief bullet points or quick checklists where appropriate.`;

  if (hasValidKey) {
    try {
      const response = await callWithTimeout(
        ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: userMessage,
          config: {
            systemInstruction: systemContext,
            temperature: 0.2,
          },
        }),
        8000
      );

      const reply = response.text?.trim();
      if (reply) {
        return {
          reply,
          engine: 'gemini-2.5-flash',
          grounded: true,
        };
      }
    } catch (err: any) {
      console.warn('Gemini API call failed, falling back to local deterministic clinical advisor:', err.message);
    }
  }

  // High-fidelity Clinical Rule-Based Fallback
  const q = userMessage.toLowerCase();
  let fallbackReply = '';

  if (q.includes('o-') || q.includes('universal') || q.includes('compatible') || q.includes('who can donate')) {
    fallbackReply = `### 🩸 Blood Compatibility Guidelines
- **O- Negative**: Universal red cell donor. Can donate to **all blood types** (A+, A-, B+, B-, AB+, AB-, O+, O-). However, an O- recipient can **only receive O-**.
- **AB+ Positive**: Universal recipient for red blood cells. Can receive blood from any group, but can only donate to AB+.
- **Plasma Exception**: The reverse is true for plasma! AB plasma is universal and can be safely given to any patient.
- **Platelets**: Match type where possible; O, A, and B platelets can often be cross-matched under clinical guidance.

*Would you like to initiate an urgent request or view nearby compatible donors?*`;
  } else if (q.includes('eligible') || q.includes('can i donate') || q.includes('requirement') || q.includes('criteria')) {
    fallbackReply = `### ✅ Voluntary Donor Eligibility Criteria
To safely donate blood through BloodConnect:
1. **Age**: 17+ years (or 16 with signed guardian consent in some jurisdictions).
2. **Weight**: At least 110 lbs (50 kg).
3. **Donation Intervals**:
   - Whole Blood: Minimum **56 days** (8 weeks) between donations.
   - Platelets: Minimum **7 days** (up to 24 times/year).
   - Double Red Cells: Minimum **112 days** (16 weeks).
4. **General Health**: Feeling well with no active fever, cold, or flu symptoms today.
5. **Hemoglobin**: Minimum 12.5 g/dL for females, 13.0 g/dL for males (verified by quick fingerstick at the bank).

*You can toggle your availability in the Donor Dashboard to receive instant alerts!*`;
  } else if (q.includes('prepare') || q.includes('eat') || q.includes('after') || q.includes('dizzy')) {
    fallbackReply = `### 💧 How to Prepare for Donation
**Before Your Appointment:**
- Drink an extra 16-24 oz (500-750 ml) of water or electrolyte fluid.
- Eat a substantial, healthy meal low in fatty foods (fat affects screening tests).
- Ensure a good night's rest (7-8 hours).

**After Donating:**
- Relax in the recovery lounge for 15 minutes and enjoy light snacks and juice.
- Keep the bandage on for at least 4 hours.
- Avoid heavy lifting or intense aerobic workouts for the rest of the day.`;
  } else {
    fallbackReply = `Hello! I am **PulseAI**, your clinical coordinator assistant on **BloodConnect**.

I can assist you with:
- **Instant Compatibility Check**: Find out who can donate to whom for Whole Blood, Platelets, or Plasma.
- **Donor Eligibility**: Review health screening requirements, waiting periods, and medical deferrals.
- **Emergency Dispatch Triage**: Learn how our live algorithm matches recipients with certified blood banks and verified donors within 5-50 km.
- **Locating Blood Banks**: Ask me for centers like UCSF Medical Center, Vitalant, Zuckerberg SF General, or Stanford Outreach.

How can I help you save a life today?`;
  }

  return {
    reply: fallbackReply,
    engine: 'pulse-clinical-advisor',
    grounded: false,
  };
}
