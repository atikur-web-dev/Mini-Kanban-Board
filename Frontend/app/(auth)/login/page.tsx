"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";

function LogoIcon() {
  return (
    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 shadow-lg shadow-blue-600/25">
      <svg
        width="22"
        height="22"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-white"
      >
        <rect x="3" y="3" width="6" height="18" rx="2" />
        <rect x="15" y="3" width="6" height="11" rx="2" />
      </svg>
    </div>
  );
}

function MailIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

const demoUsers = [
  {
    name: "Test User",
    email: "test@example.com",
  },
  {
    name: "Atikur Rahman",
    email: "atikurrahman@gmail.com",
  },
];

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error ? err.message : "Invalid email or password";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
        <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
          {/* Left - Product Information */}
          <section className="relative overflow-hidden bg-linear-to-br from-blue-700 via-blue-800 to-slate-950 px-8 py-10 sm:px-10 sm:py-12 lg:px-12 lg:py-14">
            <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-blue-400/20 blur-3xl" />
            <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="relative z-10 flex h-full flex-col">
              <div className="flex items-center gap-3">
                <LogoIcon />

                <div>
                  <p className="text-lg font-bold tracking-tight text-white">
                    Mini Kanban
                  </p>
                  <p className="text-xs text-blue-200">
                    Plan. Organize. Deliver.
                  </p>
                </div>
              </div>

              <div className="my-auto py-12">
                <div className="mb-5 inline-flex items-center rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-medium text-blue-100 backdrop-blur">
                  <span className="mr-2 h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Simple workflow management
                </div>

                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  Keep your work
                  <span className="block text-blue-200">
                    moving forward.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-sm leading-6 text-blue-100/80 sm:text-base">
                  Create boards, organize tasks, manage workflows, and
                  collaborate with your team from one focused workspace.
                </p>

                <div className="mt-8 space-y-3">
                  {[
                    "Create and manage multiple boards",
                    "Organize work with flexible columns",
                    "Share boards and collaborate with others",
                  ].map((feature) => (
                    <div
                      key={feature}
                      className="flex items-center gap-3 text-sm text-blue-50"
                    >
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
                        <CheckIcon />
                      </span>

                      {feature}
                    </div>
                  ))}
                </div>
              </div>

              <p className="text-xs text-blue-200/60">
                A focused workspace for keeping work organized.
              </p>
            </div>
          </section>

          {/* Right - Login */}
          <section className="flex items-center bg-white px-7 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="w-full max-w-md mx-auto">
              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  Welcome back
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Sign in to your workspace
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Access your boards and continue managing your work.
                </p>
              </div>

              {error && (
                <div
                  role="alert"
                  className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-3.5 text-sm text-red-700"
                >
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="mt-0.5 shrink-0"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>

                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <MailIcon />
                    </span>

                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
                      <LockIcon />
                    </span>

                    <Input
                      id="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your password"
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg"
                >
                  {loading ? (
                    <Loader size="sm" />
                  ) : (
                    <>
                      Sign in
                      <ArrowIcon />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Access */}
              <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="mb-3">
                  <p className="text-sm font-semibold text-slate-900">
                    Quick demo access
                  </p>

                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Seed users are recommended for exploring board sharing.
                    Password for all seeded users:{" "}
                    <span className="font-semibold text-slate-700">
                      password123
                    </span>
                  </p>
                </div>

                <div className="space-y-2">
                  {demoUsers.map((user) => (
                    <button
                      key={user.email}
                      type="button"
                      onClick={() => fillDemoAccount(user.email)}
                      className="flex w-full items-center justify-between rounded-lg border border-blue-100 bg-white px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-xs font-semibold text-slate-800">
                          {user.name}
                        </p>

                        <p className="truncate text-xs text-slate-500">
                          {user.email}
                        </p>
                      </div>

                      <span className="ml-3 shrink-0 text-xs font-semibold text-blue-600">
                        Use account
                      </span>
                    </button>
                  ))}
                </div>

                <p className="mt-3 text-[11px] leading-4 text-slate-500">
                  You can also create your own account using the registration
                  page.
                </p>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don&apos;t have an account?{" "}
                  <Link
                    href="/register"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}