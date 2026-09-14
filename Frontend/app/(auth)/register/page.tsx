"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { API_URL } from "@/lib/constants";

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

function UserIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 20c.8-3.4 3.1-5 7-5s6.2 1.6 7 5" />
    </svg>
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
      aria-hidden="true"
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
      aria-hidden="true"
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
      aria-hidden="true"
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
      aria-hidden="true"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

/*
 * Google official-style multicolor G logo.
 */
function GoogleIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 48 48"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        fill="#EA4335"
        d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.39 30.47 0 24 0 14.61 0 6.55 5.38 2.56 13.22l7.98 6.2C12.43 13.13 17.74 9.5 24 9.5z"
      />

      <path
        fill="#4285F4"
        d="M46.5 24.5c0-1.64-.15-3.22-.43-4.74H24v9h12.65c-.54 2.9-2.17 5.36-4.63 7.01l7.49 5.81C43.86 37.39 46.5 31.47 46.5 24.5z"
      />

      <path
        fill="#FBBC05"
        d="M10.54 28.58A14.48 14.48 0 0 1 9.5 24c0-1.59.36-3.13 1.04-4.58l-7.98-6.2A23.94 23.94 0 0 0 0 24c0 3.88.93 7.55 2.56 10.78l7.98-6.2z"
      />

      <path
        fill="#34A853"
        d="M24 48c6.48 0 11.91-2.14 15.88-5.82l-7.49-5.81c-2.07 1.39-4.71 2.22-8.39 2.22-6.26 0-11.57-3.63-13.46-8.92l-7.98 6.2C6.55 42.62 14.61 48 24 48z"
      />
    </svg>
  );
}

/*
 * GitHub official Mark.
 */
function GitHubIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M12 0C5.37 0 0 5.37 0 12C0 17.3 3.44 21.8 8.21 23.39C8.81 23.5 9.03 23.13 9.03 22.81C9.03 22.52 9.02 21.75 9.02 20.71C5.67 21.44 4.97 19.09 4.97 19.09C4.42 17.7 3.63 17.33 3.63 17.33C2.55 16.59 3.72 16.6 3.72 16.6C4.92 16.68 5.55 17.83 5.55 17.83C6.61 19.65 8.34 19.13 9.05 18.82C9.16 18.05 9.47 17.53 9.81 17.23C7.14 16.93 4.34 15.9 4.34 11.37C4.34 10.08 4.8 9.02 5.57 8.19C5.44 7.88 5.03 6.67 5.68 5.04C5.68 5.04 6.68 4.72 8.98 6.28C9.93 6.02 10.95 5.89 12 5.89C13.05 5.89 14.07 6.02 15.02 6.28C17.32 4.72 18.32 5.04 18.32 5.04C18.97 6.67 18.56 7.88 18.43 8.19C19.2 9.02 19.66 10.08 19.66 11.37C19.66 15.91 16.86 16.92 14.18 17.22C14.61 17.59 15 18.32 15 19.44C15 21.04 14.98 22.33 14.98 22.81C14.98 23.13 15.2 23.5 15.81 23.39C20.57 21.8 24 17.3 24 12C24 5.37 18.63 0 12 0Z" />
    </svg>
  );
}

export default function RegisterPage() {
  const [name, setName] = useState("");

  const [email, setEmail] = useState("");

  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const [loading, setLoading] = useState(false);

  const [oauthLoading, setOauthLoading] = useState<
    "google" | "github" | null
  >(null);

  const { register, isAuthenticated } = useAuth();

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
      await register(name, email, password);

      router.replace("/dashboard");
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Registration failed";

      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthRegister = (
    provider: "google" | "github",
  ) => {
    setError("");
    setOauthLoading(provider);

    window.location.href = `${API_URL}/auth/${provider}`;
  };

  const isBusy = loading || oauthLoading !== null;

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 sm:px-6 lg:px-8">
      <div className="w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-300/40">
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          {/* Left - Register Form */}
          <section className="flex items-center bg-white px-7 py-10 sm:px-10 lg:px-12 lg:py-14">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8">
                <p className="mb-2 text-sm font-semibold text-blue-600">
                  Get started
                </p>

                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Create your account
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Set up your workspace and start organizing your work.
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
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="9" />
                    <path d="M12 8v5M12 16h.01" />
                  </svg>

                  <span>{error}</span>
                </div>
              )}

              {/* OAuth buttons */}
              <div className="mb-7 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    handleOAuthRegister("google")
                  }
                  disabled={isBusy}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {oauthLoading === "google" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
                  ) : (
                    <GoogleIcon />
                  )}

                  Continue with Google
                </button>

                <button
                  type="button"
                  onClick={() =>
                    handleOAuthRegister("github")
                  }
                  disabled={isBusy}
                  className="flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-300 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {oauthLoading === "github" ? (
                    <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />
                  ) : (
                    <GitHubIcon />
                  )}

                  Continue with GitHub
                </button>
              </div>

              {/* Divider */}
              <div className="mb-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wider text-slate-400">
                  Or continue with email
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Email/password registration */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Full name
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                      <UserIcon />
                    </span>

                    <Input
                      id="name"
                      type="text"
                      required
                      autoComplete="name"
                      value={name}
                      onChange={(e) =>
                        setName(e.target.value)
                      }
                      placeholder="Your full name"
                      disabled={isBusy}
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                      <MailIcon />
                    </span>

                    <Input
                      id="email"
                      type="email"
                      required
                      autoComplete="email"
                      value={email}
                      onChange={(e) =>
                        setEmail(e.target.value)
                      }
                      placeholder="you@example.com"
                      disabled={isBusy}
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
                    <span className="pointer-events-none absolute left-3.5 top-1/2 z-10 -translate-y-1/2 text-slate-400">
                      <LockIcon />
                    </span>

                    <Input
                      id="password"
                      type="password"
                      required
                      minLength={6}
                      autoComplete="new-password"
                      value={password}
                      onChange={(e) =>
                        setPassword(e.target.value)
                      }
                      placeholder="At least 6 characters"
                      disabled={isBusy}
                      className="h-11 pl-10"
                    />
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Use at least 6 characters for your password.
                  </p>
                </div>

                <Button
                  type="submit"
                  disabled={isBusy}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-lg"
                >
                  {loading ? (
                    <>
                      <Loader size="sm" />
                      Creating account...
                    </>
                  ) : (
                    <>
                      Create account
                      <ArrowIcon />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo Information */}
              <div className="mt-7 rounded-xl border border-blue-100 bg-blue-50/70 p-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                    <CheckIcon />
                  </div>

                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      Want to explore first?
                    </p>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Seed users are recommended when exploring board sharing
                      and collaboration. All seeded users use the password{" "}
                      <span className="font-semibold text-slate-700">
                        password123
                      </span>
                      .
                    </p>

                    <p className="mt-2 text-xs font-medium text-blue-600">
                      Seed file: Backend/prisma/seed.ts
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?{" "}
                  <Link
                    href="/login"
                    className="font-semibold text-blue-600 transition hover:text-blue-700"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </div>
          </section>

          {/* Right - Product Information */}
          <section className="relative order-first overflow-hidden bg-linear-to-br from-blue-700 via-blue-800 to-slate-950 px-8 py-10 sm:px-10 sm:py-12 lg:order-last lg:px-12 lg:py-14">
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-indigo-400/20 blur-3xl" />

            <div className="absolute -bottom-24 -left-20 h-72 w-72 rounded-full bg-blue-400/20 blur-3xl" />

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
                  Your workspace starts here
                </div>

                <h1 className="text-4xl font-bold leading-tight tracking-tight text-white sm:text-5xl">
                  Build your
                  <span className="block text-blue-200">
                    perfect workflow.
                  </span>
                </h1>

                <p className="mt-5 max-w-md text-sm leading-6 text-blue-100/80 sm:text-base">
                  Keep projects organized, make progress visible, and
                  collaborate with others through a simple Kanban workflow.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3">
                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-lg font-bold text-white">
                      Boards
                    </p>

                    <p className="mt-1 text-xs text-blue-200">
                      Organize projects
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-lg font-bold text-white">
                      Tasks
                    </p>

                    <p className="mt-1 text-xs text-blue-200">
                      Track every step
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-lg font-bold text-white">
                      Teams
                    </p>

                    <p className="mt-1 text-xs text-blue-200">
                      Work together
                    </p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur">
                    <p className="text-lg font-bold text-white">
                      Flow
                    </p>

                    <p className="mt-1 text-xs text-blue-200">
                      Keep moving
                    </p>
                  </div>
                </div>
              </div>

              <p className="text-xs text-blue-200/60">
                A clean workspace designed around your workflow.
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
