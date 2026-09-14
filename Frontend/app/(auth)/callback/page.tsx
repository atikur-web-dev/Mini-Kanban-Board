
"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { authApi } from "@/lib/api";
import { api } from "@/lib/api/client";

function OAuthCallbackContent() {
  const router = useRouter();

  const searchParams = useSearchParams();

  const code = searchParams.get("code");

  const provider = searchParams.get("provider");

  const [error, setError] = useState<string | null>(null);

  const isValidProvider =
    provider === "google" || provider === "github";

  const isValidCallback = !!code && isValidProvider;

  useEffect(() => {
    if (!isValidCallback || !code) {
      return;
    }

    let cancelled = false;

    const exchangeCode = async () => {
      try {
        const response =
          provider === "google"
            ? await authApi.exchangeGoogleCode(code)
            : await authApi.exchangeGitHubCode(code);

        if (cancelled) {
          return;
        }

        const { user, token } = response;

        api.setToken(token);

        localStorage.setItem(
          "user",
          JSON.stringify(user),
        );

        window.dispatchEvent(
          new Event("auth-storage"),
        );

        router.replace("/dashboard");
      } catch (err) {
        if (cancelled) {
          return;
        }

        setError(
          err instanceof Error
            ? err.message
            : "OAuth login failed. Please try again.",
        );
      }
    };

    exchangeCode();

    return () => {
      cancelled = true;
    };
  }, [code, provider, isValidCallback, router]);

  if (!isValidCallback) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="text-xl font-semibold text-slate-900">
            Invalid OAuth Callback
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            The authentication callback is missing
            required information.
          </p>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
            !
          </div>

          <h1 className="text-xl font-semibold text-slate-900">
            Authentication Failed
          </h1>

          <p className="mt-2 text-sm text-slate-600">
            {error}
          </p>

          <button
            type="button"
            onClick={() => router.replace("/login")}
            className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            Back to Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <h1 className="text-xl font-semibold text-slate-900">
          Signing you in...
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </main>
  );
}

function OAuthCallbackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-5 h-10 w-10 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600" />

        <h1 className="text-xl font-semibold text-slate-900">
          Signing you in...
        </h1>

        <p className="mt-2 text-sm text-slate-600">
          Please wait while we complete your authentication.
        </p>
      </div>
    </main>
  );
}

export default function OAuthCallbackPage() {
  return (
    <Suspense fallback={<OAuthCallbackFallback />}>
      <OAuthCallbackContent />
    </Suspense>
  );
}
