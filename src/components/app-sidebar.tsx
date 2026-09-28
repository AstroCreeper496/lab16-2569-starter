import { BookOpen, ClipboardList, Home } from "lucide-react";
import { Link, useLocation } from "react-router";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// ผู้ใช้ตัวอย่างฝั่ง Lecture: ผู้ดูแลระบบ (ADMIN)
type AppSidebarProps = {
  firstName: string;
  lastName: string;
  studentId: string;
};

const navigationItems = [
  { label: "หน้าหลัก", href: "/", icon: Home },
  { label: "จัดการการลงทะเบียน", href: "/admin/enrollments", icon: ClipboardList },
  { label: "จัดการรายวิชา", href: "/admin/courses", icon: BookOpen },
];

export function AppSidebar({ firstName, lastName, studentId }: AppSidebarProps) {
  const location = useLocation();

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center gap-2 px-2 py-1">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <BookOpen className="size-4" />
          </div>
          <span className="truncate text-sm font-semibold">ระบบลงทะเบียนเรียน</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>เมนูหลัก</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navigationItems.map(({ label, href, icon: Icon }) => (
                <SidebarMenuItem key={href}>
                  <SidebarMenuButton
                    render={<Link to={href} />}
                    isActive={location.pathname === href}
                    tooltip={label}
                  >
                    <Icon />
                    <span>{label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <Separator />
        <div className="flex items-center gap-2 px-2 py-1">
          <Avatar>
            <AvatarFallback>
              {firstName.charAt(0)}{lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
            <span className="truncate font-medium">{firstName} {lastName}</span>
            <span className="truncate text-xs text-muted-foreground">{studentId}</span>
          </div>
          <Badge variant="secondary">ADMIN</Badge>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
       