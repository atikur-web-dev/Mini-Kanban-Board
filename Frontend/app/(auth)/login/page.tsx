
"use client";

import {
  FormEvent,
  useContext,
  useEffect,
  useState,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { AuthContext } from "@/context/AuthContext";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Loader } from "@/components/ui/Loader";
import { API_URL } from "@/lib/constants";

function LogoIcon() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="8" fill="white" />

      <path
        d="M10 9.5H22C23.1046 9.5 24 10.3954 24 11.5V20.5C24 21.6046 23.1046 22.5 22 22.5H10C8.89543 22.5 8 21.6046 8 20.5V11.5C8 10.3954 8.89543 9.5 10 9.5Z"
        stroke="#2563EB"
        strokeWidth="1.8"
      />

      <path
        d="M8.5 13.5H23.5"
        stroke="#2563EB"
        strokeWidth="1.8"
      />

      <path
        d="M12 17H20"
        stroke="#2563EB"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 19.5H17"
        stroke="#2563EB"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M4 5H20C21.1046 5 22 5.89543 22 7V17C22 18.1046 21.1046 19 20 19H4C2.89543 19 2 18.1046 2 17V7C2 5.89543 2.89543 5 4 5Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M3 7L10.94 12.33C11.575 12.755 12.425 12.755 13.06 12.33L21 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="10"
        width="16"
        height="10"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />

      <path
        d="M8 10V7C8 4.79086 9.79086 3 12 3C14.2091 3 16 4.79086 16 7V10"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />

      <path
        d="M12 14V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12H19"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />

      <path
        d="M13 6L19 12L13 18"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M5 12L10 17L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

const demoUsers = [
  {
    name: "Test User",
    email: "test@example.com",
    password: "password123",
  },
  {
    name: "Atikur Rahman",
    email: "atikurrahman@gmail.com",
    password: "password123",
  },
];

export default function LoginPage() {
  const router = useRouter();

  const auth = useContext(AuthContext);

  if (!auth) {
    throw new Error(
      "LoginPage must be used inside AuthProvider",
    );
  }

  const { login, isAuthenticated } = auth;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [oauthLoading, setOauthLoading] = useState<
    "google" | "github" | null
  >(null);

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Invalid email or password.",
      );
    } finally {
      setLoading(false);
    }
  };

  const fillDemoAccount = (
    account: (typeof demoUsers)[number],
  ) => {
    setEmail(account.email);
    setPassword(account.password);
    setError("");
  };

  const handleOAuthLogin = (
    provider: "google" | "github",
  ) => {
    setError("");
    setOauthLoading(provider);

    window.location.href = `${API_URL}/auth/${provider}`;
  };

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-xl ring-1 ring-slate-200 lg:grid-cols-2">
          {/* Left branding section */}
          <section className="relative hidden overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
            <div className="absolute -right-24 -top-24 h-64 w-64 rounded-full bg-white/10" />
            <div className="absolute -bottom-32 -left-20 h-72 w-72 rounded-full bg-white/10" />

            <div className="relative z-10">
              <div className="flex items-center gap-3">
                <LogoIcon />

                <span className="text-xl font-bold">
                  Mini Kanban Board
                </span>
              </div>

              <div className="mt-20 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-100">
                  Welcome back
                </p>

                <h1 className="mt-4 text-4xl font-bold leading-tight xl:text-5xl">
                  Organize your work.
                  <br />
                  Ship with confidence.
                </h1>

                <p className="mt-6 text-base leading-7 text-blue-100">
                  Manage projects, organize tasks, and keep your
                  team moving with a simple and focused Kanban
                  workspace.
                </p>
              </div>
            </div>

            <div className="relative z-10 space-y-4">
              {[
                "Simple project and task management",
                "Drag-and-drop Kanban workflow",
                "Secure authentication",
              ].map((feature) => (
                <div
                  key={feature}
                  className="flex items-center gap-3 text-sm text-blue-50"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/15">
                    <CheckIcon />
                  </span>

                  {feature}
                </div>
              ))}
            </div>
          </section>

          {/* Login section */}
          <section className="p-6 sm:p-10 lg:p-12 xl:p-14">
            <div className="mx-auto w-full max-w-md">
              {/* Mobile logo */}
              <div className="lg:hidden">
                <div className="flex items-center justify-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
                    <LogoIcon />
                  </div>

                  <span className="text-lg font-bold text-slate-900">
                    Mini Kanban Board
                  </span>
                </div>
              </div>

              <div className="mt-8 text-center lg:mt-0 lg:text-left">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                  Sign in
                </h2>

                <p className="mt-2 text-sm text-slate-600">
                  Welcome back! Please enter your details.
                </p>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Google / GitHub */}
              <div className="mt-8 space-y-3">
                <button
                  type="button"
                  onClick={() =>
                    handleOAuthLogin("google")
                  }
                  disabled={
                    loading || oauthLoading !== null
                  }
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
                    handleOAuthLogin("github")
                  }
                  disabled={
                    loading || oauthLoading !== null
                  }
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
              <div className="my-7 flex items-center gap-4">
                <div className="h-px flex-1 bg-slate-200" />

                <span className="whitespace-nowrap text-xs font-medium uppercase tracking-wider text-slate-400">
                  Or continue with email
                </span>

                <div className="h-px flex-1 bg-slate-200" />
              </div>

              {/* Existing email/password login */}
              <form
                onSubmit={handleSubmit}
                className="space-y-5"
              >
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-medium text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400">
                      <MailIcon />
                    </div>

                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(event) =>
                        setEmail(event.target.value)
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      disabled={
                        loading ||
                        oauthLoading !== null
                      }
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-medium text-slate-700"
                    >
                      Password
                    </label>

                    <button
                      type="button"
                      className="text-xs font-medium text-blue-600 hover:text-blue-700"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 z-10 flex items-center pl-3 text-slate-400">
                      <LockIcon />
                    </div>

                    <Input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(event) =>
                        setPassword(event.target.value)
                      }
                      placeholder="Enter your password"
                      autoComplete="current-password"
                      required
                      disabled={
                        loading ||
                        oauthLoading !== null
                      }
                      className="h-11 pl-10"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={
                    loading || oauthLoading !== null
                  }
                  className="flex h-11 w-full items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign in
                      <ArrowIcon />
                    </>
                  )}
                </Button>
              </form>

              {/* Demo accounts */}
              <div className="mt-7 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Quick demo access
                </p>

                <div className="mt-3 space-y-2">
                  {demoUsers.map((account) => (
                    <button
                      key={account.email}
                      type="button"
                      onClick={() =>
                        fillDemoAccount(account)
                      }
                      disabled={
                        loading ||
                        oauthLoading !== null
                      }
                      className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-left transition hover:border-blue-300 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {account.name}
                        </p>

                        <p className="text-xs text-slate-500">
                          {account.email}
                        </p>
                      </div>

                      <span className="text-xs font-medium text-blue-600">
                        Use
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Register */}
              <p className="mt-7 text-center text-sm text-slate-600">
                Don&apos;t have an account?{" "}
                <Link
                  href="/register"
                  className="font-semibold text-blue-600 hover:text-blue-700"
                >
                  Create an account
                </Link>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}