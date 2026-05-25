import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="animate-pulse space-y-4">
      <div className="h-8 bg-muted rounded w-1/2" />
      <div className="h-4 bg-muted rounded w-3/4" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
      <div className="h-10 bg-muted rounded" />
    </div>}>
      <LoginForm />
    </Suspense>
  );
}
