import React, { useState, useEffect } from 'react';
import {
  X,
  Activity,
  Trash2,
  RefreshCw,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import type { NetworkLog } from '@/types';
import { subscribeNetworkLogs, simulationState, resetDemoData } from '@/lib/api';

interface ApiInspectorDrawerProps {
  open: boolean;
  onClose: () => void;
  onResetData: () => void;
}

export default function ApiInspectorDrawer({
  open,
  onClose,
  onResetData,
}: ApiInspectorDrawerProps) {
  const [logs, setLogs] = useState<NetworkLog[]>([]);
  const [errorMode, setErrorMode] = useState<'none' | '500' | '400'>(simulationState.errorMode);
  const [delayMs, setDelayMs] = useState<number>(simulationState.delayMs);
  const [selectedLogId, setSelectedLogId] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeNetworkLogs((newLog) => {
      setLogs((prev) => [newLog, ...prev.slice(0, 49)]); // keep last 50
    });
    return unsubscribe;
  }, []);

  const handleApplySimulation = (mode: 'none' | '500' | '400', delay: number) => {
    setErrorMode(mode);
    setDelayMs(delay);
    simulationState.errorMode = mode;
    simulationState.delayMs = delay;
  };

  const handleResetDb = async () => {
    setIsResetting(true);
    try {
      await resetDemoData();
      onResetData();
    } catch (err) {
      console.error(err);
    } finally {
      setIsResetting(false);
    }
  };

  if (!open) return null;

  const selectedLog = logs.find((l) => l.id === selectedLogId);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col h-full transform transition-transform">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <Activity size={18} />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-slate-900">API & Network Inspector</h2>
              <p className="text-[11px] text-slate-500">Live telemetry, request auditing & simulation suite</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
            aria-label="Close API Inspector"
          >
            <X size={18} />
          </button>
        </div>

        {/* Simulator Control Bar */}
        <div className="p-5 border-b border-slate-200 bg-slate-50/30">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-800">
              <Sliders size={14} className="text-slate-500" />
              <span>Simulate Edge Conditions (Task 3 Testing)</span>
            </div>
            <button
              type="button"
              onClick={handleResetDb}
              disabled={isResetting}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium text-slate-700 bg-white border border-slate-200 rounded-md hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              <RefreshCw size={11} className={isResetting ? 'animate-spin' : ''} />
              <span>Reset Sample DB</span>
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              type="button"
              onClick={() => handleApplySimulation('none', delayMs)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                errorMode === 'none'
                  ? 'bg-emerald-50 border-emerald-300 text-emerald-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Normal (200 OK)
            </button>
            <button
              type="button"
              onClick={() => handleApplySimulation('500', delayMs)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                errorMode === '500'
                  ? 'bg-rose-50 border-rose-300 text-rose-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Simulate 500 Error
            </button>
            <button
              type="button"
              onClick={() => handleApplySimulation('400', delayMs)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border text-center transition-all ${
                errorMode === '400'
                  ? 'bg-amber-50 border-amber-300 text-amber-800 font-semibold'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
              }`}
            >
              Simulate 400 Bad
            </button>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-slate-400" /> Simulated Latency:
            </span>
            <div className="flex items-center gap-1.5">
              {[0, 800, 1800].map((ms) => (
                <button
                  key={ms}
                  type="button"
                  onClick={() => handleApplySimulation(errorMode, ms)}
                  className={`px-2 py-0.5 rounded text-[11px] border font-mono ${
                    delayMs === ms
                      ? 'bg-slate-900 border-slate-900 text-white font-medium'
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  {ms === 0 ? '0ms' : `${ms}ms`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Live Requests List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400 font-medium">
            <span>Recent Requests ({logs.length})</span>
            {logs.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  setLogs([]);
                  setSelectedLogId(null);
                }}
                className="inline-flex items-center gap-1 hover:text-slate-700 transition-colors"
              >
                <Trash2 size={12} /> Clear Logs
              </button>
            )}
          </div>

          {logs.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <Activity size={24} className="mx-auto mb-2 text-slate-300" />
              <p>No API requests recorded yet.</p>
              <p className="mt-1 text-slate-400">Trigger actions in the UI to see live requests.</p>
            </div>
          ) : (
            logs.map((log) => {
              const isSelected = log.id === selectedLogId;
              const isSuccess = log.status >= 200 && log.status < 300;
              const isError = !isSuccess;

              return (
                <div
                  key={log.id}
                  onClick={() => setSelectedLogId(isSelected ? null : log.id)}
                  className={`cursor-pointer rounded-lg border text-xs p-3 transition-all ${
                    isSelected
                      ? 'border-slate-900 bg-slate-50'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 font-mono">
                      <span
                        className={`font-semibold px-1.5 py-0.5 rounded text-[10px] ${
                          log.method === 'GET'
                            ? 'bg-blue-50 text-blue-700'
                            : log.method === 'POST'
                            ? 'bg-emerald-50 text-emerald-700'
                            : log.method === 'PUT'
                            ? 'bg-amber-50 text-amber-700'
                            : 'bg-rose-50 text-rose-700'
                        }`}
                      >
                        {log.method}
                      </span>
                      <span className="text-slate-700 font-medium truncate max-w-[200px]">
                        {log.url}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 font-mono tabular-nums text-[11px]">
                      <span
                        className={`font-bold ${
                          isSuccess
                            ? 'text-emerald-600'
                            : log.status === 0
                            ? 'text-slate-400'
                            : 'text-rose-600'
                        }`}
                      >
                        {log.status === 0 ? 'FAIL' : log.status}
                      </span>
                      <span className="text-slate-400">{log.durationMs}ms</span>
                      {isSelected ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    </div>
                  </div>

                  {isSelected && (
                    <div className="mt-3 pt-3 border-t border-slate-200 space-y-2">
                      {Boolean(log.requestBody) && (
                        <div>
                          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                            Request Payload
                          </p>
                          <pre className="p-2 bg-slate-900 text-slate-100 rounded text-[11px] overflow-x-auto font-mono">
                            {JSON.stringify(log.requestBody, null, 2)}
                          </pre>
                        </div>
                      )}

                      <div>
                        <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
                          Response Body
                        </p>
                        <pre className="p-2 bg-slate-900 text-slate-100 rounded text-[11px] overflow-x-auto font-mono">
                          {typeof log.responseBody === 'object'
                            ? JSON.stringify(log.responseBody, null, 2)
                            : String(log.responseBody || 'No content (204)')}
                        </pre>
                      </div>

                      {log.error && (
                        <p className="text-rose-600 text-[11px] font-medium">Error: {log.error}</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
