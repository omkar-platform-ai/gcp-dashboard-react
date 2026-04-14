import React from 'react';
import { Server, Cpu, Clock, Activity } from 'lucide-react';

/**
 * UptimeSparkline
 * ---------------
 * Renders a 28-bar mini bar chart using ONLY CSS flexbox + inline styles.
 * No SVG, no canvas, no chart library.
 *
 * Technique:
 *   - Container is a fixed-height flex row with `items-end` (bars grow upward).
 *   - Each bar's height is set via an inline `style={{ height: `${value}%` }}`.
 *   - Bar colours reflect the magnitude of the datapoint (<80 red, <97 amber, else emerald).
 *   - A pulsing "live" dot on the last bar signals the current status.
 */
const UptimeSparkline = ({ history, compact = false }) => {
  const barHeight = compact ? 24 : 32; // px — total chart height

  const barColor = (value) => {
    if (value < 80) return '#ef4444';   // red-500
    if (value < 97) return '#f59e0b';   // amber-500
    return '#10b981';                   // emerald-500
  };

  return (
    <div
      title="28-day uptime history"
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '1.5px',
        height: `${barHeight}px`,
        width: '100%',
      }}
    >
      {history.map((value, i) => {
        const isLast = i === history.length - 1;
        return (
          <div
            key={i}
            style={{
              flex: '1 1 0',
              height: `${Math.max(4, (value / 100) * barHeight)}px`,
              backgroundColor: barColor(value),
              borderRadius: '1.5px 1.5px 0 0',
              opacity: isLast ? 1 : 0.65 + (i / history.length) * 0.35,
              position: 'relative',
              transition: 'height 0.3s ease',
            }}
          >
            {/* Pulsing "live" dot on the newest bar */}
            {isLast && (
              <span
                style={{
                  position: 'absolute',
                  top: '-5px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: barColor(value),
                  boxShadow: `0 0 4px 2px ${barColor(value)}55`,
                  animation: 'pulse-dot 1.8s ease-in-out infinite',
                }}
              />
            )}
          </div>
        );
      })}
    </div>
  );
};

/**
 * StatusBadge — inline pill with colour derived from status string
 */
const StatusBadge = ({ status }) => {
  let cls = '';
  let dot = '';
  if (status.includes('Healthy')) {
    cls = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    dot = 'bg-emerald-400';
  } else if (status.includes('Degraded')) {
    cls = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    dot = 'bg-amber-400';
  } else {
    cls = 'bg-red-500/10 text-red-400 border-red-500/20';
    dot = 'bg-red-400';
  }

  // Strip the emoji — we use the coloured dot instead
  const label = status.replace(/[^\x20-\x7E]/g, '').trim();

  return (
    <span className={`inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full border ${cls} whitespace-nowrap`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

/**
 * ServiceHealthCard
 * -----------------
 * Props — the `health` object from data.js:
 *   name, status, uptime, activeInstances, maxInstances,
 *   currentRevision, lastDeployTime, uptimeHistory
 */
const ServiceHealthCard = ({ health }) => {
  const {
    name,
    status,
    uptime,
    activeInstances,
    maxInstances,
    currentRevision,
    lastDeployTime,
    uptimeHistory = [],
  } = health;

  // Instance usage ratio for the mini progress bar
  const instanceRatio = maxInstances > 0 ? activeInstances / maxInstances : 0;

  // Relative deploy time
  const relativeTime = (iso) => {
    const diff = Date.now() - new Date(iso).getTime();
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ago`;
    return `${Math.floor(h / 24)}d ago`;
  };

  return (
    <article className="glass rounded-xl p-5 flex flex-col gap-4 hover:bg-white/[0.05] transition-colors duration-200 group">
      {/* ── Header ── */}
      <header className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center flex-shrink-0 group-hover:bg-white/10 transition-colors">
            <Server className="w-4 h-4 text-blue-400" />
          </div>
          <h3 className="font-semibold text-gray-100 truncate text-sm leading-tight">{name}</h3>
        </div>
        <StatusBadge status={status} />
      </header>

      {/* ── Sparkline ── */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <Activity className="w-3 h-3" /> 28-day uptime
          </span>
          <span className="text-xs font-mono font-semibold text-gray-300">{uptime}</span>
        </div>
        <UptimeSparkline history={uptimeHistory} />
      </div>

      {/* ── Metrics grid ── */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        {/* Instances */}
        <div className="bg-white/[0.03] rounded-lg p-2.5">
          <div className="text-gray-500 mb-1 flex items-center gap-1">
            <Cpu className="w-3 h-3" /> Instances
          </div>
          <div className="text-gray-200 font-medium mb-1.5">
            {activeInstances}
            <span className="text-gray-600 font-normal"> / {maxInstances}</span>
          </div>
          {/* CSS-only mini progress bar */}
          <div className="h-1 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-blue-500 transition-all duration-500"
              style={{ width: `${instanceRatio * 100}%` }}
            />
          </div>
        </div>

        {/* Last deploy */}
        <div className="bg-white/[0.03] rounded-lg p-2.5">
          <div className="text-gray-500 mb-1 flex items-center gap-1">
            <Clock className="w-3 h-3" /> Last deploy
          </div>
          <div className="text-gray-200 font-medium">
            {relativeTime(lastDeployTime)}
          </div>
        </div>
      </div>

      {/* ── Revision tag ── */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-gray-600">Revision</span>
        <span className="font-mono text-gray-400 bg-black/30 px-2 py-0.5 rounded truncate max-w-[160px]">
          {currentRevision}
        </span>
      </div>
    </article>
  );
};

export default ServiceHealthCard;
