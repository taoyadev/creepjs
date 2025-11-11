'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { collectFingerprint } from '@creepjs/core';
import type { FingerprintResult } from '@creepjs/core';
import { Code, Play, Copy, Check, Zap, BookOpen, Terminal, AlertCircle, CheckCircle, Shield, Globe, Fingerprint, Info } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';

export default function PlaygroundPage() {
  const [apiToken, setApiToken] = useState('');
  const [email, setEmail] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [fingerprint, setFingerprint] = useState<FingerprintResult | null>(null);
  const [fingerprintLoading, setFingerprintLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('javascript');

  useEffect(() => {
    // Load fingerprint on mount
    const loadFingerprint = async () => {
      setFingerprintLoading(true);
      try {
        const fp = await collectFingerprint();
        setFingerprint(fp);
      } catch (error) {
        console.error('Failed to collect fingerprint:', error);
      } finally {
        setFingerprintLoading(false);
      }
    };
    void loadFingerprint();
  }, []);

  interface TokenResponse {
    token?: string;
    error?: string;
    [key: string]: unknown;
  }

  const generateToken = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/v1/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = (await res.json()) as TokenResponse;
      setResponse(JSON.stringify(data, null, 2));
      if (typeof data.token === 'string') {
        setApiToken(data.token);
        toast.success('API token generated', {
          description: `Token has been sent to ${email}`,
        });
      } else if (data.error) {
        toast.error('Failed to generate token', {
          description: data.error,
        });
      }
    } catch (error) {
      setResponse(`Error: ${String(error)}`);
      toast.error('Request failed', {
        description: 'Unable to connect to the API server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const testFingerprintAPI = async () => {
    if (!fingerprint) {
      setResponse('Error: No fingerprint data available');
      toast.error('No fingerprint available', {
        description: 'Please wait for fingerprint collection to complete.',
      });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/v1/fingerprint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-API-Token': apiToken,
        },
        body: JSON.stringify(fingerprint),
      });
      const data = (await res.json()) as unknown;
      setResponse(JSON.stringify(data, null, 2));

      if (res.ok) {
        toast.success('API request successful', {
          description: 'Fingerprint data processed successfully.',
        });
      } else {
        toast.error('API request failed', {
          description: 'Check the response below for details.',
        });
      }
    } catch (error) {
      setResponse(`Error: ${String(error)}`);
      toast.error('Request failed', {
        description: 'Unable to connect to the API server.',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Copied to clipboard', {
        description: 'Content has been copied successfully.',
      });
    } catch (error) {
      console.error('Failed to copy:', error);
      toast.error('Failed to copy', {
        description: 'Please try again or copy manually.',
      });
    }
  };

  // Code examples for different languages
  const codeExamples = {
    javascript: `// Using fetch API
const fingerprint = await fetch('https://api.creepjs.org/v1/fingerprint', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-API-Token': '${apiToken || 'YOUR_API_TOKEN'}'
  },
  body: JSON.stringify({
    fingerprintId: 'abc123...',
    data: { /* fingerprint data */ },
    timestamp: Date.now(),
    confidence: 0.95
  })
});

const result = await fingerprint.json();
console.log(result);`,

    python: `import requests
import json

# API Configuration
API_URL = 'https://api.creepjs.org/v1/fingerprint'
API_TOKEN = '${apiToken || 'YOUR_API_TOKEN'}'

# Prepare fingerprint data
payload = {
    'fingerprintId': 'abc123...',
    'data': {},  # fingerprint data
    'timestamp': int(time.time() * 1000),
    'confidence': 0.95
}

# Make API request
response = requests.post(
    API_URL,
    headers={
        'Content-Type': 'application/json',
        'X-API-Token': API_TOKEN
    },
    json=payload
)

# Handle response
if response.status_code == 200:
    result = response.json()
    print(json.dumps(result, indent=2))
else:
    print(f'Error: {response.status_code}')
    print(response.text)`,

    curl: `curl -X POST https://api.creepjs.org/v1/fingerprint \\
  -H "Content-Type: application/json" \\
  -H "X-API-Token: ${apiToken || 'YOUR_API_TOKEN'}" \\
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
    "io/ioutil"
    "net/http"
    "time"
)

type FingerprintRequest struct {
    FingerprintID string                 \`json:"fingerprintId"\`
    Data          map[string]interface{} \`json:"data"\`
    Timestamp     int64                  \`json:"timestamp"\`
    Confidence    float64                \`json:"confidence"\`
}

func main() {
    apiURL := "https://api.creepjs.org/v1/fingerprint"
    apiToken := "${apiToken || 'YOUR_API_TOKEN'}"

    // Prepare request payload
    payload := FingerprintRequest{
        FingerprintID: "abc123...",
        Data:          make(map[string]interface{}),
        Timestamp:     time.Now().UnixMilli(),
        Confidence:    0.95,
    }

    jsonData, _ := json.Marshal(payload)

    // Create HTTP request
    req, _ := http.NewRequest("POST", apiURL, bytes.NewBuffer(jsonData))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("X-API-Token", apiToken)

    // Send request
    client := &http.Client{}
    resp, err := client.Do(req)
    if err != nil {
        fmt.Println("Error:", err)
        return
    }
    defer resp.Body.Close()

    // Read response
    body, _ := ioutil.ReadAll(resp.Body)
    fmt.Println(string(body))
}`,
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-secondary">
      <div className="container mx-auto max-w-7xl p-4 md:p-8 space-y-6 md:space-y-8">
        {/* Page Header */}
        <div className="text-center space-y-2 md:space-y-4">
          <h1 className="text-2xl md:text-4xl font-bold">API Playground</h1>
          <p className="text-muted-foreground text-sm md:text-lg max-w-3xl mx-auto">
            Interactive testing environment for the CreepJS Fingerprinting API. Learn by doing - generate tokens, test endpoints, and explore integration patterns in real-time without writing any backend code.
          </p>
        </div>

        {/* Introduction Card */}
        <Card className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border-blue-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-500" />
              About This Playground
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm md:text-base leading-relaxed">
            <p>
              The API Playground is a hands-on learning environment designed for developers who want to understand and test the CreepJS Fingerprinting API before integrating it into their applications. This interactive tool eliminates the need for backend setup during the exploration phase, allowing you to focus on understanding the API's capabilities and response structures.
            </p>
            <p>
              Unlike traditional API documentation, the Playground provides immediate visual feedback and real browser fingerprint data. You can see exactly what information is collected, how it's structured, and what responses to expect - all within seconds of loading this page.
            </p>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="bg-background/50 rounded-lg p-4">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Zap className="h-4 w-4 text-yellow-500" />
                  Zero Setup Required
                </div>
                <p className="text-xs text-muted-foreground">
                  No backend infrastructure, authentication servers, or local development environment needed. Just open your browser and start testing.
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Code className="h-4 w-4 text-green-500" />
                  Multi-Language Examples
                </div>
                <p className="text-xs text-muted-foreground">
                  Copy-paste ready code snippets in JavaScript, Python, cURL, and Go. All examples are pre-filled with your actual API token for immediate use.
                </p>
              </div>
              <div className="bg-background/50 rounded-lg p-4">
                <div className="font-semibold mb-2 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-purple-500" />
                  Real-Time Testing
                </div>
                <p className="text-xs text-muted-foreground">
                  Test API endpoints with your actual browser fingerprint. See live API responses and understand the data structure before writing production code.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* What You'll Learn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              What You'll Learn
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">1</div>
                  <div>
                    <p className="font-semibold">Token Generation & Management</p>
                    <p className="text-xs text-muted-foreground">Understand how API tokens are created, formatted, and used for authentication. Learn about token security and rate limit associations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">2</div>
                  <div>
                    <p className="font-semibold">Fingerprint Data Structure</p>
                    <p className="text-xs text-muted-foreground">Explore the complete fingerprint payload including confidence scores, timestamps, and collector outputs. See real data from your browser.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">3</div>
                  <div>
                    <p className="font-semibold">API Request & Response Patterns</p>
                    <p className="text-xs text-muted-foreground">Master the complete request/response cycle including headers, body format, error handling, and success criteria.</p>
                  </div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">4</div>
                  <div>
                    <p className="font-semibold">Integration Code Examples</p>
                    <p className="text-xs text-muted-foreground">Review production-ready code examples in multiple programming languages. Understand client-side vs server-side implementations.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">5</div>
                  <div>
                    <p className="font-semibold">Rate Limiting & Quotas</p>
                    <p className="text-xs text-muted-foreground">Learn how rate limits work, what happens when exceeded, and how to monitor your usage for production planning.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">6</div>
                  <div>
                    <p className="font-semibold">Error Handling Strategies</p>
                    <p className="text-xs text-muted-foreground">Understand different error types, HTTP status codes, and how to implement proper error handling in your applications.</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Start Guide */}
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
              <Zap className="h-5 w-5" />
              Quick Start Guide
            </CardTitle>
            <CardDescription>
              Follow these steps to generate your API token and test your first fingerprint submission. The entire process takes less than 2 minutes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-xs md:text-sm">
              <li><strong>Generate Token:</strong> Enter your email address below to receive a free API token (1,000 requests/day limit)</li>
              <li><strong>Copy or Use Token:</strong> Your token will appear in Step 2 and automatically populate code examples</li>
              <li><strong>Test Fingerprint API:</strong> Click "Test API Now" to submit your browser's fingerprint using the generated token</li>
              <li><strong>Explore Code Examples:</strong> Review multi-language integration code pre-configured with your token</li>
              <li><strong>Review Response:</strong> Examine the API response structure including fingerprint ID, metadata, and success indicators</li>
            </ol>
            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <p className="text-xs flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                <span><strong>Pro Tip:</strong> Keep this page open while reading the code examples. The interactive testing helps you understand API behavior before writing production code.</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Left Column - API Testing */}
          <div className="space-y-6">
            {/* Step 1: Generate Token */}
            <Card>
              <CardHeader>
                <CardTitle>Step 1: Generate API Token</CardTitle>
                <CardDescription>
                  Enter your email to receive a free API token (1000 requests/day)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full rounded-md border bg-background px-3 py-2"
                    placeholder="your@email.com"
                  />
                </div>
                <Button
                  onClick={() => void generateToken()}
                  disabled={loading || !email}
                  className="w-full"
                >
                  <Play className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Token'}
                </Button>
              </CardContent>
            </Card>

            {/* Step 2: API Token */}
            <Card>
              <CardHeader>
                <CardTitle>Step 2: Your API Token</CardTitle>
                <CardDescription>
                  Use this token in the X-API-Token header for authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">API Token</label>
                  {loading && !apiToken ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={apiToken}
                        onChange={(e) => setApiToken(e.target.value)}
                        className="flex-1 rounded-md border bg-background px-3 py-2 font-mono text-sm"
                        placeholder="cfp_..."
                      />
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => void copyToClipboard(apiToken)}
                        disabled={!apiToken}
                      >
                        {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                  )}
                </div>
                {apiToken && !loading && (
                  <div className="text-xs text-muted-foreground bg-muted p-3 rounded">
                    ✓ Token ready. You can now test the API or copy code examples below.
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Step 3: Test API */}
            <Card>
              <CardHeader>
                <CardTitle>Step 3: Test Fingerprint API</CardTitle>
                <CardDescription>
                  Send your browser's fingerprint data to the API
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground">
                    Current Fingerprint ID:
                  </div>
                  {fingerprintLoading ? (
                    <Skeleton className="h-10 w-full" />
                  ) : (
                    <code className="block text-xs font-mono bg-muted p-2 rounded break-all">
                      {fingerprint?.fingerprintId || 'Failed to load'}
                    </code>
                  )}
                </div>
                <Button
                  onClick={() => void testFingerprintAPI()}
                  disabled={loading || !apiToken || !fingerprint || fingerprintLoading}
                  className="w-full"
                >
                  <Terminal className="h-4 w-4 mr-2" />
                  {loading ? 'Testing...' : fingerprintLoading ? 'Loading fingerprint...' : 'Test API Now'}
                </Button>
              </CardContent>
            </Card>

            {/* Response Viewer */}
            <Card>
              <CardHeader>
                <CardTitle>API Response</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && !response ? (
                  <div className="space-y-2 rounded bg-muted p-4">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                    <Skeleton className="h-4 w-2/3" />
                    <Skeleton className="h-4 w-4/5" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                ) : (
                  <pre className="overflow-auto rounded bg-muted p-4 text-xs font-mono max-h-96">
                    {response || 'Response will appear here after testing...'}
                  </pre>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Code Examples */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  Code Examples
                </CardTitle>
                <CardDescription>
                  Copy-paste ready code snippets in multiple languages
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Tabs value={selectedLanguage} onValueChange={setSelectedLanguage}>
                  <TabsList className="grid w-full grid-cols-4">
                    <TabsTrigger value="javascript">JavaScript</TabsTrigger>
                    <TabsTrigger value="python">Python</TabsTrigger>
                    <TabsTrigger value="curl">cURL</TabsTrigger>
                    <TabsTrigger value="go">Go</TabsTrigger>
                  </TabsList>

                  {Object.entries(codeExamples).map(([lang, code]) => (
                    <TabsContent key={lang} value={lang} className="space-y-4">
                      <div className="relative">
                        <Button
                          variant="outline"
                          size="sm"
                          className="absolute top-2 right-2 z-10"
                          onClick={() => void copyToClipboard(code)}
                        >
                          {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                        </Button>
                        <pre className="overflow-auto rounded bg-muted p-4 text-xs font-mono max-h-96 pt-12">
                          {code}
                        </pre>
                      </div>
                    </TabsContent>
                  ))}
                </Tabs>

                <div className="flex gap-2">
                  <Link href="/docs" className="flex-1">
                    <Button variant="outline" className="w-full">
                      <BookOpen className="h-4 w-4 mr-2" />
                      View Full Documentation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* API Endpoints Reference */}
            <Card>
              <CardHeader>
                <CardTitle>API Endpoints</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="border-l-4 border-blue-500 pl-4">
                    <div className="font-mono text-sm font-bold">POST /v1/token</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Generate a new API token with your email address
                    </div>
                  </div>
                  <div className="border-l-4 border-green-500 pl-4">
                    <div className="font-mono text-sm font-bold">POST /v1/fingerprint</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Submit fingerprint data for processing and storage
                    </div>
                  </div>
                  <div className="border-l-4 border-purple-500 pl-4">
                    <div className="font-mono text-sm font-bold">GET /v1/fingerprint/:id</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Retrieve a specific fingerprint by ID
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Rate Limits */}
            <Card className="bg-orange-500/5 border-orange-500/20">
              <CardHeader>
                <CardTitle>Rate Limits</CardTitle>
              </CardHeader>
              <CardContent className="text-sm space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Free Tier:</span>
                  <span className="font-bold">1,000 requests/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pro Tier:</span>
                  <span className="font-bold">100,000 requests/day</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Enterprise:</span>
                  <span className="font-bold">Unlimited</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              Best Practices for API Integration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-blue-500" />
                    Token Security
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Never expose API tokens in client-side code or public repositories. Use environment variables on your backend server. For production applications, implement server-side proxy endpoints that handle token authentication internally.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-500" />
                    Caching Strategy
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Cache fingerprint results in localStorage or sessionStorage to avoid redundant API calls during the same browsing session. Set appropriate TTL (1-24 hours) based on your use case. This reduces API quota consumption and improves response times.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Shield className="h-4 w-4 text-green-500" />
                    Error Handling
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Always implement comprehensive error handling for network failures, rate limit exceeded (429), and invalid requests (400). Provide fallback behavior for when fingerprinting fails - never let API errors break your application flow.
                  </p>
                </div>
              </div>
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-500" />
                    Client vs Server Implementation
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    For sensitive applications, collect fingerprints client-side but submit them via your backend server. This keeps tokens secure and allows you to add additional validation, logging, or business logic before hitting the CreepJS API.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Terminal className="h-4 w-4 text-orange-500" />
                    Rate Limit Monitoring
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Monitor your API usage through response headers (X-RateLimit-Remaining). Implement exponential backoff when approaching limits. For high-traffic applications, consider upgrading to Pro or Enterprise tiers before hitting daily quotas.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-1 flex items-center gap-2">
                    <Globe className="h-4 w-4 text-blue-500" />
                    Privacy Compliance
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Always inform users about fingerprinting in your privacy policy. Provide opt-out mechanisms for users who don't want to be tracked. Ensure compliance with GDPR, CCPA, and other applicable data protection regulations.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Use Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Fingerprint className="h-5 w-5" />
              Common Use Cases & Implementation Patterns
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Fraud Detection</h4>
                <p className="text-xs text-muted-foreground">
                  Collect fingerprints during account registration and login. Flag suspicious activities when the same fingerprint attempts multiple accounts or when fingerprints change unexpectedly during a session.
                </p>
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <strong>Pattern:</strong> Compare new fingerprints against known-bad database. Set risk scores based on fingerprint uniqueness and change frequency.
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Bot Prevention</h4>
                <p className="text-xs text-muted-foreground">
                  Automated bots often have inconsistent or spoofed fingerprints. Check for lies detection flags, webdriver indicators, and headless browser signatures to identify automated traffic.
                </p>
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <strong>Pattern:</strong> Analyze resistance detection results. Bots typically show webdriver flags, missing features, or impossible combinations of browser characteristics.
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Analytics Enhancement</h4>
                <p className="text-xs text-muted-foreground">
                  Improve visitor tracking accuracy in privacy-focused environments where cookies are blocked. Use fingerprints as a supplement to traditional analytics, not a replacement.
                </p>
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <strong>Pattern:</strong> Combine fingerprint IDs with cookie-based tracking. Fall back to fingerprints when cookies are unavailable or blocked by privacy tools.
                </div>
              </div>
            </div>
            <div className="grid md:grid-cols-3 gap-4 mt-4">
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Session Management</h4>
                <p className="text-xs text-muted-foreground">
                  Maintain user sessions across cookie deletions or incognito mode. Fingerprints provide an additional layer of session continuity for enhanced user experience.
                </p>
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <strong>Pattern:</strong> Store session data indexed by fingerprint ID. Restore sessions automatically when fingerprint matches, requiring re-authentication for new fingerprints.
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">A/B Testing</h4>
                <p className="text-xs text-muted-foreground">
                  Ensure consistent experiment groups even when users clear cookies. Fingerprints help maintain test group assignment for more reliable A/B test results.
                </p>
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <strong>Pattern:</strong> Hash fingerprint ID to deterministically assign test variants. Users see the same variant across sessions, improving result validity.
                </div>
              </div>
              <div className="border rounded-lg p-4 space-y-2">
                <h4 className="font-semibold">Rate Limiting</h4>
                <p className="text-xs text-muted-foreground">
                  Enforce API or resource access limits based on device fingerprints rather than IP addresses. More effective against distributed attacks using proxy networks.
                </p>
                <div className="text-xs bg-muted p-2 rounded mt-2">
                  <strong>Pattern:</strong> Track request counts per fingerprint ID. Apply exponential backoff when thresholds are exceeded. Combine with IP-based limits for defense in depth.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Troubleshooting Guide */}
        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              Troubleshooting Common Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4 text-sm">
              <div className="border-l-4 border-red-500 pl-4 py-2">
                <h4 className="font-semibold mb-1">Error 401: Unauthorized</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Your API token is missing, invalid, or expired.
                </p>
                <p className="text-xs"><strong>Solution:</strong> Generate a new token using Step 1 above. Ensure you're including the token in the <code className="bg-muted px-1">X-API-Token</code> header. Tokens start with <code className="bg-muted px-1">cfp_</code> prefix.</p>
              </div>

              <div className="border-l-4 border-orange-500 pl-4 py-2">
                <h4 className="font-semibold mb-1">Error 429: Rate Limit Exceeded</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  You've exceeded your daily request quota (1,000 for free tier).
                </p>
                <p className="text-xs"><strong>Solution:</strong> Wait until the next day (resets at midnight UTC) or upgrade to Pro tier (100K requests/day). Implement caching to reduce API calls. Check response headers for <code className="bg-muted px-1">X-RateLimit-Remaining</code>.</p>
              </div>

              <div className="border-l-4 border-yellow-500 pl-4 py-2">
                <h4 className="font-semibold mb-1">Error 400: Bad Request</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Request body format is incorrect or missing required fields.
                </p>
                <p className="text-xs"><strong>Solution:</strong> Ensure JSON is properly formatted. Required fields are <code className="bg-muted px-1">fingerprintId</code>, <code className="bg-muted px-1">confidence</code>, <code className="bg-muted px-1">timestamp</code>, and <code className="bg-muted px-1">data</code>. Check code examples above for correct structure.</p>
              </div>

              <div className="border-l-4 border-blue-500 pl-4 py-2">
                <h4 className="font-semibold mb-1">Low Confidence Scores (below 0.6)</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Not enough distinguishing characteristics were collected.
                </p>
                <p className="text-xs"><strong>Solution:</strong> This often occurs in privacy-focused browsers (Tor, Brave) or with anti-fingerprinting extensions. It's normal behavior. Consider combining fingerprints with other identification methods for critical use cases.</p>
              </div>

              <div className="border-l-4 border-purple-500 pl-4 py-2">
                <h4 className="font-semibold mb-1">Fingerprint Changes Frequently</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Fingerprint IDs are different on each visit for the same user.
                </p>
                <p className="text-xs"><strong>Solution:</strong> Fingerprint stability varies by browser and user behavior. Browser updates, extension changes, or resolution changes will alter fingerprints. Use fingerprints as one signal among many, not the sole identifier. Consider monitoring fingerprint components to identify which attributes are causing instability.</p>
              </div>

              <div className="border-l-4 border-green-500 pl-4 py-2">
                <h4 className="font-semibold mb-1">CORS Errors in Browser</h4>
                <p className="text-xs text-muted-foreground mb-2">
                  Cross-origin requests are blocked by browser security policies.
                </p>
                <p className="text-xs"><strong>Solution:</strong> CORS errors are expected when testing from localhost or unauthorized domains. For production, either add your domain to our CORS whitelist (contact support) or implement a backend proxy that adds proper CORS headers. Never expose API tokens in client-side code for production apps.</p>
              </div>
            </div>

            <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="font-semibold mb-2 flex items-center gap-2">
                <Info className="h-4 w-4 text-blue-500" />
                Still Having Issues?
              </h4>
              <p className="text-xs text-muted-foreground mb-3">
                If you're experiencing issues not covered here, we're here to help:
              </p>
              <ul className="text-xs space-y-1 ml-4 list-disc">
                <li>Check the <Link href="/docs" className="text-blue-500 underline">full documentation</Link> for detailed API specifications</li>
                <li>Review the <Link href="/demo" className="text-blue-500 underline">demo page</Link> to see expected fingerprint structure</li>
                <li>Email us at <a href="mailto:support@creepjs.org" className="text-blue-500 underline">support@creepjs.org</a> with your issue details</li>
                <li>Include error messages, request/response examples, and your use case for faster resolution</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Next Steps */}
        <Card className="bg-gradient-to-br from-green-500/10 to-blue-500/10 border-green-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-green-500" />
              Next Steps After Testing
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm space-y-3">
            <p>
              Now that you've explored the Playground and understand how the API works, here's what to do next:
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <Link href="/docs" className="block p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="font-semibold mb-2">1. Read Full Documentation</div>
                <p className="text-xs text-muted-foreground">Deep dive into all API endpoints, SDK options, collector details, and integration best practices.</p>
              </Link>
              <Link href="/demo" className="block p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="font-semibold mb-2">2. Explore Live Demo</div>
                <p className="text-xs text-muted-foreground">See all 24+ fingerprint collectors in action with real-time data from your browser.</p>
              </Link>
              <a href="https://github.com/abrahamjuliot/creepjs" target="_blank" rel="noopener noreferrer" className="block p-4 border rounded-lg hover:border-primary transition-colors">
                <div className="font-semibold mb-2">3. Review Source Code</div>
                <p className="text-xs text-muted-foreground">Examine the open-source implementation on GitHub to understand collector logic and algorithms.</p>
              </a>
            </div>
            <div className="mt-4 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
              <p className="text-xs flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span><strong>Ready for Production?</strong> Contact us at <a href="mailto:sales@creepjs.org" className="underline">sales@creepjs.org</a> to discuss Pro or Enterprise plans with higher rate limits, SLA guarantees, and dedicated support.</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
