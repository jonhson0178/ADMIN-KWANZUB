
import React from 'react';
import { CogIcon, ShieldCheckIcon, BanknotesIcon } from './Icons';

const Settings: React.FC = () => {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white mb-4">Settings</h2>
        <p className="text-kwanzub-light">Manage your marketplace settings and configurations.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Commission Settings */}
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <BanknotesIcon className="h-8 w-8 text-kwanzub-primary" />
            <h3 className="ml-3 text-xl font-semibold text-white">Commissions</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="global-commission" className="block text-sm font-medium text-kwanzub-light">Global Commission Rate (%)</label>
              <input type="number" id="global-commission" defaultValue="15" className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" />
            </div>
            <button className="w-full px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover transition-colors">
              Save Commission Settings
            </button>
          </div>
        </div>

        {/* Security Settings */}
        <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <ShieldCheckIcon className="h-8 w-8 text-kwanzub-primary" />
            <h3 className="ml-3 text-xl font-semibold text-white">Security</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label htmlFor="ip-allowlist" className="block text-sm font-medium text-kwanzub-light">IP Allowlist (one per line)</label>
              <textarea id="ip-allowlist" rows={3} className="mt-1 w-full px-3 py-2 bg-gray-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-kwanzub-primary" placeholder="203.0.113.55&#10;198.51.100.0/24"></textarea>
            </div>
             <button className="w-full px-4 py-2 bg-kwanzub-primary text-white rounded-md hover:bg-kwanzub-primary-hover transition-colors">
              Update Security Settings
            </button>
          </div>
        </div>

        {/* General Settings */}
         <div className="bg-kwanzub-dark rounded-lg shadow-lg p-6">
          <div className="flex items-center mb-4">
            <CogIcon className="h-8 w-8 text-kwanzub-primary" />
            <h3 className="ml-3 text-xl font-semibold text-white">General</h3>
          </div>
          <p className="text-kwanzub-light">
            General application settings will be managed here. (e.g., maintenance mode, notification preferences, etc.)
          </p>
        </div>

      </div>
    </div>
  );
};

export default Settings;
