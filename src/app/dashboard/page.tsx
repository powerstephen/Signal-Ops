'use client'
import { useState } from 'react'
import { Target, TrendingUp, RefreshCw, Users, BarChart2, Zap, Database } from 'lucide-react'
import ICPProfile from '../components/ICPProfile'
import RecoverTab from '../components/RecoverTab'
import GenerateTab from '../components/GenerateTab'
import DataCentre from '../components/DataCentre'

type Tab = 'icp' | 'recover' | 'generate' | 'data'

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<Tab>('icp')

  const tabs = [
    { id: 'data' as Tab,     label: 'Data Centre',    icon: Database,  desc: 'Connect your data sources' },
    { id: 'icp' as Tab,      label: 'ICP Profile',    icon: Target,    desc: 'Analyse your best customers' },
    { id: 'recover' as Tab,  label: 'Recover',        icon: RefreshCw, desc: 'Reactivate dormant accounts' },
    { id: 'generate' as Tab, label: 'Generate',       icon: Zap,       desc: 'Find net-new lookalikes' },
  ]

  return (
    <div className="min-h-screen bg-navy-900 text-white">
      {/* Top nav */}
      <nav className="border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="SignalOps" className="h-7 brightness-0 invert" />
          <span className="text-xs text-slate-500 border border-slate-700 px-2 py-0.5 rounded">Demo</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500">100 accounts loaded</span>
          <div className="w-2 h-2 rounded-full bg-teal-500" />
        </div>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-white mb-1">Revenue Intelligence</h1>
          <p className="text-slate-400 text-sm">Precision targeting, powered by your own revenue data.</p>
        </div>

        {/* Tab nav */}
        <div className="flex gap-2 mb-8 border-b border-slate-800 pb-0">
          {tabs.map(tab => {
            const Icon = tab.icon
            const active = activeTab === tab.id
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors -mb-px ${
                  active
                    ? 'border-teal-500 text-teal-400'
                    : 'border-transparent text-slate-500 hover:text-slate-300'
                }`}
              >
                <Icon size={15} />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'data'     && <DataCentre />}
        {activeTab === 'icp'      && <ICPProfile />}
        {activeTab === 'recover'  && <RecoverTab />}
        {activeTab === 'generate' && <GenerateTab />}
      </div>
    </div>
  )
}
