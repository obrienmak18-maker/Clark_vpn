import React, { useState, useEffect } from 'react';
import { Server, Edit2, Trash2, Power, Plus } from 'lucide-react';
import axios from 'axios';

// Mock data to start
const mockServers = [
  { id: '1', name: 'Paris - Premium', location: 'France', flag: '🇫🇷', ipAddress: '10.0.0.1', port: 443, protocol: 'DARK_TUNNEL', load: 25, isActive: true, isUnderMaintenance: false },
  { id: '2', name: 'Frankfurt - Gaming', location: 'Germany', flag: '🇩🇪', ipAddress: '10.0.0.2', port: 443, protocol: 'HTTP_INJECTOR', load: 40, isActive: true, isUnderMaintenance: true },
];

export default function ServerManager() {
  const [servers, setServers] = useState(mockServers);

  const handleToggleActive = (id: string) => {
    setServers(servers.map(s => s.id === id ? { ...s, isActive: !s.isActive } : s));
  };

  const handleToggleMaintenance = (id: string) => {
    setServers(servers.map(s => s.id === id ? { ...s, isUnderMaintenance: !s.isUnderMaintenance } : s));
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-white">Server Management</h1>
        <button className="bg-primary-600 hover:bg-primary-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
          <Plus size={20} />
          <span>Add Server</span>
        </button>
      </div>
      
      <div className="bg-dark-800 rounded-xl border border-dark-700 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-dark-900 border-b border-dark-700 text-slate-400">
            <tr>
              <th className="p-4 font-semibold">Server</th>
              <th className="p-4 font-semibold">IP / Port</th>
              <th className="p-4 font-semibold">Protocol</th>
              <th className="p-4 font-semibold">Status</th>
              <th className="p-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-dark-700">
            {servers.map((server) => (
              <tr key={server.id} className="hover:bg-dark-700/50">
                <td className="p-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{server.flag}</span>
                    <div>
                      <div className="text-white font-medium">{server.name}</div>
                      <div className="text-slate-400 text-sm">{server.location}</div>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-white">{server.ipAddress}</div>
                  <div className="text-slate-400 text-sm">Port {server.port}</div>
                </td>
                <td className="p-4">
                  <span className="bg-dark-900 text-primary-500 px-3 py-1 rounded-full text-xs border border-primary-500/30">
                    {server.protocol}
                  </span>
                </td>
                <td className="p-4">
                  <div className="flex flex-col space-y-2">
                    <span className={`inline-flex w-fit items-center px-2 py-1 rounded text-xs font-medium ${server.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {server.isActive ? 'Active' : 'Disabled'}
                    </span>
                    {server.isUnderMaintenance && (
                      <span className="inline-flex w-fit items-center px-2 py-1 rounded text-xs font-medium bg-yellow-500/10 text-yellow-500">
                        Maintenance
                      </span>
                    )}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center justify-end space-x-3">
                    <button 
                      onClick={() => handleToggleActive(server.id)}
                      className={`p-2 rounded-lg ${server.isActive ? 'text-red-400 hover:bg-red-400/10' : 'text-green-400 hover:bg-green-400/10'}`}
                      title={server.isActive ? 'Disable Server' : 'Enable Server'}
                    >
                      <Power size={18} />
                    </button>
                    <button className="p-2 text-slate-400 hover:text-white hover:bg-dark-700 rounded-lg">
                      <Edit2 size={18} />
                    </button>
                    <button className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg">
                      <Trash2 size={18} />
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
