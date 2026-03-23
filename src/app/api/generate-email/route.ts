import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST(req: Request) {
  try {
    const { account, type = 'recover' } = await req.json()

    const isProspect = type === 'prospect'

    const prompt = isProspect
      ? `You are a senior SDR at a B2B SaaS company. Write a short, personalised cold outreach email to a net-new prospect.

PROSPECT DETAILS:
Company: ${account.company}
Contact: ${account.contact_name}, ${account.contact_title}
Industry: ${account.industry}
Size: ${account.employees} employees
Stage: ${account.stage}
Country: ${account.country}

ACTIVE SIGNALS:
${account.active_signals?.join('\n')}

WHY NOW:
${account.why_now}

LOOKALIKE REASON:
${account.lookalike_reason}

Write a cold outreach email that:
- References 2-3 specific signals naturally (not robotically)
- Feels human and warm, not automated
- Is under 120 words in the body
- Has a soft CTA — a question or short call offer
- Does NOT mention "AI", "algorithm", "data analysis", or "your data"
- Does NOT use the phrase "I hope this email finds you well"

Return ONLY valid JSON:
{
  "subject": "Email subject line",
  "body": "Email body text with natural line breaks"
}`
      : `You are a senior SDR. Write a short re-engagement email to a dormant account.

ACCOUNT DETAILS:
Company: ${account.company}
Contact: ${account.contact}, ${account.title}
Industry: ${account.industry}
Size: ${account.employees} employees
Stage: ${account.stage}
Status: ${account.status}
Last contact: ${account.last_contact}
Previous LTV: $${account.ltv?.toLocaleString() ?? 'unknown'}

WHY SCORE HIGH:
${account.score_reasons?.join('\n')}

WHY NOW:
${account.why_now}

Write a re-engagement email that:
- Acknowledges the gap since last contact naturally
- References why now is a good moment to reconnect
- Is warm and human — not salesy
- Is under 110 words in the body  
- Ends with a simple, low-friction question
- Does NOT use "I hope this email finds you well" or "just checking in"

Return ONLY valid JSON:
{
  "subject": "Email subject line",
  "body": "Email body with natural line breaks"
}`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 600,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text
    const cleaned = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (error) {
    console.error('Email generation error:', error)
    return NextResponse.json({ error: 'Email generation failed' }, { status: 500 })
  }
}
