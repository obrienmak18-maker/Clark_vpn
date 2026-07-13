import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { LayoutDashboard, Server, Users, Settings } from 'lucide-react';
import Dashboard from './pages/Dashboard';
import ServerManager from './pages/ServerManager';

function App() {
  return (
    <BrowserRouter>
      <div className="flex h-screen bg-dark-900 text-white">
        {/* Sidebar */}
        <div className="w-64 bg-dark-800 p-4 border-r border-dark-700">
          <div className="text-2xl font-bold text-white mb-8 tracking-wider">
            CLARK<span className="text-primary-500">VPN</span>
          </div>
          <nav className="space-y-2">
            <Link to="/" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-700">
              <LayoutDashboard size={20} className="text-primary-500" />
              <span>Dashboard</span>
            </Link>
            <Link to="/servers" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-700">
              <Server size={20} className="text-primary-500" />
              <span>Servers</span>
            </Link>
            <Link to="/users" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-700">
              <Users size={20} className="text-slate-400" />
              <span className="text-slate-400">Users (WIP)</span>
            </Link>
            <Link to="/settings" className="flex items-center space-x-3 p-3 rounded-lg hover:bg-dark-700">
              <Settings size={20} className="text-slate-400" />
              <span className="text-slate-400">Settings</span>
            </Link>
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/servers" element={<ServerManager />} />
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
