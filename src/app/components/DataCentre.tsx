'use client'
import { useState } from 'react'
import { CheckCircle, Plus, ExternalLink, Search, Upload, X } from 'lucide-react'

interface Integration {
  id: string
  name: string
  description: string
  category: string
  icon: string
  connected: boolean
  comingSoon?: boolean
}

const integrations: Integration[] = [
  // CRM
  { id: 'hubspot',     name: 'HubSpot',      category: 'CRM',          icon: '🟠', connected: false, description: 'Sync contacts, deals, and pipeline data with your HubSpot CRM automatically.' },
  { id: 'salesforce',  name: 'Salesforce',   category: 'CRM',          icon: '🔵', connected: false, description: 'Connect your Salesforce org to sync leads, opportunities, and custom objects.' },
  { id: 'attio',       name: 'Attio',        category: 'CRM',          icon: '🟣', connected: false, description: 'Powerful CRM integration to manage relationships and track deal flow in real-time.' },
  { id: 'pipedrive',   name: 'Pipedrive',    category: 'CRM',          icon: '🟢', connected: false, description: 'Pull deal stages, contact activity, and pipeline data from Pipedrive.' },
  // Billing
  { id: 'stripe',      name: 'Stripe',       category: 'Billing',      icon: '💳', connected: false, description: 'Connect Stripe to analyse real LTV, MRR, churn, and expansion revenue by customer.' },
  { id: 'chargebee',   name: 'Chargebee',    category: 'Billing',      icon: '📊', connected: false, description: 'Import subscription billing data to power your best-customer ICP profile.' },
  { id: 'paddle',      name: 'Paddle',       category: 'Billing',      icon: '🏓', connected: false, description: 'Sync Paddle billing events and revenue data for LTV analysis.', comingSoon: true },
  // CS
  { id: 'intercom',    name: 'Intercom',     category: 'CS',           icon: '💬', connected: false, description: 'Pull support ticket volume, type, and sentiment to identify high-maintenance accounts.' },
  { id: 'zendesk',     name: 'Zendesk',      category: 'CS',           icon: '🎫', connected: false, description: 'Import CS ticket history to surface which customers are truly profitable.' },
  { id: 'freshdesk',   name: 'Freshdesk',    category: 'CS',           icon: '🌿', connected: false, description: 'Connect Freshdesk to analyse support cost per customer.', comingSoon: true },
  // Spreadsheets
  { id: 'gsheets',     name: 'Google Sheets', category: 'Spreadsheets', icon: '📗', connected: true,  description: 'Import and export data directly from your Google Sheets spreadsheets.' },
  { id: 'airtable',    name: 'Airtable',     category: 'Spreadsheets', icon: '🟥', connected: false, description: 'Bi-directional sync with Airtable bases to keep records up to date everywhere.' },
  // Outreach
  { id: 'outreach',    name: 'Outreach',     category: 'Outreach',     icon: '📤', connected: false, description: 'Push scored accounts and generated emails directly to Outreach sequences.' },
  { id: 'salesloft',   name: 'Salesloft',    category: 'Outreach',     icon: '📨', connected: false, description: 'Send high-scoring accounts straight to Salesloft for immediate sequencing.' },
  { id: 'apollo',      name: 'Apollo',       category: 'Outreach',     icon: '🚀', connected: false, description: 'Export lookalike prospects directly to Apollo outreach campaigns.', comingSoon: true },
  // Signals
  { id: 'linkedin',    name: 'LinkedIn',     category: 'Signals',      icon: '🔗', connected: false, description: 'Monitor job changes, hiring signals, and company updates from LinkedIn.', comingSoon: true },
  { id: 'harmonic',    name: 'Harmonic',     category: 'Signals',      icon: '📡', connected: false, description: 'Pull funding, headcount, and hiring signal data via Harmonic API.', comingSoon: true },
  { id: 'bombora',     name: 'Bombora',      category: 'Signals',      icon: '🎯', connected: false, description: 'Layer intent signal data from Bombora to identify in-market accounts.', comingSoon: true },
]

const categories = ['All', 'CRM', 'Billing', 'CS', 'Spreadsheets', 'Outreach', 'Signals']

const categoryColors: Record<string, string> = {
  CRM:          'bg-blue-500/10 text-blue-400',
  Billing:      'bg-teal-500/10 text-teal-400',
  CS:           'bg-purple-500/10 text-purple-400',
  Spreadsheets: 'bg-green-500/10 text-green-400',
  Outreach:     'bg-amber-500/10 text-amber-400',
  Signals:      'bg-red-500/10 text-red-400',
}

export default function DataCentre() {
  const [connected, setConnected] = useState<Record<string, boolean>>(
    Object.fromEntries(integrations.map(i => [i.id, i.connected]))
  )
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<string | null>(null)

  const connectedCount = Object.values(connected).filter(Boolean).length

  const filtered = integrations.filter(i => {
    const matchCat = activeCategory === 'All' || i.category === activeCategory
    const matchSearch = i.name.toLowerCase().includes(search.toLowerCase()) ||
                        i.description.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  function toggle(id: string, comingSoon?: boolean) {
    if (comingSoon) return
    setConnected(prev => ({ ...prev, [id]: !prev[id] }))
  }

  return (
    <div>
      <div className="flex items-start justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Data Centre</h2>
          <p className="text-slate-400 text-sm">
            Connect the tools your team already uses.{' '}
            <span className="text-teal-400 font-medium">{connectedCount} of {integrations.length} integrations active.</span>
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 text-sm bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-4 py-2 rounded transition-colors"
        >
          <Upload size={14} /> Upload CSV
        </button>
      </div>

      {/* CSV upload modal */}
      {showUpload && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
          <div className="bg-navy-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">Upload CSV data</h3>
              <button onClick={() => setShowUpload(false)}><X size={18} className="text-slate-400 hover:text-white" /></button>
            </div>
            <p className="text-slate-400 text-sm mb-4">
              Export your CRM, billing, or CS data as a CSV and upload it here. SignalOps will parse and ingest it automatically.
            </p>
            <div
              className="border-2 border-dashed border-slate-700 rounded-lg p-8 text-center cursor-pointer hover:border-teal-500 transition-colors"
              onDragOver={e => e.preventDefault()}
              onDrop={e => {
                e.preventDefault()
                const file = e.dataTransfer.files[0]
                if (file) setUploadedFile(file.name)
              }}
              onClick={() => document.getElementById('csv-input')?.click()}
            >
              <Upload size={28} className="text-slate-500 mx-auto mb-2" />
              {uploadedFile ? (
                <p className="text-teal-400 font-medium">{uploadedFile} ready to import</p>
              ) : (
                <>
                  <p className="text-slate-400 text-sm">Drag and drop your CSV here</p>
                  <p className="text-slate-600 text-xs mt-1">or click to browse</p>
                </>
              )}
              <input
                id="csv-input"
                type="file"
                accept=".csv"
                className="hidden"
                onChange={e => { if (e.target.files?.[0]) setUploadedFile(e.target.files[0].name) }}
              />
            </div>
            <div className="mt-4 p-3 bg-navy-900 rounded-lg text-xs text-slate-500">
              <p className="font-medium text-slate-400 mb-1">Expected columns (CRM):</p>
              <p>company, industry, employees, stage, contact, title, deal_value, close_date, status, ltv, mrr</p>
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => setShowUpload(false)}
                className="flex-1 text-sm text-slate-400 hover:text-white border border-slate-700 py-2 rounded transition-colors"
              >Cancel</button>
              <button
                onClick={() => {
                  if (uploadedFile) {
                    setShowUpload(false)
                    setUploadedFile(null)
                  }
                }}
                disabled={!uploadedFile}
                className="flex-1 text-sm bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-white font-medium py-2 rounded transition-colors"
              >
                Import data →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Search + filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            placeholder="Search integrations..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-navy-800 border border-slate-700 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-teal-500 transition-colors"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat
                  ? 'bg-teal-500 text-white'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Integration grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(integration => {
          const isConnected = connected[integration.id]
          return (
            <div
              key={integration.id}
              className={`bg-navy-800 rounded-xl border p-4 flex flex-col transition-all ${
                isConnected ? 'border-teal-500/30' : 'border-slate-800'
              } ${integration.comingSoon ? 'opacity-60' : ''}`}
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 bg-slate-700 rounded-lg flex items-center justify-center text-xl">
                  {integration.icon}
                </div>
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${categoryColors[integration.category] ?? 'bg-slate-700 text-slate-400'}`}>
                  {integration.category}
                </span>
              </div>

              {/* Name + description */}
              <h3 className="font-semibold text-white text-sm mb-1">{integration.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed flex-1 mb-4">{integration.description}</p>

              {/* CTA */}
              {integration.comingSoon ? (
                <div className="text-xs text-slate-600 border border-slate-700 rounded-lg px-3 py-2 text-center">
                  Coming soon
                </div>
              ) : isConnected ? (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggle(integration.id)}
                    className="flex-1 flex items-center justify-center gap-1.5 text-xs font-medium text-teal-400 border border-teal-500/30 bg-teal-500/5 rounded-lg px-3 py-2 hover:bg-teal-500/10 transition-colors"
                  >
                    <CheckCircle size={13} /> Connected
                  </button>
                  <button className="border border-slate-700 rounded-lg p-2 text-slate-500 hover:text-white transition-colors">
                    <ExternalLink size={13} />
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => toggle(integration.id)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg px-3 py-2 transition-colors w-full"
                >
                  <Plus size={13} /> Connect
                </button>
              )}
            </div>
          )
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-slate-500">
          <p>No integrations found for "{search}"</p>
        </div>
      )}
    </div>
  )
}
