import React from "react";
import Link from "next/link";
import { LayoutDashboard, Users, Video, Settings, LogOut, Terminal, Activity } from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 flex overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/20 via-gray-950 to-gray-950"></div>
        <div className="absolute -top-[500px] -right-[500px] w-[1000px] h-[1000px] rounded-full bg-violet-600/10 blur-[120px]"></div>
        <div className="absolute -bottom-[500px] -left-[500px] w-[1000px] h-[1000px] rounded-full bg-blue-600/10 blur-[120px]"></div>
      </div>

      {/* Sidebar */}
      <aside className="relative z-10 w-72 flex-shrink-0 border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col transition-all">
        <div className="h-20 flex items-center px-8 border-b border-white/10">
          <Link href="/admin" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 group-hover:shadow-indigo-500/40 transition-shadow">
              <Terminal className="text-white w-5 h-5" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-violet-400">
              LP Admin
            </span>
          </Link>
        </div>

        <nav className="flex-1 py-8 px-4 flex flex-col gap-2 overflow-y-auto">
          <NavItem href="/admin/dashboard" icon={<LayoutDashboard size={18} />} label="Dashboard" />
          <NavItem href="/admin/candidates" icon={<Users size={18} />} label="Candidates" />
          <NavItem href="/admin/interviews" icon={<Video size={18} />} label="Interviews" />
          <NavItem href="/admin/activity" icon={<Activity size={18} />} label="Activity Log" />
        </nav>

        <div className="p-4 mt-auto border-t border-white/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <LogOut size={18} />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex flex-col overflow-hidden">
        {/* Top Navbar */}
        <header className="h-20 border-b border-white/10 bg-black/20 backdrop-blur-md flex items-center justify-end px-8">
          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
              <Settings size={20} />
            </button>
            <div className="w-px h-6 bg-white/10"></div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-sm font-medium text-white">Admin User</div>
                <div className="text-xs text-indigo-400">Superadmin</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-violet-500 to-fuchsia-500 border-2 border-gray-950"></div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  // Basic NavItem setup, in a real app would use usePathname to highlight active state
  return (
    <Link
      href={href}
      className="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400 hover:text-white hover:bg-indigo-500/10 hover:border-indigo-500/20 border border-transparent transition-all group"
    >
      <div className="text-gray-500 group-hover:text-indigo-400 transition-colors">
        {icon}
      </div>
      <span className="font-medium">{label}</span>
    </Link>
  );
}
