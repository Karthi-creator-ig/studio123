"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useReminders } from '@/lib/store-reminders';
import { summarizeMeetingContext } from '@/ai/flows/meeting-context-summarizer-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarPlus, Loader2, Sparkles, Wand2, Clock, Globe, ArrowRight, Settings as SettingsIcon } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { fromZonedTime, toZonedTime } from 'date-fns-tz';
import Link from 'next/link';

const COMMON_TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "America/Los_Angeles", label: "San Francisco (PST/PDT)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "UTC", label: "UTC (Universal)" },
];

export default function SchedulePage() {
  const router = useRouter();
  const { addReminder, homeTimezone, homeCountry } = useReminders();
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    hour: '09',
    minute: '00',
    period: 'AM',
    timezone: 'America/New_York',
    hostCountry: 'USA',
    soundId: 'iris',
    summary: ''
  });

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setFormData(prev => ({
      ...prev,
      date: format(now, 'yyyy-MM-dd'),
    }));
  }, []);

  const localPreview = useMemo(() => {
    if (!formData.date || !mounted) return null;
    
    let h = parseInt(formData.hour);
    if (formData.period === 'PM' && h < 12) h += 12;
    if (formData.period === 'AM' && h === 12) h = 0;
    const hourStr = h.toString().padStart(2, '0');
    
    const dateTimeStr = `${formData.date} ${hourStr}:${formData.minute}:00`;
    try {
      const utcDate = fromZonedTime(dateTimeStr, formData.timezone);
      const zonedDate = toZonedTime(utcDate, homeTimezone);
      return format(zonedDate, 'hh:mm a');
    } catch (e) {
      return null;
    }
  }, [formData, homeTimezone, mounted]);

  const generateSummary = async () => {
    if (!formData.title) {
      toast({ title: "Title Required", description: "Please enter a meeting title first." });
      return;
    }
    setAiLoading(true);
    try {
      const result = await summarizeMeetingContext({
        title: formData.title,
        description: formData.description
      });
      setFormData(prev => ({ ...prev, summary: result.summary }));
      toast({ title: "Context Generated", description: "AI has prepared a summary for this meeting." });
    } catch (error) {
      console.error(error);
      toast({ title: "AI Error", description: "Could not generate summary." });
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.date) {
      toast({ title: "Error", description: "Please fill in all required fields." });
      return;
    }

    setLoading(true);
    
    let h = parseInt(formData.hour);
    if (formData.period === 'PM' && h < 12) h += 12;
    if (formData.period === 'AM' && h === 12) h = 0;
    const hourStr = h.toString().padStart(2, '0');
    
    const dateTimeStr = `${formData.date} ${hourStr}:${formData.minute}:00`;
    const utcDate = fromZonedTime(dateTimeStr, formData.timezone);
    const startTime = utcDate.toISOString();
    
    addReminder({
      id: Math.random().toString(36).substring(7),
      title: formData.title,
      description: formData.description,
      startTime,
      timezone: formData.timezone,
      hostCountry: formData.hostCountry,
      summary: formData.summary,
      soundId: formData.soundId,
      isActive: true
    });

    toast({ 
      title: "Reminder Set", 
      description: `Alarm scheduled. AI converted ${formData.hour}:${formData.minute} ${formData.period} (${formData.hostCountry}) to ${homeCountry} time.` 
    });
    router.push('/');
  };

  if (!mounted) return null;

  const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString().padStart(2, '0'));
  const minutes = Array.from({ length: 60 }, (_, i) => i.toString().padStart(2, '0'));

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-primary/20 rounded-xl">
            <CalendarPlus className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold">New Global Reminder</h1>
            <p className="text-muted-foreground">Setup precision alerts across timezones.</p>
          </div>
        </div>
        <Button asChild variant="outline" size="sm" className="gap-2">
          <Link href="/settings">
            <SettingsIcon className="w-4 h-4" />
            Home Settings
          </Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle>Meeting Basics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Meeting Title</Label>
                <Input 
                  id="title" 
                  placeholder="e.g. Sync with Tokyo Team" 
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description</Label>
                <Textarea 
                  id="description" 
                  placeholder="Goals, agenda items..." 
                  className="min-h-[100px]"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5 text-accent" />
                Host Location
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="hostCountry">Meeting Country (Host)</Label>
                <Input 
                  id="hostCountry" 
                  placeholder="e.g. USA, UK, Japan, India" 
                  value={formData.hostCountry}
                  onChange={e => setFormData({ ...formData, hostCountry: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timezone">Host's Timezone</Label>
                <Select 
                  value={formData.timezone} 
                  onValueChange={v => setFormData({ ...formData, timezone: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {COMMON_TIMEZONES.map(tz => (
                      <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-accent" />
                Meeting Time
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Date</Label>
                <Input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} />
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Hour</Label>
                  <Select value={formData.hour} onValueChange={v => setFormData({...formData, hour: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {hours.map(h => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">Min</Label>
                  <Select value={formData.minute} onValueChange={v => setFormData({...formData, minute: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent className="max-h-60">
                      {minutes.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] uppercase text-muted-foreground">AM/PM</Label>
                  <Select value={formData.period} onValueChange={v => setFormData({...formData, period: v})}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AM">AM</SelectItem>
                      <SelectItem value="PM">PM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20 space-y-2">
                <div className="flex items-center justify-between text-xs font-bold uppercase tracking-widest text-primary">
                  <span>Conversion Preview</span>
                  <Sparkles className="w-3 h-3" />
                </div>
                <div className="flex items-center justify-between">
                  <div className="text-sm">
                    <div className="text-muted-foreground text-[10px] uppercase font-bold">{formData.hostCountry || 'Host'}</div>
                    <div className="font-code font-bold">{formData.hour}:{formData.minute} {formData.period}</div>
                  </div>
                  <ArrowRight className="text-primary w-4 h-4" />
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end">
                      <div className="text-primary text-[10px] uppercase font-bold">{homeCountry} (YOU)</div>
                    </div>
                    <div className="font-code font-bold text-accent text-lg">{localPreview || '--:--'}</div>
                  </div>
                </div>
                <p className="text-[10px] text-muted-foreground italic leading-tight pt-2 border-t border-white/5">
                  The alarm will ring at exactly <span className="text-accent font-bold">{localPreview}</span> in <span className="text-primary font-bold">{homeCountry}</span>.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel bg-primary/5">
            <CardHeader className="py-4">
              <div className="flex justify-between items-center">
                <CardTitle className="text-sm font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-primary" />
                  AI Preview
                </CardTitle>
                <Button type="button" variant="ghost" size="sm" onClick={generateSummary} disabled={aiLoading} className="h-7 text-xs">
                  {aiLoading ? <Loader2 className="animate-spin w-3 h-3" /> : "Refresh"}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={formData.summary} 
                placeholder="AI Summary will appear here..." 
                readOnly 
                className="text-xs h-24 bg-transparent border-none focus-visible:ring-0"
              />
              <Button type="submit" disabled={loading} className="w-full mt-4 bg-primary font-headline h-12 hover:bg-primary/90">
                {loading ? <Loader2 className="animate-spin" /> : "Set Global Reminder"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
