"use client";

import { 
  LayoutDashboard, 
  CalendarPlus, 
  Clock, 
  Settings, 
  BellRing,
  LogOut,
  LogIn,
  User as UserIcon,
  ChevronUp
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useUser, useAuth } from "@/firebase";
import { signOut } from "firebase/auth";
import { toast } from "@/hooks/use-toast";

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useUser();
  const auth = useAuth();

  const menuItems = [
    { title: "Dashboard", icon: LayoutDashboard, href: "/" },
    { title: "Schedule Meeting", icon: CalendarPlus, href: "/schedule" },
    { title: "Reminders", icon: BellRing, href: "/reminders" },
    { title: "Global Sync", icon: Clock, href: "/sync" },
    { title: "Settings", icon: Settings, href: "/settings" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast({ title: "Signed Out", description: "You have been logged out successfully." });
      router.push('/auth');
    } catch (error) {
      toast({ variant: "destructive", title: "Error", description: "Failed to sign out." });
    }
  };

  return (
    <Sidebar>
      <SidebarHeader className="p-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Clock className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-headline font-bold text-white tracking-tighter">GlobalCue</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="px-6 text-xs uppercase tracking-widest text-muted-foreground mb-2">Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu className="px-3">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={pathname === item.href}
                    className="h-11 px-4 rounded-lg transition-all duration-200"
                  >
                    <Link href={item.href} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-4 border-t border-white/5">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton className="h-12 w-full justify-between px-4 hover:bg-white/5">
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                      <UserIcon className="w-4 h-4 text-primary" />
                    </div>
                    <div className="flex flex-col items-start overflow-hidden">
                      <span className="text-sm font-medium text-white truncate w-full">
                        {user ? (user.displayName || user.email?.split('@')[0]) : 'Guest User'}
                      </span>
                      <span className="text-[10px] text-muted-foreground truncate w-full">
                        {user ? user.email : 'Sign in to sync'}
                      </span>
                    </div>
                  </div>
                  <ChevronUp className="w-4 h-4 text-muted-foreground" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-56 glass-panel mb-2">
                {user ? (
                  <DropdownMenuItem onClick={handleSignOut} className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild className="gap-2 cursor-pointer">
                    <Link href="/auth">
                      <LogIn className="w-4 h-4" />
                      <span>Sign In</span>
                    </Link>
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
