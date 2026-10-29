'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Code } from 'lucide-react';

import { trackEvent } from '@/lib/analytics';
import { SITE_CONFIG } from '@/lib/metadata';
import { CopyButton } from '@/components/CopyButton';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const API_URL = SITE_CONFIG.apiUrl;

export type SnippetLanguage = 'javascript' | 'python' | 'curl' | 'go';

export function buildCodeExamples(
  apiToken: string
): Record<SnippetLanguage, string> {
  const token = JSON.stringify(apiToken || 'YOUR_API_TOKEN');
  const shellToken = (apiToken || 'YOUR_API_TOKEN').replace(/'/g, "'\\''");
  return {
    javascript: `// Load https://creepjs.org/sdk.full.js in your page first.

// Run after the visitor agrees to collection.
const fingerprint = await CreepJSFull.collectFingerprint();
const response = await fetch('${API_URL}/v1/fingerprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': ${token}
  },
  body: JSON.stringify(fingerprint),
  signal: AbortSignal.timeout(15000)
});
const result = await response.json();
if (!response.ok) throw new Error(result.error || 'Request failed');
console.log(result.fingerprintId);`,
    python: `import json
from pathlib import Path
import requests

# Save a real browser-collected payload as fingerprint.json first.
payload = json.loads(Path('fingerprint.json').read_text())
response = requests.post(
    '${API_URL}/v1/fingerprint',
    headers={'X-API-Token': ${token}},
    json=payload,
    timeout=15,
)
response.raise_for_status()
print(response.json()['fingerprintId'])`,
    curl: `# Save a real browser-collected payload as fingerprint.json first.
curl --fail-with-body --max-time 15 '${API_URL}/v1/fingerprint' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Token: ${shellToken}' \\
  --data-binary @fingerprint.json`,
    go: `package main

import (
    "bytes"
    "fmt"
    "io"
    "net/http"
    "os"
    "time"
)

func main() {
    // Save a real browser-collected payload as fingerprint.json first.
    payload, err := os.ReadFile("fingerprint.json")
    if err != nil { panic(err) }
    req, err := http.NewRequest("POST", "${API_URL}/v1/fingerprint", bytes.NewReader(payload))
    if err != nil { panic(err) }
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Token", ${token})
    client := &http.Client{Timeout: 15 * time.Second}
    res, err := client.Do(req)
    if err != nil { panic(err) }
    defer res.Body.Close()
    body, err := io.ReadAll(res.Body)
    if err != nil { panic(err) }
    if res.StatusCode >= 400 { panic(fmt.Sprintf("HTTP %d: %s", res.StatusCode, body)) }
    fmt.Println(string(body))
}`,
  };
}

export function CodeSnippets({ apiToken }: { apiToken: string }) {
  const [selectedLanguage, setSelectedLanguage] =
    useState<SnippetLanguage>('javascript');
  const codeExamples = buildCodeExamples(apiToken);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Code className="h-5 w-5" aria-hidden="true" />
          Code examples
        </CardTitle>
        <CardDescription>
          Use a real collected payload. Browser JavaScript requires sdk.full.js;
          Python uses requests. Other examples read fingerprint.json.
        </CardDescription>
      </CardHeader>
      <CardContent className="min-w-0 space-y-4">
        <Tabs
          value={selectedLanguage}
          onValueChange={(value) =>
            setSelectedLanguage(value as SnippetLanguage)
          }
        >
          <div className="max-w-full overflow-x-auto pb-1">
            <TabsList className="grid min-w-[28rem] grid-cols-4">
              <TabsTrigger value="javascript">JavaScript</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
            </TabsList>
          </div>

          {Object.entries(codeExamples).map(([language, code]) => (
            <TabsContent
              key={language}
              value={language}
              className="min-w-0 space-y-4"
            >
              <div className="relative min-w-0">
                <CopyButton
                  value={code}
                  variant="outline"
                  size="sm"
                  className="absolute right-2 top-2 z-10"
                  ariaLabel={`Copy ${language} code example`}
                  successMessage={`${language} example copied`}
                  onCopied={() =>
                    trackEvent('button_clicked', {
                      label: 'copy_sdk_example',
                      section: selectedLanguage,
                    })
                  }
                />
                <pre
                  className="bg-muted max-h-[38rem] max-w-full overflow-auto rounded p-4 pt-12 font-mono text-xs"
                  tabIndex={0}
                >
                  <code>{code}</code>
                </pre>
              </div>
            </TabsContent>
          ))}
        </Tabs>

        <Button asChild variant="outline" className="w-full">
          <Link href="/docs">
            <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
            View full documentation
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
