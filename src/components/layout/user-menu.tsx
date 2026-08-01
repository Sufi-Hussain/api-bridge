import { LogOut, User as UserIcon, Settings, HelpCircle } from "lucide-react";
import { Link } from "@tanstack/react-router";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/stores/auth.store";

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function UserMenu() {
  const user = useAuthStore((s) => s.user);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="h-9 gap-2 rounded-full pl-1 pr-2.5"
          aria-label="Account menu"
        >
          <Avatar className="h-7 w-7">
            <AvatarFallback className="bg-primary text-xs text-primary-foreground">
              {initials(user.name)}
            </AvatarFallback>
          </Avatar>
          <div className="hidden text-left sm:block">
            <p className="text-xs font-semibold leading-tight">{user.name}</p>
            <p className="text-[11px] leading-tight text-muted-foreground">
              {user.jobTitle}
            </p>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-semibold">{user.name}</span>
            <span className="text-xs font-normal text-muted-foreground">
              {user.email}
            </span>
            <span className="mt-1 text-[11px] font-normal text-muted-foreground">
              ID · {user.employeeId} · {user.department}
            </span>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/profile/personal">
            <UserIcon className="mr-2 h-4 w-4" /> My Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings/preferences">
            <Settings className="mr-2 h-4 w-4" /> Preferences
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/helpdesk/knowledge">
            <HelpCircle className="mr-2 h-4 w-4" /> Help & Support
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/auth/logout">
            <LogOut className="mr-2 h-4 w-4" /> Sign out
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
