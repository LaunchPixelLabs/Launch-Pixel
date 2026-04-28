import React from 'react';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

export default function DashboardPage() {
  const stats = [
    { label: 'Total Applications', value: '1,248', icon: <FileText size={20} />, change: '+12%', color: 'from-blue-500 to-cyan-400' },
    { label: 'Shortlisted', value: '42', icon: <CheckCircle size={20} />, change: '+5%', color: 'from-emerald-400 to-teal-500' },
    { label: 'Pending Review', value: '312', icon: <Clock size={20} />, change: '-2%', color: 'from-orange-400 to-amber-500' },
    { label: 'Total Employees', value: '84', icon: <Users size={20} />, change: '+1', color: 'from-violet-500 to-fuchsia-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Welcome Back</h1>
        <p className="text-gray-400">Here's an overview of your recruitment pipeline.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div key={i} className="relative group rounded-2xl bg-white/[0.02] border border-white/5 p-6 overflow-hidden backdrop-blur-md">
            {/* Glow effect */}
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${stat.color} opacity-20 blur-3xl group-hover:opacity-40 transition-opacity`}></div>
            
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 text-white">
                {stat.icon}
              </div>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-400">{stat.label}</div>
                <div className={`text-xs font-semibold ${stat.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>
                  {stat.change}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2 rounded-2xl bg-white/[0.02] border border-white/5 p-6 backdrop-blur-md">
          <h2 className="text-xl font-bold text-white mb-6">Recent Applications</h2>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="flex items-center justify-between p-4 rounded-xl bg-white/5 hover:bg-white/10 transition-colors border border-white/5">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                    JS
                  </div>
                  <div>
                    <div className="text-white font-medium">Jane Smith</div>
                    <div className="text-sm text-gray-400">Frontend Developer</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    Pending
                  </span>
                  <div className="text-sm text-gray-500">2h ago</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-gradient-to-br from-indigo-900/40 to-violet-900/40 border border-indigo-500/20 p-6 backdrop-blur-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 blur-[80px]"></div>
          <h2 className="text-xl font-bold text-white mb-6 relative z-10">Quick Actions</h2>
          <div className="space-y-3 relative z-10">
            <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left text-white">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-300">
                <Users size={16} />
              </div>
              <span className="font-medium">Review Candidates</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left text-white">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center text-violet-300">
                <FileText size={16} />
              </div>
              <span className="font-medium">Export Reports</span>
            </button>
            <button className="w-full flex items-center gap-3 p-4 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-left text-white">
              <div className="w-8 h-8 rounded-lg bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-300">
                <CheckCircle size={16} />
              </div>
              <span className="font-medium">Schedule Interviews</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
