"use client";

import { useState, useEffect } from 'react';
import { useReminders } from '@/lib/store-reminders';
import { DigitalClock } from '@/components/digital-clock';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Globe, Clock, Zap, MapPin, Info } from 'lucide-react';
import { addHours, format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';

const MAJOR_HUBS = [
  { city: "San Francisco", zone: "America/Los_Angeles" },
  { city: "New York", zone: "America/New_York" },
  { city: "London", zone: "Europe/London" },
  { city: "Paris", zone: "Europe/Paris" },
  { city: "Dubai", zone: "Asia/Dubai" },
  { city: "Singapore", zone: "Asia/Singapore" },
  { city: "Tokyo", zone: "Asia/Tokyo" },
  { city: "Sydney", zone: "Australia/Sydney" },
];

export default function GlobalSyncPage() {
  const { homeTimezone, homeCountry } = useReminders();
  const [offset, setOffset] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const getFutureTime = (zone: string) => {
    const now = new Date();
    const future = addHours(now, offset);
    return format(toZonedTime(future, zone), 'HH:mm');
  };

  const getFutureDate = (zone: string) => {
    const now = new Date();
    const future = addHours(now, offset);
    return format(toZonedTime(future, zone), 'EEE, MMM d');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
            <Globe className="w-10 h-10 text-primary" />
            Global Sync
          </h1>
          <p className="text-muted-foreground text-lg">Visualize time across the planet in real-time.</p>
        </div>
        <div className="flex gap-4">
          <DigitalClock timezone={homeTimezone} label={`${homeCountry} (Home)`} />
        </div>
      </header>

      <Card className="glass-panel border-primary/20 bg-primary/5">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Time Travel Scrubber
            </CardTitle>
            <Badge variant="outline" className="border-primary text-primary font-code">
              {offset === 0 ? "Real Time" : `+${offset} Hours`}
            </Badge>
          </div>
          <CardDescription>
            Drag the slider to see how time shifts globally. Perfect for coordinating future calls.
          </CardDescription>
        </CardHeader>
        <CardContent className="py-6">
          <Slider 
            value={[offset]} 
            onValueChange={(val) => setOffset(val[0])} 
            max={24} 
            step={1} 
            className="my-4"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-2">
            <span>Now</span>
            <span>+6h</span>
            <span>+12h</span>
            <span>+18h</span>
            <span>+24h</span>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {MAJOR_HUBS.map((hub) => (
          <Card key={hub.city} className={`glass-panel overflow-hidden transition-all duration-300 ${offset > 0 ? 'border-primary/30' : ''}`}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-6">
                <div className="p-2 bg-white/5 rounded-lg">
                  <MapPin className="w-4 h-4 text-accent" />
                </div>
                <div className="text-right">
                  <div className="text-xs font-bold text-muted-foreground uppercase">{hub.city}</div>
                  <div className="text-[10px] text-muted-foreground/60">{hub.zone}</div>
                </div>
              </div>

              <div className="flex flex-col items-center">
                <div className={`text-4xl font-code font-bold tracking-tighter mb-1 ${offset > 0 ? 'text-primary' : 'text-white'}`}>
                  {getFutureTime(hub.zone)}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {getFutureDate(hub.zone)}
                </div>
              </div>

              {offset === 0 && (
                <div className="mt-6 pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-bold text-muted-foreground/40 uppercase">
                    <span>Status</span>
                    <Badge variant="ghost" className="h-4 text-[9px] bg-green-500/10 text-green-500">Live</Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="bg-white/5 border border-white/5 p-6 rounded-2xl flex items-start gap-4">
        <div className="p-2 bg-accent/20 rounded-full shrink-0">
          <Info className="w-5 h-5 text-accent" />
        </div>
        <div className="space-y-1">
          <h4 className="font-bold text-white text-sm">Pro Tip</h4>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Global Sync shows you the world at a glance. If you see a city is in their night hours (typically 22:00 - 06:00), 
            consider scheduling meetings during their morning or early afternoon for better participation.
          </p>
        </div>
      </div>
    </div>
  );
}
