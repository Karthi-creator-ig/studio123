import type { Metadata } from 'next';
import './globals.css';
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/app-sidebar";
import { Toaster } from "@/components/ui/toaster";
import { RemindersProvider } from "@/lib/store-reminders";
import { ReminderMonitor } from "@/components/reminder-monitor";
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { Clock } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GlobalCue | Smart Timezone Reminders',
  description: 'Synchronize your global meetings with AI-driven insights and conflict optimization.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Space+Grotesk:wght@400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-body antialiased bg-background text-foreground">
        <FirebaseClientProvider>
          <RemindersProvider>
            <SidebarProvider>
              <div className="flex min-h-screen w-full flex-col md:flex-row">
                {/* Mobile Header */}
                <header className="flex h-14 items-center justify-between border-b border-white/5 px-4 md:hidden bg-card/50 backdrop-blur-md sticky top-0 z-50">
                  <div className="flex items-center gap-2">
                    <SidebarTrigger />
                    <div className="flex items-center gap-2 ml-2">
                      <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
                        <Clock className="w-4 h-4 text-white" />
                      </div>
                      <span className="text-lg font-headline font-bold text-white tracking-tighter">GlobalCue</span>
                    </div>
                  </div>
                </header>
                
                <AppSidebar />
                <main className="flex-1 overflow-auto">
                  {children}
                </main>
              </div>
            </SidebarProvider>
            <ReminderMonitor />
            <Toaster />
          </RemindersProvider>
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
