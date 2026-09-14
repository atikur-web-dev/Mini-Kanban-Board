"use client";

import Link from "next/link";

function LogoIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M8 8h3v3H8z" />
      <path d="M13 8h3v8h-3z" />
      <path d="M8 13h3v3H8z" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="m13 6 6 6-6 6" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m5 12 4 4L19 6" />
    </svg>
  );
}

function BoardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-5xl">
      <div className="absolute -inset-8 rounded-[2.5rem] bg-blue-500/10 blur-3xl" />

      <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_25px_80px_-30px_rgba(15,23,42,0.35)]">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white">
              <LogoIcon />
            </div>

            <div>
              <p className="text-sm font-semibold text-slate-900">
                Product Launch
              </p>

              <p className="text-xs text-slate-500">Project workspace</p>
            </div>
          </div>

          <div className="hidden items-center gap-2 sm:flex">
            <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
              8 tasks
            </span>

            <div className="flex -space-x-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-800 text-[10px] font-semibold text-white">
                AR
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-[10px] font-semibold text-white">
                MK
              </div>

              <div className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-slate-300 text-[10px] font-semibold text-slate-700">
                +
              </div>
            </div>
          </div>
        </div>

        <div className="grid gap-4 bg-slate-50/80 p-4 sm:grid-cols-3 sm:p-5">
          <PreviewColumn
            title="To Do"
            count="3"
            accent="bg-slate-400"
            tasks={[
              {
                title: "Design landing page",
                label: "Design",
                labelClass: "bg-violet-50 text-violet-700",
              },
              {
                title: "Write project copy",
                label: "Content",
                labelClass: "bg-amber-50 text-amber-700",
              },
              {
                title: "Plan sprint tasks",
                label: "Planning",
                labelClass: "bg-slate-100 text-slate-600",
              },
            ]}
          />

          <PreviewColumn
            title="In Progress"
            count="2"
            accent="bg-blue-500"
            tasks={[
              {
                title: "Build authentication",
                label: "Development",
                labelClass: "bg-blue-50 text-blue-700",
              },
              {
                title: "Create dashboard UI",
                label: "Frontend",
                labelClass: "bg-cyan-50 text-cyan-700",
              },
            ]}
          />

          <PreviewColumn
            title="Done"
            count="3"
            accent="bg-emerald-500"
            tasks={[
              {
                title: "Set up database",
                label: "Backend",
                labelClass: "bg-emerald-50 text-emerald-700",
              },
              {
                title: "Create project board",
                label: "Setup",
                labelClass: "bg-indigo-50 text-indigo-700",
              },
              {
                title: "Configure API",
                label: "API",
                labelClass: "bg-sky-50 text-sky-700",
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
}

function PreviewColumn({
  title,
  count,
  accent,
  tasks,
}: {
  title: string;
  count: string;
  accent: string;
  tasks: {
    title: string;
    label: string;
    labelClass: string;
  }[];
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-100/70 p-3">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${accent}`} />

          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-700">
            {title}
          </h3>
        </div>

        <span className="text-xs font-medium text-slate-400">{count}</span>
      </div>

      <div className="space-y-2.5">
        {tasks.map((task) => (
          <div
            key={task.title}
            className="rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
          >
            <p className="mb-2 text-sm font-medium leading-5 text-slate-800">
              {task.title}
            </p>

            <span
              className={`inline-flex rounded-md px-2 py-1 text-[10px] font-medium ${task.labelClass}`}
            >
              {task.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

const features = [
  {
    title: "Multiple Boards",
    description:
      "Create separate boards for different projects, teams, or workflows and keep everything organized in one place.",
  },
  {
    title: "Drag & Drop",
    description:
      "Move and reorder tasks naturally across workflow columns with smooth drag-and-drop interactions.",
  },
  {
    title: "Team Collaboration",
    description:
      "Share boards with registered users and manage workspace access from a centralized board.",
  },
  {
    title: "Custom Workflow",
    description:
      "Create, rename, and remove columns to shape each board around the way your team works.",
  },
  {
    title: "Task Management",
    description:
      "Create detailed tasks, update their information, move them between stages, and remove completed work.",
  },
  {
    title: "Secure Workspace",
    description:
      "Protected authentication and guarded resources keep your boards and workspace actions restricted to authorized users.",
  },
];

export default function LandingPage() {
  return (
    <main className="min-h-screen overflow-hidden bg-white text-slate-900">
      <section
        className="relative bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://www.capdata.co.uk/assets/about-1-e6167468.png')",
        }}
      >
        <div className="absolute inset-0 bg-white/80" />

        <div className="absolute inset-0 bg-linear-to-b from-white/90 via-white/70 to-white/95" />

        <div className="relative">
          <div className="mx-auto max-w-7xl px-5 pb-16 pt-8 sm:px-8 sm:pt-10 lg:px-10 lg:pb-24">
            <div className="flex items-center justify-center">
              <Link
                href="/"
                className="inline-flex items-center gap-2.5 text-sm font-semibold tracking-tight text-slate-900"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
                  <LogoIcon />
                </span>

                <span className="text-base">Mini Kanban Board</span>
              </Link>
            </div>

            <div className="mx-auto max-w-4xl pt-16 text-center sm:pt-20">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/90 px-3.5 py-1.5 text-xs font-medium text-blue-700 backdrop-blur-sm">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Simple workflow management
              </div>

              <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Organize your work.
                <span className="block text-blue-600">
                  Move projects forward.
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
                Plan tasks, manage workflows, and collaborate on projects with a
                clean Kanban workspace built to keep your work moving.
              </p>

              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 sm:w-auto"
                >
                  Get Started
                  <ArrowRightIcon />
                </Link>

                <Link
                  href="/login"
                  className="inline-flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white/90 px-6 py-3 text-sm font-semibold text-slate-700 backdrop-blur-sm transition hover:border-slate-300 hover:bg-white sm:w-auto"
                >
                  Sign In
                </Link>
              </div>
            </div>

            <div className="mt-14 sm:mt-16 lg:mt-20">
              <BoardPreview />
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/70">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20 lg:px-10">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-semibold text-blue-600">
              Everything you need
            </p>

            <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              A focused workspace for getting things done
            </h2>

            <p className="mt-4 text-sm leading-6 text-slate-600 sm:text-base">
              Keep projects structured, tasks visible, and collaboration
              straightforward without unnecessary complexity.
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="mb-4 flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <CheckIcon />
                </div>

                <h3 className="text-base font-semibold text-slate-900">
                  {feature.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-blue-600" />

        <div className="absolute -right-24 -top-32 h-72 w-72 rounded-full bg-white/10 blur-2xl" />

        <div className="absolute -bottom-40 -left-24 h-80 w-80 rounded-full bg-blue-400/20 blur-3xl" />

        <div className="mx-auto max-w-4xl px-5 py-16 text-center sm:px-8 sm:py-20">
          <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Ready to organize your workflow?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-6 text-blue-100 sm:text-base">
            Create your first board and bring projects, tasks, and collaboration
            into one focused workspace.
          </p>

          <Link
            href="/register"
            className="mt-7 inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-50"
          >
            Create Your Board
            <ArrowRightIcon />
          </Link>
        </div>
      </section>

      <footer className="bg-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-5 py-6 text-center sm:flex-row sm:px-8 sm:text-left lg:px-10">
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-blue-600 text-white">
              <LogoIcon />
            </span>
            Mini Kanban Board
          </div>

          <p className="text-xs text-slate-500">Plan. Organize. Collaborate.</p>
        </div>
      </footer>
    </main>
  );
}
