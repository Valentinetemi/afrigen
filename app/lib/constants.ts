export const DOMAINS = [
  {
    id: "healthcare",
    name: "Healthcare",
    icon: "🏥",
    color: "#ef4444",
    light: "#fee2e2",
    description: "Patient records, disease data, clinical trials",
    examples: [
      "1000 malaria patient records from Kano State, Nigeria",
      "500 diabetes patients from Nairobi, Kenya",
      "2000 maternal health records from Accra, Ghana",
      "800 HIV/AIDS patient data from Johannesburg, South Africa",
    ],
  },
  {
    id: "finance",
    name: "Finance",
    icon: "💰",
    color: "#f59e0b",
    light: "#fef3c7",
    description: "Mobile money, transactions, fraud detection",
    examples: [
      "10000 M-Pesa transactions from Nairobi, Kenya",
      "5000 fraud cases from Lagos mobile banking",
      "3000 microfinance loan records from Ghana",
      "8000 airtime transfer records across West Africa",
    ],
  },
  {
    id: "agriculture",
    name: "Agriculture",
    icon: "🌾",
    color: "#16a34a",
    light: "#dcfce7",
    description: "Crop yields, weather, soil, market prices",
    examples: [
      "5000 maize yield records from Zambia",
      "3000 cassava disease detection records from Nigeria",
      "2000 coffee farm data from Ethiopia",
      "4000 market price records from East Africa",
    ],
  },
];

export const COUNTRIES = [
  { code: "NG", name: "Nigeria", flag: "🇳🇬", continent: "West Africa" },
  { code: "KE", name: "Kenya", flag: "🇰🇪", continent: "East Africa" },
  { code: "GH", name: "Ghana", flag: "🇬🇭", continent: "West Africa" },
  { code: "ZA", name: "South Africa", flag: "🇿🇦", continent: "Southern Africa" },
  { code: "ET", name: "Ethiopia", flag: "🇪🇹", continent: "East Africa" },
  { code: "TZ", name: "Tanzania", flag: "🇹🇿", continent: "East Africa" },
  { code: "EG", name: "Egypt", flag: "🇪🇬", continent: "North Africa" },
  { code: "SN", name: "Senegal", flag: "🇸🇳", continent: "West Africa" },
  { code: "RW", name: "Rwanda", flag: "🇷🇼", continent: "East Africa" },
  { code: "CI", name: "Côte d'Ivoire", flag: "🇨🇮", continent: "West Africa" },
  { code: "CM", name: "Cameroon", flag: "🇨🇲", continent: "Central Africa" },
  { code: "ZM", name: "Zambia", flag: "🇿🇲", continent: "Southern Africa" },
  { code: "UG", name: "Uganda", flag: "🇺🇬", continent: "East Africa" },
  { code: "MA", name: "Morocco", flag: "🇲🇦", continent: "North Africa" },
  { code: "MZ", name: "Mozambique", flag: "🇲🇿", continent: "Southern Africa" },
];

export const ROW_OPTIONS = [100, 500, 1000, 5000, 10000, 50000];

export const FORMATS = ["CSV", "JSON", "JSONL"];

export function buildPrompt(
  prompt: string,
  domain: string,
  country: string,
  rows: number,
  format: string
): string {
  const domainContext: Record<string, string> = {
    healthcare: `Use realistic African names, local hospital names, regional diseases, local medication brands, and healthcare terminology relevant to ${country}. Include fields like: patient_id, full_name, age, gender, state/region, hospital, diagnosis, symptoms, treatment, outcome, date.`,
    finance: `Use realistic African names, local bank/fintech names (like M-Pesa, Flutterwave, GTBank, Mpesa, MTN Mobile Money), local currency amounts, and transaction patterns relevant to ${country}. Include fields like: transaction_id, sender_name, receiver_name, amount, currency, channel, status, timestamp, location.`,
    agriculture: `Use realistic African farm names, local crop varieties, regional weather patterns, local market names, and agricultural terminology relevant to ${country}. Include fields like: farm_id, farmer_name, location, crop_type, variety, area_hectares, yield_kg, rainfall_mm, soil_type, season, market_price.`,
  };

  return `You are AfriGen, an AI that generates statistically accurate, culturally authentic synthetic datasets for Africa.

Generate exactly ${rows} rows of synthetic data based on this request: "${prompt}"

Domain: ${domain}
Country: ${country}
Format: ${format}

Context instructions:
${domainContext[domain] || domainContext.healthcare}

CRITICAL RULES:
1. Generate ONLY the data — no explanations, no markdown, no backticks
2. First line must be the header row (for CSV) or the first JSON object
3. Use realistic ${country} names, places, and context
4. Make the data statistically realistic and varied
5. For CSV: use comma-separated values, header on first line
6. For JSON: output a JSON array of objects
7. For JSONL: one JSON object per line
8. Include some realistic variation — not all "healthy" or all "fraud" — mix outcomes
9. Generate all ${rows} rows — do not stop early
10. Never add commentary before or after the data

Start generating now:`;
}
