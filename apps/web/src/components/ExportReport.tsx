'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { FingerprintResult } from '@creepjs/core';
import { Download, FileJson, FileSpreadsheet, Info } from 'lucide-react';
import { toast } from 'sonner';

interface ExportReportProps {
  result: FingerprintResult;
}

export function ExportReport({ result }: ExportReportProps) {
  const exportToJSON = () => {
    try {
      // Create comprehensive JSON export
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          source: 'CreepJS.org',
        },
        fingerprint: {
          id: result.fingerprintId,
          timestamp: result.timestamp,
          confidence: result.confidence,
        },
        collectors: result.data,
        performance: {
          timings: result.timings,
          totalTime: result.timings.total,
        },
        lies: result.data.lies,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creepjs-fingerprint-${result.fingerprintId}-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('JSON exported successfully', {
        description: `File: creepjs-fingerprint-${result.fingerprintId.slice(0, 8)}...json`,
      });
    } catch (error) {
      console.error('Failed to export JSON:', error);
      toast.error('Failed to export JSON', {
        description: 'Please try again or check the console for details.',
      });
    }
  };

  const exportToCSV = () => {
    try {
      // Create CSV with flattened data structure
      const rows: string[][] = [
        ['Category', 'Field', 'Value'],
        ['', '', ''], // Empty row for readability
        ['Basic Info', 'Fingerprint ID', result.fingerprintId],
        ['Basic Info', 'Timestamp', new Date(result.timestamp).toISOString()],
        ['Basic Info', 'Confidence', `${(result.confidence * 100).toFixed(2)}%`],
        ['', '', ''],
      ];

      // Canvas
      if (result.data.canvas) {
        rows.push(['Canvas', 'Hash', result.data.canvas.hash || 'N/A']);
        rows.push(['Canvas', 'Detected', result.data.canvas.hash ? 'Yes' : 'No']);
        rows.push(['', '', '']);
      }

      // WebGL
      if (result.data.webgl) {
        rows.push(['WebGL', 'Hash', result.data.webgl.hash || 'N/A']);
        rows.push(['WebGL', 'Vendor', result.data.webgl.vendor || 'N/A']);
        rows.push(['WebGL', 'Renderer', result.data.webgl.renderer || 'N/A']);
        rows.push(['WebGL', 'Extensions', result.data.webgl.extensions?.length.toString() || '0']);
        rows.push(['', '', '']);
      }

      // Navigator
      if (result.data.navigator) {
        rows.push(['Navigator', 'User Agent', result.data.navigator.userAgent || 'N/A']);
        rows.push(['Navigator', 'Platform', result.data.navigator.platform || 'N/A']);
        rows.push(['Navigator', 'Languages', result.data.navigator.languages?.join(', ') || 'N/A']);
        rows.push(['Navigator', 'Hardware Concurrency', result.data.navigator.hardwareConcurrency?.toString() || 'N/A']);
        rows.push(['Navigator', 'Max Touch Points', result.data.navigator.maxTouchPoints?.toString() || 'N/A']);
        rows.push(['', '', '']);
      }

      // Screen
      if (result.data.screen) {
        rows.push(['Screen', 'Resolution', `${result.data.screen.width}x${result.data.screen.height}`]);
        rows.push(['Screen', 'Available Resolution', `${result.data.screen.availWidth}x${result.data.screen.availHeight}`]);
        rows.push(['Screen', 'Color Depth', `${result.data.screen.colorDepth} bits`]);
        rows.push(['Screen', 'Pixel Depth', `${result.data.screen.pixelDepth} bits`]);
        rows.push(['', '', '']);
      }

      // Fonts
      if (result.data.fonts) {
        rows.push(['Fonts', 'Hash', result.data.fonts.hash || 'N/A']);
        rows.push(['Fonts', 'Detected Count', result.data.fonts.fonts?.length.toString() || '0']);
        if (result.data.fonts.fonts && result.data.fonts.fonts.length > 0) {
          rows.push(['Fonts', 'Sample (First 10)', result.data.fonts.fonts.slice(0, 10).join(', ')]);
        }
        rows.push(['', '', '']);
      }

      // Audio
      if (result.data.audio) {
        rows.push(['Audio', 'Hash', result.data.audio.hash || 'N/A']);
        rows.push(['Audio', 'Sample Rate', result.data.audio.sampleRate?.toString() || 'N/A']);
        rows.push(['', '', '']);
      }

      // Timezone
      if (result.data.timezone) {
        rows.push(['Timezone', 'Timezone', result.data.timezone.timezone || 'N/A']);
        rows.push(['Timezone', 'Offset', result.data.timezone.offset?.toString() || 'N/A']);
        rows.push(['', '', '']);
      }

      // Media Devices
      if (result.data.mediaDevices) {
        rows.push(['Media Devices', 'Hash', result.data.mediaDevices.hash || 'N/A']);
        rows.push(['Media Devices', 'Audio Inputs', result.data.mediaDevices.devices?.filter((d) => d.kind === 'audioinput').length.toString() || '0']);
        rows.push(['Media Devices', 'Video Inputs', result.data.mediaDevices.devices?.filter((d) => d.kind === 'videoinput').length.toString() || '0']);
        rows.push(['Media Devices', 'Audio Outputs', result.data.mediaDevices.devices?.filter((d) => d.kind === 'audiooutput').length.toString() || '0']);
        rows.push(['', '', '']);
      }

      // WebRTC
      if (result.data.webrtc) {
        rows.push(['WebRTC', 'Hash', result.data.webrtc.hash || 'N/A']);
        rows.push(['WebRTC', 'IPv4 Candidates', result.data.webrtc.candidates?.ipv4?.length.toString() || '0']);
        rows.push(['WebRTC', 'IPv6 Candidates', result.data.webrtc.candidates?.ipv6?.length.toString() || '0']);
        if (result.data.webrtc.candidates?.ipv4 && result.data.webrtc.candidates.ipv4.length > 0) {
          rows.push(['WebRTC', 'Sample IPv4', result.data.webrtc.candidates.ipv4[0]]);
        }
        rows.push(['', '', '']);
      }

      // CSS
      if (result.data.css) {
        rows.push(['CSS', 'Hash', result.data.css.hash || 'N/A']);
        rows.push(['CSS', 'System Colors Detected', result.data.css.systemColors ? 'Yes' : 'No']);
        rows.push(['', '', '']);
      }

      // Intl
      if (result.data.intl) {
        rows.push(['Intl', 'Hash', result.data.intl.hash || 'N/A']);
        rows.push(['Intl', 'Locale', result.data.intl.locale || 'N/A']);
        rows.push(['Intl', 'DateTimeFormat', result.data.intl.dateTimeFormat || 'N/A']);
        rows.push(['Intl', 'NumberFormat', result.data.intl.numberFormat || 'N/A']);
        rows.push(['', '', '']);
      }

      // Headless Detection
      if (result.data.headless) {
        rows.push(['Headless Detection', 'Detected', result.data.headless.isHeadless ? 'Yes' : 'No']);
        rows.push(['Headless Detection', 'Confidence', `${(result.data.headless.confidence * 100).toFixed(2)}%`]);
        if (result.data.headless.indicators && result.data.headless.indicators.length > 0) {
          rows.push(['Headless Detection', 'Indicators', result.data.headless.indicators.join(', ')]);
        }
        rows.push(['', '', '']);
      }

      // Lies Detection
      if (result.data.lies) {
        rows.push(['Lies Detection', 'Total Lies', result.data.lies.totalLies?.toString() || '0']);
        if (result.data.lies.lies && result.data.lies.lies.length > 0) {
          result.data.lies.lies.forEach((lie, index) => {
            rows.push(['Lies Detection', `Lie ${index + 1}`, lie]);
          });
        }
        rows.push(['', '', '']);
      }

      // Performance
      rows.push(['Performance', 'Total Time', `${result.timings.total.toFixed(2)}ms`]);
      rows.push(['Performance', 'Canvas Time', `${result.timings.canvas.toFixed(2)}ms`]);
      rows.push(['Performance', 'WebGL Time', `${result.timings.webgl.toFixed(2)}ms`]);
      rows.push(['Performance', 'Navigator Time', `${result.timings.navigator.toFixed(2)}ms`]);
      rows.push(['Performance', 'Screen Time', `${result.timings.screen.toFixed(2)}ms`]);
      rows.push(['Performance', 'Fonts Time', `${result.timings.fonts.toFixed(2)}ms`]);
      rows.push(['Performance', 'Audio Time', `${result.timings.audio.toFixed(2)}ms`]);

      // Convert to CSV string
      const csvContent = rows
        .map((row) =>
          row.map((cell) => {
            // Escape quotes and wrap in quotes if contains comma, newline, or quote
            const cellStr = String(cell);
            if (cellStr.includes(',') || cellStr.includes('\n') || cellStr.includes('"')) {
              return `"${cellStr.replace(/"/g, '""')}"`;
            }
            return cellStr;
          }).join(',')
        )
        .join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creepjs-fingerprint-${result.fingerprintId}-${Date.now()}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      toast.success('CSV exported successfully', {
        description: `File: creepjs-fingerprint-${result.fingerprintId.slice(0, 8)}...csv`,
      });
    } catch (error) {
      console.error('Failed to export CSV:', error);
      toast.error('Failed to export CSV', {
        description: 'Please try again or check the console for details.',
      });
    }
  };

  const exportHistory = () => {
    try {
      const stored = localStorage.getItem('creepjs_history');
      if (!stored) {
        toast.warning('No history records found', {
          description: 'Visit the demo page multiple times to build history.',
        });
        return;
      }

      const history = JSON.parse(stored);
      const exportData = {
        metadata: {
          exportDate: new Date().toISOString(),
          version: '1.0.0',
          source: 'CreepJS.org',
          recordCount: history.length,
        },
        history: history,
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `creepjs-history-${Date.now()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('History exported successfully', {
        description: `Exported ${history.length} fingerprint record${history.length === 1 ? '' : 's'}`,
      });
    } catch (error) {
      console.error('Failed to export history:', error);
      toast.error('Failed to export history', {
        description: 'Please try again or check the console for details.',
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Report
        </CardTitle>
        <CardDescription>
          Download your fingerprint data in various formats for analysis or record-keeping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Export Options */}
          <div className="grid md:grid-cols-3 gap-4">
            {/* JSON Export */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">JSON Format</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Complete fingerprint data with all collectors and metadata in JSON format. Best for
                programmatic analysis.
              </p>
              <Button onClick={exportToJSON} className="w-full" variant="outline">
                <FileJson className="h-4 w-4 mr-2" />
                Download JSON
              </Button>
            </div>

            {/* CSV Export */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">CSV Format</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Flattened data in CSV format. Ideal for spreadsheet analysis in Excel or Google
                Sheets.
              </p>
              <Button onClick={exportToCSV} className="w-full" variant="outline">
                <FileSpreadsheet className="h-4 w-4 mr-2" />
                Download CSV
              </Button>
            </div>

            {/* History Export */}
            <div className="space-y-3 p-4 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Full History</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Export all stored history records in JSON format. Useful for backing up your data.
              </p>
              <Button onClick={exportHistory} className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download History
              </Button>
            </div>
          </div>

          {/* Information Note */}
          <div className="flex items-start gap-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Info className="h-5 w-5 mt-0.5 text-blue-500 flex-shrink-0" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">About Exports</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>All exports are generated locally in your browser</li>
                <li>No data is sent to any server during export</li>
                <li>JSON files contain complete raw data from all collectors</li>
                <li>CSV files contain summarized data in spreadsheet-friendly format</li>
                <li>History exports include all fingerprints stored in your browser</li>
              </ul>
            </div>
          </div>

          {/* Data Structure Info */}
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">JSON Export Structure</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="text-xs font-mono overflow-x-auto">
{`{
  "metadata": {
    "exportDate": "ISO timestamp",
    "version": "1.0.0",
    "source": "CreepJS.org"
  },
  "fingerprint": {
    "id": "unique fingerprint ID",
    "timestamp": "collection timestamp",
    "confidence": "0.0 - 1.0"
  },
  "collectors": {
    "canvas": { ... },
    "webgl": { ... },
    "navigator": { ... },
    // ... all other collectors
  },
  "performance": {
    "timings": { ... },
    "totalTime": "milliseconds"
  },
  "lies": { ... }
}`}
              </pre>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
