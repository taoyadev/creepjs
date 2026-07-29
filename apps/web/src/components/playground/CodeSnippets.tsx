'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { BookOpen, Code } from 'lucide-react';

import { analytics } from '@/lib/analytics';
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
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';

const API_URL = SITE_CONFIG.apiUrl;

export type SnippetLanguage = 'javascript' | 'python' | 'curl' | 'go';

export function buildCodeExamples(
  apiToken: string
): Record<SnippetLanguage, string> {
  const token = apiToken || 'YOUR_API_TOKEN';

  return {
    javascript: `const response = await fetch('${API_URL}/v1/fingerprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': '${token}'
  },
  body: JSON.stringify({
    fingerprintId: 'abc123...',
    data: {},
    timestamp: Date.now(),
    confidence: 0.95
  })
});

const result = await response.json();
console.log(result);`,
    python: `import json
import time

import requests

api_url = '${API_URL}/v1/fingerprint'
api_token: str = '${token}'
payload = {
    'fingerprintId': 'abc123...',
    'data': {},
    'timestamp': int(time.time() * 1000),
    'confidence': 0.95,
}

response = requests.post(
    api_url,
    headers={
        'Content-Type': 'application/json',
        'X-API-Token': api_token,
    },
    json=payload,
    timeout=15,
)
response.raise_for_status()
print(json.dumps(response.json(), indent=2))`,
    curl: `curl -X POST '${API_URL}/v1/fingerprint' \\
  -H 'Content-Type: application/json' \\
  -H 'X-API-Token: ${token}' \\
  -d '{
    "fingerprintId": "abc123...",
    "data": {},
    "timestamp": 1234567890000,
    "confidence": 0.95
  }'`,
    go: `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "io"
    "net/http"
    "time"
)

func main() {
    payload := map[string]any{
        "fingerprintId": "abc123...",
        "data": map[string]any{},
        "timestamp": time.Now().UnixMilli(),
        "confidence": 0.95,
    }
    body, _ := json.Marshal(payload)
    request, _ := http.NewRequest(
        "POST",
        "${API_URL}/v1/fingerprint",
        bytes.NewBuffer(body),
    )
    request.Header.Set("Content-Type", "application/json")
    request.Header.Set("X-API-Token", "${token}")

    response, err := http.DefaultClient.Do(request)
    if err != nil {
        panic(err)
    }
    defer response.Body.Close()
    responseBody, _ := io.ReadAll(response.Body)
    fmt.Println(string(responseBody))
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
          Copy plain, dependency-free request examples using the current token.
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
                    analytics.track.buttonClicked({
                      buttonLabel: 'copy_sdk_example',
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
