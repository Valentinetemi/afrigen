import { createGoogleGenerativeAI } from '@ai-sdk/google'
import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'

const google = createGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY!,
})

const model = google('gemini-2.0-flash')

export async function POST(req: NextRequest) {
  const { csvContent, analysisReport } = await req.json()

  const { text } = await generateText({
    model,
    prompt: `You are a data cleaning expert specializing in African datasets.

Here is the quality analysis of this dataset:
${analysisReport}

Here is the raw CSV data:
${csvContent}

Clean this dataset by:
1. Fill missing values intelligently based on context and African regional patterns
2. Remove duplicate rows
3. Standardize inconsistent values (e.g. "lagos", "LAGOS", "Lagos" → "Lagos")
4. Fix data type inconsistencies
5. Replace PII columns (names, phone numbers, emails) with realistic synthetic African equivalents

Return ONLY the cleaned CSV data with headers. No explanations, no markdown, no backticks.`,
    temperature: 0.3,
  })

  return NextResponse.json({ cleanedCsv: text })
}