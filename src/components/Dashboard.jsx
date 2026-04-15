import React, { useState, useMemo } from 'react';
import { initialDeployments, initialServiceHealth } from '../data';
import ServiceHealthCard from './ServiceHealthCard';
import {
  Search, Activity, Clock, FileText,
  CheckCircle, XCircle, AlertTriangle,
} from 'lucide-react';

/* ─── Helpers ────────────────────────────────────────────────── */
const getStatusIcon = (status) => {
  if (status === 'success') return <CheckCircle className="w-4 h-4 text-emerald-500" />;
  if (status === 'failed')  return <XCircle className="w-4 h-4 text-red-500" />;
  return <AlertTriangle className="w-4 h-4 text-amber-500" />;
};

const STATUS_PILL = {
  success:  'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
  failed:   'bg-red-500/10 text-red-400 border-red-500/20',
  rollback: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
};

const fmt = new Intl.DateTimeFormat('en-US', {
  month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
});

/* ─── Dashboard ──────────────────────────────────────────────── */
const Dashboard = () => {
  const [search,       setSearch]       = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  /* Client-side filtering — no backend call */
  const filteredDeployments = useMemo(() => {
    const q = search.toLowerCase();
    return initialDeployments.filter((d) => {
      const matchSearch = d.serviceName.toLowerCase().includes(q) ||
                          d.imageTag.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || d.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [search, statusFilter]);

  const visibleCards = useMemo(() =>
    Object.values(initialServiceHealth).filter((h) =>
      !search || h.name.toLowerCase().includes(search.toLowerCase())
    ),
    [search]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-6 py-8 space-y-10 pb-24">

      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
            GCP Microservices
          </h1>
          <p className="text-gray-400 mt-1 text-sm">
            Platform · deployment &amp; health overview
          </p>
        </div>

        {/* Controls */}
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            <input
              id="service-search"
              type="text"
              placeholder="Filter by service or image tag…"
              className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-500"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            id="status-filter"
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2 text-sm text-gray-300
                       focus:outline-none focus:ring-2 focus:ring-blue-500/50 cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Any Status</option>
            <option value="success">✓ Success</option>
            <option value="failed">✗ Failed</option>
            <option value="rollback">↩ Rollback</option>
          </select>
        </div>
      </header>

      {/* ── Service Health Cards ─────────────────────────────── */}
      <section aria-label="Service Health Summary">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <Activity className="w-4 h-4 text-blue-400" />
          Service Health
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visibleCards.map((health) => (
            <ServiceHealthCard key={health.name} health={health} />
          ))}
          {visibleCards.length === 0 && (
            <p className="col-span-4 text-center text-gray-600 py-12">
              No services match &quot;{search}&quot;.
            </p>
          )}
        </div>
      </section>

      {/* ── Deployment Timeline ──────────────────────────────── */}
      <section aria-label="Deployment Timeline">
        <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4 flex items-center gap-2">
          <Clock className="w-4 h-4 text-blue-400" />
          Deployment Timeline
          <span className="ml-auto text-xs normal-case tracking-normal text-gray-600">
            Showing {Math.min(filteredDeployments.length, 60)} of {filteredDeployments.length}
          </span>
        </h2>

        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-white/[0.04] border-b border-white/10 text-xs uppercase tracking-wider text-gray-500">
                  <th className="px-5 py-3 font-medium">Service / Revision</th>
                  <th className="px-5 py-3 font-medium">Status</th>
                  <th className="px-5 py-3 font-medium hidden md:table-cell">Image Tag</th>
                  <th className="px-5 py-3 font-medium hidden lg:table-cell">Deployer</th>
                  <th className="px-5 py-3 font-medium text-right">Time</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-white/[0.04]">
                {filteredDeployments.slice(0, 60).map((dep) => (
                  <tr key={dep.id} className="hover:bg-white/[0.025] transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-gray-200">{dep.serviceName}</div>
                      <div className="text-xs font-mono text-gray-500 mt-0.5">{dep.revision}</div>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${STATUS_PILL[dep.status]}`}>
                        {getStatusIcon(dep.status)}
                        <span className="capitalize">{dep.status}</span>
                      </span>
                    </td>

                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <div className="flex items-center gap-1.5 text-xs font-mono text-gray-400
                                      bg-black/30 rounded px-2 py-1 w-fit max-w-[200px] truncate"
                           title={dep.imageTag}>
                        <FileText className="w-3 h-3 flex-shrink-0" />
                        {dep.imageTag.split('/').pop()}
                      </div>
                    </td>

                    <td className="px-5 py-3.5 hidden lg:table-cell text-xs text-gray-400">
                      {dep.deployer}
                    </td>

                    <td className="px-5 py-3.5 text-right text-xs text-gray-400 whitespace-nowrap tabular-nums">
                      {fmt.format(new Date(dep.timestamp))}
                    </td>
                  </tr>
                ))}

                {filteredDeployments.length === 0 && (
                  <tr>
                    <td colSpan="5" className="px-5 py-14 text-center text-gray-600">
                      No deployments match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-600">
        <span>
          Built with{' '}
          <span className="text-white/30">✦</span>{' '}
          <span className="text-gray-400 font-medium">Google Antigravity</span>
        </span>
        <span>
          by{' '}
          <a
            href="https://www.linkedin.com/in/oomkar-sonawane/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
          >
            Omkar Sonawane
          </a>
          <span className="text-gray-600 mx-1.5">·</span>
          Platform Engineering Leader
        </span>
      </footer>
    </div>
  );
};

export default Dashboard;
