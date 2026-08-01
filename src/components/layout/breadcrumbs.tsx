import { useRouterState } from "@tanstack/react-router";
import { findNav } from "@/config/navigation";

export function Breadcrumbs() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/") return null;
  const match = findNav(pathname);
  const segments = pathname.split("/").filter(Boolean);
  return (
    <nav
      aria-label="Breadcrumb"
      className="hidden items-center text-xs text-muted-foreground md:flex"
    >
      <span className="opacity-70">Home</span>
      {match?.parent && (
        <>
          <span className="mx-1.5 opacity-40">/</span>
          <span className="opacity-70">{match.parent}</span>
        </>
      )}
      <span className="mx-1.5 opacity-40">/</span>
      <span className="font-medium text-foreground">
        {match?.label ?? segments[segments.length - 1]}
      </span>
    </nav>
  );
}
