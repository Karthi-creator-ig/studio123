"use client";

import { useState, useEffect } from 'react';
import { optimalMeetingTimeSuggester, OptimalMeetingTimeSuggesterOutput } from '@/ai/flows/optimal-meeting-time-suggester-flow';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Globe2, Users, Calendar, Loader2, Wand2, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { format } from 'date-fns';

const COMMON_TIMEZONES = [
  { value: "Asia/Kolkata", label: "India (IST)" },
  { value: "America/New_York", label: "New York (EST/EDT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "America/Los_Angeles", label: "California (PST/PDT)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
  { value: "UTC", label: "UTC (Universal)" },
];

export default function OptimizePage() {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<OptimalMeetingTimeSuggesterOutput | null>(null);
  const [mounted, setMounted] = useState(false);
  
  const [meetingInfo, setMeetingInfo] = useState({
    title: '',
    duration: 60,
    date: ''
  });

  const [participants, setParticipants] = useState([
    { name: 'Self', timezone: 'UTC' },
    { name: 'US Colleague', timezone: 'America/New_York' },
    { name: 'London Partner', timezone: 'Europe/London' }
  ]);

  useEffect(() => {
    setMounted(true);
    const now = new Date();
    setMeetingInfo(prev => ({
      ...prev,
      date: format(now, 'yyyy-MM-dd')
    }));

    // Detect timezone after mount to avoid hydration mismatch
    if (typeof Intl !== 'undefined') {
      const userTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      setParticipants(prev => {
        const next = [...prev];
        next[0].timezone = userTz;
        return next;
      });
    }
  }, []);

  const addParticipant = () => {
    setParticipants([...participants, { name: '', timezone: 'UTC' }]);
  };

  const handleOptimize = async () => {
    if (!meetingInfo.title) {
      toast({ title: "Meeting Title Required", description: "Please enter what the meeting is about." });
      return;
    }
    setLoading(true);
    try {
      const output = await optimalMeetingTimeSuggester({
        meetingTitle: meetingInfo.title,
        meetingDurationMinutes: meetingInfo.duration,
        targetDate: meetingInfo.date,
        participants: participants.map(p => ({
          name: p.name || 'Anonymous',
          timezone: p.timezone
        }))
      });
      setResults(output);
      toast({ title: "Analysis Complete", description: "AI has found the most respectful meeting windows." });
    } catch (error) {
      console.error(error);
      toast({ title: "Optimization Failed", description: "Could not calculate overlaps." });
    } finally {
      setLoading(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
            <Globe2 className="w-10 h-10 text-primary" />
            Conflict Optimization
          </h1>
          <p className="text-muted-foreground text-lg">AI-powered cross-border scheduling assistant.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <Card className="glass-panel">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Calendar className="w-5 h-5 text-accent" />
                Parameters
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meeting Title</Label>
                <Input 
                  placeholder="e.g. Q4 Planning" 
                  value={meetingInfo.title}
                  onChange={e => setMeetingInfo({ ...meetingInfo, title: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Duration (min)</Label>
                <Input 
                  type="number" 
                  value={meetingInfo.duration}
                  onChange={e => setMeetingInfo({ ...meetingInfo, duration: parseInt(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Target Date</Label>
                <Input 
                  type="date" 
                  value={meetingInfo.date}
                  onChange={e => setMeetingInfo({ ...meetingInfo, date: e.target.value })}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="glass-panel">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Users className="w-5 h-5 text-accent" />
                Participants
              </CardTitle>
              <Button size="sm" variant="ghost" onClick={addParticipant} className="text-primary text-xs">+</Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {participants.map((p, idx) => (
                <div key={idx} className="space-y-1 pb-2 border-b border-white/5 last:border-0">
                  <Input 
                    placeholder="Name" 
                    value={p.name} 
                    onChange={e => {
                      const newP = [...participants];
                      newP[idx].name = e.target.value;
                      setParticipants(newP);
                    }}
                    className="h-8 text-xs mb-1"
                  />
                  <Select 
                    value={p.timezone} 
                    onValueChange={v => {
                      const newP = [...participants];
                      newP[idx].timezone = v;
                      setParticipants(newP);
                    }}
                  >
                    <SelectTrigger className="h-8 text-[10px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {COMMON_TIMEZONES.map(tz => (
                        <SelectItem key={tz.value} value={tz.value}>{tz.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))}
              <Button 
                onClick={handleOptimize} 
                disabled={loading} 
                className="w-full bg-primary hover:bg-primary/90 gap-2 mt-4"
              >
                {loading ? <Loader2 className="animate-spin" /> : <Wand2 className="w-4 h-4" />}
                Analyze Overlaps
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <h2 className="text-2xl font-headline font-semibold">Recommended Windows</h2>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-pulse">
              <Sparkles className="w-12 h-12 text-primary mb-4" />
              <p className="text-muted-foreground font-medium">AI is simulating timezone overlaps...</p>
            </div>
          ) : results ? (
            <div className="space-y-6">
              {results.suggestedTimeWindows.map((window, idx) => (
                <Card key={idx} className={`glass-panel border-l-4 ${idx === 0 ? 'border-l-primary' : 'border-l-accent'}`}>
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="text-2xl font-code font-bold text-white mb-1">
                          {new Date(window.startTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })} 
                          <span className="text-muted-foreground mx-2">→</span>
                          {new Date(window.endTimeUTC).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}
                          <span className="text-xs text-muted-foreground font-medium ml-2 uppercase">UTC</span>
                        </div>
                        <p className="text-primary text-sm font-medium">{window.reasoning}</p>
                      </div>
                      <Badge className={idx === 0 ? "bg-primary" : "bg-accent"}>
                        Option #{idx + 1}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      {window.participantLocalTimes.map((pTime, pIdx) => (
                        <div key={pIdx} className="p-3 rounded-lg bg-white/5 border border-white/5 flex items-center justify-between">
                          <div>
                            <div className="text-xs text-muted-foreground font-bold uppercase">{pTime.name}</div>
                            <div className="text-sm font-code">{pTime.localStartTime} - {pTime.localEndTime}</div>
                          </div>
                          {pTime.isDuringWorkingHours ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <AlertCircle className="w-5 h-5 text-yellow-500" />
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="border-dashed bg-transparent border-white/10 py-20 flex flex-col items-center">
              <Globe2 className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
              <p className="text-muted-foreground">Fill in parameters and click Analyze to see suggestions.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
