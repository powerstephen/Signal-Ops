import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { getAllCustomers, getBestCustomers } from '@/lib/data'

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function POST() {
  try {
    const all = getAllCustomers()
    const best = getBestCustomers()

    const bestSummary = best.slice(0, 20).map(c => ({
      company: c.company,
      industry: c.industry,
      employees: c.employees,
      stage: c.stage,
      country: c.country,
      ltv: c.ltv,
      mrr: c.mrr,
      months_active: c.months_active,
      expanded: c.expanded,
      support_tickets: c.support_tickets,
      ticket_type: c.ticket_type,
      time_to_value_days: c.time_to_value_days,
      champion_active: c.champion_active,
      nps: c.nps,
    }))

    const churnedSummary = all.filter(c => c.status === 'churned').map(c => ({
      company: c.company,
      industry: c.industry,
      employees: c.employees,
      stage: c.stage,
      support_tickets: c.support_tickets,
      months_active: c.months_active,
      time_to_value_days: c.time_to_value_days,
    }))

    const prompt = `You are a revenue intelligence analyst. Analyse these SaaS customer records and build an ICP profile.

BEST CUSTOMERS (highest LTV, retained, expanded, low support cost):
${JSON.stringify(bestSummary, null, 2)}

CHURNED CUSTOMERS (for comparison — what to avoid):
${JSON.stringify(churnedSummary, null, 2)}

Return ONLY valid JSON with this exact structure:
{
  "summary": "2-3 sentence plain English description of the ideal customer profile based on actual data patterns",
  "top_industries": ["industry1", "industry2", "industry3"],
  "typical_size": "e.g. 40-90 employees",
  "typical_stage": "e.g. Series A to Series B",
  "avg_ltv": "e.g. $65,000",
  "key_traits": ["trait1", "trait2", "trait3", "trait4", "trait5"],
  "red_flags": ["flag1", "flag2", "flag3", "flag4"],
  "best_count": ${best.length}
}

Base everything on the actual data patterns. Be specific and data-driven.`

    const message = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }],
    })

    const text = (message.content[0] as { type: string; text: string }).text
    const cleaned = text.replace(/```json|```/g, '').trim()
    const result = JSON.parse(cleaned)

    return NextResponse.json(result)
  } catch (error) {
    console.error('ICP analysis error:', error)
    return NextResponse.json({ error: 'Analysis failed' }, { status: 500 })
  }
}
