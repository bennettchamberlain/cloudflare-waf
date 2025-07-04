import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";

export default function WAFDashboard() {
  const [siteDomain, setSiteDomain] = useState("");
  const [cloudflareConnected, setCloudflareConnected] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">Webflow Bot Protection</h1>

      {/* Connect Site */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">1. Connect Your Site</h2>
          <Input
            placeholder="yourdomain.com"
            value={siteDomain}
            onChange={(e) => setSiteDomain(e.target.value)}
          />
          <Button onClick={() => alert("Verification sent")}>Verify Domain</Button>
        </CardContent>
      </Card>

      {/* Connect Cloudflare */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">2. Connect Cloudflare</h2>
          {cloudflareConnected ? (
            <p>✅ Connected to Cloudflare</p>
          ) : (
            <Button onClick={() => setCloudflareConnected(true)}>Connect Cloudflare</Button>
          )}
        </CardContent>
      </Card>

      {/* WAF Templates */}
      <Card>
        <CardContent className="p-4 space-y-6">
          <h2 className="text-xl font-semibold">3. WAF Rule Templates</h2>
          <Tabs defaultValue="scrapers">
            <TabsList>
              <TabsTrigger value="scrapers">Block Scrapers</TabsTrigger>
              <TabsTrigger value="rate">Rate Limiting</TabsTrigger>
              <TabsTrigger value="regions">Block Countries</TabsTrigger>
            </TabsList>

            <TabsContent value="scrapers">
              <div className="flex items-center justify-between">
                <p>Block known bad bots and scrapers using IP reputation and bot score</p>
                <Switch />
              </div>
            </TabsContent>

            <TabsContent value="rate">
              <div className="flex items-center justify-between">
                <p>Challenge users who exceed 100 requests per minute</p>
                <Switch />
              </div>
            </TabsContent>

            <TabsContent value="regions">
              <div className="flex items-center justify-between">
                <p>Block traffic from selected countries (e.g. Russia, China)</p>
                <Switch />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Analytics Preview */}
      <Card>
        <CardContent className="p-4 space-y-4">
          <h2 className="text-xl font-semibold">4. Traffic Overview</h2>
          <ul className="text-sm space-y-1">
            <li>🔍 Total Requests: 24,501</li>
            <li>🤖 Bot Requests Blocked: 12,390</li>
            <li>📉 Bandwidth Saved: 1.2 GB</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
} 