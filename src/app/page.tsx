"use client";

import { DigitalClock } from "@/components/digital-clock";
import { useReminders } from "@/lib/store-reminders";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Globe, Bell, Trash2, Zap, Calendar, Volume2, VolumeX, ArrowRight, Settings as SettingsIcon, Sparkles, Plus } from "lucide-react";
import { isAfter, parseISO } from "date-fns";
import { useAudioEngine } from "@/components/audio-engine";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useUser } from "@/firebase";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const { reminders, deleteReminder, homeTimezone, homeCountry, loading: remindersLoading } = useReminders();
  const { playAlert, audioStarted } = useAudioEngine();
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!userLoading && !user) {
      router.replace('/auth');
    }
  }, [user, userLoading, router]);

  if (!mounted || userLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Sparkles className="w-12 h-12 text-primary animate-pulse" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="p-4 md:p-8 space-y-6 md:space-y-10 max-w-7xl mx-auto animate-in fade-in duration-700">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl md:text-4xl font-headline font-bold text-white mb-1 md:mb-2 tracking-tight">
            Hello, {user.displayName || 'Explorer'}
          </h1>
          <p className="text-muted-foreground text-sm md:text-lg">Your global time awareness center.</p>
        </div>
        <div className="flex flex-row md:flex-wrap gap-2 md:gap-4 items-center overflow-x-auto pb-2 md:pb-0 scrollbar-hide">
          <DigitalClock timezone="UTC" label="UTC" />
          <DigitalClock timezone={homeTimezone} label={homeCountry || 'Local'} />
          <Button asChild variant="ghost" size="icon" className="text-muted-foreground hidden md:flex">
            <Link href="/settings"><SettingsIcon className="w-5 h-5" /></Link>
          </Button>
        </div>
      </header>

      {/* CRITICAL: Audio Sync Banner */}
      {!audioStarted && (
        <Card className="bg-primary/20 border-primary border-2 shadow-lg animate-in slide-in-from-top-4">
          <CardContent className="p-6 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <VolumeX className="text-primary w-6 h-6" />
              </div>
              <div className="space-y-1 text-center md:text-left">
                <p className="text-lg font-bold text-white leading-tight">Audio is currently blocked</p>
                <p className="text-sm text-muted-foreground">Browsers require a click to enable sounds. Click sync to hear meeting alarms.</p>
              </div>
            </div>
            <Button size="lg" onClick={() => playAlert('test')} className="font-headline font-bold px-8 shadow-xl shadow-primary/20 hover:scale-105 transition-transform">
              Sync Audio Now
            </Button>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-headline font-semibold flex items-center gap-2 text-white">
              <Bell className="w-5 h-5 md:w-6 md:h-6 text-primary" />
              Your Reminders
            </h2>
            <Button asChild variant="outline" size="sm" className="border-primary/20 hover:border-primary h-8 font-bold">
              <Link href="/schedule">
                <Plus className="w-4 h-4 mr-1 md:hidden" />
                <span className="hidden md:inline">Add New Reminder</span>
                <span className="md:hidden">Add New</span>
              </Link>
            </Button>
          </div>

          <div className="space-y-4">
            {remindersLoading ? (
              <div className="py-20 flex flex-col items-center justify-center space-y-4">
                <Sparkles className="w-10 h-10 text-primary animate-pulse" />
                <p className="text-muted-foreground text-sm">Syncing your reminders...</p>
              </div>
            ) : reminders.length === 0 ? (
              <Card className="border-dashed border-2 bg-transparent border-white/10">
                <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                    <Clock className="w-8 h-8 text-muted-foreground opacity-20" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">No meetings yet</h3>
                  <p className="text-muted-foreground font-medium text-sm max-w-xs mb-6">Schedule your first cross-border meeting reminder to see the magic of GlobalCue.</p>
                  <Button asChild className="bg-primary hover:bg-primary/90">
                    <Link href="/schedule">Create My First Alert</Link>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              reminders.map((reminder) => {
                const startTime = parseISO(reminder.startTime);
                const isUpcoming = isAfter(startTime, new Date()) && reminder.isActive;
                
                return (
                  <Card key={reminder.id} className={`glass-panel overflow-hidden group transition-all duration-300 hover:border-primary/30 ${!reminder.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                    <CardContent className="p-4 md:p-6">
                      <div className="flex flex-col gap-4">
                        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                          <div className="space-y-2 flex-1">
                            <div className="flex items-center flex-wrap gap-2">
                              <h3 className="text-lg md:text-xl font-headline font-bold text-white leading-tight group-hover:text-primary transition-colors">{reminder.title}</h3>
                              <Badge variant={isUpcoming ? "default" : "secondary"} className={`text-[10px] h-5 font-bold ${isUpcoming ? "bg-primary" : "bg-muted"}`}>
                                {isUpcoming ? "Upcoming" : (!reminder.isActive ? "Completed" : "Past")}
                              </Badge>
                            </div>
                            <p className="text-muted-foreground text-xs md:text-sm line-clamp-2 leading-relaxed">{reminder.description}</p>
                            
                            <div className="flex flex-wrap gap-3 mt-2">
                              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-accent font-bold">
                                <Calendar className="w-3.5 h-3.5" />
                                {startTime.toLocaleDateString([], { dateStyle: 'medium', timeZone: homeTimezone })}
                              </div>
                              <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-muted-foreground font-medium">
                                <Globe className="w-3.5 h-3.5" />
                                {reminder.hostCountry}: {reminder.timezone}
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-4 pt-4 md:pt-0 border-t md:border-t-0 border-white/5">
                            <div className="text-right flex flex-col items-start md:items-end">
                              <div className="flex items-center gap-2">
                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">{reminder.hostCountry}:</div>
                                <div className="text-xs font-code font-bold text-white/40">
                                  {startTime.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit',
                                    timeZone: reminder.timezone 
                                  })}
                                </div>
                              </div>
                              <div className="flex flex-col items-start md:items-end mt-1">
                                <div className="text-[10px] text-primary font-bold uppercase tracking-tighter flex items-center gap-1">
                                  <ArrowRight className="w-2 h-2" />
                                  {homeCountry || 'Local'}
                                </div>
                                <div className="text-xl md:text-3xl font-code font-bold text-accent tracking-tighter">
                                  {startTime.toLocaleTimeString([], { 
                                    hour: '2-digit', 
                                    minute: '2-digit', 
                                    timeZone: homeTimezone 
                                  })}
                                </div>
                              </div>
                            </div>
                            <div className="flex gap-1 md:mt-2">
                              <Button size="icon" variant="ghost" onClick={() => playAlert(reminder.soundId)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                                <Volume2 className="w-4 h-4" />
                              </Button>
                              <Button size="icon" variant="ghost" onClick={() => deleteReminder(reminder.id)} className="h-8 w-8 hover:text-destructive text-muted-foreground">
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>

                        {reminder.summary && (
                          <div className="p-3 rounded-lg bg-primary/5 border border-primary/10 flex gap-3 group-hover:bg-primary/10 transition-colors">
                            <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            <div className="text-[10px] md:text-xs italic text-muted-foreground leading-relaxed">
                              <span className="font-bold text-primary not-italic uppercase tracking-widest mr-2">AI Insight:</span> {reminder.summary}
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        <aside className="space-y-6">
          <Card className="glass-panel border-primary/10">
            <CardHeader className="p-4 md:p-6 pb-2 md:pb-4">
              <CardTitle className="text-base md:text-lg font-headline flex items-center gap-2 text-white">
                <Globe className="w-4 h-4 md:w-5 md:h-5 text-accent" />
                Global Time Hub
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 md:p-6 pt-0 space-y-3">
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                <span className="text-xs md:text-sm font-bold text-white">New York</span>
                <span className="font-code text-[10px] md:text-xs text-accent font-bold tracking-widest">GMT-4</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-primary/10 border border-primary/30">
                <span className="text-xs md:text-sm font-black text-primary uppercase">{homeCountry}</span>
                <span className="font-code text-[10px] md:text-xs text-primary font-black tracking-widest">HOME</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                <span className="text-xs md:text-sm font-bold text-white">London</span>
                <span className="font-code text-[10px] md:text-xs text-accent font-bold tracking-widest">GMT+1</span>
              </div>
              <div className="flex justify-between items-center p-3 rounded-lg bg-white/5 border border-white/5 group hover:bg-white/10 transition-colors">
                <span className="text-xs md:text-sm font-bold text-white">Tokyo</span>
                <span className="font-code text-[10px] md:text-xs text-accent font-bold tracking-widest">GMT+9</span>
              </div>
              <Button asChild variant="link" className="w-full text-[10px] md:text-xs text-muted-foreground mt-4 hover:text-primary">
                <Link href="/settings">Adjust Global Hub Settings</Link>
              </Button>
            </CardContent>
          </Card>
          
          <Card className="glass-panel border-accent/10 bg-accent/5">
            <CardContent className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <Zap className="w-5 h-5 text-accent" />
                <h4 className="font-bold text-white text-sm">Productivity Tip</h4>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Global teams perform best when meeting during "Respectful Overlaps." Check your <strong>Global Sync</strong> dashboard regularly to find the perfect windows.
              </p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}
