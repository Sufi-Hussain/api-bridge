import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Mail, MapPin, Building2 } from "lucide-react";
import { StatusBadge } from "./status-badge";
import type { StatusTone } from "@/types";
import { cn } from "@/lib/utils";

export interface EmployeeCardProps {
  name: string;
  jobTitle: string;
  department: string;
  location: string;
  email: string;
  status?: string;
  tone?: StatusTone;
  className?: string;
  onClick?: () => void;
}

export function EmployeeCard({
  name,
  jobTitle,
  department,
  location,
  email,
  status,
  tone = "muted",
  className,
  onClick,
}: EmployeeCardProps) {
  const inits = name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("");
  return (
    <Card
      className={cn(
        "cursor-pointer border-border/60 shadow-sm transition-all hover:border-primary/40 hover:shadow-md",
        className,
      )}
      onClick={onClick}
    >
      <CardContent className="flex items-start gap-3 p-4">
        <Avatar className="h-11 w-11">
          <AvatarFallback className="bg-primary/10 text-sm font-semibold text-primary">
            {inits}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{name}</p>
              <p className="truncate text-xs text-muted-foreground">{jobTitle}</p>
            </div>
            {status && <StatusBadge tone={tone}>{status}</StatusBadge>}
          </div>
          <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Building2 className="h-3 w-3" /> {department}
            </span>
            <span className="inline-flex items-center gap-1">
              <MapPin className="h-3 w-3" /> {location}
            </span>
            <span className="inline-flex items-center gap-1 truncate">
              <Mail className="h-3 w-3" /> {email}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
