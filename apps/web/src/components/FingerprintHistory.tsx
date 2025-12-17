'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FingerprintResult } from '@creepjs/core';
import {
  History,
  Trash2,
  TrendingUp,
  Calendar,
  Hash,
  Check,
  X,
} from 'lucide-react';
import { FingerprintComparison } from '@/components/FingerprintComparison';
import { toast } from 'sonner';

interface FingerprintHistoryProps {
  currentResult: FingerprintResult;
  onCompare?: (selectedIds: string[]) => void;
}

interface HistoryRecord extends FingerprintResult {
  id: string;
}

export function FingerprintHistory({
  currentResult,
  onCompare,
}: FingerprintHistoryProps) {
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [comparing, setComparing] = useState(false);
  const [comparisonFingerprints, setComparisonFingerprints] = useState<
    [FingerprintResult, FingerprintResult] | null
  >(null);

  useEffect(() => {
    loadHistory();
    saveCurrentToHistory();
  }, [currentResult]);

  const loadHistory = () => {
    try {
      const stored = localStorage.getItem('creepjs_history');
      if (stored) {
        const parsed = JSON.parse(stored) as HistoryRecord[];
        // Sort by timestamp descending (newest first)
        parsed.sort((a, b) => b.timestamp - a.timestamp);
        setHistory(parsed);
      }
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  };

  const saveCurrentToHistory = () => {
    try {
      const stored = localStorage.getItem('creepjs_history');
      let historyArray: HistoryRecord[] = stored ? JSON.parse(stored) : [];

      // Add current result with unique ID
      const record: HistoryRecord = {
        ...currentResult,
        id: `${currentResult.fingerprintId}-${currentResult.timestamp}`,
      };

      // Check if already exists (same fingerprint ID and close timestamp)
      const exists = historyArray.some(
        (r) =>
          r.fingerprintId === record.fingerprintId &&
          Math.abs(r.timestamp - record.timestamp) < 5000 // Within 5 seconds
      );

      if (!exists) {
        historyArray.push(record);
        // Keep only last 50 records
        if (historyArray.length > 50) {
          historyArray = historyArray.slice(-50);
        }
        localStorage.setItem('creepjs_history', JSON.stringify(historyArray));
        loadHistory();
      }
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  };

  const deleteRecord = (id: string) => {
    try {
      const updated = history.filter((r) => r.id !== id);
      localStorage.setItem('creepjs_history', JSON.stringify(updated));
      setHistory(updated);
      setSelectedForCompare((prev) =>
        prev.filter((selectedId) => selectedId !== id)
      );
      toast.success('Record deleted', {
        description: 'Fingerprint record has been removed from history.',
      });
    } catch (error) {
      console.error('Failed to delete record:', error);
      toast.error('Failed to delete record', {
        description: 'Please try again or check the console for details.',
      });
    }
  };

  const clearAllHistory = () => {
    if (confirm('Are you sure you want to delete all history records?')) {
      try {
        localStorage.removeItem('creepjs_history');
        setHistory([]);
        setSelectedForCompare([]);
        toast.success('All history cleared', {
          description: 'All fingerprint records have been deleted.',
        });
      } catch (error) {
        console.error('Failed to clear history:', error);
        toast.error('Failed to clear history', {
          description: 'Please try again or check the console for details.',
        });
      }
    }
  };

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare((prev) => {
      if (prev.includes(id)) {
        return prev.filter((selectedId) => selectedId !== id);
      } else {
        // Only allow selecting 2 at a time
        if (prev.length >= 2) {
          return [prev[1], id];
        }
        return [...prev, id];
      }
    });
  };

  const handleCompare = () => {
    if (selectedForCompare.length === 2) {
      // Find the two selected fingerprints
      const fp1 = history.find((r) => r.id === selectedForCompare[0]);
      const fp2 = history.find((r) => r.id === selectedForCompare[1]);

      if (fp1 && fp2) {
        // Sort by timestamp (older first, newer second)
        const sorted = [fp1, fp2].sort((a, b) => a.timestamp - b.timestamp);
        setComparisonFingerprints([sorted[0], sorted[1]]);
        setComparing(true);
        toast.info('Comparing fingerprints', {
          description: `${new Date(sorted[0].timestamp).toLocaleDateString()} vs ${new Date(sorted[1].timestamp).toLocaleDateString()}`,
        });
      }

      // Call the optional callback
      if (onCompare) {
        onCompare(selectedForCompare);
      }
    }
  };

  const closeComparison = () => {
    setComparing(false);
    setComparisonFingerprints(null);
  };

  // Calculate statistics
  const avgCoverage =
    history.length > 0
      ? history.reduce((sum, r) => sum + r.confidence, 0) / history.length
      : 0;

  const uniqueFingerprints = new Set(history.map((r) => r.fingerprintId)).size;

  const coverageTrend =
    history.length >= 2
      ? history[0].confidence - history[history.length - 1].confidence
      : 0;

  return (
    <div className="space-y-6">
      {/* Statistics Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Fingerprint History
          </CardTitle>
          <CardDescription>
            Track changes in your browser fingerprint over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-muted/50 space-y-1 rounded-lg p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <History className="h-4 w-4" />
                <span>Total Records</span>
              </div>
              <div className="text-2xl font-bold">{history.length}</div>
            </div>
            <div className="bg-muted/50 space-y-1 rounded-lg p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Hash className="h-4 w-4" />
                <span>Unique IDs</span>
              </div>
              <div className="text-2xl font-bold">{uniqueFingerprints}</div>
            </div>
            <div className="bg-muted/50 space-y-1 rounded-lg p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <Check className="h-4 w-4" />
                <span>Avg Coverage</span>
              </div>
              <div className="text-2xl font-bold">
                {(avgCoverage * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-muted/50 space-y-1 rounded-lg p-4">
              <div className="text-muted-foreground flex items-center gap-2 text-sm">
                <TrendingUp className="h-4 w-4" />
                <span>Trend</span>
              </div>
              <div
                className={`text-2xl font-bold ${
                  coverageTrend > 0
                    ? 'text-green-600 dark:text-green-400'
                    : coverageTrend < 0
                      ? 'text-red-600 dark:text-red-400'
                      : ''
                }`}
              >
                {coverageTrend > 0 ? '+' : ''}
                {(coverageTrend * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-4 flex gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCompare}
              disabled={selectedForCompare.length !== 2}
            >
              Compare Selected ({selectedForCompare.length}/2)
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={clearAllHistory}
              disabled={history.length === 0}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* History Records */}
      {history.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <div className="text-muted-foreground py-8 text-center">
              <History className="mx-auto mb-4 h-12 w-12 opacity-50" />
              <p>
                No history records yet. Visit this page multiple times to build
                history.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {history.map((record, index) => {
            const isSelected = selectedForCompare.includes(record.id);
            const isCurrent = record.timestamp === currentResult.timestamp;

            return (
              <Card
                key={record.id}
                className={`transition-all ${
                  isSelected ? 'border-primary border-2' : ''
                } ${isCurrent ? 'bg-primary/5' : ''}`}
              >
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    {/* Selection Checkbox */}
                    <button
                      onClick={() => toggleSelectForCompare(record.id)}
                      className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded border-2 transition-all ${
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground'
                          : 'border-muted-foreground/30 hover:border-primary'
                      }`}
                    >
                      {isSelected && <Check className="h-4 w-4" />}
                    </button>

                    {/* Record Info */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {isCurrent && (
                              <span className="bg-primary text-primary-foreground rounded-full px-2 py-1 text-xs">
                                CURRENT
                              </span>
                            )}
                            <span className="text-muted-foreground text-xs">
                              #{history.length - index}
                            </span>
                          </div>
                          <div className="text-muted-foreground flex items-center gap-2 text-sm">
                            <Calendar className="h-4 w-4" />
                            <span>
                              {new Date(record.timestamp).toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteRecord(record.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>

                      <div className="grid gap-4 md:grid-cols-3">
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-xs">
                            Fingerprint ID
                          </div>
                          <code className="break-all font-mono text-sm">
                            {record.fingerprintId}
                          </code>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-xs">
                            Coverage
                          </div>
                          <div className="flex items-center gap-2">
                            <div
                              className={`text-lg font-bold ${
                                record.confidence >= 0.8
                                  ? 'text-green-600 dark:text-green-400'
                                  : record.confidence >= 0.6
                                    ? 'text-yellow-600 dark:text-yellow-400'
                                    : 'text-red-600 dark:text-red-400'
                              }`}
                            >
                              {(record.confidence * 100).toFixed(1)}%
                            </div>
                            <div className="bg-muted h-2 flex-1 overflow-hidden rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  record.confidence >= 0.8
                                    ? 'bg-green-500'
                                    : record.confidence >= 0.6
                                      ? 'bg-yellow-500'
                                      : 'bg-red-500'
                                }`}
                                style={{ width: `${record.confidence * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-muted-foreground text-xs">
                            Collection Time
                          </div>
                          <div className="text-sm font-medium">
                            {(record.timings.total ?? 0).toFixed(0)}ms
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Fingerprint Comparison */}
      {comparing && comparisonFingerprints && (
        <FingerprintComparison
          fingerprint1={comparisonFingerprints[0]}
          fingerprint2={comparisonFingerprints[1]}
          onClose={closeComparison}
        />
      )}
    </div>
  );
}
