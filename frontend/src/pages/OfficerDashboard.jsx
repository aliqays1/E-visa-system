import React, { useContext, useState, useEffect, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HomeIcon, 
  DocumentCheckIcon, 
  UsersIcon, 
  ChartPieIcon,
  MagnifyingGlassIcon,
  BellIcon,
  BanknotesIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  Bars3Icon,
  DocumentTextIcon,
  CameraIcon,
  BuildingLibraryIcon,
  ArrowDownTrayIcon,
  Cog6ToothIcon,
  ChartBarIcon,
  TrashIcon,
  PencilSquareIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';

const getDocumentUrl = (pathOrUrl) => {
  if (!pathOrUrl) return '#';
  if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
    return pathOrUrl;
  }
  return `${import.meta.env.VITE_API_URL || ''}/uploads/${pathOrUrl.split(/[\\/]/).pop()}`;
};

// ─── Configurations Tab ─────────────────────────────────────────────────────

const ConfigurationsTab = ({ configs, token, onRefresh }) => {
  const [editingType, setEditingType] = useState(null);
  const [newOption, setNewOption] = useState({ duration: '', price: '' });
  const [saving, setSaving] = useState(false);
  const [showAddVisa, setShowAddVisa] = useState(false);
  const [newVisaName, setNewVisaName] = useState('');
  const [addingVisa, setAddingVisa] = useState(false);
  const [renamingType, setRenamingType] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  // 100% backend-driven: only show what's in the database
  const allVisaTypes = configs.map(c => c.visaType);

  const getConfig = (type) => configs.find(c => c.visaType.toLowerCase() === type.toLowerCase()) || { visaType: type, options: [] };

  const handleAddOption = async (type) => {
    if (!newOption.duration || !newOption.price) return alert('Please enter duration and price.');
    setSaving(true);
    try {
      const config = getConfig(type);
      const updatedOptions = [
        ...config.options,
        { duration: Number(newOption.duration), price: Number(newOption.price) }
      ].sort((a, b) => a.duration - b.duration);

      await axios.put(`/api/visa/config/${type}`, 
        { options: updatedOptions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewOption({ duration: '', price: '' });
      onRefresh();
    } catch (e) {
      alert('Error saving config: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveOption = async (type, duration) => {
    if (!window.confirm(`Remove ${duration}-day option for ${type} visa?`)) return;
    setSaving(true);
    try {
      const config = getConfig(type);
      const updatedOptions = config.options.filter(o => o.duration !== duration);
      await axios.put(`/api/visa/config/${type}`,
        { options: updatedOptions },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      onRefresh();
    } catch (e) {
      alert('Error removing option: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleAddVisaType = async () => {
    const trimmed = newVisaName.trim();
    if (!trimmed) return alert('Please enter a visa type name.');
    if (allVisaTypes.map(t => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      return alert(`"${trimmed}" already exists.`);
    }
    setAddingVisa(true);
    try {
      await axios.put(`/api/visa/config/${trimmed}`,
        { options: [] },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewVisaName('');
      setShowAddVisa(false);
      onRefresh();
    } catch (e) {
      alert('Error creating visa type: ' + (e.response?.data?.message || e.message));
    } finally {
      setAddingVisa(false);
    }
  };

  const handleDeleteVisaType = async (type) => {
    if (!window.confirm(`Are you sure you want to delete the "${type}" visa type and all its configurations?`)) return;
    setSaving(true);
    try {
      await axios.delete(`/api/visa/config/${type}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onRefresh();
    } catch (e) {
      alert('Error deleting visa type: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  const handleRenameVisaType = async (oldType) => {
    const trimmed = renameValue.trim();
    if (!trimmed) return alert('Please enter a valid visa name.');
    if (trimmed.toLowerCase() === oldType.toLowerCase()) {
      setRenamingType(null);
      return;
    }
    if (allVisaTypes.map(t => t.toLowerCase()).includes(trimmed.toLowerCase())) {
      return alert(`Visa type "${trimmed}" already exists.`);
    }

    setSaving(true);
    try {
      await axios.put(`/api/visa/config/${encodeURIComponent(oldType)}/rename`,
        { newVisaType: trimmed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRenamingType(null);
      setRenameValue('');
      onRefresh();
    } catch (e) {
      alert('Error renaming visa type: ' + (e.response?.data?.message || e.message));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Visa Fee Configuration</h2>
          <p className="text-sm text-gray-500 mt-1">Manage duration options, edit names, and set pricing for each visa type.</p>
        </div>
        <button
          onClick={() => { setShowAddVisa(v => !v); setNewVisaName(''); }}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm border-2 transition-all duration-200 ${
            showAddVisa
              ? 'border-gray-300 bg-gray-100 text-gray-700'
              : 'border-primary bg-primary text-white hover:bg-blue-800 shadow-md shadow-primary/20'
          }`}
        >
          {showAddVisa ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
              Cancel
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
              Add New Visa Type
            </>
          )}
        </button>
      </div>

      {/* Add New Visa Type Panel */}
      {showAddVisa && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-primary/20 rounded-2xl p-5 flex flex-col sm:flex-row gap-4 items-start sm:items-end shadow-sm">
          <div className="flex-1">
            <label className="block text-xs font-bold text-primary uppercase tracking-wider mb-2">New Visa Type Name</label>
            <input
              type="text"
              placeholder="e.g. Medical, Transit, Journalist..."
              value={newVisaName}
              onChange={e => setNewVisaName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddVisaType()}
              className="w-full px-4 py-3 border-2 border-primary/20 bg-white rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary placeholder-gray-400"
            />
            <p className="text-[11px] text-gray-400 mt-1.5">This will create a new visa category that applicants can choose from.</p>
          </div>
          <button
            onClick={handleAddVisaType}
            disabled={addingVisa || !newVisaName.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-xl text-sm hover:bg-blue-800 disabled:opacity-50 transition-all shadow-md shadow-primary/20"
          >
            {addingVisa ? (
              <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg> Creating...</>
            ) : (
              <><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg> Create Visa Type</>
            )}
          </button>
        </div>
      )}

      {/* Visa Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {allVisaTypes.map(type => {
          const config = getConfig(type);
          const isEditing = editingType === type;
          const isRenaming = renamingType === type;

          return (
            <div key={type} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gradient-to-r from-slate-50 to-blue-50">
                {isRenaming ? (
                  <div className="flex items-center gap-2 flex-1 mr-2">
                    <input
                      type="text"
                      value={renameValue}
                      onChange={e => setRenameValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleRenameVisaType(type)}
                      autoFocus
                      className="px-2 py-1 border-2 border-primary rounded-lg text-sm font-bold text-gray-800 focus:outline-none flex-1"
                    />
                    <button
                      onClick={() => handleRenameVisaType(type)}
                      className="px-2.5 py-1 bg-emerald-600 text-white font-bold text-xs rounded-lg hover:bg-emerald-700"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => setRenamingType(null)}
                      className="px-2.5 py-1 bg-gray-200 text-gray-600 font-bold text-xs rounded-lg hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-extrabold text-gray-800">{type}</span>
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full uppercase tracking-wider">Visa</span>
                    <button
                      onClick={() => { setRenamingType(type); setRenameValue(type); }}
                      title="Edit visa name"
                      className="p-1 text-gray-400 hover:text-primary transition-colors"
                    >
                      <PencilSquareIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
                
                {!isRenaming && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingType(isEditing ? null : type)}
                      className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-colors ${
                        isEditing ? 'bg-gray-200 text-gray-700 border-gray-300' : 'bg-primary/10 text-primary border-primary/20 hover:bg-primary/20'
                      }`}
                    >
                      {isEditing ? 'Done' : '+ Add Option'}
                    </button>
                    <button
                      onClick={() => handleDeleteVisaType(type)}
                      disabled={saving}
                      title={`Delete ${type} Visa`}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div className="px-5 py-3 space-y-2">
                {config.options.length === 0 ? (
                  <p className="text-xs text-gray-400 italic py-2">No options configured yet.</p>
                ) : (
                  config.options.map(opt => (
                    <div key={opt.duration} className="flex items-center justify-between bg-gray-50 rounded-xl px-4 py-2.5 border border-gray-100 group hover:border-red-200 transition-colors">
                      <div>
                        <span className="text-sm font-bold text-gray-800">{opt.duration} Days</span>
                        <span className="ml-3 text-sm font-extrabold text-emerald-600">${opt.price}</span>
                      </div>
                      <button
                        onClick={() => handleRemoveOption(type, opt.duration)}
                        disabled={saving}
                        className="text-[10px] text-red-500 font-bold opacity-0 group-hover:opacity-100 transition-opacity hover:text-red-700 px-2 py-1 rounded-md hover:bg-red-50"
                      >
                        Remove
                      </button>
                    </div>
                  ))
                )}
              </div>

              {isEditing && (
                <div className="px-5 pb-4 pt-1 border-t border-dashed border-gray-200 bg-blue-50/50">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2">New Option</p>
                  <div className="flex gap-2">
                    <input
                      type="number"
                      placeholder="Days (e.g. 30)"
                      value={newOption.duration}
                      onChange={e => setNewOption(p => ({ ...p, duration: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <input
                      type="number"
                      placeholder="Price ($)"
                      value={newOption.price}
                      onChange={e => setNewOption(p => ({ ...p, price: e.target.value }))}
                      className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <button
                      onClick={() => handleAddOption(type)}
                      disabled={saving}
                      className="px-4 py-2 bg-primary text-white font-bold rounded-lg text-xs hover:bg-blue-800 disabled:opacity-50 transition-colors"
                    >
                      {saving ? '...' : 'Save'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Reports Tab ─────────────────────────────────────────────────────────────
const ReportsTab = ({ reports }) => {
  if (!reports) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <div className="text-center">
          <ChartBarIcon className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-medium">Loading report data...</p>
        </div>
      </div>
    );
  }

  const { revenueStats, typeStats, statusStats, overstayStats } = reports;

  const totalRevenue = revenueStats.reduce((sum, r) => sum + (r.totalRevenue || 0), 0);
  const totalApplications = statusStats.reduce((sum, s) => sum + (s.count || 0), 0);
  const totalOverstays = overstayStats.reduce((sum, o) => sum + (o.count || 0), 0);
  const renewalCount = typeStats.find(t => t._id === 'Renewal')?.count || 0;

  const statusColors = {
    'Approved': 'bg-emerald-500',
    'Rejected': 'bg-rose-500',
    'Submitted': 'bg-blue-400',
    'Under Review': 'bg-amber-400',
    'Needs Revision': 'bg-orange-400',
    'Pending': 'bg-gray-400',
  };

  const kpis = [
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      color: 'from-emerald-500 to-emerald-700',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Applications',
      value: totalApplications,
      color: 'from-blue-500 to-blue-700',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Total Renewals',
      value: renewalCount,
      color: 'from-purple-500 to-purple-700',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
        </svg>
      ),
    },
    {
      label: 'Overstay Alerts',
      value: totalOverstays,
      color: 'from-red-500 to-red-700',
      icon: (
        <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Reports & Analytics</h2>
        <p className="text-sm text-gray-500 mt-1">Live aggregated data from all visa applications.</p>
      </div>

      {/* KPI Summary */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map(kpi => (
          <div key={kpi.label} className={`bg-gradient-to-br ${kpi.color} rounded-2xl p-5 text-white shadow-lg`}>
            <div className="mb-2">{kpi.icon}</div>
            <div className="text-3xl font-extrabold">{kpi.value}</div>
            <div className="text-xs font-bold uppercase tracking-wider opacity-80 mt-1">{kpi.label}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by Visa Type */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <BanknotesIcon className="w-4 h-4 text-emerald-600" />
            </span>
            Revenue by Visa Type
          </h3>
          {revenueStats.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No approved revenue yet.</p>
          ) : (
            <div className="space-y-3">
              {revenueStats.sort((a, b) => b.totalRevenue - a.totalRevenue).map(stat => {
                const pct = totalRevenue > 0 ? Math.round((stat.totalRevenue / totalRevenue) * 100) : 0;
                return (
                  <div key={stat._id}>
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                      <span>{stat._id || 'Unknown'} Visa</span>
                      <span className="font-extrabold text-emerald-600">${stat.totalRevenue?.toLocaleString()}</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
                    </div>
                    <div className="text-[10px] text-gray-400 text-right mt-0.5">{pct}%</div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Status Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-extrabold text-gray-800 mb-5 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-blue-100 flex items-center justify-center flex-shrink-0">
              <ChartPieIcon className="w-4 h-4 text-blue-600" />
            </span>
            Application Status Breakdown
          </h3>
          {statusStats.length === 0 ? (
            <p className="text-sm text-gray-400 italic">No data yet.</p>
          ) : (
            <div className="space-y-4">
              {statusStats.sort((a, b) => b.count - a.count).map(stat => {
                const pct = totalApplications > 0 ? Math.round((stat.count / totalApplications) * 100) : 0;
                const barColor = statusColors[stat._id] || 'bg-gray-400';
                return (
                  <div key={stat._id} className="flex items-center gap-4">
                    <span className={`w-4 h-4 rounded-full flex-shrink-0 ${barColor}`} />
                    <span className="text-base font-bold text-gray-700 w-40 truncate">{stat._id}</span>
                    <div className="flex-1 h-5 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full ${barColor} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-base font-extrabold text-gray-700 w-10 text-right">{stat.count}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Application Type Split */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">
          <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-purple-100 flex items-center justify-center flex-shrink-0">
              <DocumentCheckIcon className="w-4 h-4 text-purple-600" />
            </span>
            New vs. Renewal Applications
          </h3>
          <div className="space-y-3">
            {(() => {
              // Merge any null/undefined/empty _id entries into a single "New" group
              const merged = typeStats.reduce((acc, stat) => {
                const key = stat._id && stat._id.trim() !== '' ? stat._id : 'New';
                const existing = acc.find(x => x._id === key);
                if (existing) { existing.count += stat.count; } else { acc.push({ _id: key, count: stat.count }); }
                return acc;
              }, []);
              const total = merged.reduce((s, t) => s + t.count, 0);
              return merged.map(stat => {
                const pct = total > 0 ? Math.round((stat.count / total) * 100) : 0;
                const isRenewal = stat._id === 'Renewal';
                return (
                  <div key={stat._id}>
                    <div className="flex justify-between text-sm font-semibold text-gray-700 mb-1">
                      <span className="flex items-center gap-2">
                        {isRenewal
                          ? <svg className="w-4 h-4 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                          : <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                        }
                        {stat._id}
                      </span>
                      <span className="font-extrabold">{stat.count} ({pct}%)</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${isRenewal ? 'bg-gradient-to-r from-purple-400 to-purple-600' : 'bg-gradient-to-r from-blue-400 to-blue-600'}`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              });
            })()}
          </div>
        </div>

        {/* Overstay by Visa Type */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 border-t-4 border-t-red-400">
          <h3 className="text-base font-extrabold text-gray-800 mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-red-100 flex items-center justify-center flex-shrink-0">
              <ExclamationTriangleIcon className="w-4 h-4 text-red-600" />
            </span>
            Overstays by Visa Type
          </h3>
          {overstayStats.length === 0 ? (
            <div className="flex items-center justify-center h-20 gap-2 text-emerald-600">
              <ShieldCheckIcon className="w-5 h-5" />
              <p className="text-sm font-semibold">No overstay incidents recorded.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {overstayStats.map(stat => (
                <div key={stat._id} className="flex items-center justify-between bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                  <span className="text-sm font-bold text-red-800">{stat._id || 'Unknown'} Visa</span>
                  <span className="px-3 py-1 bg-red-600 text-white text-xs font-extrabold rounded-full">{stat.count} Case{stat.count !== 1 ? 's' : ''}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
const OfficerDashboard = () => {
  const { user, logout, loading: authLoading } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const dataLoaded = useRef(false); // flips true only after first real fetch completes
  const [selectedApplication, setSelectedApplication] = useState(null); // Modal state
  const [rejectionReason, setRejectionReason] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const searchDebounceRef = useRef(null);
  const [activeTab, setActiveTab] = useState('review');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();


  // Stats state
  const [stats, setStats] = useState({ totalApps: 0, pendingApps: 0, approvedApps: 0, rejectedApps: 0, overstays: 0 });
  
  // New States
  const [configs, setConfigs] = useState([]);
  const [reports, setReports] = useState(null);

  // Border Control states
  const [scanToken, setScanToken] = useState('');
  const [newlyDetectedOverstays, setNewlyDetectedOverstays] = useState([]);

  // Retrieve user token
  const token = user ? user.token : null;

  const fetchData = React.useCallback(async (signal) => {
    if (authLoading) return;
    if (!token) {
      Promise.resolve().then(() => setLoading(false));
      return;
    }
    
    setLoading(true);
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      
      const statsPromise = axios.get('/api/visa/stats', { headers, signal });
      const appsPromise = axios.get(`/api/visa/all?page=1&limit=1000`, { headers, signal });
      const configsPromise = axios.get('/api/visa/config', { headers, signal });
      const reportsPromise = axios.get('/api/visa/reports', { headers, signal });

      const [statsRes, appsRes, configsRes, reportsRes] = await Promise.all([statsPromise, appsPromise, configsPromise, reportsPromise]);

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }
      
      if (appsRes.data.success) {
        setApplications(appsRes.data.applications);
        dataLoaded.current = true;
      }
      
      if (configsRes.data.success) {
        setConfigs(configsRes.data.configs);
      }
      
      if (reportsRes.data.success) {
        setReports(reportsRes.data.reports);
      }
    } catch (error) {
      if (axios.isCancel(error)) {
        console.log('Request canceled', error.message);
      } else {
        console.error('Error fetching dashboard data:', error);
      }
    } finally {
      setLoading(false);
    }
  }, [token, authLoading]);

  const fetchConfigs = React.useCallback(async () => {
    if (!token) return;
    try {
      const headers = { 'Authorization': `Bearer ${token}` };
      const res = await axios.get('/api/visa/config', { headers });
      if (res.data.success) {
        setConfigs(res.data.configs);
      }
    } catch (e) {
      console.error('Error refreshing configs:', e);
    }
  }, [token]);

  const handleTabChange = (tab) => {
    if (activeTab === tab) return;
    setActiveTab(tab);
  };

  useEffect(() => {
    const controller = new AbortController();
    // eslint-disable-next-line
    fetchData(controller.signal);
    return () => {
      controller.abort();
    };
  }, [fetchData]);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const payload = { status: newStatus };
      if (newStatus === 'Approved') {
        // Visa duration is now handled from the initial application
      } else if (newStatus === 'Rejected' || newStatus === 'Needs Revision') {
        if (!rejectionReason.trim()) {
          alert(`Please enter a reason for ${newStatus}.`);
          return;
        }
        payload.rejectionReason = rejectionReason;
      }

      const res = await axios.put(`/api/visa/${id}/status`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`Application status successfully updated to ${newStatus}!`);
        const updatedApp = res.data.application || { ...selectedApplication, applicationStatus: newStatus };
        // Update local state instantly — no full re-fetch needed
        setApplications(prev => prev.map(app => app._id === id ? updatedApp : app));
        setStats(prev => prev ? {
          ...prev,
          pending: newStatus === 'Approved' || newStatus === 'Rejected' || newStatus === 'Needs Revision'
            ? Math.max(0, (prev.pending || 1) - 1)
            : prev.pending,
          approved: newStatus === 'Approved' ? (prev.approved || 0) + 1 : prev.approved,
          rejected: newStatus === 'Rejected' ? (prev.rejected || 0) + 1 : prev.rejected,
        } : prev);
        setSelectedApplication(null);
        setRejectionReason('');
      } else {
        alert('Failed to update status: ' + res.data.message);
      }
    } catch (error) {
      console.error(error);
      alert('Error updating application: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleSendWarning = async (id) => {
    try {
      const res = await axios.post(`/api/visa/${id}/send-warning`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        alert('Warning email sent successfully!');
      } else {
        alert(res.data.message || 'Failed to send warning email.');
      }
    } catch (error) {
      console.error(error);
      const errorMsg = error.response?.data?.message || 'An error occurred while sending the email.';
      alert(errorMsg);
    }
  };

  const handleVerifyPayment = async (id, status) => {
    try {
      const res = await axios.put(`/api/visa/${id}/verify-payment`, {
        paymentStatus: status,
        transactionId: `TXN-MANUAL-VERIFY`,
        amountPaid: 100
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.data.success) {
        alert(`Payment marked as ${status}!`);
        setApplications(prev => prev.filter(app => app._id !== id));
        fetchData();
      }
    } catch (error) {
      console.error(error);
      alert('Error updating payment: ' + (error.response?.data?.message || error.message));
    }
  };

  const handleScanOrVerify = () => {
    if (!scanToken) return alert('Please enter a secure token, passport number, or application ID');
    let extractedToken = scanToken.trim();
    if (extractedToken.includes('token=')) {
      extractedToken = extractedToken.split('token=')[1].split('&')[0];
    }
    navigate(`/verify?token=${extractedToken}`);
    setScanToken('');
  };

  const handleScannerInput = (e) => {
    if (e.key === 'Enter' && scanToken) {
      handleScanOrVerify();
    }
  };

  const handleBorderAction = async (action) => {
    if (!scanToken) return alert('Please enter a secure token, passport number, or application ID');
    let extractedToken = scanToken.trim();
    if (extractedToken.includes('token=')) {
      extractedToken = extractedToken.split('token=')[1].split('&')[0];
    }
    
    try {
      const resApp = await axios.get(`/api/visa/all?search=${extractedToken}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const app = resApp.data.applications.find(a => 
        a.secureToken === extractedToken || 
        a._id === extractedToken || 
        a.personalDetails?.passportNumber?.toLowerCase() === extractedToken.toLowerCase()
      );
      if (!app) return alert('No application found matching that input!');

      const res = await axios.post(`/api/visa/${app._id}/${action}`, {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        setScanToken('');
        fetchData();
        navigate(`/verify?token=${app.secureToken || app._id}`);
      }
    } catch (error) {
      console.error(error);
      alert(`Error recording ${action}: ` + (error.response?.data?.message || error.message));
    }
  };

  const checkOverstays = async () => {
    handleTabChange('alerts');
    try {
      const res = await axios.post('/api/visa/check-overstays', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.data.success) {
        setNewlyDetectedOverstays(res.data.newOverstayIds || []);
        fetchData();
      }
    } catch (error) {
      console.error(error);
      alert('Error checking overstays.');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f4f7fa] absolute inset-0 z-50">
         <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!user || user.role !== 'officer') {
    return <Navigate to="/login" replace />;
  }

  const { totalApps, pendingApps, approvedApps, rejectedApps, overstays } = stats;

  // Search filter across applications
  const searchedApps = applications.filter(app => {
    if (!debouncedSearch.trim()) return true;
    const query = debouncedSearch.toLowerCase().trim();

    // Normalize each name part (trim + collapse internal spaces), then join
    const firstName = (app.personalDetails?.firstName || '').trim().replace(/\s+/g, ' ');
    const lastName  = (app.personalDetails?.lastName  || '').trim().replace(/\s+/g, ' ');
    // Build full name both ways so "Hussein Farah Fatima" also matches
    const fullName     = `${firstName} ${lastName}`.toLowerCase().trim().replace(/\s+/g, ' ');
    const fullNameRev  = `${lastName} ${firstName}`.toLowerCase().trim().replace(/\s+/g, ' ');

    // Word-by-word fallback: every word in the query must appear somewhere in
    // firstName or lastName (handles 3-part names split unevenly across the two fields)
    const queryWords = query.split(/\s+/);
    const namePool   = fullName; // already normalized
    const allWordsMatch = queryWords.every(word => namePool.includes(word));

    const passport = (app.personalDetails?.passportNumber || app.passportNumber || '').toLowerCase();
    const id       = (app._id || '').toLowerCase();
    const token    = (app.secureToken || '').toLowerCase();
    const visaType = (app.visaType || '').toLowerCase();
    const status   = (app.applicationStatus || '').toLowerCase();

    return (
      fullName.includes(query)    ||
      fullNameRev.includes(query) ||
      allWordsMatch               ||
      passport.includes(query)    ||
      id.includes(query)          ||
      token.includes(query)       ||
      visaType.includes(query)    ||
      status.includes(query)
    );
  });

  // Tab specific filters
  const reviewApps = searchedApps;
  const paymentApps = searchedApps.filter(app => app.paymentStatus === 'Pending' || app.paymentStatus === 'Unverified');
  const borderApps = searchedApps.filter(app => ['Approved', 'Active'].includes(app.applicationStatus) || ['Entered', 'Exited', 'Overstayed'].includes(app.entryStatus));
  const alertApps = searchedApps.filter(app => app.overstayAlert === true || app.entryStatus === 'Overstayed');

  return (
    <div className="flex h-screen bg-[#F4F7FA] font-sans text-gray-800 absolute inset-0 z-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-[#0b3c5d] to-[#1d2731] shadow-xl border-r border-transparent hidden md:flex flex-col text-white">
        <div className="h-16 flex items-center px-6 border-b border-white/10 space-x-2">
          <img src="/logo.png" alt="Logo" className="h-8 w-8 rounded bg-white p-1" />
          <span className="text-lg font-bold text-white tracking-tight">Admin Portal</span>
        </div>
        <div className="p-4 mt-2">
          <p className="text-[11px] font-bold text-white/50 uppercase tracking-widest mb-4 px-2">Navigation</p>
          <nav className="flex-1 space-y-5 mt-4 px-3">
            <button onClick={() => handleTabChange('review')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'review' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <HomeIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Application Review</span>
            </button>
            <button onClick={() => handleTabChange('payments')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'payments' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <BanknotesIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Payment Verifications</span>
            </button>
            <button onClick={() => handleTabChange('border')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'border' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ShieldCheckIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Border Control</span>
            </button>
            <button onClick={() => handleTabChange('alerts')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'alerts' ? 'bg-red-500/80 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ExclamationTriangleIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Overstays & Alerts</span>
            </button>
            <button onClick={() => handleTabChange('configs')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'configs' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <Cog6ToothIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Configurations</span>
            </button>
            <button onClick={() => handleTabChange('reports')} className={`w-full flex items-center justify-start px-3 py-3 rounded-xl font-medium transition-all duration-200 text-left ${activeTab === 'reports' ? 'bg-white/20 text-white shadow-md' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
              <ChartBarIcon className="w-5 h-5 mr-3 flex-shrink-0" /> <span className="leading-tight">Reports & Analytics</span>
            </button>
          </nav>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Header */}
        <header className="min-h-16 bg-white border-b border-gray-200 flex flex-col md:flex-row items-center justify-between p-4 lg:px-6 shadow-sm gap-4">
          <div className="flex items-center w-full md:w-auto gap-4">
            <button className="lg:hidden text-gray-500 hover:text-primary" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              <Bars3Icon className="h-6 w-6" />
            </button>
            <div className="flex flex-1 items-center bg-gray-50 border border-gray-200 px-4 py-2 rounded-xl md:w-96 transition-colors focus-within:border-primary focus-within:bg-white">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 mr-2" />
              <input 
              type="text" 
              placeholder="Search by Name, Passport, Visa ID, or QR Token..." 
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => setDebouncedSearch(e.target.value), 200);
              }}
              className="bg-transparent border-none focus:outline-none text-sm w-full text-gray-700" 
            />
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <button onClick={checkOverstays} className="px-4 py-1.5 bg-gray-100 text-xs font-bold rounded-lg hover:bg-gray-200">Run Overstay Check</button>
            <div className="relative cursor-pointer">
              <BellIcon className="h-6 w-6 text-gray-400 hover:text-primary transition-colors" />
              {overstays > 0 && <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>}
            </div>
            <div className="flex items-center cursor-pointer border-l border-gray-200 pl-6">
              <div className="h-9 w-9 bg-primary/10 text-primary rounded-full flex items-center justify-center font-bold mr-3 border border-primary/20">
                {user.fullName ? user.fullName.substring(0, 2).toUpperCase() : 'AD'}
              </div>
              <div className="flex flex-col">
                 <span className="text-sm font-bold text-gray-700">{user.fullName || 'Officer Admin'}</span>
                 <button onClick={logout} className="text-xs text-red-500 font-semibold text-left hover:text-red-700 transition-colors">Logout</button>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto p-6 md:p-8">
          
          {/* Review Tab */}
          {activeTab === 'review' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-500 to-blue-700 p-6 rounded-2xl shadow-lg border border-blue-400 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-blue-100 mb-1 uppercase tracking-wider">Total Received</p>
                    <h3 className="text-4xl font-extrabold">{totalApps}</h3>
                  </div>
                  <DocumentCheckIcon className="h-10 w-10 text-blue-200 opacity-80" />
                </div>
                <div className="bg-gradient-to-br from-amber-400 to-amber-600 p-6 rounded-2xl shadow-lg border border-amber-300 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-amber-100 mb-1 uppercase tracking-wider">Pending Review</p>
                    <h3 className="text-4xl font-extrabold">{pendingApps}</h3>
                  </div>
                  <ChartPieIcon className="h-10 w-10 text-amber-200 opacity-80" />
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-emerald-700 p-6 rounded-2xl shadow-lg border border-emerald-400 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-emerald-100 mb-1 uppercase tracking-wider">Approved Visas</p>
                    <h3 className="text-4xl font-extrabold">{approvedApps}</h3>
                  </div>
                  <DocumentCheckIcon className="h-10 w-10 text-emerald-200 opacity-80" />
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-rose-700 p-6 rounded-2xl shadow-lg border border-rose-400 flex items-center justify-between text-white transform hover:scale-105 transition-transform duration-300">
                  <div>
                    <p className="text-xs font-bold text-rose-100 mb-1 uppercase tracking-wider">Rejected Visas</p>
                    <h3 className="text-4xl font-extrabold">{rejectedApps}</h3>
                  </div>
                  <UsersIcon className="h-10 w-10 text-rose-200 opacity-80" />
                </div>
              </div>

              <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">E-Visa Applications Registry</h3>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b-2 border-gray-200">
                          <th className="px-8 py-4 font-extrabold">Applicant</th>
                          <th className="px-8 py-4 font-extrabold">Category</th>
                          <th className="px-8 py-4 font-extrabold">Submission Date</th>
                          <th className="px-8 py-4 font-extrabold">Status</th>
                          <th className="px-8 py-4 font-extrabold text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100 text-sm">
                        {(loading || !dataLoaded.current) && (
                          <tr><td colSpan="5" className="px-8 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-gray-400"><svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading records...</span></div></td></tr>
                        )}
                        {!loading && dataLoaded.current && reviewApps.length === 0 && (
                          <tr><td colSpan="5" className="px-8 py-16 text-center">
                            <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                              <p className="font-semibold text-gray-500 text-base">{searchQuery.trim() ? `No results found for "${searchQuery.trim()}"` : 'No applications found'}</p>
                              <p className="text-sm text-gray-400">{searchQuery.trim() ? 'Try a different name, passport number, or visa ID.' : 'Applications will appear here once submitted.'}</p>
                            </div>
                          </td></tr>
                        )}
                        {!loading && reviewApps.map((app) => (
                          <tr key={app._id} className="hover:bg-blue-50/40 transition-all duration-200 group">
                            <td className="px-8 py-5">
                              <div className="font-bold text-gray-900 text-base group-hover:text-primary transition-colors capitalize">
                                {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                                {app.applicationType === 'Renewal' && (
                                  <span className="ml-2 px-2 py-0.5 text-[10px] bg-purple-600 text-white rounded-md font-extrabold uppercase tracking-wider shadow-sm">
                                    RENEWAL
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-gray-400 font-mono mt-1">{app._id}</div>
                            </td>
                            <td className="px-8 py-5 text-gray-600 font-semibold">{app.visaType}</td>
                            <td className="px-8 py-5 text-gray-500 font-medium">{new Date(app.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</td>
                            <td className="px-8 py-5">
                              <span className={`px-4 py-1.5 inline-flex text-xs font-bold uppercase tracking-wider rounded-full shadow-sm border ${
                                (app.applicationStatus === 'Active' || app.entryRecorded || ['Entered', 'Overstayed', 'Exited'].includes(app.entryStatus))
                                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' :
                                app.applicationStatus === 'Approved' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                app.applicationStatus === 'Rejected' ? 'bg-rose-50 text-rose-700 border-rose-200' :
                                app.applicationStatus === 'Needs Revision' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                app.applicationStatus === 'Renewal Pending' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-blue-50 text-blue-700 border-blue-200'
                              }`}>{
                                app.applicationStatus === 'Under Review' ? 'Updated Revision' :
                                app.applicationStatus === 'Submitted' ? 'Pending' :
                                (app.entryRecorded || ['Entered', 'Overstayed', 'Exited'].includes(app.entryStatus) || app.applicationStatus === 'Active') ? 'Active' :
                                app.applicationStatus
                              }</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <button onClick={() => setSelectedApplication(app)} className="text-white bg-primary hover:bg-blue-800 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Review</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
              </div>
            </>
          )}

          {/* Payments Tab */}
          {activeTab === 'payments' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold text-gray-900 font-sans">Payment Verification Pipeline</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold border-b border-gray-100">Visa ID</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-100">Applicant</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-100">Payment Status</th>
                      <th className="px-6 py-4 font-bold border-b border-gray-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-sm">
                    {loading && (
                      <tr><td colSpan="4" className="px-6 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-gray-400"><svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading records...</span></div></td></tr>
                    )}
                    {!loading && paymentApps.length === 0 && (
                      <tr><td colSpan="4" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="font-semibold text-gray-500 text-base">{searchQuery.trim() ? `No pending payment verifications found for "${searchQuery.trim()}"` : 'No pending payment verifications'}</p>
                          <p className="text-sm text-gray-400">{searchQuery.trim() ? 'Try a different applicant name or ID.' : 'Applications requiring manual payment verification will appear here.'}</p>
                        </div>
                      </td></tr>
                    )}
                    {paymentApps.map((app) => (
                      <tr key={app._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4 font-mono text-xs text-gray-500">{app._id}</td>
                        <td className="px-6 py-4">
                           <div className="font-bold text-gray-900 text-base capitalize">{app.personalDetails?.firstName} {app.personalDetails?.lastName}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 inline-flex text-[11px] leading-5 font-bold uppercase tracking-wider rounded-md ${
                            app.paymentStatus === 'Completed' ? 'bg-green-50 text-green-700 border border-green-200' :
                            app.paymentStatus === 'Failed' ? 'bg-red-50 text-red-700 border border-red-200' :
                            'bg-yellow-50 text-yellow-700 border border-yellow-200'
                          }`}>{app.paymentStatus || 'Pending'}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                          <button onClick={() => handleVerifyPayment(app._id, 'Completed')} className="text-white bg-green-600 hover:bg-green-700 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Mark Paid</button>
                          <button onClick={() => handleVerifyPayment(app._id, 'Failed')} className="text-white bg-red-600 hover:bg-red-700 px-5 py-2 rounded-xl transition-all duration-300 font-bold shadow-md hover:shadow-lg transform hover:-translate-y-0.5">Mark Failed</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Border Control Tab */}
          {activeTab === 'border' && (
            <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                <h3 className="text-lg font-bold text-gray-900 font-sans mb-4">Border Control Scanner</h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    placeholder="Scan QR Code or enter Secure Token..."
                    value={scanToken}
                    onChange={e => setScanToken(e.target.value)}
                    onKeyDown={handleScannerInput}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary"
                  />
                  <button onClick={handleScanOrVerify} className="px-6 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    Scan & View
                  </button>
                  <button onClick={() => handleBorderAction('entry')} className="px-6 py-3 bg-green-600 text-white font-bold rounded-xl hover:bg-green-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">Record Entry</button>
                  <button onClick={() => handleBorderAction('exit')} className="px-6 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300">Record Exit</button>
                </div>
              </div>


              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                  <h3 className="text-lg font-bold text-gray-900 font-sans">Recent Border Movements</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Applicant</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Passport</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Entry Status</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Entry Date</th>
                        <th className="px-6 py-4 font-bold border-b border-gray-100">Exit Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 text-sm">
                      {loading && (
                        <tr><td colSpan="5" className="px-6 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-gray-400"><svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading records...</span></div></td></tr>
                      )}
                      {!loading && borderApps.length === 0 && (
                        <tr><td colSpan="5" className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="font-semibold text-gray-500 text-base">{searchQuery.trim() ? `No border movements found for "${searchQuery.trim()}"` : 'No border movements recorded'}</p>
                            <p className="text-sm text-gray-400">{searchQuery.trim() ? 'Try a different name or passport number.' : 'Approved visa entries and exits will appear here.'}</p>
                          </div>
                        </td></tr>
                      )}
                      {borderApps.map((app) => {
                        const isOverstayed = app.entryStatus === 'Overstayed' || app.overstayAlert;
                        const isNewOverstay = newlyDetectedOverstays.includes(app._id);
                        return (
                          <tr 
                            key={app._id} 
                            className={`transition-colors ${
                              isNewOverstay
                                ? 'bg-red-100/80 hover:bg-red-200 border-l-4 border-red-500 animate-pulse shadow-sm'
                                : isOverstayed 
                                ? 'bg-red-50/80 border-l-4 border-l-red-600 hover:bg-red-100/80 shadow-sm' 
                                : 'hover:bg-gray-50/50'
                            }`}
                          >
                            <td className="px-6 py-4">
                              <div className="font-bold text-gray-900 text-base capitalize flex items-center gap-2">
                                {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                                {isNewOverstay ? (
                                  <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-md font-bold uppercase tracking-widest shadow-sm shadow-red-500/30">
                                    NEW
                                  </span>
                                ) : isOverstayed ? (
                                  <span className="px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-md font-extrabold uppercase tracking-wider shadow-sm shadow-red-500/30">
                                    OVERSTAY
                                  </span>
                                ) : null}
                              </div>
                            </td>
                            <td className="px-6 py-4 text-gray-500 font-mono font-bold uppercase">{app.personalDetails?.passportNumber}</td>
                            <td className="px-6 py-4">
                              <span className={`px-3 py-1.5 inline-flex text-[11px] leading-5 font-extrabold uppercase tracking-wider rounded-lg border ${
                                app.entryStatus === 'Overstayed'
                                  ? 'bg-red-600 text-white border-red-700 shadow-md shadow-red-500/40 ring-2 ring-red-300 animate-pulse'
                                  : app.entryStatus === 'Entered'
                                  ? 'bg-blue-50 text-blue-700 border-blue-200 font-bold'
                                  : app.entryStatus === 'Exited'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 font-bold'
                                  : 'bg-slate-50 text-slate-700 border-slate-200 font-bold'
                              }`}>
                                {app.entryStatus || 'Not Entered'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-500">{app.entryDate ? new Date(app.entryDate).toLocaleString() : '-'}</td>
                            <td className="px-6 py-4 text-gray-500">{app.exitDate ? new Date(app.exitDate).toLocaleString() : '-'}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Alerts Tab */}
          {activeTab === 'alerts' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden border-t-4 border-t-red-500">
              <div className="px-6 py-5 border-b border-gray-100 flex justify-between items-center bg-white">
                <h3 className="text-lg font-bold text-red-700 font-sans flex items-center"><ExclamationTriangleIcon className="w-6 h-6 mr-2"/> Overstay & Security Alerts</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-red-50/50 text-red-700 text-xs uppercase tracking-wider">
                      <th className="px-6 py-4 font-bold border-b border-red-100">Applicant</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100">Passport</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100">Entry Date</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100">Expiration Date</th>
                      <th className="px-6 py-4 font-bold border-b border-red-100 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 text-sm">
                    {loading && (
                      <tr><td colSpan="5" className="px-6 py-10 text-center"><div className="inline-flex items-center justify-center space-x-2 text-red-400"><svg className="animate-spin h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span className="font-medium animate-pulse">Loading alerts...</span></div></td></tr>
                    )}
                    {alertApps.map((app) => (
                      <tr key={app._id} className={`transition-colors ${newlyDetectedOverstays.includes(app._id) ? 'bg-red-100/80 hover:bg-red-200 border-l-4 border-red-500 animate-pulse' : 'hover:bg-red-50/30'}`}>
                        <td className="px-6 py-4 text-gray-800 font-bold">
                          {app.personalDetails?.firstName} {app.personalDetails?.lastName}
                          {newlyDetectedOverstays.includes(app._id) && <span className="ml-3 px-2 py-0.5 text-[10px] bg-red-600 text-white rounded-full font-bold uppercase tracking-widest">NEW</span>}
                        </td>
                        <td className="px-6 py-4 text-gray-600">{app.personalDetails?.passportNumber || app.passportNumber || 'N/A'}</td>
                        <td className="px-6 py-4 text-gray-600">{app.entryDate ? new Date(app.entryDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-red-600 font-bold">{app.expirationDate ? new Date(app.expirationDate).toLocaleDateString() : 'N/A'}</td>
                        <td className="px-6 py-4 text-right">
                          <button onClick={() => setSelectedApplication(app)} className="text-red-700 bg-red-100 px-4 py-2 rounded-lg font-bold hover:bg-red-200">Investigate</button>
                        </td>
                      </tr>
                    ))}
                    {!loading && alertApps.length === 0 && (
                      <tr><td colSpan="5" className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center space-y-3 text-gray-400">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          <p className="font-semibold text-gray-500 text-base">{searchQuery.trim() ? `No overstay alerts found for "${searchQuery.trim()}"` : 'No active overstay alerts'}</p>
                          <p className="text-sm text-gray-400">{searchQuery.trim() ? 'Try a different name or passport number.' : 'Run an overstay check to detect new violations.'}</p>
                        </div>
                      </td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Configurations Tab */}
          {activeTab === 'configs' && (
            <ConfigurationsTab configs={configs} token={token} onRefresh={fetchConfigs} />
          )}

          {/* Reports Tab */}
          {activeTab === 'reports' && (
            <ReportsTab reports={reports} />
          )}
        </main>
      </div>

      {/* Review Modal Dialog */}
      {selectedApplication && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full overflow-hidden border border-gray-100 max-h-[90vh] flex flex-col">
            <div className="bg-gradient-to-r from-blue-900 to-indigo-950 p-6 text-white flex justify-between items-center">
              <div>
                <div className="flex items-center gap-3">
                  <h3 className="font-extrabold text-xl tracking-tight">Application Dossier</h3>
                  <span className="px-3 py-0.5 bg-blue-400/20 text-blue-200 border border-blue-300/30 text-xs font-extrabold rounded-full uppercase tracking-wider">
                    {selectedApplication.visaType} Visa
                  </span>
                </div>
                <p className="text-xs text-blue-300 mt-1 font-mono">ID: {selectedApplication._id}</p>
              </div>
              <button onClick={() => { setSelectedApplication(null); setRejectionReason(''); }} className="text-white/70 hover:text-white text-xl">✕</button>
            </div>
            <div className="p-6 space-y-6 overflow-y-auto flex-1">

              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Personal Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-blue-50/70 p-3 rounded-xl border border-blue-200/60 shadow-sm hover:shadow-md transition-all sm:col-span-2 flex justify-between items-center">
                    <div>
                      <span className="text-blue-600 text-[10px] font-extrabold uppercase tracking-wider block">Visa Category Requested</span>
                      <span className="font-black text-blue-950 text-base">{selectedApplication.visaType} Visa</span>
                    </div>
                    {selectedApplication.applicationType === 'Renewal' && (
                      <span className="px-3 py-1 bg-purple-600 text-white rounded-full font-black text-xs uppercase tracking-wider shadow-sm">
                        RENEWAL APPLICATION
                      </span>
                    )}
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Full Name</span>
                    <span className="font-bold text-slate-800 text-sm capitalize">{selectedApplication.personalDetails?.firstName} {selectedApplication.personalDetails?.lastName}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Passport Number</span>
                    <span className="font-mono font-bold text-slate-800 text-sm uppercase">{selectedApplication.personalDetails?.passportNumber || selectedApplication.passportNumber || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Nationality</span>
                    <span className="font-semibold text-slate-800 text-sm capitalize">{selectedApplication.personalDetails?.nationality || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Email Address</span>
                    <span className="font-semibold text-slate-800 text-sm break-all">{selectedApplication.personalDetails?.email || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Passport Expiry Date</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.personalDetails?.passportExpiry ? new Date(selectedApplication.personalDetails.passportExpiry).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Purpose of Travel</span>
                    <span className="font-semibold text-slate-800 text-sm capitalize">{selectedApplication.purposeOfTravel || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Travel Details</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="sm:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Lodging / Host Address in Somalia</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.travelDetails?.hostAddress || selectedApplication.travelDetails?.address || selectedApplication.hostAddress || selectedApplication.address || 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Expected Arrival Date</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.travelDetails?.arrivalDate ? new Date(selectedApplication.travelDetails.arrivalDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Expected Departure Date</span>
                    <span className="font-semibold text-slate-800 text-sm">{selectedApplication.travelDetails?.departureDate ? new Date(selectedApplication.travelDetails.departureDate).toLocaleDateString() : 'N/A'}</span>
                  </div>
                  <div className="sm:col-span-2 bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Duration (Days)</span>
                    <span className="font-bold text-slate-800 text-sm">
                      {selectedApplication.renewalHistory && selectedApplication.renewalHistory.length > 0
                        ? selectedApplication.renewalHistory[selectedApplication.renewalHistory.length - 1].addedDays
                        : (selectedApplication.visaDuration || 'N/A')} Days
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Documents & Artifacts</h4>
                <div className={`grid grid-cols-1 sm:grid-cols-2 ${(selectedApplication.admissionDocument || (selectedApplication.visaType && selectedApplication.visaType.toLowerCase().includes('student'))) ? 'lg:grid-cols-4' : 'lg:grid-cols-3'} gap-3 text-xs`}>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between">
                    <span className="text-gray-500 text-[11px] font-semibold block mb-2">Passport Scan</span>
                    {selectedApplication.passportDocument ? (
                      <a 
                        href={getDocumentUrl(selectedApplication.passportDocument)} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-full"
                      >
                        <DocumentTextIcon className="w-4 h-4 text-blue-600" /> View Passport
                      </a>
                    ) : <span className="text-gray-400 font-medium">N/A</span>}
                  </div>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between">
                    <span className="text-gray-500 text-[11px] font-semibold block mb-2">Applicant Photo</span>
                    {selectedApplication.supportingDocuments && selectedApplication.supportingDocuments[0] ? (
                      <a 
                        href={getDocumentUrl(selectedApplication.supportingDocuments[0])} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-full"
                      >
                        <CameraIcon className="w-4 h-4 text-blue-600" /> View Photo
                      </a>
                    ) : <span className="text-gray-400 font-medium">N/A</span>}
                  </div>
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200 transition-all flex flex-col justify-between">
                    <span className="text-gray-500 text-[11px] font-semibold block mb-2">Bank Statement</span>
                    {selectedApplication.supportingDocuments && selectedApplication.supportingDocuments[1] ? (
                      <a 
                        href={getDocumentUrl(selectedApplication.supportingDocuments[1])} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="inline-flex items-center justify-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold bg-blue-50/80 hover:bg-blue-100/80 px-3 py-1.5 rounded-lg border border-blue-100 transition-colors w-full"
                      >
                        <BuildingLibraryIcon className="w-4 h-4 text-blue-600" /> View Statement
                      </a>
                    ) : <span className="text-gray-400 font-medium">N/A</span>}
                  </div>
                  {(selectedApplication.admissionDocument || (selectedApplication.visaType && selectedApplication.visaType.toLowerCase().includes('student'))) && (
                    <div className="bg-blue-50/80 p-3.5 rounded-xl border border-blue-200/80 shadow-sm hover:shadow-md hover:border-blue-300 transition-all flex flex-col justify-between ring-1 ring-blue-400/30">
                      <span className="text-blue-900 text-[11px] font-bold block mb-2">Admission Acceptance Letter</span>
                      {selectedApplication.admissionDocument ? (
                        <a 
                          href={getDocumentUrl(selectedApplication.admissionDocument)} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="inline-flex items-center justify-center gap-1.5 text-blue-700 hover:text-blue-900 font-bold bg-blue-100/80 hover:bg-blue-200/80 px-3 py-1.5 rounded-lg border border-blue-200 transition-colors w-full text-center"
                        >
                          <AcademicCapIcon className="w-4 h-4 text-blue-700 shrink-0" /> View Proof
                        </a>
                      ) : <span className="text-gray-400 font-medium">N/A</span>}
                    </div>
                  )}
                </div>
              </div>
              
              {/* Payment Info */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Payment Verification</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Payment Status</span>
                    <span className="font-extrabold text-emerald-600 text-sm uppercase">{selectedApplication.paymentStatus}</span>
                  </div>
                  <div className="bg-slate-50/80 p-3 rounded-xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all">
                    <span className="text-gray-400 text-[10px] font-bold uppercase tracking-wider block mb-1">Transaction Reference</span>
                    <span className="font-mono font-bold text-slate-800 text-sm">{selectedApplication.paymentDetails?.transactionId || 'N/A'}</span>
                  </div>
                </div>
              </div>

              {selectedApplication.qrCodeUrl && (
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-3 border-b border-gray-100 pb-1">Generated Visa Assets</h4>
                  <div className="bg-gradient-to-br from-slate-50 to-blue-50/50 border border-blue-100 rounded-2xl p-4 shadow-lg shadow-blue-950/10 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col sm:flex-row items-center gap-4">
                      <div className="bg-white p-2.5 rounded-xl shadow-sm border border-gray-100 flex-shrink-0">
                        <img src={selectedApplication.qrCodeUrl} alt="Visa Verification QR Code" className="w-24 h-24 rounded-lg object-contain" />
                      </div>
                      <div className="flex-1 space-y-2 text-xs w-full">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 font-semibold rounded-md text-[10px] uppercase tracking-wider">
                            Official Digital Visa
                          </span>
                          {['Approved', 'Active'].includes(selectedApplication.applicationStatus) && selectedApplication.pdfUrl && (
                            <a
                              href={`${import.meta.env.VITE_API_URL || ''}/${(selectedApplication.pdfUrl).replace(/\\/g, '/')}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-sm"
                            >
                              <ArrowDownTrayIcon className="w-3.5 h-3.5" /> Download Official PDF
                            </a>
                          )}
                        </div>
                        <div className="bg-white/90 p-2.5 rounded-xl border border-gray-200/80 shadow-inner">
                          <span className="text-gray-400 font-bold uppercase text-[10px] block mb-0.5">Secure Token</span>
                          <span className="font-mono font-bold text-slate-800 text-xs break-all select-all">
                            {selectedApplication.secureToken}
                          </span>
                        </div>
                        <div className="flex justify-between items-center text-xs pt-0.5">
                          <span className="text-gray-400 font-bold uppercase text-[10px] tracking-wider">Entry Valid Until</span>
                          <span className="font-bold text-slate-800 text-xs">
                            {(() => {
                              if (selectedApplication.entryRecorded && selectedApplication.stayExpiryDate) {
                                return new Date(selectedApplication.stayExpiryDate).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                              }
                              const duration = Number(selectedApplication.visaDuration) || Number(selectedApplication.stayDuration) || 30;
                              const baseDate = selectedApplication.approvalDate || selectedApplication.issueDate || selectedApplication.createdAt;
                              const calculated = baseDate ? new Date(new Date(baseDate).getTime() + duration * 24 * 60 * 60 * 1000) : new Date();
                              return calculated.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
                            })()}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {['Submitted', 'Pending', 'Under Review', 'Needs Revision'].includes(selectedApplication.applicationStatus) && (
                <div className="bg-gradient-to-br from-slate-50 to-gray-100/70 border border-slate-200/80 rounded-2xl p-5 shadow-lg shadow-slate-900/10 hover:shadow-xl transition-all duration-300">
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                    Officer Comments
                  </label>
                  <input
                    type="text"
                    placeholder="Required for reject/revision..."
                    value={rejectionReason}
                    onChange={(e) => setRejectionReason(e.target.value)}
                    className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  />
                </div>
              )}
            </div>

            <div className="bg-gray-50 px-6 py-4 flex justify-between items-center border-t border-gray-100">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status: <span className="text-gray-700">{selectedApplication.applicationStatus === 'Submitted' ? 'Pending' : selectedApplication.applicationStatus === 'Under Review' ? 'Updated Revision' : selectedApplication.applicationStatus}</span></span>
              
              {['Submitted', 'Pending', 'Under Review', 'Needs Revision'].includes(selectedApplication.applicationStatus) ? (
                <div className="space-x-3">
                  <button onClick={() => handleUpdateStatus(selectedApplication._id, 'Rejected')} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md">Reject</button>
                  <button onClick={() => handleUpdateStatus(selectedApplication._id, 'Needs Revision')} className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md">Request Revision</button>
                  <button onClick={() => handleUpdateStatus(selectedApplication._id, 'Approved')} className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white font-bold text-sm rounded-xl transition-colors shadow-md">Approve Visa</button>
                </div>
              ) : (
                <div className="space-x-3">
                  {selectedApplication.overstayAlert && (
                    <button onClick={() => handleSendWarning(selectedApplication._id)} className="px-6 py-2 bg-red-100 text-red-700 hover:bg-red-200 font-bold text-sm rounded-xl transition-colors">
                      <ExclamationTriangleIcon className="w-4 h-4 inline mr-1 -mt-0.5" /> Send Warning Email
                    </button>
                  )}
                  <button onClick={() => setSelectedApplication(null)} className="px-6 py-2 bg-gray-800 hover:bg-gray-700 text-white font-bold text-sm rounded-xl transition-colors">Close Dossier</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OfficerDashboard;
