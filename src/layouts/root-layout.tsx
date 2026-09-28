import { Outlet } from "react-router";

import { AppSidebar } from "@/components/app-sidebar";
import { currentStudent } from "@/lib/mock-data";
import { ModeToggle } from "@/components/mode-toggle";
import { Separator } from "@/components/ui/separator";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function RootLayout() {
  return (
    <SidebarProvider>
      <AppSidebar
        firstName={"Suthanakit"}
        lastName={"Wongsrichan"}
        studentId={"680610729"}
      />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-2 border-b px-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-4" />
            <span className="text-sm font-medium">ระบบลงทะเบียนเรียน</span>
          </div>
          <ModeToggle />
        </header>
        <main className="flex-1 p-4">
          <Outlet />
        </main>
        <footer className="border-t p-4 text-center text-xs text-muted-foreground"></footer>
      </SidebarInset>
    </SidebarProvider>
  );
}
