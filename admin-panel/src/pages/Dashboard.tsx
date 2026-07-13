import React, { useState, useEffect } from 'react';
import { Activity, Server, Users, ArrowUpRight, ArrowDownRight } from 'lucide-react';

export default function Dashboard() {
  // Mock stats for now
  const stats = [
    { title: 'Total Users', value: '1,245', icon: Users, change: '+12%' },
    { title: 'Active Connections', value: '432', icon: Activity, change: '+5%' },
    { title: 'Servers Online', value: '14/15', icon: Server, change: '0%' },
    { title: 'Bandwidth (24h)', value: '1.2 TB', icon: ArrowUpRight, change: '+15%' },
  ];

  return (
    <div>
      <h1 className="text-3xl font-bold mb-8 text-white">Dashboard Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="bg-dark-800 p-6 rounded-xl border border-dark-700">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-dark-900 rounded-lg">
                  <Icon size={24} className="text-primary-500" />
                </div>
                <span className="text-primary-500 text-sm font-semibold">{stat.change}</span>
              </div>
              <h3 className="text-slate-400 text-sm">{stat.title}</h3>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="bg-dark-800 p-6 rounded-xl border border-dark-700">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="text-slate-400">
          <p className="py-3 border-b border-dark-700">Admin started maintenance on server "Paris - Premium"</p>
          <p className="py-3 border-b border-dark-700">New server "Tokyo - Fast" added to the pool</p>
          <p className="py-3">User base grew by 12% this week</p>
        </div>
      </div>
    </div>
  );
}
