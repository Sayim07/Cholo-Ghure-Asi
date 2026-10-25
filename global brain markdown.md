# Global Prompt — Generate Project Doc Set for AI Coding Tools

> **How to use:** Copy everything inside the "PROMPT START / PROMPT END" block into Claude (or any strong LLM). Fill in the `[BRACKETED]` fields in Part A. Attach any problem statement, analysis, or notes as context. The output will be 8 grounded `.md` files you can drop into your repo for Antigravity / Cursor / Claude Code / Copilot.

---

## PROMPT START

You are a senior technical product manager and software architect. Your job is to produce a **complete, internally consistent documentation set** that a vibe-coding / AI coding tool will read before writing any code. The primary goal is to **prevent the coding tool from hallucinating**: inventing libraries, endpoints, fields, datasets, or scope that were never agreed on.

### PART A — PROJECT INPUTS (filled in by me)

- **App Name:** [APP_NAME]  (use this exact name everywhere: UI header, browser/tab/window title, README, all docs. No variants, no abbreviations.)
- **One-line description:** [ONE_LINE_DESCRIPTION]
- **Problem statement / context:** [PASTE PROBLEM STATEMENT, ANALYSIS, OR ATTACHED DOCUMENT]
- **Project type:** [web app / mobile app / data+ML pipeline / API service / CLI tool / game / other]
- **Context:** [hackathon / college project / startup MVP / personal project]
- **Time available:** [e.g., 24 hours / 3 days / 2 weeks]
- **Team size and roles:** [e.g., 2 backend, 1 ML, 1 frontend, 1 design]
- **Budget constraint:** [e.g., 100% free tools and free tiers only]
- **Must-have features (if any):** [LIST OR "decide for me"]
- **Hard constraints (if any):** [e.g., must be Python, must work offline, specific data sources, region limits]
- **Judging / success criteria (if any):** [WHAT EVALUATORS OR USERS WILL MEASURE]

### PART B — FILES TO GENERATE

Generate exactly these 8 Markdown files, in this order, each as a separate clearly titled file: `PRD.md`, `TRD.md`, `AppFlow.md`, `Design.md`, `Schema.md`, `ImplementationPlan.md`, `Tracker.md`, `Rules.md`.

**1. PRD.md** (Product Requirements)
- Title uses the App Name, plus a note that the name is mandatory user-facing branding.
- Sections: Problem Statement, Goals (scoped to the time available), Non-Goals (explicit "do NOT build" list), Target Users/Stakeholders, Core Features as a prioritized table (P0/P1/P2), Success Metrics (measurable), Key Risks with mitigation (each pointing to the doc section that handles it), Deliverables Checklist.
- Non-Goals must actively block the most likely scope-creep and misinterpretation traps for this specific project.

**2. TRD.md** (Technical Requirements)
- The single source of truth for technology choices. Open with: "The coding tool must not substitute a library, dataset, or service not listed here without flagging it as an assumption first."
- Tech stack grouped by layer (frontend, backend, data/ML if any, storage, deployment). **Only free or free-tier tools** unless I said otherwise. Name each tool and why it was chosen.
- Where there are two viable options, recommend ONE default and state the decision must be locked on Day 1.
- Data sources / external APIs table: source, access method, cost, auth needed. Only real, existing services.
- Fixed scope parameters (regions, variables, limits) stated as constants that must not change mid-project.
- Performance/scope constraints, including memory/size handling guidance if data is large.
- Performance targets and an API contract pointer to Schema.md.

**3. AppFlow.md** (Application and Data Flow)
- End-to-end data/processing flow as a numbered text diagram (inputs → processing → outputs, with file paths).
- Runtime/serving flow (what happens when a user opens and uses the app).
- Screen-level flow (each screen/page and what it contains).
- Error and edge-case flows that must be handled (missing data, service down, invalid input, empty state).

**4. Design.md** (UI/UX)
- Section 0 "Branding": App Name usage rules (header, tab title with the exact code snippet for the chosen framework, tagline rules, no variants).
- Design intent, layout principles, color system, typography/components, key visual differentiators tied to the project's main value claim, special-feature UI (e.g., explainability, fallback/stress demo), and a "What to avoid" list.
- Must be implementable with the free stack chosen in TRD.md.

**5. Schema.md** (Data, File, and API Contracts)
- Open with: "This is the exact contract every module must follow. If a field is not defined here, do not invent it; add it here first."
- Fixed scope constants, folder/file structure with naming conventions, database tables or file schemas with field names, types, and descriptions, and all API endpoints with exact request/response JSON examples.
- End with: "No other endpoints/fields should be added without updating this section first."

**6. ImplementationPlan.md** (Phased Build Plan)
- Phases sized to the time available (Phase 0 setup through final polish/deploy), each with: owner role, checkbox tasks, and **exit criteria**.
- Where a task uses an external API or library with non-obvious syntax, include a **verified reference code snippet** so the coding tool does not guess the syntax.
- A fallback plan for the riskiest task (slow data, API limits, hard algorithm).
- An **explicit de-scope order** (what to cut first if time runs out) and a **"never cut"** list.

**7. Tracker.md** (Status Board)
- Tables per phase mirroring ImplementationPlan.md: Task | Owner | Status | Notes. Status values: Not Started, In Progress, Blocked, Done.
- Mark the blocking exit-criteria task(s) clearly.
- Include a Blockers Log and a Decisions Log (Date | Decision | Reason | Doc updated?).

**8. Rules.md** (Grounding Rules for the AI Coding Tool)
- Open with: "Read this file before generating any code. If a request conflicts with these rules, flag it instead of silently complying."
- Must include: (1) Source-of-truth hierarchy for resolving doc conflicts (Rules → Schema → TRD → PRD → AppFlow → Design → ImplementationPlan → Tracker); (2) App Naming Rule; (3) Hard Scope Boundaries (specific "do not" list for THIS project); (4) the project's 2-4 non-negotiable technical rules (the things that, if violated, would make the project fail or be rejected, each with a concrete required/forbidden approach); (5) Schema consistency rule (no renaming fields for convenience); (6) Fallback/error-handling rule; (7) Grounded talking points table for likely judge/user questions, with a note to update if implementation changes; (8) Code conventions (language style, typing, docstrings, no hardcoded absolute paths, logging not print, no new database unless logged in Tracker Decisions Log); (9) "When the coding tool is unsure" protocol (state ambiguity, propose the option fitting existing docs, never silently invent); (10) Definition of Done per feature.

### PART C — QUALITY RULES FOR YOUR OUTPUT

1. **Cross-reference precisely.** Every doc must cite the others by file and section (e.g., "see Schema.md §3"). Section numbers you cite must actually exist.
2. **Zero contradictions.** Names, paths, variables, endpoints, and tool choices must be identical across all 8 files.
3. **No invented tools.** Only recommend real, currently existing libraries, services, and datasets. If unsure whether something exists or is free, say "VERIFY" next to it instead of guessing.
4. **Be concrete, not generic.** Prefer exact file paths, field names, constants, and example JSON over vague descriptions. Avoid filler like "ensure scalability" without a specific mechanism.
5. **Scope ruthlessly** to the time available and team size. A smaller scope that fully works beats a large scope that half works.
6. **Anticipate misinterpretation.** Identify the most likely wrong interpretation of this problem (what teams commonly build by mistake) and block it explicitly in PRD Non-Goals and Rules.
7. **Free-first stack.** Everything runs on free tools/tiers; note free-tier limits where they matter.
8. **Use tables and checklists** where they improve clarity; keep prose tight.
9. Do not write application code except short reference snippets in ImplementationPlan.md and the framework title snippet in Design.md.

### PART D — PROCESS

1. First, silently analyze the problem: identify core pain points, the true deliverable, the main technical risk, the most common misinterpretation, and the minimum viable scope.
2. If a critical input in Part A is missing and would change the architecture, ask me **one** concise batch of clarifying questions. Otherwise, state your assumptions in a short list at the top and proceed.
3. Generate all 8 files in the specified order.
4. End with a short **Consistency Check**: confirm that app name, paths, field names, endpoints, and tool choices match across files, and list any assumptions I should verify.

## PROMPT END

---

## Tips for best results

- **Paste real context.** The more concrete your problem statement and constraints, the less generic the docs.
- **Load Rules.md first** in every coding-tool session, then reference the other files as needed.
- **Keep docs live.** When a decision changes, update Schema.md/TRD.md first, log it in Tracker.md's Decisions Log, then change code.
- **Follow-up prompt for edits:** "Update [FILE] section [N] with the following change, and propagate any impacted references to the other docs: [CHANGE]."
- **Verify external syntax.** For any API snippet, check it against official docs before relying on it (Antigravity can still guess wrong on version-specific syntax).
