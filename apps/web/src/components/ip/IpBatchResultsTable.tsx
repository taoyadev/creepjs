import React from 'react';
import { Badge } from '@/components/ui/badge';
import type { IpBatchResponse, IpBatchRow } from '@/lib/ip-batch';

interface IpBatchResultsTableProps {
  response: IpBatchResponse;
  labelledBy: string;
}

function statusBadge(row: IpBatchRow) {
  if (row.ok) return <Badge variant="success">Success</Badge>;
  if (row.outcome === 'skipped') {
    return <Badge variant="warning">Skipped</Badge>;
  }
  if (row.outcome === 'invalid') {
    return <Badge variant="outline">Invalid</Badge>;
  }
  return <Badge variant="destructive">Failed</Badge>;
}

export function IpBatchResultsTable({
  response,
  labelledBy,
}: IpBatchResultsTableProps) {
  return (
    <div
      role="region"
      aria-labelledby={labelledBy}
      tabIndex={0}
      className="focus-visible:ring-ring max-w-full overflow-x-auto rounded-md border outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
    >
      <table className="w-full min-w-[860px] border-collapse text-left text-sm">
        <caption className="sr-only">
          Batch IP lookup results with success, invalid, failed, and skipped
          outcomes.
        </caption>
        <thead className="bg-muted/50">
          <tr>
            <th scope="col" className="px-4 py-3 font-medium">
              IP address
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Status
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Risk
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Network
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Location
            </th>
            <th scope="col" className="px-4 py-3 font-medium">
              Details
            </th>
          </tr>
        </thead>
        <tbody>
          {response.results.map((row) => (
            <tr
              key={row.ip}
              className="border-t align-top"
              data-outcome={row.outcome}
            >
              <th
                scope="row"
                className="max-w-56 break-all px-4 py-3 font-mono font-medium"
              >
                {row.ip}
              </th>
              <td className="px-4 py-3">{statusBadge(row)}</td>
              <td className="px-4 py-3">
                {row.ok ? (
                  <span>
                    {row.data.score?.risk_score ?? '—'}
                    {row.data.score?.band
                      ? ` · ${row.data.score.band}`
                      : ''}
                  </span>
                ) : (
                  '—'
                )}
              </td>
              <td className="max-w-56 break-words px-4 py-3">
                {row.ok
                  ? (row.data.network?.org ??
                    row.data.network?.owner ??
                    row.data.network?.asn ??
                    'Unknown')
                  : '—'}
              </td>
              <td className="max-w-52 break-words px-4 py-3">
                {row.ok
                  ? [
                      row.data.location?.city,
                      row.data.location?.region,
                      row.data.location?.country_code,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Unknown'
                  : '—'}
              </td>
              <td className="max-w-72 break-words px-4 py-3">
                {row.ok
                  ? `${row.cached ? 'Cache hit' : 'Fresh lookup'} · ${
                      row.data.score?.verdict ?? 'No verdict'
                    }`
                  : row.error}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
