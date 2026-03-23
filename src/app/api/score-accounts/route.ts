import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAllCustomers, getBestCustomers } from '@/lib/data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST() {
  try {
    const all = getAllCustomers()
    const best = getBestCustomers()

    // Build best customer profile snapshot
    const bestProfile = {
      avg_employees: Math.round(best.reduce((s, c) => s + c.employees, 0) / best.length),
      top_industries: [...new Set(best.slice(0, 10).map(c => c.industry))].slice(0, 5),
      top_stages: [...new Set(best.map(c => c.stage))],
      avg_ltv: Math.round(best.reduce((s, c) => s + c.ltv, 0) / best.length),
    }

    // Dormant = last contact > 5 months ago OR churned/lost
    const now = new Date()
    const dormant = all.filter(c => {
      const last = new Date(c.last_contact)
      const monthsAgo = (now.getTime() - last.getTime()) / (1000 * 60 * 60 * 24 * 30)
      return monthsAgo > 5 || c.status === 'churned' || c.status === 'lost' || c.deal_stage === 'closed_lost'
    }).slice(0, 25)

    const prompt = `You are a revenue intelligence analyst. Score these dormant/inactive accounts against the ICP profile.

BEST CUSTOMER PROFILE:
${JSON.stringify(bestProfile, null, 2)}

DORMANT ACCOUNTS TO SCORE:
${JSON.stringify(dormant.map(c => ({
  id: c.id,
  company: c.company,
  industry: c.industry,
  employees: c.employees,
  stage: c.stage,
  country: c.country,
  contact: c.contact,
  title: c.title,
  status: c.status,
  last_contact: c.last_contact,
  ltv: c.ltv,
  deal_value: c.deal_value,
  support_tickets: c.support_tickets,
})), null, 2)}

For each account, assign an ICP match score 0-100 based on similarity to the best customer profile.
Consider: industry match, company size, stage, previous LTV, support history.

Return ONLY valid JSON array:
[
  {
    "id": "c001",
    "icp_score": 85,
    "score_label": "Strong fit",
    "score_reasons": ["Reason 1", "Reason 2", "Reason 3"],
    "why_now": "One sentence signal-based reason to re-engage right now"
  }
]

Only return the JSON array, no other text.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text
    const cleaned = text.replace(/```json|```/g, '').trim()
    const scores: Array<{ id: string; icp_score: number; score_label: string; score_reasons: string[]; why_now: string }> = JSON.parse(cleaned)

    // Merge scores back into full account data
    const scored = scores
      .map(score => {
        const account = dormant.find(d => d.id === score.id)
        if (!account) return null
        return { ...account, ...score }
      })
      .filter(Boolean)
      .sort((a: any, b: any) => b.icp_score - a.icp_score)

    return NextResponse.json({ accounts: scored })
  } catch (error) {
    console.error('Scoring error:', error)
    return NextResponse.json({ error: 'Scoring failed' }, { status: 500 })
  }
}
