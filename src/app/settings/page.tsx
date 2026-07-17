"use client";

import { useState, useEffect } from 'react';
import { useReminders } from '@/lib/store-reminders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Settings, Globe, Save, CheckCircle2, Navigation } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

const TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST) - GMT+5:30" },
  { value: "America/New_York", label: "New York (EST/EDT) - GMT-4" },
  { value: "Europe/London", label: "London (GMT/BST) - GMT+1" },
  { value: "Asia/Tokyo", label: "Tokyo (JST) - GMT+9" },
  { value: "America/Los_Angeles", label: "San Francisco (PST/PDT) - GMT-7" },
  { value: "Asia/Singapore", label: "Singapore (SGT) - GMT+8" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT) - GMT+10" },
  { value: "Europe/Paris", label: "Paris (CET/CEST) - GMT+2" },
  { value: "Asia/Dubai", label: "Dubai (GST) - GMT+4" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST) - GMT+2" },
  { value: "America/Chicago", label: "Chicago (CST/CDT) - GMT-5" },
  { value: "UTC", label: "UTC (Universal)" },
];

export default function SettingsPage() {
  const { homeTimezone, homeCountry, updateHomeSettings } = useReminders();
  const [country, setCountry] = useState(homeCountry);
  const [timezone, setTimezone] = useState(homeTimezone);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setCountry(homeCountry);
    setTimezone(homeTimezone);
  }, [homeCountry, homeTimezone]);

  const handleSave = () => {
    updateHomeSettings(timezone, country);
    toast({
      title: "Settings Saved",
      description: `App is now synchronized to ${country} (${timezone}).`,
    });
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-8">
      <header className="flex items-center gap-4">
        <div className="p-3 bg-primary/20 rounded-xl">
          <Settings className="w-8 h-8 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-headline font-bold text-white tracking-tight">App Settings</h1>
          <p className="text-muted-foreground">Customize your global reference preferences.</p>
        </div>
      </header>

      <Card className="glass-panel">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-accent" />
            Home Location
          </CardTitle>
          <CardDescription>This defines the "Local Time" used for your alarms and dashboard conversion.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="country">Home Country / Label</Label>
            <div className="relative">
              <Input 
                id="country" 
                placeholder="e.g. India" 
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="pl-10"
              />
              <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            </div>
            <p className="text-xs text-muted-foreground">This label will appear on your dashboard reminders (e.g., "{country || 'Your'} Reminder Time").</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="timezone">Reference Timezone</Label>
            <Select value={timezone} onValueChange={setTimezone}>
              <SelectTrigger>
                <SelectValue placeholder="Select Home Timezone" />
              </SelectTrigger>
              <SelectContent>
                {TIMEZONES.map((tz) => (
                  <SelectItem key={tz.value} value={tz.value}>
                    {tz.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSave} className="w-full bg-primary hover:bg-primary/90 gap-2">
            <Save className="w-4 h-4" />
            Save Preferences
          </Button>
        </CardContent>
      </Card>

      <Card className="bg-primary/5 border-primary/20">
        <CardContent className="p-6 flex items-start gap-4">
          <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="font-bold text-white">Custom Synchronization</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              If you are in <span className="text-primary font-bold">{country || 'Home'}</span>, all meetings from global hubs will be translated to <span className="text-primary font-bold font-code">{timezone}</span> time.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
