'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
          source: 'CreepJS 2.0',
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
        ['Basic Info', 'Coverage', `${(result.confidence * 100).toFixed(2)}%`],
        ['', '', ''],
      ];

      // Canvas
      if (result.data.canvas) {
        rows.push(['Canvas', 'Hash', result.data.canvas.hash || 'N/A']);
        rows.push([
          'Canvas',
          'Detected',
          result.data.canvas.hash ? 'Yes' : 'No',
        ]);
        rows.push(['', '', '']);
      }

      // WebGL
      if (result.data.webgl) {
        rows.push(['WebGL', 'Vendor', result.data.webgl.vendor || 'N/A']);
        rows.push(['WebGL', 'Renderer', result.data.webgl.renderer || 'N/A']);
        rows.push(['WebGL', 'Version', result.data.webgl.version || 'N/A']);
        rows.push([
          'WebGL',
          'Shading Language',
          result.data.webgl.shadingLanguageVersion || 'N/A',
        ]);
        if (result.data.webgl.unmaskedRenderer) {
          rows.push([
            'WebGL',
            'Unmasked Renderer',
            result.data.webgl.unmaskedRenderer,
          ]);
        }
        rows.push(['', '', '']);
      }

      // Navigator
      if (result.data.navigator) {
        rows.push([
          'Navigator',
          'User Agent',
          result.data.navigator.userAgent || 'N/A',
        ]);
        rows.push([
          'Navigator',
          'Platform',
          result.data.navigator.platform || 'N/A',
        ]);
        rows.push([
          'Navigator',
          'Language',
          result.data.navigator.language || 'N/A',
        ]);
        if (result.data.languages) {
          rows.push([
            'Navigator',
            'Languages',
            result.data.languages.flat().join(', '),
          ]);
        }
        if (result.data.hardwareConcurrency) {
          rows.push([
            'System',
            'Hardware Concurrency',
            result.data.hardwareConcurrency.toString(),
          ]);
        }
        if (result.data.touchSupport?.maxTouchPoints) {
          rows.push([
            'System',
            'Max Touch Points',
            result.data.touchSupport.maxTouchPoints.toString(),
          ]);
        }
        rows.push(['', '', '']);
      }

      // Screen
      if (result.data.screen) {
        rows.push([
          'Screen',
          'Resolution',
          `${result.data.screen.width}x${result.data.screen.height}`,
        ]);
        rows.push([
          'Screen',
          'Available Resolution',
          `${result.data.screen.availWidth}x${result.data.screen.availHeight}`,
        ]);
        rows.push([
          'Screen',
          'Color Depth',
          `${result.data.screen.colorDepth} bits`,
        ]);
        rows.push([
          'Screen',
          'Pixel Depth',
          `${result.data.screen.pixelDepth} bits`,
        ]);
        rows.push(['', '', '']);
      }

      // Fonts
      if (result.data.fonts) {
        rows.push([
          'Fonts',
          'Detected Count',
          result.data.fonts.count.toString(),
        ]);
        if (
          result.data.fonts.available &&
          result.data.fonts.available.length > 0
        ) {
          rows.push([
            'Fonts',
            'Sample (First 10)',
            result.data.fonts.available.slice(0, 10).join(', '),
          ]);
        }
        rows.push(['', '', '']);
      }

      // Audio
      if (result.data.audio) {
        rows.push(['Audio', 'Hash', result.data.audio.hash || 'N/A']);
        rows.push([
          'Audio',
          'Sample Rate',
          result.data.audio.sampleRate?.toString() || 'N/A',
        ]);
        rows.push(['', '', '']);
      }

      // Timezone
      if (result.data.timezone) {
        rows.push([
          'Timezone',
          'Timezone',
          result.data.timezone.timezone || 'N/A',
        ]);
        rows.push([
          'Timezone',
          'Offset',
          result.data.timezone.timezoneOffset?.toString() || 'N/A',
        ]);
        rows.push(['Timezone', 'Locale', result.data.timezone.locale || 'N/A']);
        rows.push(['', '', '']);
      }

      // Media Devices
      if (result.data.media) {
        rows.push([
          'Media Devices',
          'Audio Inputs',
          result.data.media.deviceCount.audioInput.toString(),
        ]);
        rows.push([
          'Media Devices',
          'Video Inputs',
          result.data.media.deviceCount.videoInput.toString(),
        ]);
        rows.push([
          'Media Devices',
          'Audio Outputs',
          result.data.media.deviceCount.audioOutput.toString(),
        ]);
        rows.push(['', '', '']);
      }

      // WebRTC
      if (result.data.webrtc) {
        rows.push(['WebRTC', 'Hash', result.data.webrtc.hash || 'N/A']);
        rows.push([
          'WebRTC',
          'IPv4 Candidates',
          result.data.webrtc.candidates?.ipv4?.length.toString() || '0',
        ]);
        rows.push([
          'WebRTC',
          'IPv6 Candidates',
          result.data.webrtc.candidates?.ipv6?.length.toString() || '0',
        ]);
        if (
          result.data.webrtc.candidates?.ipv4 &&
          result.data.webrtc.candidates.ipv4.length > 0
        ) {
          rows.push([
            'WebRTC',
            'Sample IPv4',
            result.data.webrtc.candidates.ipv4[0],
          ]);
        }
        rows.push(['', '', '']);
      }

      // CSS
      if (result.data.css) {
        rows.push(['CSS', 'Hash', result.data.css.hash || 'N/A']);
        rows.push([
          'CSS',
          'System Fonts',
          Object.keys(result.data.css.systemFonts).length.toString(),
        ]);
        rows.push([
          'CSS',
          'Computed Styles',
          Object.keys(result.data.css.styles).length.toString(),
        ]);
        rows.push(['', '', '']);
      }

      // Date/Time Locale
      if (
        result.data.dateTimeLocale &&
        typeof result.data.dateTimeLocale === 'string'
      ) {
        rows.push(['Locale', 'Date/Time Locale', result.data.dateTimeLocale]);
        rows.push(['', '', '']);
      }

      // Lies Detection
      if (result.data.lies) {
        rows.push([
          'Lies Detection',
          'Total Lies',
          result.data.lies.liesCount?.toString() || '0',
        ]);
        rows.push([
          'Lies Detection',
          'Trust Score',
          result.data.lies.trustScore?.toString() || 'N/A',
        ]);
        if (
          result.data.lies.inconsistencies &&
          result.data.lies.inconsistencies.length > 0
        ) {
          result.data.lies.inconsistencies.forEach((inconsistency, index) => {
            rows.push(['Lies Detection', `Issue ${index + 1}`, inconsistency]);
          });
        }
        rows.push(['', '', '']);
      }

      // Performance
      rows.push([
        'Performance',
        'Total Time',
        `${(result.timings.total ?? 0).toFixed(2)}ms`,
      ]);
      if (result.timings.canvas !== undefined) {
        rows.push([
          'Performance',
          'Canvas Time',
          `${result.timings.canvas.toFixed(2)}ms`,
        ]);
      }
      if (result.timings.webgl !== undefined) {
        rows.push([
          'Performance',
          'WebGL Time',
          `${result.timings.webgl.toFixed(2)}ms`,
        ]);
      }
      if (result.timings.navigator !== undefined) {
        rows.push([
          'Performance',
          'Navigator Time',
          `${result.timings.navigator.toFixed(2)}ms`,
        ]);
      }
      if (result.timings.screen !== undefined) {
        rows.push([
          'Performance',
          'Screen Time',
          `${result.timings.screen.toFixed(2)}ms`,
        ]);
      }
      if (result.timings.fonts !== undefined) {
        rows.push([
          'Performance',
          'Fonts Time',
          `${result.timings.fonts.toFixed(2)}ms`,
        ]);
      }
      if (result.timings.audio !== undefined) {
        rows.push([
          'Performance',
          'Audio Time',
          `${result.timings.audio.toFixed(2)}ms`,
        ]);
      }

      // Convert to CSV string
      const csvContent = rows
        .map((row) =>
          row
            .map((cell) => {
              // Escape quotes and wrap in quotes if contains comma, newline, or quote
              const cellStr = String(cell);
              if (
                cellStr.includes(',') ||
                cellStr.includes('\n') ||
                cellStr.includes('"')
              ) {
                return `"${cellStr.replace(/"/g, '""')}"`;
              }
              return cellStr;
            })
            .join(',')
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
          source: 'CreepJS 2.0',
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
          Download your fingerprint data in various formats for analysis or
          record-keeping
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Export Options */}
          <div className="grid gap-4 md:grid-cols-3">
            {/* JSON Export */}
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FileJson className="h-5 w-5 text-blue-500" />
                <h3 className="font-semibold">JSON Format</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Complete fingerprint data with all collectors and metadata in
                JSON format. Best for programmatic analysis.
              </p>
              <Button
                onClick={exportToJSON}
                className="w-full"
                variant="outline"
              >
                <FileJson className="mr-2 h-4 w-4" />
                Download JSON
              </Button>
            </div>

            {/* CSV Export */}
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-green-500" />
                <h3 className="font-semibold">CSV Format</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Flattened data in CSV format. Ideal for spreadsheet analysis in
                Excel or Google Sheets.
              </p>
              <Button
                onClick={exportToCSV}
                className="w-full"
                variant="outline"
              >
                <FileSpreadsheet className="mr-2 h-4 w-4" />
                Download CSV
              </Button>
            </div>

            {/* History Export */}
            <div className="bg-muted/50 space-y-3 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Download className="h-5 w-5 text-purple-500" />
                <h3 className="font-semibold">Full History</h3>
              </div>
              <p className="text-muted-foreground text-sm">
                Export all stored history records in JSON format. Useful for
                backing up your data.
              </p>
              <Button
                onClick={exportHistory}
                className="w-full"
                variant="outline"
              >
                <Download className="mr-2 h-4 w-4" />
                Download History
              </Button>
            </div>
          </div>

          {/* Information Note */}
          <div className="flex items-start gap-3 rounded-lg border border-blue-500/20 bg-blue-500/10 p-4">
            <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
            <div className="space-y-1 text-sm">
              <p className="font-medium">About Exports</p>
              <ul className="text-muted-foreground list-inside list-disc space-y-1">
                <li>All exports are generated locally in your browser</li>
                <li>No data is sent to any server during export</li>
                <li>
                  JSON files contain complete raw data from all collectors
                </li>
                <li>
                  CSV files contain summarized data in spreadsheet-friendly
                  format
                </li>
                <li>
                  History exports include all fingerprints stored in your
                  browser
                </li>
              </ul>
            </div>
          </div>

          {/* Data Structure Info */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold">JSON Export Structure</h3>
            <div className="bg-muted/50 rounded-lg p-4">
              <pre className="overflow-x-auto font-mono text-xs">
                {`{
  "metadata": {
    "exportDate": "ISO timestamp",
    "version": "1.0.0",
    "source": "CreepJS 2.0"
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
