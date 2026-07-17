"use client";

import { useState, useEffect } from 'react';
import { useReminders } from '@/lib/store-reminders';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Bell, Clock, Calendar, Globe, Trash2, Zap, ArrowRight, ExternalLink } from 'lucide-react';
import { parseISO, isAfter, format, formatDistanceToNow } from 'date-fns';
import Link from 'next/link';

export default function RemindersPage() {
  const { reminders, deleteReminder, homeTimezone, homeCountry } = useReminders();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const activeReminders = reminders.filter(r => r.isActive && isAfter(parseISO(r.startTime), new Date()));
  const pastReminders = reminders.filter(r => !r.isActive || !isAfter(parseISO(r.startTime), new Date()));

  const ReminderCard = ({ reminder }: { reminder: any }) => {
    const startTime = parseISO(reminder.startTime);
    const isUpcoming = isAfter(startTime, new Date()) && reminder.isActive;

    return (
      <Card className={`glass-panel overflow-hidden group ${!reminder.isActive ? 'opacity-70' : ''}`}>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="md:w-1/4 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-white/5 pb-4 md:pb-0 md:pr-6 text-center">
              <div className="text-4xl font-code font-bold text-accent mb-1">
                {format(startTime, 'HH:mm', { timeZone: homeTimezone })}
              </div>
              <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4">
                {homeCountry} Time
              </div>
              <Badge variant={isUpcoming ? "default" : "secondary"} className="w-full justify-center">
                {isUpcoming ? "Active" : "Completed"}
              </Badge>
            </div>

            <div className="flex-1 space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-headline font-bold text-white group-hover:text-primary transition-colors">
                    {reminder.title}
                  </h3>
                  <div className="flex items-center gap-4 mt-1">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Calendar className="w-3.5 h-3.5" />
                      {format(startTime, 'MMM d, yyyy')}
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Globe className="w-3.5 h-3.5" />
                      {reminder.hostCountry} ({reminder.timezone})
                    </div>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => deleteReminder(reminder.id)}
                  className="text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed">
                {reminder.description || "No additional details provided for this meeting."}
              </p>

              {reminder.summary && (
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 flex gap-3">
                  <Zap className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  <div className="text-xs italic text-muted-foreground leading-relaxed">
                    <span className="font-bold text-primary not-italic uppercase tracking-tighter mr-2">AI Summary:</span> 
                    {reminder.summary}
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2">
                  <div className="text-[10px] font-bold text-muted-foreground uppercase">Original Hub Time:</div>
                  <div className="text-xs font-code font-bold text-white/50">
                    {format(startTime, 'hh:mm a', { timeZone: reminder.timezone })}
                  </div>
                </div>
                {isUpcoming && (
                  <div className="text-xs font-bold text-primary animate-pulse">
                    Rings in {formatDistanceToNow(startTime)}
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-headline font-bold text-white tracking-tight flex items-center gap-3">
            <Bell className="w-10 h-10 text-primary" />
            Reminders Center
          </h1>
          <p className="text-muted-foreground text-lg">Manage and review your global alerts.</p>
        </div>
        <Button asChild className="bg-primary hover:bg-primary/90">
          <Link href="/schedule">
            <Calendar className="w-4 h-4 mr-2" />
            New Reminder
          </Link>
        </Button>
      </header>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 glass-panel h-12">
          <TabsTrigger value="active" className="data-[state=active]:bg-primary">
            Active ({activeReminders.length})
          </TabsTrigger>
          <TabsTrigger value="past" className="data-[state=active]:bg-muted">
            History ({pastReminders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-6">
          {activeReminders.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent py-20">
              <CardContent className="flex flex-col items-center justify-center text-center">
                <Clock className="w-16 h-16 text-muted-foreground opacity-20 mb-4" />
                <h3 className="text-xl font-bold text-white">No active alerts</h3>
                <p className="text-muted-foreground mt-2 max-w-xs">
                  Your active reminders will appear here once they are scheduled.
                </p>
                <Button asChild variant="link" className="text-primary mt-4">
                  <Link href="/schedule">Schedule a meeting now</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            activeReminders.map(r => <ReminderCard key={r.id} reminder={r} />)
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-6">
          {pastReminders.length === 0 ? (
            <div className="text-center py-20 text-muted-foreground">
              No history found.
            </div>
          ) : (
            pastReminders.map(r => <ReminderCard key={r.id} reminder={r} />)
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
