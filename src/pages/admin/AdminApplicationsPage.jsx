import React, { useEffect, useState } from 'react';
import {
  FileCheck,
  CheckCircle,
  XCircle,
  ExternalLink,
  Phone,
  Mail,
  MapPin,
  Building
} from 'lucide-react';
import useAdminStore from '../../store/adminStore';

const tabs = ['pending', 'approved', 'rejected'];

export default function AdminApplicationsPage() {
  const { applications, fetchApplications, approveWholesaler, rejectWholesaler, loading } = useAdminStore();
  const [activeTab, setActiveTab] = useState('pending');
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [confirmingId, setConfirmingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchApplications(activeTab);
  }, [activeTab]);

  const handleApprove = async (id) => {
    if (confirmingId !== id) {
      setConfirmingId(id);
      return;
    }
    setActionLoading(true);
    try {
      await approveWholesaler(id);
      fetchApplications(activeTab);
      setConfirmingId(null);
    } catch (e) {
      // handled by store
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (id) => {
    if (!rejectNote.trim()) {
      return;
    }
    setActionLoading(true);
    try {
      await rejectWholesaler(id, rejectNote);
      fetchApplications(activeTab);
      setRejectingId(null);
      setRejectNote('');
    } catch (e) {
      // handled by store
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-bold text-gray-900">Wholesaler Applications</h2>

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl shadow-sm p-1.5">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-2 rounded-lg text-sm font-medium capitalize transition-colors ${
              activeTab === tab
                ? 'bg-blue-600 text-white'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm p-5 animate-pulse space-y-3">
              <div className="h-5 w-40 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-100 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-8 w-24 bg-gray-200 rounded" />
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <FileCheck size={40} className="mx-auto text-gray-300 mb-3" />
          <p className="text-gray-400 text-sm">No {activeTab} applications</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {applications.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl shadow-sm p-5 space-y-4"
            >
              {/* Header */}
              <div>
                <h3 className="text-base font-semibold text-gray-900">{app.name}</h3>
                {app.shopName && (
                  <p className="text-sm text-gray-500 flex items-center gap-1 mt-0.5">
                    <Building size={13} /> {app.shopName}
                  </p>
                )}
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-2 text-sm">
                {app.city && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <MapPin size={13} className="text-gray-400 flex-shrink-0" /> {app.city}
                  </p>
                )}
                {app.gstNumber && (
                  <p className="text-gray-600 text-xs font-mono">
                    GST: {app.gstNumber}
                  </p>
                )}
                {app.phone && (
                  <p className="text-gray-600 flex items-center gap-1.5">
                    <Phone size={13} className="text-gray-400 flex-shrink-0" /> {app.phone}
                  </p>
                )}
                {app.email && (
                  <p className="text-gray-600 flex items-center gap-1.5 truncate">
                    <Mail size={13} className="text-gray-400 flex-shrink-0" /> {app.email}
                  </p>
                )}
              </div>

              {/* Documents */}
              <div className="flex flex-wrap gap-2">
                {app.businessProofUrl && (
                  <a
                    href={app.businessProofUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={12} /> Business Proof
                  </a>
                )}
                {app.shopPhotoUrl && (
                  <a
                    href={app.shopPhotoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={12} /> Shop Photo
                  </a>
                )}
                {app.aadharUrl && (
                  <a
                    href={app.aadharUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 rounded text-xs text-gray-600 hover:bg-gray-200 transition-colors"
                  >
                    <ExternalLink size={12} /> Aadhar
                  </a>
                )}
              </div>

              {/* Actions */}
              {activeTab === 'pending' && (
                <div className="space-y-3 pt-2 border-t border-gray-100">
                  {rejectingId === app._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        placeholder="Reason for rejection *"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-red-400 outline-none resize-none"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReject(app._id)}
                          disabled={actionLoading || !rejectNote.trim()}
                          className="flex-1 px-3 py-1.5 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 disabled:opacity-50"
                        >
                          {actionLoading ? 'Rejecting...' : 'Confirm Reject'}
                        </button>
                        <button
                          onClick={() => { setRejectingId(null); setRejectNote(''); }}
                          className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg text-sm"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApprove(app._id)}
                        disabled={actionLoading}
                        className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          confirmingId === app._id
                            ? 'bg-green-700 text-white'
                            : 'bg-green-600 text-white hover:bg-green-700'
                        } disabled:opacity-50`}
                      >
                        <CheckCircle size={15} />
                        {confirmingId === app._id
                          ? actionLoading
                            ? 'Approving...'
                            : 'Click again to confirm'
                          : 'Approve'}
                      </button>
                      <button
                        onClick={() => { setRejectingId(app._id); setConfirmingId(null); }}
                        className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition-colors"
                      >
                        <XCircle size={15} />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Rejected reason */}
              {activeTab === 'rejected' && app.rejectionNote && (
                <div className="bg-red-50 rounded-lg p-3 text-sm text-red-700">
                  <span className="font-medium">Reason:</span> {app.rejectionNote}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
