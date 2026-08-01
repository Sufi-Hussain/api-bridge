import * as React from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useAuth } from "@/lib/auth/context";

export const Route = createFileRoute("/auth/logout")({
  component: LogoutPage,
});

function LogoutPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    const signOut = async () => {
      await logout();
      navigate({
        to: "/auth/login",
        search: {
          redirect: "/",
        },
        replace: true,
      });
    };

    signOut();
  }, [logout, navigate]);

  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <p className="text-muted-foreground">Signing you out...</p>
    </div>
  );
}