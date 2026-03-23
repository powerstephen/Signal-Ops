import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getBestCustomers } from '@/lib/data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST() {
  try {
    const best = getBestCustomers()

    const bestProfile = best.slice(0, 15).map(c => ({
      company: c.company,
      industry: c.industry,
      employees: c.employees,
      stage: c.stage,
      country: c.country,
      ltv: c.ltv,
      months_active: c.months_active,
      expanded: c.expanded,
      support_tickets: c.support_tickets,
      time_to_value_days: c.time_to_value_days,
      nps: c.nps,
    }))

    const prompt = `You are a revenue intelligence analyst helping a B2B SaaS company find net-new prospects.

Based on these best customers (highest LTV, retained, expanded, low support cost):
${JSON.stringify(bestProfile, null, 2)}

Generate 8 realistic net-new prospect companies that:
1. Closely match the profile of the best customers above
2. Are showing active buying signals right now
3. Have not been contacted before (net-new)

Use real-sounding but fictional company names. Make the signals and reasons specific and believable.

Return ONLY valid JSON array:
[
  {
    "company": "Company Name",
    "industry": "Industry",
    "employees": "45-60",
    "stage": "Series A",
    "country": "USA",
    "contact_name": "First Last",
    "contact_title": "VP Sales",
    "icp_match_score": 88,
    "active_signals": ["Hired 3 SDRs in last 45 days", "Series A announced $8M", "New VP Sales hired 6 weeks ago"],
    "why_now": "Building outbound motion from scratch after Series A — exact moment your product is most valuable",
    "lookalike_reason": "Matches profile of your top 5 customers: SaaS, Series A, 40-60 employees, outbound-first growth motion"
  }
]

Only return the JSON array. Be specific with signals — use realistic details.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2500,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text
    const cleaned = text.replace(/```json|```/g, '').trim()
    const prospects = JSON.parse(cleaned)

    return NextResponse.json({ prospects })
  } catch (error) {
    console.error('Prospect generation error:', error)
    return NextResponse.json({ error: 'Generation failed' }, { status: 500 })
  }
}
