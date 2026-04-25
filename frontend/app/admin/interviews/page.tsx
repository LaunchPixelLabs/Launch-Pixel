"use client";

import React, { useState } from 'react';
import { Video, Copy, ExternalLink, Calendar as CalendarIcon, Clock, Users } from 'lucide-react';

export default function InterviewsPage() {
  const [meetLink, setMeetLink] = useState('https://meet.google.com/abc-defg-hij');

  const upcomingInterviews = [
    { id: 1, candidate: 'Sarah Williams', role: 'UX Designer', time: '10:00 AM', date: 'Today' },
    { id: 2, candidate: 'Emma Davis', role: 'Product Manager', time: '02:30 PM', date: 'Today' },
    { id: 3, candidate: 'James Miller', role: 'Frontend Engineer', time: '11:00 AM', date: 'Tomorrow' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Interviews</h1>
        <p className="text-gray-400">Manage the common interview room and upcoming slots.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Common Room Settings */}
        <div className="lg:col-span-1 border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl p-6 h-fit">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4">
            <Video size={24} />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Common Interview Room</h2>
          <p className="text-sm text-gray-400 mb-6">This link is sent to candidates for all scheduled interviews.</p>
          
          <div className="space-y-2">
            <label className="text-xs font-semibold tracking-wider text-gray-500 uppercase">Google Meet Link</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={meetLink}
                onChange={(e) => setMeetLink(e.target.value)}
                className="flex-1 px-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-indigo-500/50 transition-colors"
              />
              <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors">
                Save
              </button>
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-colors">
              <Copy size={16} />
              <span>Copy Link</span>
            </button>
            <a href={meetLink} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 rounded-xl transition-colors">
              <ExternalLink size={16} />
              <span>Join Room</span>
            </a>
          </div>
        </div>

        {/* Upcoming Interviews */}
        <div className="lg:col-span-2 border border-white/10 bg-black/40 backdrop-blur-md rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Upcoming Interviews</h2>
            <button className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-sm text-white transition-colors">
              View Calendar
            </button>
          </div>

          <div className="space-y-4">
            {upcomingInterviews.map((interview) => (
              <div key={interview.id} className="p-5 border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors rounded-xl flex items-center justify-between group">
                <div className="flex items-center gap-5">
                  <div className="flex flex-col items-center justify-center w-16 h-16 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-xs text-gray-500 font-medium uppercase">{interview.date}</span>
                    <span className="text-sm font-bold text-indigo-400 mt-1">{interview.time}</span>
                  </div>
                  <div>
                    <div className="text-lg font-bold text-white mb-1 flex items-center gap-2">
                      <Users size={16} className="text-gray-500" />
                      {interview.candidate}
                    </div>
                    <div className="text-sm text-gray-400">{interview.role}</div>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/20 rounded-lg text-sm transition-colors">
                    Reschedule
                  </button>
                </div>
              </div>
            ))}
          </div>

          {upcomingInterviews.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 text-gray-500">
                <CalendarIcon size={24} />
              </div>
              <h3 className="text-lg font-medium text-white mb-2">No upcoming interviews</h3>
              <p className="text-gray-400 mb-6">You have a clear schedule for the next few days.</p>
              <button className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-xl text-white font-medium transition-colors">
                Schedule Interview
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
