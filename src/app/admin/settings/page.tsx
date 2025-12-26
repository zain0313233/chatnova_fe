'use client';

import { useState } from 'react';

export default function AdminSettingsPage() {
  const [primaryColor, setPrimaryColor] = useState('#9333EA'); // Default purple
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    // Save theme color to localStorage or send to backend
    if (typeof window !== 'undefined') {
      localStorage.setItem('app_theme_color', primaryColor);
      // Apply the color to CSS variable
      document.documentElement.style.setProperty('--primary-color', primaryColor);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Settings</h1>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Theme & Appearance</h2>

          <div className="space-y-4">
            <div>
              <label htmlFor="primaryColor" className="block text-sm font-medium text-gray-700">
                Primary Color
              </label>
              <div className="mt-2 flex items-center gap-4">
                <input
                  type="color"
                  id="primaryColor"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="h-12 w-24 cursor-pointer rounded border border-gray-300"
                />
                <input
                  type="text"
                  value={primaryColor}
                  onChange={(e) => setPrimaryColor(e.target.value)}
                  className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-purple-500 focus:outline-none focus:ring-purple-500"
                  placeholder="#9333EA"
                />
                <div
                  className="h-12 w-12 rounded border border-gray-300"
                  style={{ backgroundColor: primaryColor }}
                />
              </div>
              <p className="mt-2 text-sm text-gray-500">
                This color will be used as the primary theme color throughout the application.
              </p>
            </div>

            {saved && (
              <div className="rounded-md bg-green-50 p-4">
                <p className="text-sm text-green-800">Settings saved successfully!</p>
              </div>
            )}

            <button
              onClick={handleSave}
              className="rounded-md bg-purple-600 px-6 py-2 text-white hover:bg-purple-700"
            >
              Save Settings
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="rounded-lg bg-white p-6 shadow">
          <h2 className="mb-4 text-xl font-semibold text-gray-900">Application Information</h2>
          <div className="space-y-2 text-sm text-gray-600">
            <p>
              <span className="font-medium">App Name:</span> ChatNova
            </p>
            <p>
              <span className="font-medium">Version:</span> 1.0.0
            </p>
            <p>
              <span className="font-medium">Environment:</span>{' '}
              {process.env.NODE_ENV || 'development'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

