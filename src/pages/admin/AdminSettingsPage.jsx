import React from 'react';
import {
  Store,
  Truck,
  MessageCircle,
  Mail,
  Info,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

function SettingsCard({ icon: Icon, title, children }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">
          <Icon size={18} className="text-blue-600" />
        </div>
        <h3 className="text-base font-semibold text-gray-800">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

function InfoRow({ label, value, mono = false }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b border-gray-50 last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className={`text-sm font-medium text-gray-900 text-right ${mono ? 'font-mono' : ''}`}>
        {value}
      </span>
    </div>
  );
}

function StatusBadge({ configured }) {
  return configured ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
      <CheckCircle size={13} />
      Configured
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-yellow-50 text-yellow-700 text-xs font-medium rounded-full">
      <AlertCircle size={13} />
      Not Configured
    </span>
  );
}

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-900">Settings</h2>

      {/* Notice banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
        <p className="text-sm text-blue-800">
          To change these settings, update the <code className="bg-blue-100 px-1.5 py-0.5 rounded text-xs font-mono">.env</code> file on the server and restart the application. These values are read-only in the admin panel.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Store Information */}
        <SettingsCard icon={Store} title="Store Information">
          <InfoRow label="Store Name" value="Fashion Forward" />
          <InfoRow label="Store Address" value="Set in .env (STORE_ADDRESS)" mono />
          <InfoRow label="Store Phone" value="Set in .env (STORE_PHONE)" mono />
          <InfoRow label="GSTIN" value="Set in .env (STORE_GSTIN)" mono />
          <p className="text-xs text-gray-400 mt-3">
            Configure these values using STORE_NAME, STORE_ADDRESS, STORE_PHONE, and STORE_GSTIN environment variables.
          </p>
        </SettingsCard>

        {/* Shipping Configuration */}
        <SettingsCard icon={Truck} title="Shipping Configuration">
          <InfoRow label="Flat Rate Shipping" value={'\u20B980'} />
          <InfoRow label="Free Shipping Threshold" value={'\u20B9999+'} />
          <InfoRow label="Wholesale Shipping" value={'\u20B90 (Free)'} />
          <p className="text-xs text-gray-400 mt-3">
            Shipping rates are configured in the order controller code. To change rates, update the shipping logic in the backend and redeploy.
          </p>
        </SettingsCard>

        {/* WhatsApp Integration */}
        <SettingsCard icon={MessageCircle} title="WhatsApp Integration">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge configured={false} />
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Setup Steps:</p>
            <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
              <li>Create a WhatsApp Business API account</li>
              <li>Obtain your API key and phone number ID</li>
              <li>Set <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">WHATSAPP_API_KEY</code> and <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">WHATSAPP_PHONE_ID</code> in .env</li>
              <li>Restart the server to enable WhatsApp notifications</li>
            </ol>
          </div>
        </SettingsCard>

        {/* Email Configuration */}
        <SettingsCard icon={Mail} title="Email Configuration">
          <div className="flex items-center justify-between py-2.5 border-b border-gray-50">
            <span className="text-sm text-gray-500">Status</span>
            <StatusBadge configured={false} />
          </div>
          <div className="mt-3 space-y-2">
            <p className="text-sm font-medium text-gray-700">Setup Steps:</p>
            <ol className="text-xs text-gray-500 space-y-1.5 list-decimal list-inside">
              <li>Choose an email provider (Gmail, SendGrid, SES, etc.)</li>
              <li>Set <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">SMTP_HOST</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">SMTP_PORT</code>, <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">SMTP_USER</code>, and <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">SMTP_PASS</code> in .env</li>
              <li>Set <code className="bg-gray-100 px-1 py-0.5 rounded font-mono">FROM_EMAIL</code> for the sender address</li>
              <li>Restart the server to enable email notifications</li>
            </ol>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
