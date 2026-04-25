"use client";

import React, { useState } from 'react';
import { Search, Filter, MoreVertical, Eye, Check, X, Calendar } from 'lucide-react';

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([
    { id: 1, name: 'Alex Johnson', role: 'Frontend Engineer', status: 'Pending', date: '2026-04-12', resume: '#' },
    { id: 2, name: 'Sarah Williams', role: 'UX Designer', status: 'Fit', date: '2026-04-13', resume: '#' },
    { id: 3, name: 'Michael Chen', role: 'Backend Dev', status: 'Unfit', date: '2026-04-10', resume: '#' },
    { id: 4, name: 'Emma Davis', role: 'Product Manager', status: 'Interviewing', date: '2026-04-14', resume: '#' },
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Candidates</h1>
          <p className="text-gray-400">Manage applicants, view resumes, and schedule interviews.</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Search candidates..." 
              className="pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500/50 transition-colors w-64"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white hover:bg-white/5 transition-colors">
            <Filter w={16} />
            <span>Filter</span>
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 backdrop-blur-md overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/10 bg-white/[0.02]">
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Candidate</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Applied Role</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Date</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400">Status</th>
              <th className="px-6 py-4 text-sm font-medium text-gray-400 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((c) => (
              <tr key={c.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500/20 to-violet-500/20 flex items-center justify-center text-indigo-300 font-medium text-sm">
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div className="font-medium text-white">{c.name}</div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">{c.role}</td>
                <td className="px-6 py-4 text-gray-400 text-sm">{c.date}</td>
                <td className="px-6 py-4">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                    c.status === 'Fit' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    c.status === 'Unfit' ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                    c.status === 'Interviewing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {c.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-white bg-black/40 hover:bg-white/10 rounded-lg transition-colors tooltip" title="View Resume">
                      <Eye size={16} />
                    </button>
                    <button className="p-2 text-emerald-400 hover:text-white bg-emerald-500/10 hover:bg-emerald-500/20 rounded-lg transition-colors tooltip" title="Mark Fit">
                      <Check size={16} />
                    </button>
                    <button className="p-2 text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-colors tooltip" title="Mark Unfit">
                      <X size={16} />
                    </button>
                    <button className="p-2 text-indigo-400 hover:text-white bg-indigo-500/10 hover:bg-indigo-500/20 rounded-lg transition-colors tooltip" title="Schedule Interview">
                      <Calendar size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
