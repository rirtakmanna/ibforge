// Layer B — User-owned. Do not restructure. Edit values only.
//
// Schema version: 1.0 — matches ATLAS_Claude_Project_Setup_v4_5.md and CONFLICT_SOLUTIONS.md Stage 3 output.
//
// linkedInSchedule entries use a two-field shape: { day: number, content: string }
// The five-field shape (postNumber, type, title) is derived at runtime by
// preparePostsForSchedule() — it is NOT stored here. Do not add those fields.
//
// acceptedFileTypes values must always include a leading dot: ".xlsx" not "xlsx".
// pattern field on learn/watch entries: "A" (standalone) | "B" (continuous case study).
// learnChain field on learn/watch entries: string (chain name) | null (Pattern A).
//
// Step ID format: M{module}-S{step} — e.g. M1-S01, M14-S145.
// The P{phase}-S{step} format was incorrect and has been corrected in BRAND and SETUP
// (Stage 3 rewrites). M-prefix is canonical. All new entries must follow M{N}-S{NNN} format.
//
// "phase" field = curriculum Module number (1–14). This is not a BuildPhase (web-app
// construction stage) and not an IBProjectPhase (AI_Template execution stage).
// See setup file glossary for full disambiguation.
//
// companyId format: {company-slug}-m{module} — e.g. "infosys-m1", "gyg-m3", "all-m14".
// Every companyId must have a matching entry in companiesData.js.
// Valid company slugs: infosys, hdfc, sunpharma, zalando, gyg, itc, zomato, lt, vw, genting, all.
// The "all" slug is reserved for the M14 portfolio step only.
//
// "locked" field: true = step is locked until prerequisites are complete.
// M1-S01 is the only entry seeded as locked: false — it is the entry-point step,
// always accessible without prerequisites. All other steps unlock via user progress
// logic in the app. Do not change M1-S01's locked value. Do not seed new entries
// as locked: false unless they are explicitly designated as no-prerequisite entry points.
//
// All company-step entries must include linkedInSchedule. Use [] for steps with no posts.
// Never omit the field — the Calendar population logic expects the field to always exist.
//
// courseUrl: pending population by operator. Will contain the direct URL to the
// course lesson on Udemy/YouTube when added. Format: full https:// URL string.
// Placeholder for unpopulated courseUrl is always "" (empty string). Never use null,
// undefined, or omit the field.
// Field exists only on learn and watch entries — not on company-step entries.
//
// topic field: the learning objective for the step. Rendered in full on StepDetail
// page only. Not rendered on roadmap list cards (title only shown there).
// No character limit enforced — write for clarity, not brevity.
//
// type field valid values: "learn" | "watch" | "company-step"
// learn: structured lesson from a course.
// watch: live-build or demonstration video — observe, do not build along.
// company-step: apply + build deliverable for a real company.
//
// phase field: curriculum module number, 1–14. Corresponds to the 14 modules
// defined in ATLAS_Roadmap.md. Must match the module comment headers in this file
// (e.g. // ─── MODULE 1 — ACCOUNTING FOUNDATION ───).
//
// learnBeforeValuation field on learn/watch entries: list of concepts the user must
// understand BEFORE building. Phrasing should be conceptual ("Why DCF fails for banks")
// not procedural ("Calculate X"). Data quality checks and reconciliation requirements
// belong in additionalRequirements or build.qualityBar — not here.
// learnBeforeValuation field on company-step entries: array of step ID strings
// (e.g. ["M1-S01", "M1-S02"]). These IDs are used by the prerequisite-gate UI to
// determine unlock eligibility — they are NOT freetext. The phrasing guidance above
// applies only to learn/watch entries.
export const roadmapData = [
  // ─── MODULE 1 — ACCOUNTING FOUNDATION (S01–S19, 19 steps: 15 learn + 4 company-step) ───
  {
    id: "M1-S01",
    type: "learn",
    phase: 1,
    courseName: "Accounting & Financial Statement Analysis: Complete Training",
    title: "The Three Main Statements in Financial Accounting",
    courseUrl:
      "https://www.udemy.com/course/accounting-fsa-a-solid-foundation-for-a-career-in-finance/learn/lecture/3806532#overview",
    topic:
      "Identify every line item on a P&L, balance sheet, and cash flow statement and state what it represents operationally.",
    pattern: "A",
    learnChain: null,
    locked: false,
  },
  {
    id: "M1-S02",
    type: "learn",
    phase: 1,
    courseName: "Accounting & Financial Statement Analysis: Complete Training",
    title:
      "A COMPLETE Case Study: Bookkeeping Records + Income Statement + Balance Sheet",
    courseUrl:
      "https://www.udemy.com/course/accounting-fsa-a-solid-foundation-for-a-career-in-finance/learn/lecture/3806878#overview",
    topic:
      "Reconstruct a P&L and balance sheet from raw bookkeeping entries, confirming the accounting equation holds at every step.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S03",
    type: "learn",
    phase: 1,
    courseName: "Accounting & Financial Statement Analysis: Complete Training",
    title: "Preparing a Cash Flow Statement: Understanding Cash Flow Analysis",
    courseUrl:
      "https://www.udemy.com/course/accounting-fsa-a-solid-foundation-for-a-career-in-finance/learn/lecture/3806888#overview",
    topic:
      "Build a cash flow statement from scratch using both the direct and indirect methods, and explain why the two methods converge to the same operating cash figure.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S04",
    type: "learn",
    phase: 1,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "FSA - Income Statement",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46524705#overview",
    topic:
      "Download a real company's income statement (Colgate walkthrough), identify and strip non-recurring charges with footnote references, and produce normalised EBIT and EBITDA.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S05",
    type: "learn",
    phase: 1,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Income Tax - Understanding Income Tax Concepts",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46534117#overview",
    topic:
      "Identify deferred tax assets and liabilities on a balance sheet, state whether they arise from temporary or permanent differences, and explain how DTL/DTA affects effective tax rate modelling.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S06",
    type: "learn",
    phase: 1,
    courseName: "The Corporate Finance Course",
    title: "Working Capital Management",
    courseUrl:
      "https://www.udemy.com/course/the-corporate-finance-course/learn/lecture/17876724#overview",
    topic:
      "Apply liquidity management, asset management ratios, payables turnover, and operating/cash conversion cycle analysis to detect receivables aging, inventory build-up, and payables stretching anomalies.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S07",
    type: "learn",
    phase: 1,
    courseName: "Accounting & Financial Statement Analysis: Complete Training",
    title: "Financial Statement Analysis: Science and Practice",
    courseUrl:
      "https://www.udemy.com/course/accounting-fsa-a-solid-foundation-for-a-career-in-finance/learn/lecture/3837416#overview",
    topic:
      "Apply the four key dimensions of FSA, calculate subtotals and year-on-year growth, perform horizontal and vertical analysis, learn the Days methodology for working capital trends, and use financial ratios in practice with the P&G exercise.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S08",
    type: "learn",
    phase: 1,
    courseName: "Accounting & Financial Statement Analysis: Complete Training",
    title: "Financial Statement Analysis - Tesla Exercise",
    courseUrl:
      "https://www.udemy.com/course/accounting-fsa-a-solid-foundation-for-a-career-in-finance/learn/lecture/12511968#overview",
    topic:
      "Calculate growth, profitability, liquidity, and solvency ratios on Tesla's historical financials and interpret what trend divergence signals operationally.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S09",
    type: "learn",
    phase: 1,
    courseName: "Consolidated Financial Statement Under IFRS",
    title: "Understanding the Process of Consolidation",
    courseUrl:
      "https://www.udemy.com/course/consolidated-financial-statements-ifrs/learn/lecture/29309826#overview",
    topic:
      "Calculate goodwill under both fair value and proportionate NCI methods, account for intra-group trading eliminations, handle PUP, and produce a consolidated balance sheet from parent and subsidiary financials.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S10",
    type: "learn",
    phase: 1,
    courseName: "IFRS 16 Leases - Beginner to Advance",
    title: "Lease identification",
    courseUrl:
      "https://www.udemy.com/course/ifrs-16-beginner-to-advance/learn/lecture/21252330#overview",
    topic:
      "Identify whether a contract contains a lease under IFRS 16: define the underlying asset, evaluate right-of-use, assess substitution rights, and determine lease term.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S11",
    type: "learn",
    phase: 1,
    courseName: "IFRS 16 Leases - Beginner to Advance",
    title: "Lessee accounting",
    courseUrl:
      "https://www.udemy.com/course/ifrs-16-beginner-to-advance/learn/lecture/21252454#overview",
    topic:
      "Calculate the right-of-use asset and lease liability on initial recognition, apply the correct discount rate, account for variable lease payments and guaranteed residual value, and build a complete lease liability amortisation schedule.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S12",
    type: "learn",
    phase: 1,
    courseName: "IFRS 16 Leases - Beginner to Advance",
    title: "Special topics",
    courseUrl:
      "https://www.udemy.com/course/ifrs-16-beginner-to-advance/learn/lecture/21308668#overview",
    topic:
      "Account for lease modifications, apply COVID rent concessions practical expedient, handle subleases, and explain sale-and-leaseback gain/loss recognition under IFRS 16.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S13",
    type: "learn",
    phase: 1,
    courseName: "Financial Modeling for Startups & Small Businesses",
    title: "Jumpstart",
    courseUrl:
      "https://www.udemy.com/course/financial-modeling-for-startups-small-businesses/learn/lecture/12904304#overview",
    topic:
      "Apply unit economics to the lemonade stand case: calculate per-unit cost, labour cost and selling price, build a single-product/single-location model, and layer in product premiums and multiple locations.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S14",
    type: "learn",
    phase: 1,
    courseName: "Financial Modeling for Startups & Small Businesses",
    title: "Modeling revenue",
    courseUrl:
      "https://www.udemy.com/course/financial-modeling-for-startups-small-businesses/learn/lecture/6784328#overview",
    topic:
      "Decompose revenue into per-customer drivers across business model archetypes: free/ad-based, affiliate, freemium, subscription, pay-per-use, tiered pricing, and base-plus-features pricing.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S15",
    type: "learn",
    phase: 1,
    courseName: "Financial Modeling for Startups & Small Businesses",
    title: "Modeling startup costs & expenses",
    courseUrl:
      "https://www.udemy.com/course/financial-modeling-for-startups-small-businesses/learn/lecture/6764280#overview",
    topic:
      "Calculate startup costs and operating expenses: headcount and labour, rent and office needs, hosting expenses, contingency. Identify the fixed cost base that must be covered before break-even.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M1-S16",
    type: "company-step",
    phase: 1,
    title: "Infosys — Accounting Workbook",
    companyId: "infosys-m1",
    locked: true,
    apply: {
      focusDo:
        "Three-statement extraction + non-recurring normalisation + working capital ratios + IND-AS 116 lease capitalisation",
      focusIgnore:
        "Driver-based revenue (headcount × utilisation × billing rate) — held for M6 where this workbook is reopened",
      learnBeforeValuation: [
        "Three-statement structure under IND-AS",
        "Non-recurring charge identification from footnotes",
        "DSO, DIO, DPO, CCC calculation mechanics",
        "IND-AS 116 lease capitalisation impact on EBITDA and net debt",
      ],
      valuationMethods: [],
      financialModels: [
        "Restated income statement, balance sheet, cash flow statement (3 years)",
        "Non-recurring items schedule with footnote citations",
        "Working capital ratios table (DSO/DIO/DPO/CCC) with year-on-year commentary",
        "Lease capitalisation schedule (ROU asset, lease liability, EBITDA/net debt adjustment)",
      ],
      additionalRequirements:
        "Source all numbers from FY24 and FY25 annual reports only. Non-recurring items must cite the specific footnote and page number from the AR. Working capital days must be calculated from AR line items directly, not sourced from data terminals or Screener. Lease liability must equal the present value of future lease payments at the incremental borrowing rate. This workbook will be reopened in M6.",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "Infosys Accounting Workbook — a single Excel file containing: (1) three restated financial statements for 3 years; (2) non-recurring items schedule with footnote citations; (3) working capital ratios table (DSO, DIO, DPO, CCC) with year-on-year commentary; (4) lease capitalisation schedule showing ROU asset, lease liability, and the EBITDA/net debt adjustment. Persists into M6.",
      skillDemonstrated:
        "Financial Statement Literacy; Non-Recurring Item Identification & Normalisation; Working Capital Anomaly Detection; Lease Accounting — IND-AS 116 / IFRS 16",
      qualityBar:
        "Balance sheet balances for each restated year. Normalised EBIT excludes all non-recurring items with explicit footnote references. Working capital days calculated from AR — not sourced from data aggregators. Lease liability equals present value of future lease payments at incremental borrowing rate.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },
  {
    id: "M1-S17",
    type: "company-step",
    phase: 1,
    title: "HDFC Bank — FSA Extraction Workbook",
    companyId: "hdfc-m1",
    locked: true,
    apply: {
      focusDo:
        "Bank-specific FSA — loan book composition, yield on advances, cost of deposits, NIM reconciliation, GNPA/NNPA/PCR actuals from AR",
      focusIgnore:
        "DDM construction (held for M7) and credit memo work (held for M12). At M1 stage, extract actuals only.",
      learnBeforeValuation: [
        "How a bank P&L differs from a non-financial company (NII first, not Revenue)",
        "Loan book breakdown by type (retail, corporate, SME, rural)",
        "Yield on advances and cost of deposits — definition and calculation",
        "GNPA / NNPA / PCR definitions and reconciliation",
        "Why DCF will not work for a bank (preview — full answer in M7)",
      ],
      valuationMethods: [],
      financialModels: [
        "Bank P&L extraction (NII, other income, opex, provisions, PAT) — 3 years",
        "Loan book composition table (by segment) — 3 years",
        "Yield on advances and cost of deposits calculation — 3 years",
        "NIM reconciliation: (Interest Income − Interest Expense) / Average Interest-Earning Assets",
        "GNPA / NNPA / PCR table — 3 years from RBI Pillar 3 disclosure",
      ],
      additionalRequirements:
        "Loan book × yield on advances must reconcile to reported interest income within 5%. GNPA actuals must be sourced from the AR or Pillar 3, not assumed. NIM must be calculated from disclosed yields. CASA ratio must be sourced from the AR liability disclosure. This workbook is the input for M7 and M12.",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "HDFC Bank FSA Extraction Workbook — a single Excel file containing: (1) bank P&L extraction from the AR for 3 years; (2) loan book composition by segment; (3) yield on advances and cost of deposits calculation; (4) NIM reconciliation; (5) GNPA/NNPA/PCR table from RBI Pillar 3 disclosure. Persists into M7 and M12.",
      skillDemonstrated:
        "Financial Statement Literacy; Bank-Specific Accounting — NIM, NPA, PCR; Loan Book Decomposition",
      qualityBar:
        "Loan book × yield on advances reconciles to reported interest income within 5%. GNPA actuals from AR / Pillar 3 — not assumed. NIM calculated from disclosed yields. CASA ratio sourced from AR liability disclosure.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },
  {
    id: "M1-S18",
    type: "company-step",
    phase: 1,
    title: "Sun Pharmaceuticals — Accounting Workbook",
    companyId: "sunpharma-m1",
    locked: true,
    apply: {
      focusDo:
        "Three-statement basics + revenue by geography (US generics / India branded / EM / RoW) + R&D capitalisation policy + inventory composition",
      focusIgnore:
        "Pipeline rNPV, USFDA regulatory risk quantification, and pipeline probability-weighting — all held for M10",
      learnBeforeValuation: [
        "Pharma three-statement structure under IND-AS",
        "Geography revenue disclosure under IND-AS segment reporting",
        "R&D capitalisation policy (capitalised vs expensed)",
        "Inventory composition (raw materials / WIP / finished)",
      ],
      valuationMethods: [],
      financialModels: [
        "Restated income statement, balance sheet, cash flow statement (3 years)",
        "Geography revenue split table (US / India / EM / RoW) — 3 years",
        "R&D capitalisation note: capitalised vs expensed, with policy citation",
        "Inventory composition table (raw / WIP / finished) — 3 years",
      ],
      additionalRequirements:
        "Geography revenue must reconcile to consolidated revenue within rounding. R&D treatment must be documented with the policy excerpt cited from the AR. US generics revenue must be isolated for M10's erosion model — do not blend it with specialty US revenue. This workbook is the input for M10's full pipeline rNPV build.",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "Sun Pharma Accounting Workbook — a single Excel file containing: (1) three restated financial statements for 3 years; (2) geography revenue split table; (3) R&D capitalisation note with policy citation; (4) inventory composition table. Persists into M10.",
      skillDemonstrated:
        "Financial Statement Literacy; Non-Recurring Item Identification & Normalisation; Revenue Recognition — Geography Decomposition; Working Capital Anomaly Detection",
      qualityBar:
        "Geography revenue reconciles to consolidated revenue. R&D treatment documented with policy citation. US generics isolated from specialty US.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },
  {
    id: "M1-S19",
    type: "company-step",
    phase: 1,
    title: "Zalando — Accounting Workbook",
    companyId: "zalando-m1",
    locked: true,
    apply: {
      focusDo:
        "IFRS three-statement extraction + GMV vs net revenue distinction + return rate disclosure + own-inventory vs marketplace presentation under IFRS 15",
      focusIgnore:
        "Pitchbook construction, valuation summary, and football field charts — all held for M13",
      learnBeforeValuation: [
        "IFRS three-statement structure",
        "Marketplace revenue recognition under IFRS 15 (own inventory vs partner / agent vs principal)",
        "GMV vs net revenue distinction",
        "Return rate impact on revenue recognition",
      ],
      valuationMethods: [],
      financialModels: [
        "Restated income statement, balance sheet, cash flow statement (3 years, IFRS)",
        "GMV-to-revenue bridge: GMV → take rate split (own inventory vs partner) → net revenue",
        "Return rate disclosure table — 3 years",
        "Own-inventory revenue vs marketplace revenue separation — 3 years per IFRS 15",
      ],
      additionalRequirements:
        "Net revenue must reconcile from GMV via take rate. Return rate sourced from AR — not market estimates. Own-inventory revenue separated from marketplace revenue with IFRS 15 note citation. This workbook is the input for M13's full pitchbook build.",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "Zalando Accounting Workbook — a single Excel file containing: (1) three restated financial statements for 3 years; (2) GMV-to-revenue bridge; (3) return rate disclosure table; (4) own-inventory vs marketplace revenue separation per IFRS 15. Persists into M13.",
      skillDemonstrated:
        "Financial Statement Literacy; Revenue Recognition — IFRS 15 Marketplace vs Own Inventory; Working Capital Anomaly Detection; Non-Recurring Item Identification & Normalisation",
      qualityBar:
        "Net revenue reconciles from GMV via take rate. Return rate from AR. Own-inventory and marketplace revenue separated per IFRS 15 with note citation.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 2 — 3-STATEMENT INTEGRATED MODEL (S20–S24, 5 steps: 3 learn + 1 watch + 1 company-step) ───
  {
    id: "M2-S20",
    type: "learn",
    phase: 2,
    courseName: "The Complete Investment Banking Course 2026",
    title: "Financial Modeling Fundamentals",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/6105042#overview",
    topic:
      "Articulate the architecture of a complete financial model, apply best modelling practices (input/output separation, colour-coding), understand the right level of detail for a 5–10 year model, and forecast P&L and balance sheet items.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M2-S21",
    type: "learn",
    phase: 2,
    courseName: "The Complete Investment Banking Course 2026",
    title: "DCF valuation - Forecasting of key P&L items",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827298#overview",
    topic:
      "Forecast top line, other revenues and COGS, operating expenses and D&A, interest expenses, extraordinary items and taxes — building a flexible P&L forecast in Excel.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 2 of 8",
  },
  {
    id: "M2-S22",
    type: "learn",
    phase: 2,
    courseName: "The Complete Investment Banking Course 2026",
    title: "DCF Valuation - Forecasting key Balance Sheet items",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827312#overview",
    topic:
      "Apply the Days methodology to project balance sheet items. Calculate Days. Use Days to project working capital line items. Forecast PPE, Other Assets, Other Liabilities.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 3 of 8",
  },
  {
    id: "M2-S23",
    type: "watch",
    phase: 2,
    courseName: "The Complete Investment Banking Course 2026",
    title: "Tesla valuation - Complete DCF exercise",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/12511260#overview",
    topic:
      "Watch the complete Tesla integrated model build: drivers sheet as single source of truth, deliveries × ASP for revenue, segment-level gross profit, fixed asset roll-forward, DSO/DIO/DPO, working capital, UFCF, financing needs, balance sheet closing, WACC, DCF, EV-to-equity bridge.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M2-S24",
    type: "company-step",
    phase: 2,
    title: "Guzman y Gomez — 3-Statement Integrated Model",
    companyId: "gyg-m2",
    locked: true,
    apply: {
      focusDo:
        "Drivers sheet architecture + AUV-based store rollout + working capital from AR + PPE roll-forward + balanced 3-statement model",
      focusIgnore:
        "DCF and valuation work — held for M3 (gyg-m3) where this model is reopened",
      learnBeforeValuation: [
        "Company-owned vs franchise store economics",
        "AUV (average unit volume) as the core revenue driver",
        "Royalty fee structure (% of net sales)",
        "Food cost % and labour intensity in QSR",
        "Days methodology for working capital projection",
        "PPE roll-forward mechanics",
      ],
      valuationMethods: [],
      financialModels: [
        "Drivers sheet with 8 operating assumptions (store count by type, AUV growth, royalty rate, food cost %, labour %, capex per new store, D&A as % of opening PPE, working capital days)",
        "Revenue build: store count × AUV per segment (company-owned vs franchise), with royalty revenue as separate stream",
        "Working capital schedule using Days methodology (DSO, DIO, DPO from AR)",
        "PPE roll-forward (opening + capex − depreciation = closing)",
        "3-statement integrated model (3 forecast years) — balanced",
      ],
      additionalRequirements:
        "Revenue must derive from store count × AUV — not % growth. Royalty income modelled as separate line from company-owned revenue. DSO/DIO/DPO calculated from AR actuals — not estimated. Balance sheet closes for all 3 forecast years with zero plug cells. This file persists into M3.",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "GYG 3-Statement Integrated Model — a single Excel file containing: (1) Drivers sheet with 8 operating assumptions; (2) revenue build (store count × AUV per segment with royalty revenue separate); (3) P&L forecast for 3 years; (4) working capital schedule using Days methodology; (5) PPE roll-forward; (6) cash flow statement (indirect); (7) balance sheet that closes for all forecast years. Persists into M3.",
      skillDemonstrated:
        "3-Statement Integrated Model; Driver-Based Revenue Model; Working Capital Schedule (Days-Based); PPE Roll-Forward & Depreciation Schedule",
      qualityBar:
        "Balance sheet closes for all 3 forecast years without a plug cell. Revenue derived from store count × AUV. DSO/DIO/DPO from GYG AR. PPE closing reconciles.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 3 — DCF VALUATION (S25–S36, 12 steps: 9 learn + 1 watch + 1 company-step) ───
  {
    id: "M3-S25",
    type: "learn",
    phase: 3,
    courseName: "The Complete Investment Banking Course 2026",
    title: "DCF Valuation - Introduction",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827302#overview",
    topic:
      "Walk through the stages of a complete DCF valuation. Set up the structure of the DCF model in Excel. Introduction to the Cheeseco case study used throughout the course.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 1 of 8",
  },
  {
    id: "M3-S26",
    type: "learn",
    phase: 3,
    courseName: "Company Valuation Masterclass Complete Guide",
    title:
      "Calculating the Discount Rate using the CAPM and WACC (Intrinsic Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26285502#overview",
    topic:
      "Understand CAPM and the WACC formula. Run an Excel WACC calculation exercise. Apply WACC as the discount rate in a DCF model. Foundation for calculating the cost of capital used in M3's DCF.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M3-S27",
    type: "learn",
    phase: 3,
    courseName: "Company Valuation Masterclass Complete Guide",
    title:
      "Understanding Free Cash Flow in DCF Valuations (Intrinsic Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26250488#overview",
    topic:
      "Explain free cash flow conceptually. Distinguish maintenance capex from growth capex. Identify the drivers of business valuation. Calculate Unlevered Cash Flow.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M3-S28",
    type: "learn",
    phase: 3,
    courseName: "The Complete Investment Banking Course 2026",
    title: "DCF valuation - Creating clean output sheets",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827322#overview",
    topic:
      "Create clean, client-ready output sheets in Excel. Populate the P&L sheet and balance sheet from the model inputs. Apply Excel best practices for financial model presentation.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 4 of 8",
  },
  {
    id: "M3-S29",
    type: "learn",
    phase: 3,
    courseName: "The Complete Investment Banking Course 2026",
    title: "DCF valuation - Calculating unlevered cash flows and Net cash flow",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827330#overview",
    topic:
      "Calculate unlevered free cash flows (UFCF). Reconcile UFCF to net cash flow. Arrive at actual net cash flow figures and perform a check with cash.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 5 of 8",
  },
  {
    id: "M3-S30",
    type: "learn",
    phase: 3,
    courseName: "The Complete Investment Banking Course 2026",
    title:
      "DCF valuation - Calculating present value of cash flows in the forecast period",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827340#overview",
    topic:
      "Apply the Weighted Average Cost of Capital and perpetuity growth rate. Find the present value of future cash flows in the forecast period.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 6 of 8",
  },
  {
    id: "M3-S31",
    type: "learn",
    phase: 3,
    courseName: "The Complete Investment Banking Course 2026",
    title:
      "DCF valuation - Calculating Continuing value, Enterprise value and Equity value",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827344#overview",
    topic:
      "Calculate Continuing Value (terminal value) and Enterprise Value. Bridge to Equity Value. Understand the two-stage DCF structure and the mechanics of terminal value calculation.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 7 of 8",
  },
  {
    id: "M3-S32",
    type: "learn",
    phase: 3,
    courseName: "The Complete Investment Banking Course 2026",
    title:
      "DCF Valuation - Additional analyses accompanying the Financial Model",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827348#overview",
    topic:
      "Run sensitivity analysis for WACC and perpetuity growth rate. Apply Goal Seek for reverse DCF. Recap the financial model with charts and hypothesis testing.",
    locked: true,
    pattern: "B",
    learnChain: "Cheeseco DCF Build",
    partOf: "Cheeseco DCF Build — Part 8 of 8",
  },
  {
    id: "M3-S33",
    type: "learn",
    phase: 3,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "The Dividend Discount Model (Bank Re-watch)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26367720#overview",
    topic:
      "Introduction to the Dividend Discount Model. Apply the Gordon Growth Model. Build single-period and multi-period DDMs. Foundation that will be applied to HDFC Bank in M7.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M3-S34",
    type: "learn",
    phase: 3,
    courseName: "YouTube — Damodaran",
    title: "Free Cash Flow: Back to Basics",
    courseUrl: "https://youtu.be/9GnwzjV9qS0?si=F50T2LMUorEvQKmW",
    topic:
      "Distinguish maintenance capex (required to sustain current capacity) from growth capex (expands capacity). Understand why only maintenance capex should be used in the terminal year of a DCF.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M3-S35",
    type: "watch",
    phase: 3,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Equity Research & Financial Modeling - Tesla Inc.",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46535889#overview",
    topic:
      "Watch the complete Tesla equity research model: revenue projection, cost of sales, working capital, CAPEX & depreciation schedules, balance sheet linkages, FCFF calculation, WACC, terminal value, target share price, and sensitivity analysis. A second-analyst perspective on Tesla, focused on the valuation mechanics.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M3-S36",
    type: "company-step",
    phase: 3,
    title: "Guzman y Gomez — DCF Valuation Model",
    companyId: "gyg-m3",
    locked: true,
    apply: {
      focusDo:
        "WACC construction from market inputs + FCFF bridge mechanics + terminal value sanity checks + reverse DCF — built on top of the M2 3-statement model",
      focusIgnore:
        "Comps work — held for M4 in a different company (ITC). Deep terminal value sensitivity until DCF is built.",
      learnBeforeValuation: [
        "Australian risk-free rate (10-year government bond yield)",
        "Beta: unlever from QSR comps and re-lever to GYG capital structure",
        "Equity risk premium (use 5.5% for Australia)",
        "After-tax cost of debt from AR interest expense and average debt balance",
        "FCFF bridge: EBIT × (1−t) + D&A − capex − ΔNWC",
      ],
      valuationMethods: [
        "DCF (FCFF) — primary",
        "Reverse DCF — implied long-run growth rate at current share price",
      ],
      financialModels: [
        "WACC calculation sheet with sourced inputs (risk-free rate, beta, ERP, cost of debt, capital structure)",
        "FCFF bridge (EBIT → FCFF) reconciled both ways",
        "Discount factor and PV of forecast cash flows",
        "Terminal value: Gordon Growth Model and EV/EBITDA exit multiple (show both)",
        "Enterprise value and equity value bridge",
        "Two sensitivity tables (WACC × growth; WACC × exit multiple)",
        "Reverse DCF tab",
      ],
      additionalRequirements:
        "Beta must be derived from unlevering QSR peer betas and re-levering to GYG's D/E — not taken raw from a data terminal. Risk-free rate must be the current 10-year Australian government bond yield — sourced and dated. FCFF from EBIT route and NOPAT + D&A − capex − ΔNWC route must produce the same number. Terminal value from Gordon Growth and exit multiple must be within 15% of each other; if wider, written explanation in commentary cell.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Personal Coverage Post — 'Why I studied a $3B Australian QSR to prep for India IB'. GYG's franchise model as a live comp for Jubilant FoodWorks + Devyani.",
        },
        {
          day: 5,
          content:
            "📊 Model Drop — Store rollout + AUV revenue model screenshot. How the same logic applies to India QSR analysis.",
        },
        {
          day: 10,
          content:
            "🎤 Pitch Post — Tear sheet + comp table vs Jubilant. BUY/SELL/NEUTRAL: US expansion — bull case or value destroyer?",
        },
      ],
    },
    build: {
      deliverable:
        "GYG DCF Valuation Model — built on top of M2's 3-statement model: WACC sheet with sourced inputs, FCFF bridge reconciled both ways, PV of forecast cash flows, terminal value (Gordon Growth + EV/EBITDA exit multiple), enterprise-to-equity bridge, two sensitivity tables, reverse DCF tab.",
      skillDemonstrated:
        "DCF — FCFF-Based; WACC Construction; Terminal Value Mechanics & Sanity Checks; Scenario & Sensitivity Analysis; Reverse DCF; Capex Classification",
      qualityBar:
        "FCFF reconciles from both calculation routes. WACC inputs explicitly sourced. Terminal value from Gordon Growth and exit multiple within 15% of each other. Reverse DCF's implied growth rate compared against GDP growth as sanity check.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 4 — TRADING COMPS & PRECEDENT TRANSACTIONS (S37–S42, 6 steps: 4 learn + 1 watch + 1 company-step) ───
  {
    id: "M4-S37",
    type: "learn",
    phase: 4,
    courseName: "The Complete Investment Banking Course 2026",
    title: "Multiples valuation – triangulating DCF results with multiples",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827364#overview",
    topic:
      "Select a peer group for a given company, gather market cap and financial data, calculate EV, and spread EV/EBITDA, EV/Revenue, P/E, and EV/EBIT multiples across a peer set.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M4-S38",
    type: "learn",
    phase: 4,
    courseName: "Company Valuation Masterclass Complete Guide",
    title:
      "The Role of Ratios in Comparative Valuation (Market Based Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26503884#overview",
    topic:
      "Understand why ratios matter in comparative valuation. Apply EV/EBITDA, P/E, EV/Revenue, and EV/EBIT across peer sets. Distinguish when each multiple is preferred and why.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M4-S39",
    type: "learn",
    phase: 4,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Valuation Techniques - Relative Valuation",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46537701#overview",
    topic:
      "Walk through the complete comps process end-to-end: peer selection, spread financials, all major multiples (P/E, EV/EBITDA, P/B, P/S, PEG), trading multiples, benchmarking, target sheet construction, and output table. Explain when EV/EBITDA is preferred over P/E. Comprehensive deep-dive — Module 4's Comps foundation.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M4-S40",
    type: "learn",
    phase: 4,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "Precedent Transaction Analysis (Market Based Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26468800#overview",
    topic:
      "Build a precedent transaction analysis table including control premiums. Distinguish precedent transaction multiples from trading comps multiples and explain what drives the difference.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M4-S41",
    type: "watch",
    phase: 4,
    courseName: "The Complete Investment Banking Course 2026",
    title: "Multiples valuation - practical example - Volkswagen",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/31691636#overview",
    topic:
      "Watch full trading comps for Volkswagen: peer identification (Stellantis, BMW, Renault), spreading P&L data, adjusting EBIT for non-recurring items, adjusting EV for minority interests and net debt, and producing a benchmarking output with implied valuation ranges.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M4-S42",
    type: "company-step",
    phase: 4,
    title: "ITC Limited — Trading Comps & Precedent Transactions Workbook",
    companyId: "itc-m4",
    locked: true,
    apply: {
      focusDo:
        "Per-segment trading comps + precedent transaction comps — EBIT adjustments with footnote citations, EV bridge per peer, output table",
      focusIgnore:
        "Capital allocation (held for M5) and full SOTP valuation (held for M11)",
      learnBeforeValuation: [
        "Segment reporting under IND-AS 108",
        "Pure-play comps for FMCG (HUL, Britannia, Nestlé India), Cigarettes (Godfrey Phillips, ITC standalone), Hotels (Indian Hotels, Lemon Tree)",
        "Why a conglomerate's blended multiple misleads",
        "Premiums paid in Indian FMCG precedent transactions",
      ],
      valuationMethods: ["Trading Comparables", "Precedent Transactions"],
      financialModels: [
        "Peer selection rationale per segment (FMCG, Cigarettes, Hotels, Agri-Business)",
        "Spread financials for each peer (3 years LTM, NTM forecast where available)",
        "EBIT adjustments per peer with footnote citations",
        "EV bridge per peer (market cap + net debt + minorities − associates)",
        "Multiples table: EV/EBITDA, EV/Revenue, P/E for each peer set",
        "Precedent transactions table: 5 Indian FMCG/cigarette/hotel deals from last 5 years with deal multiple and control premium",
        "Output: implied valuation range per ITC segment + note on why consolidated ITC multiple cannot be compared to any single peer set",
      ],
      additionalRequirements:
        "Each segment's peer group must be pure-play. Premiums in precedent transactions must be sourced, not assumed. Document explicitly why blended ITC multiple is uninformative — this becomes the foundation argument for M5 and M11.",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "ITC Trading Comps & Precedent Transactions Workbook — a single Excel file containing: (1) peer selection rationale per segment; (2) spread financials; (3) EBIT adjustments with footnote citations; (4) EV bridge per peer; (5) multiples table; (6) precedent transactions table; (7) implied valuation range with written argument for why consolidated ITC multiple is uninformative.",
      skillDemonstrated: "Trading Comparables; Precedent Transactions",
      qualityBar:
        "Peer selection documented with 1-line rationale per peer. EBIT adjustments cite footnotes. EV bridge components match each peer's reported balance sheet. 'Blended multiple is misleading' thesis stated in writing.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 5 — STRATEGIC ANALYSIS & CAPITAL ALLOCATION (S43–S53, 11 steps: 10 learn + 1 company-step) ───
  {
    id: "M5-S43",
    type: "learn",
    phase: 5,
    courseName: "The Corporate Finance Course",
    title: "Capital Budgeting",
    courseUrl:
      "https://www.udemy.com/course/the-corporate-finance-course/learn/lecture/16946710#overview",
    topic:
      "Evaluate management's capital deployment decisions across capex, dividends, buybacks, and M&A. Calculate the NPV and IRR of capital projects. Compare deployment returns to the cost of capital.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S44",
    type: "learn",
    phase: 5,
    courseName: "The Corporate Finance Course",
    title: "Capital Budgeting: Practical Example (Bonus)",
    courseUrl:
      "https://www.udemy.com/course/the-corporate-finance-course/learn/lecture/40865815#overview",
    topic:
      "Apply capital budgeting mechanics to a real-world example. Calculate project IRR and NPV. Identify whether a capital deployment is creating or destroying shareholder value.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S45",
    type: "learn",
    phase: 5,
    courseName: "The Corporate Finance Course",
    title: "Cost of Capital",
    courseUrl:
      "https://www.udemy.com/course/the-corporate-finance-course/learn/lecture/16946796#overview",
    topic:
      "Calculate WACC in the capital allocation context. Understand the cost of each source of financing. Apply cost of capital as the hurdle rate for evaluating capital deployment decisions.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S46",
    type: "learn",
    phase: 5,
    courseName: "Sales & Gross Profit Variance Analysis",
    title: "Calculate impact of Sales Variances on Profit using Excel",
    courseUrl:
      "https://www.udemy.com/course/learn-financial-analysis-of-variances-in-profit-and-sales/learn/lecture/17273368#overview",
    topic:
      "Calculate the impact of sales variances (volume, price, mix) on profit using Excel. Build a structured variance bridge that separates volume-driven from price-driven from mix-driven P&L movement.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S47",
    type: "learn",
    phase: 5,
    courseName: "Sales & Gross Profit Variance Analysis",
    title: "Summarize the results of all variances",
    courseUrl:
      "https://www.udemy.com/course/learn-financial-analysis-of-variances-in-profit-and-sales/learn/lecture/17404802#overview",
    topic:
      "Summarise all variance components into a coherent margin bridge. Present the total volume, price, and mix impact on gross profit in a single output table.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S48",
    type: "learn",
    phase: 5,
    courseName: "Sales & Gross Profit Variance Analysis",
    title: "Sales Variances - What you need to Know?",
    courseUrl:
      "https://www.udemy.com/course/learn-financial-analysis-of-variances-in-profit-and-sales/learn/lecture/17078584#overview",
    topic:
      "Understand the conceptual framework for sales variances: what drives each variance type, when each is favourable vs adverse, and how to interpret variance patterns in the context of strategic analysis.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S49",
    type: "learn",
    phase: 5,
    courseName: "Sales & Gross Profit Variance Analysis",
    title: "Calculate impact of Variance on Profit margin (%) using Excel",
    courseUrl:
      "https://www.udemy.com/course/learn-financial-analysis-of-variances-in-profit-and-sales/learn/lecture/17273452#overview",
    topic:
      "Calculate the impact of volume, price, and mix variances on profit margin percentage using Excel. Build a bridge from gross margin % change to its variance components.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S50",
    type: "learn",
    phase: 5,
    courseName: "Business Fundamentals: Corporate Strategy",
    title: "The five forces model",
    courseUrl:
      "https://www.udemy.com/course/business-fundamentals-corporate-strategy/learn/lecture/7573364#overview",
    topic:
      "Apply Porter's Five Forces framework: supplier power, buyer power, threat of new entrants, threat of substitutes, competitive rivalry. Anchor each force with quantitative evidence from company disclosures.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S51",
    type: "learn",
    phase: 5,
    courseName: "Business Fundamentals: Corporate Strategy",
    title: "Understanding the concept of competitive advantage",
    courseUrl:
      "https://www.udemy.com/course/business-fundamentals-corporate-strategy/learn/lecture/7573386#overview",
    topic:
      "Identify a company's economic moat: cost advantage, scale, brand, network effects, switching costs, and regulatory protection. Quantify moat by tracking ROIC above WACC over time.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S52",
    type: "learn",
    phase: 5,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "Warren Buffet and Valuation",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26751920#overview",
    topic:
      "Apply Buffett's valuation framework: identify businesses with durable competitive advantages, calculate owner earnings, and understand how moat translates into sustained ROIC above WACC.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M5-S53",
    type: "company-step",
    phase: 5,
    title: "ITC Limited — Strategic Analysis Workbook",
    companyId: "itc-m5",
    locked: true,
    apply: {
      focusDo:
        "Capital allocation across 4 segments + moat per segment + cigarette tax sensitivity. Built on top of M4 workbook.",
      focusIgnore: "Full SOTP valuation — held for M11",
      learnBeforeValuation: [
        "ITC's capital deployment history (cigarette FCF → FMCG capex → Hotels expansion)",
        "Tobacco regulatory/ESG constraints",
        "FMCG margin scaling trajectory of HUL/Britannia as benchmarks",
        "Excise tax mechanics on cigarette volumes (excise → consumption elasticity)",
        "Moat type per segment: cigarette = regulatory/distribution; FMCG = brand-in-build; Hotels = location",
      ],
      valuationMethods: [],
      financialModels: [
        "Capital allocation history (5 years): capex per segment, M&A spend, dividends, buybacks",
        "Capital deployment IRR: FMCG segment cumulative capex vs FMCG segment EBIT generation — implied IRR vs ITC's WACC",
        "Porter's Five Forces analysis per segment with quantitative anchors",
        "Moat assessment per segment with ROIC over time as evidence",
        "Cigarette excise sensitivity table: ±10% excise → cigarette volume response → segment EBIT impact",
        "FMCG margin bridge: ITC FMCG EBITDA margin trajectory vs HUL/Britannia at comparable scale",
      ],
      additionalRequirements:
        "Capital allocation table must show actual cash deployed per segment, not management commentary. IRR of FMCG capex must be calculated from disclosed segment financials. Cigarette volume must use excise sensitivity, not % growth. Moat assessment must cite quantitative evidence (ROIC, margin, market share).",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "ITC Strategic Analysis Workbook — Excel file + 1-page written commentary: (1) capital allocation history 5 years; (2) FMCG capital deployment IRR vs WACC; (3) Porter's Five Forces per segment; (4) moat assessment per segment with ROIC evidence; (5) cigarette excise sensitivity table; (6) FMCG margin bridge vs HUL.",
      skillDemonstrated:
        "Capital Allocation; Porter's Five Forces; Moat Analysis; Volume-Price-Mix (VPM) Analysis; Margin Bridge",
      qualityBar:
        "Capital deployment IRR is calculated, not asserted. Moat statements backed by ROIC numbers (≥3 years). Cigarette sensitivity uses excise → consumption elasticity, not a haircut. FMCG margin trajectory plotted against HUL on same chart.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls", ".pdf"],
    },
  },

  // ─── MODULE 6 — PLATFORM VALUATION & DRIVER MODELLING (S54–S60, 7 steps: 5 learn + 2 company-step) ───
  {
    id: "M6-S54",
    type: "learn",
    phase: 6,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Equity Research & Financial Modeling - Tesla Inc.",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46535889#overview",
    topic:
      "Build a segment-level revenue model for a company using operational driver trees. Decompose revenue into headcount × utilisation × billing rate for services, or volume × ASP × mix for manufacturing — calibrating each driver to disclosed AR data.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M6-S55",
    type: "learn",
    phase: 6,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "FSA - FSA Techniques",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46525637#overview",
    topic:
      "Apply FSA techniques — ROE, ROE example, dividends payout ratio — to decompose a company's return structure using DuPont analysis and identify which DuPont component is driving ROE change.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M6-S56",
    type: "learn",
    phase: 6,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "Sum of the Parts Valuation (Intrinsic Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26485814#overview",
    topic:
      "Value a multi-business company by valuing each segment with the appropriate methodology (EV/EBITDA for stable, EV/Revenue for growth, EV/GMV for marketplace) and aggregate to a total enterprise value.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M6-S57",
    type: "learn",
    phase: 6,
    courseName: "Company Valuation Masterclass Complete Guide",
    title:
      "Valuation in the New Economy - Startups and eCommerce (Advanced Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26836304#overview",
    topic:
      "Apply valuation frameworks to platform businesses: GMV × take rate revenue model, contribution margin per segment, path-to-EBITDA schedule, and EV/GMV or EV/Revenue as primary multiples for high-growth marketplaces.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M6-S58",
    type: "learn",
    phase: 6,
    courseName: "Investment Banking and Finance: Private Equity Finance",
    title: "Capitalisation Tables - The DNA of Company Ownership",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-private-equity-101/learn/lecture/50019771#overview",
    topic:
      "Build a basic cap table for a company with multiple share classes, calculate ownership dilution from a new funding round, and explain why pre-IPO platform companies have different equity structures than mature listed companies.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M6-S59",
    type: "company-step",
    phase: 6,
    title: "Infosys — Driver Revenue Model + DCF",
    companyId: "infosys-m6",
    locked: true,
    apply: {
      focusDo:
        "Driver tree (headcount × utilisation × billing rate per service line) + attrition mechanism + DCF on top of M1 Workbook",
      focusIgnore: "Deep FX (first-pass at ±5% only)",
      learnBeforeValuation: [
        "Revenue = headcount × utilisation × billing rate per service line",
        "Attrition impact on margin via utilisation drop and ramp time",
        "FX exposure: USD earnings vs INR cost base",
        "Service line mix (Digital, Cloud & Infra, Core Engineering, Data Analytics)",
      ],
      valuationMethods: [
        "DCF (FCFF) with peer-derived beta",
        "Reverse DCF — implied utilisation rate and headcount CAGR at current market price",
      ],
      financialModels: [
        "Driver tree: headcount × utilisation × billing rate → revenue by service line",
        "Attrition sensitivity: +5% attrition → utilisation drop → revenue and EBIT margin impact",
        "FX sensitivity: USD/INR ±5% impact on reported INR revenue and margins",
        "3-statement model linked from driver tree (using M1 restated financials)",
        "DCF with WACC (peer beta from TCS, Wipro, HCL re-levered to Infosys capital structure)",
        "Reverse DCF tab solving for implied utilisation rate and headcount CAGR",
      ],
      additionalRequirements:
        "Computed revenue (headcount × utilisation × billing rate) must deviate from reported revenue by less than 2%. Attrition sensitivity is mechanical (utilisation falls as a function of attrition and ramp time), not an EBIT margin override. Reverse DCF's implied headcount CAGR compared against analyst consensus.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Framework Post — 'How to model IT Services revenue properly: Headcount × Utilization × Rate'. Why % growth is lazy. Show the driver tree with Infosys numbers.",
        },
        {
          day: 5,
          content:
            "📊 Model Drop — Attrition sensitivity table. +5% attrition → utilization drop → margin hit. Real numbers, one screenshot.",
        },
        {
          day: 10,
          content:
            "🎤 Pitch Post — Tear sheet + FX note. BUY/SELL/NEUTRAL: USD/INR + deal pipeline — what matters more?",
        },
      ],
    },
    build: {
      deliverable:
        "Infosys Driver Revenue Model + DCF — built on top of M1 Accounting Workbook: driver tree by service line, attrition sensitivity, FX sensitivity, 3-statement model, DCF with sourced WACC inputs, reverse DCF tab.",
      skillDemonstrated:
        "Driver-Based Revenue Model (Advanced); Segment-Level Modelling; DCF — FCFF-Based; Reverse DCF; Scenario & Sensitivity Analysis",
      qualityBar:
        "Computed revenue deviates from reported by <2%. Attrition sensitivity is mechanical. Reverse DCF's implied headcount CAGR compared against stated consensus.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },
  {
    id: "M6-S60",
    type: "company-step",
    phase: 6,
    title: "Zomato (Eternal) — SOTP + Reverse DCF Workbook",
    companyId: "zomato-m6",
    locked: true,
    apply: {
      focusDo:
        "GMV → revenue logic + contribution margin per segment + path-to-EBITDA + reverse DCF. Single use — final deliverable.",
      focusIgnore: "Deep cohort modelling and customer LTV decomposition",
      learnBeforeValuation: [
        "GMV → Net Revenue (take rate)",
        "Contribution margin vs EBITDA distinction",
        "Blinkit unit economics (q-commerce burn)",
        "Customer acquisition cost basics",
        "Competitive risk: Swiggy, ONDC",
      ],
      valuationMethods: [
        "SOTP: Food Delivery at EV/EBITDA; Blinkit at EV/GMV or EV/Revenue; B2B Hyperpure at EV/Revenue",
        "Reverse DCF — implied GMV CAGR at current market cap",
      ],
      financialModels: [
        "Segment GMV driver model (orders × AOV by segment)",
        "Take-rate bridge per segment (sourced from AR — not assumed)",
        "Contribution margin per segment",
        "Path-to-EBITDA schedule (contribution margin − corporate overhead)",
        "SOTP consolidation sheet",
        "Bear case: ONDC + Swiggy price war → take rate compression −150 bps + order volume −15% → EBITDA break-even delay 2 years",
        "Reverse DCF: implied GMV CAGR at current market cap",
      ],
      additionalRequirements:
        "Take rates derived from reported GMV + revenue. Blinkit and Food Delivery have separate margin assumptions. Bear case models mechanism, not haircut. Reverse DCF's implied GMV CAGR stated and compared to consensus.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Framework Post — 'How to value Zomato: why EBITDA is the wrong number to watch'. Contribution margin per segment vs consolidated EBITDA. The Blinkit wild card.",
        },
        {
          day: 5,
          content:
            "📊 Model Drop — SOTP breakdown screenshot. Food Delivery + Blinkit + B2B valued separately. Share what segment surprised you most.",
        },
        {
          day: 10,
          content:
            "🎤 Pitch Post — Tear sheet + bear case. BUY/SELL/NEUTRAL: what must be true for the bull case? State it explicitly.",
        },
      ],
    },
    build: {
      deliverable:
        "Zomato SOTP + Reverse DCF Workbook — segment GMV driver model, take-rate bridge per segment, contribution margin per segment, path-to-EBITDA schedule, SOTP consolidation, bear case, reverse DCF tab.",
      skillDemonstrated:
        "Driver-Based Revenue Model (Advanced); Segment-Level Modelling; Platform Economics; SOTP Valuation; Reverse DCF; Scenario & Sensitivity Analysis",
      qualityBar:
        "Take rates derived from reported GMV + revenue. Blinkit and Food Delivery have separate margin assumptions. Bear case models mechanism. Reverse DCF's implied GMV CAGR compared against consensus.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 7 — BANK MODELLING & DDM (S61–S68, 8 steps: 6 learn + 1 watch + 1 company-step) ───
  {
    id: "M7-S61",
    type: "watch",
    phase: 7,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "FSA - FSA Techniques (Bank DuPont Re-watch)",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46525637#overview",
    topic:
      "Re-watch FSA Techniques in the bank context: apply ROE DuPont decomposition (net income / assets × leverage) to a bank and identify which DuPont component is driving ROE change for any given bank. Foundation for bank model construction.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S62",
    type: "learn",
    phase: 7,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "The Allowance for Loan Losses for Banks (FIG)",
    courseUrl: "https://youtu.be/CpmcGxBwhEc?si=fhAbuchPqvFuJ2nu",
    topic:
      "Build a GNPA waterfall (opening + slippages − recoveries − write-offs = closing), calculate provision coverage ratio, and link provision expense from the GNPA waterfall to the bank's P&L as credit cost.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S63",
    type: "learn",
    phase: 7,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Commercial Bank Revenue Model: Loan Projections",
    courseUrl: "https://youtu.be/KTKcoZz_pns?si=UrkbwTcAw5gpMiXv",
    topic:
      "Build a forward-looking bank revenue model: segment the loan book (retail, corporate, SME, rural), apply yield rates to each segment to project interest income, subtract cost of funds by deposit category, and derive NII.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S64",
    type: "learn",
    phase: 7,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title:
      "Bank Regulatory Capital and the Tragic Tale of Silicon Valley Bank and Credit Suisse",
    courseUrl: "https://youtu.be/FSnj50HtZi0?si=FndPU02y9uTzw_mh",
    topic:
      "Explain CET1, AT1, and Tier 2 capital buffers. Calculate CET1 ratio from Pillar 3 disclosures. State how the regulatory minimum constrains a bank's maximum sustainable dividend payout — and what happens when this constraint is breached.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S65",
    type: "watch",
    phase: 7,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "The Dividend Discount Model (Intrinsic Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26367720#overview",
    topic:
      "Re-watch DDM in the bank-specific context. Build a multi-period DDM, source a sustainable payout ratio for a bank from its CET1 ratio and regulatory buffer, and explain why DCF fails for banks.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S66",
    type: "learn",
    phase: 7,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Dividend Discount Model - Commercial Bank Valuation (FIG)",
    courseUrl: "https://youtu.be/sdV1KyPzCQs?si=xDQtop25UEu_nW9l",
    topic:
      "Build the complete bank DDM: net income projection from NII, operating expenses, provisions from GNPA waterfall, PAT, CET1-constrained sustainable payout ratio, multi-year dividend stream discounted to equity value.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S67",
    type: "watch",
    phase: 7,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "How to Pitch a Bank Stock (Shawbrook)",
    courseUrl: "https://youtu.be/10xGP5feK2s?si=3OPcbpSIfLz47Slg",
    topic:
      "Watch a complete bank stock pitch on Shawbrook: thesis articulation, key drivers (CET1, NIM, loan growth, asset quality), valuation frame (P/B, DDM), bear case, and recommendation. Final calibration before the HDFC Bank build — see how a banker structures a complete BUY/SELL pitch on a bank.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M7-S68",
    type: "company-step",
    phase: 7,
    title: "HDFC Bank — Financial Model + DDM",
    companyId: "hdfc-m7",
    locked: true,
    apply: {
      focusDo:
        "NII mechanics + GNPA waterfall + DDM with CET1 constraint + P/B comps. Built on top of M1 FSA Extraction Workbook.",
      focusIgnore:
        "Deep CET1 stress modelling (held for M12); credit memo (held for M12)",
      learnBeforeValuation: [
        "NIM mechanics + CASA ratio",
        "Loan book composition and yield",
        "GNPA / NNPA / PCR credit framework",
        "Why DCF does NOT work for banks (verbal answer in 2 minutes)",
        "RBI CET1 capital adequacy basics",
      ],
      valuationMethods: [
        "DDM (primary): 5-year dividend projections → Gordon Growth terminal → equity value per share",
        "P/B comps: HDFC Bank vs Kotak Mahindra, ICICI Bank, Axis Bank",
      ],
      financialModels: [
        "Bank P&L: NII (loan book × yield − deposits × cost) → other income → opex → pre-provision profit → provisions → PAT",
        "GNPA waterfall: opening + slippages − recoveries − write-offs = closing",
        "Capital adequacy tracker: CET1 ratio each year → maximum sustainable dividend",
        "DDM: 5-year dividend projections (EPS × payout ratio constrained by CET1 buffer) → Gordon Growth terminal at 5%",
        "P/B comps: HDFC Bank vs Kotak, ICICI, Axis",
        "Bear case: NPA stress — slippage rate +200 bps, loan growth −300 bps → impact on PAT and DDM value",
        "1-page tear sheet with BUY/SELL/NEUTRAL recommendation",
      ],
      additionalRequirements:
        "NII reconciles to reported NII within 5%. GNPA waterfall closing reconciles to reported GNPA × reported advances. DDM payout ratio explicitly constrained by CET1 headroom. Bear case mechanically modelled (slippage rate → new NPAs → provision → PAT → DDM value).",
      linkedInSchedule: [],
    },
    build: {
      deliverable:
        "HDFC Bank Financial Model and DDM Valuation — built on top of M1 Extraction Workbook: bank P&L, GNPA waterfall, capital adequacy tracker, DDM with CET1-constrained payout, P/B comps, bear case, 1-page tear sheet.",
      skillDemonstrated:
        "Bank Financial Modelling (NII-Based); DDM; Bank Accounting Metrics — NIM, NPA, PCR, CET1; Scenario & Sensitivity Analysis",
      qualityBar:
        "NII reconciles within 5%. GNPA waterfall closing matches reported. DDM payout is CET1-constrained. P/B analysis identifies premium/discount vs peers with ROE justification.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 8 — LBO + PAPER LBO + COVENANTS (S69–S80, 12 steps: 8 learn + 1 watch + 1 company-step) ───
  {
    id: "M8-S69",
    type: "learn",
    phase: 8,
    courseName: "The Complete Investment Banking Course 2026",
    title: "A guide to Leveraged Buyouts",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827376#overview",
    topic:
      "Identify a viable LBO target, estimate maximum debt capacity from EBITDA multiples and debt/EBITDA thresholds, and explain the four primary return drivers: earnings growth, multiple expansion, debt paydown, and dividend recapitalisation.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M8-S70",
    type: "learn",
    phase: 8,
    courseName: "The Complete Investment Banking Course 2026",
    title: "LBO Case study: Dell's LBO",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/34676136#overview",
    topic:
      "Walk through the Dell LBO case study. Understand how the deal was structured, how returns were generated, and how the debt schedule and cash sweep mechanics worked in practice.",
    locked: true,
    pattern: "B",
    learnChain: "Dell LBO Build",
    partOf: "Dell LBO Build — Part 1 of 3",
  },
  {
    id: "M8-S71",
    type: "learn",
    phase: 8,
    courseName: "The Complete Investment Banking Course 2026",
    title:
      "LBO Valuation - Building a leveraged buyout (LBO) model from scratch",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/5827388#overview",
    topic:
      "Build a complete LBO model from scratch: sources and uses, transaction balance sheet, drivers sheet, P&L forecast, debt schedule with cash sweep, revolver with circularity, IRR/MOIC analysis, sensitivity under multiple exit scenarios.",
    locked: true,
    pattern: "B",
    learnChain: "Dell LBO Build",
    partOf: "Dell LBO Build — Part 2 of 3",
  },
  {
    id: "M8-S72",
    type: "learn",
    phase: 8,
    courseName: "Investment Banking and Finance: Private Equity Finance",
    title: "A Detailed Explanation of LBO Modelling",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-private-equity-101/learn/lecture/24983948#overview",
    topic:
      "Navigate every section of a professional LBO model. Build a multi-tranche debt schedule with cash sweep mechanics and revolver. Handle circularity between revolver usage and interest calculation using iterative calculation or a circular-break toggle.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M8-S73",
    type: "learn",
    phase: 8,
    courseName: "Investment Banking and Finance: Private Equity Finance",
    title: "Deal Value Creation and Metrics",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-private-equity-101/learn/lecture/24820494#overview",
    topic:
      "Calculate IRR and MOIC under multiple exit scenarios. Explain the distribution waterfall. Decompose LBO returns into earnings growth, multiple expansion, debt paydown, and dividend recapitalisation components.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M8-S74",
    type: "learn",
    phase: 8,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Assessing Collateral and Loan Structure in Credit Agreements",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914605#overview",
    topic:
      "Read a credit agreement: loan structure, security, maintenance covenants (leverage ratio, ICR), incurrence covenants, covenant breach scenarios, and lender remedies (waiver, margin ratchet, acceleration).",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M8-S75",
    type: "learn",
    phase: 8,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Stress Testing and Scenario Analysis",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914631#overview",
    topic:
      "Stress-test covenant headroom under three downside scenarios. Model maintenance covenant breaches (leverage ratio < 5.5×, ICR > 2.0×) and specify lender remedy options for each breach scenario.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M8-S76",
    type: "learn",
    phase: 8,
    courseName: "Investment Banking and Finance: Private Equity Finance",
    title: "Structuring Private Equity Deals",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-private-equity-101/learn/lecture/24737338#overview",
    topic:
      "Understand how PE deals are structured: capital structure of a PE buyout (senior secured + mezzanine + preferred + common equity), key deal structuring terms, preferred stock liquidation preferences, and how the structure drives returns. Foundation for the Techworks financial engineering build.",
    locked: true,
    pattern: "B",
    learnChain: "Techworks Financial Engineering Build",
    partOf: "Techworks Financial Engineering Build — Part 1 of 3",
  },
  {
    id: "M8-S77",
    type: "learn",
    phase: 8,
    courseName: "The Corporate Finance Course",
    title: "Measures of Leverage",
    courseUrl:
      "https://www.udemy.com/course/the-corporate-finance-course/learn/lecture/16946888#overview",
    topic:
      "Calculate Degree of Operating Leverage (DOL), Degree of Financial Leverage (DFL), and Degree of Total Leverage (DTL). Understand the effect of financial leverage on a company's net income and ROE — the foundation of why high leverage amplifies LBO equity returns. Calculate breakeven quantity of sales under different leverage scenarios.",
    locked: true,
    pattern: "B",
    learnChain: "Techworks Financial Engineering Build",
    partOf: "Techworks Financial Engineering Build — Part 2 of 3",
  },
  {
    id: "M8-S78",
    type: "learn",
    phase: 8,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Leveraged Recapitalization",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46538755#overview",
    topic:
      "Walk through leveraged recapitalization end-to-end: the concept, ways to carry it out (leveraged share repurchase, special dividend), debt structure analysis, EBITDA capital calculation, junk bond financing, and case studies (Sealed Air Corporation). Understand valuation and shareholder-level analysis under different leverage scenarios — the toolkit for optimising the capital structure mix.",
    locked: true,
    pattern: "B",
    learnChain: "Techworks Financial Engineering Build",
    partOf: "Techworks Financial Engineering Build — Part 3 of 3",
  },
  {
    id: "M8-S79",
    type: "watch",
    phase: 8,
    courseName: "The Complete Investment Banking Course 2026",
    title: "Building a comprehensive LBO model",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/37617750#overview",
    topic:
      "Full live build of a comprehensive institutional-grade LBO model from scratch — sources and uses, transaction balance sheet, goodwill, drivers sheet, P&L to EBITDA, working capital, fixed asset roll-forward, debt schedule, revolver with circularity, exit IRR/MOIC under 3 scenarios. Observe: (1) circularity handling; (2) sources and uses must balance; (3) IRR on equity cash flows only.",
    locked: true,
    pattern: "B",
    learnChain: "Dell LBO Build",
    partOf: "Dell LBO Build — Part 3 of 3",
  },
  {
    id: "M8-S80",
    type: "company-step",
    phase: 8,
    title: "L&T Technology Services — LBO Model",
    companyId: "lt-m8",
    locked: true,
    apply: {
      focusDo:
        "PE buyout simulation — sources & uses, debt schedule, cash sweep, IRR/MOIC, covenant tests",
      focusIgnore: "Full L&T conglomerate SOTP (held for M11)",
      learnBeforeValuation: [
        "Why a separately-listed subsidiary is an LBO simulation candidate",
        "Standard LBO assumption set: 18× EV/EBITDA entry, 60% debt funded, 3-year hold, 15× exit",
        "Senior + mezzanine + revolver tranching",
        "Cash sweep mechanics",
        "Covenant headroom tracking",
      ],
      valuationMethods: [
        "LBO Return Analysis: IRR and MOIC at exit multiples 13×, 15×, 17×",
        "Sensitivity: IRR vs entry multiple and revenue CAGR",
      ],
      financialModels: [
        "Sources and uses tab: entry EV at 18× EV/EBITDA, debt tranches (senior 3.5× EBITDA; mezzanine 1.5× EBITDA; equity remainder), transaction fees 2% of EV",
        "Opening balance sheet at transaction (with goodwill from PPA)",
        "Drivers sheet with 5 operating assumptions",
        "3-year P&L to EBITDA",
        "Working capital schedule",
        "Fixed asset roll-forward",
        "Debt schedule with cash sweep (senior amortises 10%/year; excess cash sweeps senior principal)",
        "Revolver with circularity",
        "IRR and MOIC analysis at exit multiples 13×, 15×, 17×",
        "Sensitivity: IRR vs entry multiple (16×, 18×, 20×) and revenue CAGR (5%, 8%, 11%)",
        "Covenant tests tab: leverage ratio (Net Debt/EBITDA, max 5.5×) and ICR (EBITDA/Interest, min 2.0×) tested each year; bear scenario triggers written remedy plan",
      ],
      additionalRequirements:
        "Sources = uses to the rupee. Opening BS closes including written-up goodwill. Debt principal at end of Year 3 reconciles to net debt used in exit equity value. IRR calculated on equity cash flows only. Revolver balance never negative. Covenant breach scenario triggers a written remedy (waiver / margin ratchet / acceleration).",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Technical Thread — 'Why LBO returns collapse at 20× entry: the leverage trap explained'. Sources & uses → debt schedule → IRR at exit. One sensitivity table every PE associate builds on day one.",
        },
        {
          day: 5,
          content:
            "📊 Model Drop — L&T Tech Services LBO screenshot. Cash sweep mechanics + covenant headroom by year. The number that determines whether lenders accelerate.",
        },
        {
          day: 10,
          content:
            "🎤 Pitch Post — Tear sheet. BUY/SELL/NEUTRAL: at 18× entry and 5-year hold, what IRR do you underwrite — and what has to go right?",
        },
      ],
    },
    build: {
      deliverable:
        "L&T Technology Services LBO Model — complete leveraged buyout model: sources and uses, opening BS, drivers sheet, 3-year P&L, working capital, fixed asset roll-forward, debt schedule with cash sweep, revolver with circularity, IRR/MOIC at 3 exit multiples, sensitivity, covenant tests tab with bear scenario remedy plan.",
      skillDemonstrated:
        "LBO Model; Debt Schedule & Interest Mechanics; LBO Return Analysis (IRR / MOIC); Circularity Handling; Advanced LBO — Covenant Modelling; Scenario & Sensitivity Analysis",
      qualityBar:
        "Sources = uses (exact). Opening balance sheet closes. Year-3 debt principal matches net debt in exit equity. IRR on equity cash flows. Revolver never negative. Covenant headroom shown in basis points each year.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 9 — M&A PROCESS & MERGER MODEL (S81–S102, 22 steps: 17 learn + 3 watch + 1 company-step) ───
  {
    id: "M9-S81",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "What does the term Mergers and Acquisitions Mean?",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/9090270#overview",
    topic:
      "Define mergers and acquisitions. Distinguish hostile from friendly takeovers. Explain why companies acquire: revenue synergies, cost synergies, market access, talent acquisition, and financial engineering.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S82",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Initial Planning",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/5807674#overview",
    topic:
      "Walk through the initial planning phase of a sell-side M&A process: mandate receipt, conflict check, deal team formation, initial valuation range, and preliminary process design.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S83",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Sell Side Engagement Letters",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/38268430#overview",
    topic:
      "Understand the sell-side engagement letter: scope, fee structure (success fee + retainer), exclusivity period, liability carve-outs, and what constitutes a 'transaction' for fee purposes.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S84",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Pre Sale Preparation",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/5807688#overview",
    topic:
      "Prepare the company for sale: vendor due diligence commissioning, financial clean-up, management presentation preparation, and data room organisation before approaching buyers.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S85",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Preparing the Sale Process",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/5807688#overview",
    topic:
      "Design the sale process: buyer segmentation (strategic vs financial), teaser preparation, NDA management, process letter structuring, and timeline from first contact to binding offer.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S86",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Marketing the Business",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/5807726#overview",
    topic:
      "Execute the marketing phase: distribute teasers, manage NDAs, distribute Information Memorandum to qualified buyers, and handle buyer Q&A during the management presentation phase.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S87",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Letters of Intent in M&A Transactions",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/8682623#overview",
    topic:
      "Understand the Letter of Intent (LOI): what it does and does not bind, exclusivity provisions, price and structure indications, and how LOI terms shape the final SPA negotiation.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S88",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "The Due Diligence Process",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/17957044#overview",
    topic:
      "Walk through the due diligence process: financial, commercial, legal, and technical DD. Understand the data room structure, DD report format, and how DD findings translate into Conditions Precedent, reps and warranties, and indemnities.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S89",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "The Sale and Purchase Agreement",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/17957062#overview",
    topic:
      "Understand the SPA: purchase price mechanics (locked box vs completion accounts), representations and warranties, specific indemnities, conditions to closing, and MAC clauses.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S90",
    type: "learn",
    phase: 9,
    courseName: "Mergers & Acquisitions — M&A, Valuation & Selling a Company",
    title: "Buyside M&A",
    courseUrl:
      "https://www.udemy.com/course/how-entrepreneurs-can-maximise-value-when-selling-a-business/learn/lecture/44115066#overview",
    topic:
      "Walk through a buy-side M&A mandate: target identification, initial valuation, bid strategy, due diligence focus, and how the buy-side advisor's analysis differs from the sell-side in terms of deliverables and objectives.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S91",
    type: "learn",
    phase: 9,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Funding Merger and Acquisitions",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46538677#overview",
    topic:
      "Calculate post-merger combined EPS under cash, stock, and mixed deals. Identify whether each structure is accretive or dilutive and why. Calculate goodwill as purchase price minus fair value of net identifiable assets.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S92",
    type: "learn",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Expense Synergies in Merger Models",
    courseUrl: "https://youtu.be/5QfK7n-J8Uk?si=79de8Mu6tNRwYdKw",
    topic:
      "Build a synergy schedule with phasing (25%/75%/100% over 3 years), tax-effect gross synergies to get post-tax impact, and calculate EPS impact of synergies in the combined P&L.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S93",
    type: "learn",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Why Deferred Tax Liabilities Get Created in an M&A Deal",
    courseUrl: "https://youtu.be/UpbxN_xuGV4?si=kWTGED6SLx8zJvPN",
    topic:
      "Explain the DTL arising from intangible write-ups in PPA: when book value of assets exceeds tax basis, a DTL is created. Show how DTL flows through the combined P&L as a deferred tax reversal.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S94",
    type: "learn",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title:
      "How to Calculate Goodwill in M&A Deals and Merger Models [Tutorial]",
    courseUrl: "https://youtu.be/m5p0D3kV72g?si=tdkW9FO4FXOR-6YI",
    topic:
      "Calculate PPA goodwill correctly: goodwill = purchase price − fair value of net identifiable assets (tangible book + intangible write-ups − DTL on write-ups). Handle NCI treatment and tangible asset step-ups.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S95",
    type: "learn",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Negative Goodwill and Bargain Purchases in Merger Models",
    courseUrl: "https://youtu.be/ENXKhSpnqQk?si=Jbf9zwvhqIoTdhah",
    topic:
      "Understand negative goodwill (bargain purchase): when the purchase price is less than the fair value of net identifiable assets. Explain the accounting treatment and why this is rare but tested in interviews.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S96",
    type: "learn",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Pro-Forma Earnings vs. GAAP in Merger Models",
    courseUrl: "https://youtu.be/utYBy3eB8lk?si=6nCD0Qicn6fLi7Uq",
    topic:
      "Explain how acquirers present pro-forma EPS by stripping one-time transaction costs. Build a pro-forma vs GAAP EPS bridge for Year 1. Understand why PPA D&A amortisation is an after-tax charge below EBIT in the combined P&L.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S97",
    type: "learn",
    phase: 9,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "Bankruptcy Liquidation and Corporate Restructuring",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46538641#overview",
    topic:
      "Explain insolvency mechanics, calculate Z-score for bankruptcy prediction, describe the absolute priority rule (APR) in liquidation, and distinguish Chapter 7 (liquidation) from Chapter 11 (reorganisation).",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S98",
    type: "watch",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Accretion Dilution - Rules of Thumb for Merger Models",
    courseUrl: "https://youtu.be/DBL_XAY0Oz8?si=J0gMk854V7x3RLxd",
    topic:
      "Mental framework for accretion/dilution: rules of thumb for cash vs stock vs debt financing. When is a deal automatically accretive? When dilutive? How does P/E of acquirer vs target drive the outcome?",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S99",
    type: "watch",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Merger Model: Cash, Debt, and Stock Mix",
    courseUrl: "https://youtu.be/phcVjvvOiM0?si=6VIy9ShddjvcBTes",
    topic:
      "Live demonstration of how cash, debt, and stock financing each change EPS through different channels: share count, interest expense, and dilution. Build a merger model with all three financing structures.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S100",
    type: "watch",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Merger Model: Assessment Centre Case Study",
    courseUrl: "https://youtu.be/ErFle5ThcHU?si=g6jxttiraIxH5BHa",
    topic:
      "Complete merger model built under time pressure from a blank file: standalone models, PPA, combined P&L, synergies, EPS accretion/dilution table. Observe: assessment centre pace — standalone → sources/uses → combined P&L → EPS table.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S101",
    type: "learn",
    phase: 9,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Merger Model Interview Questions: What to Expect",
    courseUrl: "https://youtu.be/4jmyDxVHrGE?si=DB4SF2Xq6o5RJTmB",
    topic:
      "Answer the 10 most common merger model technical questions under interview conditions without reference to a model. Pre-BUILD calibration to ensure interview-level fluency before attempting the VW merger model.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M9-S102",
    type: "company-step",
    phase: 9,
    title: "Volkswagen — Merger Model",
    companyId: "vw-m9",
    locked: true,
    apply: {
      focusDo:
        "Hypothetical VW/Stellantis or VW/Renault merger — standalone P&Ls, PPA, synergies, accretion/dilution under three financing scenarios",
      focusIgnore:
        "Brand-by-brand SOTP of VW — keep at standalone P&L level for the merger model",
      learnBeforeValuation: [
        "LTM standalone financials for VW and target",
        "Premium-to-trading-price norms in auto M&A (typically 25–35%)",
        "Auto industry synergy norms (procurement, platform sharing, R&D consolidation)",
        "PPA categories for auto (brand, customer relationships, technology IP)",
        "German vs French vs Italian regulatory M&A considerations",
      ],
      valuationMethods: [
        "Accretion/Dilution Model under three financing scenarios (40% cash / 40% stock / 20% debt)",
        "Sensitivity: accretion/dilution at premiums of 20%, 30%, 40%",
      ],
      financialModels: [
        "Standalone VW and target income statements for LTM",
        "Transaction assumptions: purchase price (30% premium), financing split (40% cash, 40% stock, 20% debt)",
        "PPA: 3 intangible categories (brand, customer relationships, technology IP) with 7-year amortisation; residual goodwill; DTL on intangible write-ups",
        "Combined P&L with €500M synergies (25%/75%/100% over 3 years; tax-effected)",
        "EPS accretion/dilution table — Y1, Y2, Y3 for each financing scenario",
        "Sensitivity: accretion/dilution at premiums of 20%, 30%, 40%",
        "Pro-forma vs GAAP EPS bridge for Y1",
        "Written 1-page investment memo: BUY/SELL the deal",
      ],
      additionalRequirements:
        "Combined NI = VW standalone + target standalone − PPA D&A − additional interest + tax shield. Combined EPS = combined NI / (VW shares + new shares from stock component). Synergies are tax-effected before adding to combined NI. Goodwill = purchase price − fair value of net identifiable assets (with DTL reducing net asset value). Memo opens with a clear BUY or SELL in the first sentence.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Sector Post — 'Volkswagen's EV bet is destroying FCF — here's how to model it'. Capex intensity vs FCF conversion. Why EBITDA flatters auto companies in transition.",
        },
        {
          day: 5,
          content:
            "📊 Model Drop — SOTP screenshot with Porsche stake marked to market. Brand-by-brand value. One insight that changes your equity value calculation.",
        },
        {
          day: 10,
          content:
            "🎤 Pitch Post — Tear sheet + India bridge. BUY/SELL/NEUTRAL: VW framework applied to Tata Motors EV thesis — what transfers?",
        },
      ],
    },
    build: {
      deliverable:
        "VW Merger Model — standalone P&Ls for VW and target, transaction assumptions, PPA with 3 intangible categories + goodwill + DTL, combined P&L with synergies, EPS accretion/dilution table, sensitivity table, Pro-forma vs GAAP EPS bridge, 1-page investment memo.",
      skillDemonstrated:
        "Accretion/Dilution Model; Advanced Merger Model (PPA, DTL, GAAP vs Cash EPS); Goodwill & Purchase Price Allocation; M&A Process; Written Financial Communication",
      qualityBar:
        "Combined NI computation correct including PPA D&A and tax shield. Combined EPS uses correct denominator. Synergies are tax-effected. DTL on intangible write-ups reduces net asset value before residual goodwill. Memo opens with BUY/SELL in first sentence.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls", ".pdf"],
    },
  },

  // ─── MODULE 10 — PHARMA & HEALTHCARE VALUATION (S103–S109, 7 steps: 5 learn + 2 company-step) ───
  {
    id: "M10-S103",
    type: "learn",
    phase: 10,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "Risk Assessment and Incorporating Risk into Valuation",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/38287634#overview",
    topic:
      "Apply probability weights to cash flow scenarios. Build a Monte Carlo simulation using data tables. Frame regulatory risk as a probability-weighted NPV adjustment rather than a qualitative footnote.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M10-S104",
    type: "learn",
    phase: 10,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "How to Value Private Companies (Advanced Valuation)",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26876298#overview",
    topic:
      "Apply probability-weighting to value private companies with binary cash flow events. Use EV/EBITDA and EV/Revenue multiples for companies with staged gate pipeline data. Build a probability-weighted NPV from stage-gate assumptions.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M10-S105",
    type: "learn",
    phase: 10,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: 'Comparable Company Valuation or "Comps"',
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26444118#overview",
    topic:
      "Apply EV/EBITDA and EV/Revenue multiples to specialist sector companies: pharma with binary cash flows, gaming with EV/GGR, and other specialist industries. Understand when sector-specific multiples are preferred over generic EV/EBITDA.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M10-S106",
    type: "learn",
    phase: 10,
    courseName: "Company Valuation Masterclass Complete Guide",
    title: "Cost Valuation",
    courseUrl:
      "https://www.udemy.com/course/company-valuation-financial-modelling-and-analysis/learn/lecture/26401594#overview",
    topic:
      "Apply cost valuation methods: replacement cost, historical cost, and net asset value. Understand when cost valuation is appropriate (asset-heavy companies, insurance, real estate) and its limitations.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M10-S107",
    type: "learn",
    phase: 10,
    courseName: "YouTube — Gap-Fill",
    title: "Risk Adjusted DCF Valuation of a Pharma Biotech Company",
    courseUrl: "https://www.youtube.com/watch?v=zGmthgDgLbQ",
    topic:
      "Build a pharma rNPV model: for each pipeline asset, probability-weight cash flows by clinical stage success probability, discount to NPV, and sum to total pipeline value. Show unrisked vs risk-adjusted NPV side-by-side.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M10-S108",
    type: "company-step",
    phase: 10,
    title: "Sun Pharmaceuticals — Geography + Pipeline Model",
    companyId: "sunpharma-m10",
    locked: true,
    apply: {
      focusDo:
        "Probability-weighted pipeline + USFDA regulatory risk + geography revenue model on top of M1 Workbook",
      focusIgnore: "Deep M&A history",
      learnBeforeValuation: [
        "Generic pricing erosion (US market: 5–8% annual decay)",
        "Specialty pipeline R&D + probability weighting per stage (BIO/Trialtrove benchmarks)",
        "USFDA regulatory risk (warning letters, import alerts)",
        "Revenue by geography from M1 Workbook",
        "How to quantify regulatory downside in a model",
      ],
      valuationMethods: [
        "DCF for base business (FCFF, ex-pipeline)",
        "rNPV: 5 pipeline assets × probability-weighted cash flows × discount factor",
        "SOTP: base business DCF + pipeline rNPV = total equity value",
        "Peer comps: Dr. Reddy's, Cipla, Divis",
      ],
      financialModels: [
        "Revenue model by geography: US (generics erosion + new launches), India, EM, RoW",
        "US generics erosion schedule: opening product revenue × (1 − erosion rate) + new launches × ramp curve",
        "Pipeline NPV tab: 5 assets × probability-weighted cash flows × discount factor = rNPV per asset",
        "USFDA warning letter downside: revenue at risk by facility from AR concentration disclosure",
        "3-statement model (base case)",
        "DCF for base business using FCFF",
        "SOTP: base business DCF + pipeline rNPV",
        "Bear case: FDA import alert on primary US facility → base business DCF decline + pipeline rNPV unchanged",
      ],
      additionalRequirements:
        "US generics revenue must decay mechanically — not a flat % growth override. Pipeline probability % must be sourced from industry benchmarks and cited. USFDA downside must quantify revenue at risk by specific facility from AR concentration disclosure. Unrisked NPV and risk-adjusted NPV shown side-by-side for each pipeline asset.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Sector Thread — 'How FDA warning letters destroy pharma valuations — and how to model it'. Walk through rNPV logic. Why probability-weighting matters in healthcare IB.",
        },
        {
          day: 7,
          content:
            "📊 Model Drop — Pipeline NPV table screenshot. Show probability-weighted vs unrisked value gap. One number that surprised you.",
        },
        {
          day: 12,
          content:
            "🎤 Pitch Post — Tear sheet. BUY/SELL/NEUTRAL: defend your FDA risk assumption in 3 bullet points.",
        },
      ],
    },
    build: {
      deliverable:
        "Sun Pharma Geography + Pipeline Model — built on top of M1 Workbook: geography revenue model, US generics erosion schedule, pipeline NPV tab with 5 assets, USFDA downside scenario, 3-statement model, DCF for base business, SOTP consolidation, bear case tab.",
      skillDemonstrated:
        "rNPV (Pharma); Regulatory Risk Quantification; Driver-Based Revenue Model; DCF — FCFF-Based; SOTP Valuation; Scenario & Sensitivity Analysis",
      qualityBar:
        "Probability weights cite industry benchmarks. US generics revenue decays mechanically. Pipeline NPV shows unrisked vs risk-adjusted side-by-side. USFDA downside quantifies revenue at risk by facility from AR.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },
  {
    id: "M10-S109",
    type: "company-step",
    phase: 10,
    title: "Genting Singapore — GGR Model and Valuation",
    companyId: "genting-m10",
    locked: true,
    apply: {
      focusDo:
        "GGR-based revenue model + VIP vs mass margin bridge + EV/EBITDA comps + DCF. Single use — full chain.",
      focusIgnore:
        "Deep regulatory licensing — understand as risk, don't model",
      learnBeforeValuation: [
        "Gross Gaming Revenue (GGR) mechanics: rolling chip × hold rate (VIP); visitor volume × spend × win rate (mass)",
        "VIP vs mass market segment economics (VIP: 10–15% margin; mass: 40–50%)",
        "EBITDA margin structure in integrated resorts",
        "EV/EBITDA as primary gaming multiple",
        "Singapore duopoly dynamics (MBS vs RWS)",
      ],
      valuationMethods: [
        "EV/EBITDA comps: Las Vegas Sands, Melco, Wynn Macau, Galaxy, Delta Corp",
        "DCF (FCFF) with capex intensity scenario",
        "Reverse DCF: implied GGR CAGR at current EV",
      ],
      financialModels: [
        "GGR driver model: VIP segment (Rolling Chip volume × hold rate) + mass segment (visitor volume × spend × win rate)",
        "VIP vs mass EBITDA margin bridge",
        "FCF bridge: EBITDA → CFO → FCF (capex-adjusted)",
        "3-statement model (3-year forecast)",
        "EV/EBITDA comps: Las Vegas Sands, Melco International, Wynn Macau, Galaxy Entertainment, Delta Corp",
        "DCF (FCFF) with capex intensity scenario (base: maintenance; bull: no major expansion; bear: new expansion)",
        "Reverse DCF: implied GGR CAGR at current EV",
        "Bear case: GGR compression — tourist arrivals −20%, VIP volume −30%, mass hold rate −50 bps",
      ],
      additionalRequirements:
        "GGR derived from rolling chip × hold rate (verify against reported GGR within 5%). VIP and mass EBITDA margins differ by ≥25 percentage points from AR segment disclosure. Bear case volumes sourced from comparable downturn (2020 COVID, 2015 Macau VIP crackdown).",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Sector Thread — 'GGR, hold rates, and why gaming companies are valued differently'. EV/EBITDA as the primary metric. VIP vs mass economics explained with real numbers.",
        },
        {
          day: 7,
          content:
            "📊 Model Drop — GGR driver model + VIP vs mass margin bridge. Drop × hold rate → revenue. The one assumption that moves your valuation the most.",
        },
        {
          day: 12,
          content:
            "🎤 Pitch Post — Tear sheet + Delta Corp comp. BUY/SELL/NEUTRAL: Singapore duopoly moat — priced in or still underappreciated?",
        },
      ],
    },
    build: {
      deliverable:
        "Genting Singapore GGR Model and Valuation — GGR driver model (VIP rolling chip × hold rate + mass visitor × spend × win rate), VIP vs mass margin bridge, FCF bridge, 3-statement model, EV/EBITDA comps, DCF with capex intensity scenario, reverse DCF, bear case.",
      skillDemonstrated:
        "rNPV (sector specialist); Regulatory Risk Quantification; Driver-Based Revenue Model; DCF — FCFF-Based; Trading Comparables; Reverse DCF; Scenario & Sensitivity Analysis",
      qualityBar:
        "GGR derived from rolling chip × hold rate (verified within 5%). VIP and mass EBITDA margins differ by ≥25 percentage points from AR. Bear case volumes from comparable downturn.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 11 — CONGLOMERATE & SOTP VALUATION (S110–S114, 5 steps: 3 learn + 2 company-step) ───
  {
    id: "M11-S110",
    type: "learn",
    phase: 11,
    courseName: "Investment Banking Learning Path: Practical Skills Mastery",
    title: "FSA - Income Statement (Revenue Recognition Re-watch)",
    courseUrl:
      "https://www.udemy.com/course/investment-banking-learning-path-practical-skills-mastery/learn/lecture/46524705#overview",
    topic:
      "Re-watch FSA Income Statement with focus on revenue recognition: Percentage of Completion method for long-term EPC contracts, Installment Method, and IFRS 15 mechanics for recognising revenue as (costs incurred to date ÷ estimated total costs) × contract value.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M11-S111",
    type: "learn",
    phase: 11,
    courseName: "Consolidated Financial Statement Under IFRS",
    title: "Practice Questions and Case Studies",
    courseUrl:
      "https://www.udemy.com/course/consolidated-financial-statements-ifrs/learn/lecture/29309812#overview",
    topic:
      "Build a consolidated multi-segment model through case studies: Consolidated SOFP Paradigm, Long Question, and Consolidated SOCI. Each segment has its own revenue recognition policy and IFRS treatment for consolidation (associate vs subsidiary vs JV).",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M11-S112",
    type: "learn",
    phase: 11,
    courseName: "YouTube — IFRS 15 Five-Step Model",
    title: "IFRS 15 - Revenue from Contracts with Customers (Five-Step Model)",
    courseUrl:
      "https://www.youtube.com/results?search_query=IFRS+15+five+step+model+revenue+recognition",
    topic:
      "Apply the five-step model under IFRS 15: (1) identify the contract; (2) identify performance obligations; (3) determine transaction price; (4) allocate transaction price; (5) recognise revenue when/as performance obligations are satisfied. Conceptual framework only — practical IFRS 15 application is reinforced in M10-S109 (Zalando) and M11-S110 (L&T EPC).",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M11-S113",
    type: "company-step",
    phase: 11,
    title: "ITC Limited — Full SOTP Model",
    companyId: "itc-m11",
    locked: true,
    apply: {
      focusDo:
        "Full SOTP (Cigarettes + FMCG + Hotels + Agri-Business + Paper) with separate WACC per segment, conglomerate discount quantification. Final use — built on top of M4 + M5 outputs.",
      focusIgnore: "Deep international FX",
      learnBeforeValuation: [
        "Segment reporting under IND-AS 108 (revenue, EBIT, capex, capital employed per segment)",
        "Per-segment WACC: different beta and capital structure per segment",
        "FMCG growth narrative: ITC capital deployment vs HUL benchmark",
        "Cigarette regulatory headwinds quantified",
        "Hotel segment cyclicality and capex intensity",
      ],
      valuationMethods: [
        "SOTP: Cigarettes + FMCG + Hotels + Agri-Business + Paper — separate WACC per segment",
        "EV per segment: trading multiples (from M4) cross-checked against segment DCF",
        "Conglomerate discount: (sum of segment-implied EV − current market cap) / sum of segment-implied EV",
      ],
      financialModels: [
        "Segment 3-statement (5 segments: Cigarettes, FMCG, Hotels, Agri-Business, Paper)",
        "Separate WACC per segment using M5 capital allocation analysis + M4 peer betas",
        "EV per segment: trading multiples cross-checked against segment DCF",
        "Consolidated EV bridge: sum of segment EVs − net debt − conglomerate discount = equity value",
        "Conglomerate discount calculation from actual data",
        "Cigarette excise sensitivity rolling forward from M5",
        "Tear sheet with BUY/SELL/NEUTRAL",
      ],
      additionalRequirements:
        "Each segment must use its own WACC, not a blended ITC WACC. Conglomerate discount must be quantified using actual data (sum of segments' implied EV vs current market cap), not asserted. Cigarette excise sensitivity rolls forward from M5.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Insight Thread — 'The conglomerate discount nobody talks about: ITC's FMCG is growing faster than HUL'. Break down SOTP logic across 4 segments. Show the math.",
        },
        {
          day: 6,
          content:
            "📊 Model Drop — Post your SOTP consolidation sheet. Cigarette vs FMCG valuation gap visualized. One key insight from building it.",
        },
      ],
    },
    build: {
      deliverable:
        "ITC Full SOTP Model — built on top of M4 + M5 workbooks: segment 3-statement (5 segments), separate WACC per segment, EV per segment (comps + DCF cross-check), consolidated EV bridge with conglomerate discount, cigarette excise sensitivity, tear sheet.",
      skillDemonstrated:
        "SOTP Valuation; Segment-Level Modelling; Capital Allocation; DCF — FCFF-Based; Scenario & Sensitivity Analysis",
      qualityBar:
        "Each segment uses its own WACC. Conglomerate discount calculated from actual data. Cigarette sensitivity uses elasticity. FMCG margin trajectory plotted against HUL.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },
  {
    id: "M11-S114",
    type: "company-step",
    phase: 11,
    title: "Larsen & Toubro — SOTP Model with Backlog Waterfall",
    companyId: "lt-m11",
    locked: true,
    apply: {
      focusDo:
        "Order book → revenue (Percentage of Completion) + segment SOTP (EPC + IT Services + Financial Services). Final use — continues from M8 LBO.",
      focusIgnore: "Deep international FX (first-pass only)",
      learnBeforeValuation: [
        "Order book mechanics (opening + new wins − revenue recognised = closing)",
        "PoC revenue recognition under IND-AS 115",
        "Working capital intensity of long-cycle EPC (receivables, advances)",
        "L&T Tech as the listed subsidiary — mark-to-market its market cap in SOTP",
        "Financial services valuation by P/B (segment is a lender, not a corporate)",
      ],
      valuationMethods: [
        "SOTP: EPC at EV/EBITDA (peers: NCC, KEC International); IT Services at L&T Tech listed market cap anchor; Financial Services at P/B",
        "DCF for EPC + IT combined",
      ],
      financialModels: [
        "Backlog waterfall tab: per-segment opening + inflows − revenue recognised = closing for actuals + 3-year forecast",
        "Stress test: −30% order inflows → revenue shortfall → FCF impact",
        "Segment 3-statement: EPC (Infra + Energy) + IT Services + Financial Services",
        "Working capital intensity per segment (DSO and DPO from AR segment notes)",
        "SOTP consolidation: EPC at EV/EBITDA peers; IT Services at L&T Tech market cap anchor; Financial Services at P/B",
        "DCF for EPC + IT combined (order book as revenue certainty)",
        "1-page tear sheet with BUY/SELL/NEUTRAL and target",
      ],
      additionalRequirements:
        "Closing backlog must reconcile to reported segment order book. WC days from segment AR notes — not consolidated or estimated. IT Services segment uses L&T Tech listed market cap (mark-to-market). Stress test cascades through revenue → EBIT → FCF, not a direct revenue haircut.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Technical Thread — 'Order book is not revenue: how EPC companies mislead analysts'. Percentage of Completion + backlog waterfall explained. The WC trap in infrastructure.",
        },
        {
          day: 6,
          content:
            "📊 Model Drop — Backlog waterfall + SOTP screenshot. Order inflow → revenue recognised → FCF. One number every infra analyst must know.",
        },
        {
          day: 11,
          content:
            "🎤 Pitch Post — Tear sheet. BUY/SELL/NEUTRAL: order inflow trajectory vs margin pressure — which wins?",
        },
      ],
    },
    build: {
      deliverable:
        "L&T SOTP Model with Backlog Waterfall — backlog waterfall per segment, stress test (−30% order inflows), segment 3-statement, WC intensity per segment, SOTP consolidation, DCF for EPC + IT combined, 1-page tear sheet.",
      skillDemonstrated:
        "Order Book and Backlog Analysis; SOTP Valuation (Advanced); Segment-Level Modelling; Revenue Recognition — Percentage of Completion; Working Capital Anomaly Detection; Capital Allocation",
      qualityBar:
        "Closing backlog reconciles to reported. WC days from AR segment disclosures. IT Services uses L&T Tech market cap. Stress test cascades mechanically through revenue → EBIT → FCF.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".xls"],
    },
  },

  // ─── MODULE 12 — CREDIT ANALYSIS & LENDING (S115–S132, 18 steps: 17 learn + 1 company-step) ───
  {
    id: "M12-S115",
    type: "learn",
    phase: 12,
    courseName: "Mastering Due Diligence in M&A and PE Transactions",
    title: "Introduction to Due Diligence",
    courseUrl:
      "https://www.udemy.com/course/due-diligence/learn/lecture/43178798#overview",
    topic:
      "Distinguish vendor from buyer due diligence. Name the major DD types (financial, commercial, legal, operational, IT, ESG). Describe the DD process from kick-off to report delivery and explain the role of each advisor.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S116",
    type: "learn",
    phase: 12,
    courseName: "Mastering Due Diligence in M&A and PE Transactions",
    title: "Approaches and Kinds Due Diligence Exercise",
    courseUrl:
      "https://www.udemy.com/course/due-diligence/learn/lecture/43178832#overview",
    topic:
      "Apply different DD approaches to a specific transaction type. Understand how the buyer's objectives shape which DD streams receive priority. Complete the DD exercise applying the framework to a real deal scenario.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S117",
    type: "learn",
    phase: 12,
    courseName: "Mastering Due Diligence in M&A and PE Transactions",
    title: "Incorporating Due Diligence findings in Transaction Documents",
    courseUrl:
      "https://www.udemy.com/course/due-diligence/learn/lecture/43178814#overview",
    topic:
      "Read a DD report critically and identify which findings translate into Conditions Precedent vs Representations and Warranties vs Specific Indemnity Clauses. Understand how DD shapes the SPA negotiation.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S118",
    type: "learn",
    phase: 12,
    courseName: "Mastering Due Diligence in M&A and PE Transactions",
    title: "Due Diligence Report | Broad Layout",
    courseUrl:
      "https://www.udemy.com/course/due-diligence/learn/lecture/43178840#overview",
    topic:
      "Structure a DD report across its broad layout: executive summary, scope and limitations, key findings, and appendices. Understand how the report is structured to serve the buyer's investment decision.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S119",
    type: "learn",
    phase: 12,
    courseName: "Mastering Due Diligence in M&A and PE Transactions",
    title: "Chapters in Due Diligence Report",
    courseUrl:
      "https://www.udemy.com/course/due-diligence/learn/lecture/43178852#overview",
    topic:
      "Navigate the 11 standard DD report chapters: Corporate, Corporate Finance, Regulatory, Material Contracts, HR, Litigation, IP, IT/Data Privacy, Real Estate, Insurance, Environment. Identify which chapters are priority deep-dives for a bank acquisition.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S120",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Introduction to Credit Analysis",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52913269#overview",
    topic:
      "Articulate what credit analysis is and how it differs from equity analysis. Calculate the four core credit ratios: Interest Coverage Ratio, Net Leverage, DSCR, and Debt-to-Equity. Identify red flags in financial statements that signal credit deterioration.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S121",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Types of Fixed Income Securities",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52913793#overview",
    topic:
      "Distinguish senior secured, senior unsecured, subordinated, and high-yield debt. Understand bonds vs loans vs NCDs. Explain how instrument seniority determines recovery in default.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S122",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Financial Statement Analysis for Credit Risk",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52913925#overview",
    topic:
      "Apply FSA techniques specifically to credit risk assessment: identify deteriorating working capital patterns, rising leverage, declining interest coverage, and cash flow quality issues that signal credit stress.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S123",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Ratio Analysis in Credit Evaluation",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914083#overview",
    topic:
      "Calculate and interpret credit ratios: ICR, Net Leverage, Debt/EBITDA, DSCR, Fixed Charge Coverage. Understand threshold levels for investment-grade vs high-yield vs distressed credits.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S124",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Cash Flow Analysis and Debt Servicing Ability",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914147#overview",
    topic:
      "Derive a company's debt capacity from FCF projections. Calculate maximum sustainable debt at a target leverage ratio. Estimate probability of default from financial ratios and market signals. Calculate expected loss as PD × LGD × EAD.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S125",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Probability of Default (PD) and Expected Loss Calculations",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914329#overview",
    topic:
      "Calculate probability of default from financial ratios and structural models. Apply the expected loss framework: EL = PD × LGD × EAD. Interpret PD in the context of credit cycle positioning and regulatory capital requirements.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S126",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Credit Ratings and Risk Assessment",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52913881#overview",
    topic:
      "Explain credit rating methodology (Moody's, S&P, Fitch). Distinguish investment-grade from high-yield. Understand rating triggers and what causes rating transitions. Apply rating framework to assess HDFC Bank's rating headroom.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S127",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Bond Pricing, Yields, and Spreads",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914287#overview",
    topic:
      "Calculate yield-to-maturity and credit spread. Interpret the yield curve as a credit risk signal. Explain why a downgrade affects cost of capital quantitatively: spread widening → higher coupon → lower bond price.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S128",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Corporate Bonds vs. Sovereign Bonds",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52954323#overview",
    topic:
      "Distinguish corporate from sovereign bonds: risk-free rate vs credit risk premium, yield composition, default probability differences, and how corporate bond spreads are quoted relative to government benchmark yields.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S129",
    type: "watch",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Stress Testing and Scenario Analysis (Bank Re-watch)",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914631#overview",
    topic:
      "Build a stress test that tests covenant headroom under three downside scenarios. Apply stress to HDFC Bank: NIM compression, slippage rate increase, CASA decline — and quantify impact on ICR, Net Leverage, and DDM equity value.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S130",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "High-Yield and Distressed Debt Investing",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914703#overview",
    topic:
      "Interpret distressed debt pricing relative to recovery expectations. Understand high-yield covenant packages (incurrence vs maintenance), how PE firms use covenant flexibility, and how distressed debt investors price recovery.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S131",
    type: "learn",
    phase: 12,
    courseName: "Credit Analysis & Credit Risk Management Masterclass 2026",
    title: "Basel Regulations and Credit Risk Management",
    courseUrl:
      "https://www.udemy.com/course/credit-analysis-academy/learn/lecture/52914667#overview",
    topic:
      "Explain how Basel III capital requirements constrain bank lending behaviour. Understand Pillar 1 (minimum capital), Pillar 2 (supervisory review), and Pillar 3 (market discipline). Apply Basel framework to HDFC Bank's CET1 analysis.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M12-S132",
    type: "company-step",
    phase: 12,
    title: "HDFC Bank — Credit Memo + Mock CIM Read",
    companyId: "hdfc-m12",
    locked: true,
    apply: {
      focusDo:
        "Buy-side credit analysis of a published HDFC Bond/NCD issuance + buy-side DD on HDFC Bank as a hypothetical PE acquisition target. Use M7 model as financial backbone.",
      focusIgnore:
        "Re-running the DDM (already done in M7). Re-extracting financial statements (already done in M1).",
      learnBeforeValuation: [
        "Credit memo structure (recommendation → executive summary → financial profile → covenant analysis → risk factors)",
        "Tier 2 bond pricing mechanics for an Indian bank",
        "CIM red flags: hidden adjustments, peer cherry-picking, working capital normalisation tricks",
        "Indian mid-market M&A precedents (review 2 recent deals: ChrysCapital exit, Carlyle exit, Bain Capital portfolio)",
      ],
      valuationMethods: [],
      financialModels: [
        "5-page credit memo: NIM stability, GNPA/NNPA/PCR trend, CASA + CD ratio, CET1 headroom, ROA, cost-to-income",
        "Bond spread analysis: HDFC Bank vs peer banks (ICICI, Axis, Kotak) — sourced from NSE/Bloomberg with date",
        "Downgrade scenario: AAA → AA+ → cost-of-funds impact in bps + PAT impact in ₹ crore",
        "Credit BUY/HOLD/SELL recommendation with 3-line justification",
        "2-page mock CIM critique: ≥3 assumption-vs-data divergences with page references; 2 Q&A questions; DD chapter priority framework",
      ],
      additionalRequirements:
        "Credit memo must use bank-specific metrics (NIM, GNPA, CET1) — not corporate metrics (Net Debt/EBITDA). Bond spread analysis sourced from secondary market data with explicit date and source. Downgrade scenario quantifies both cost-of-funds impact (bps) and PAT impact (₹ crore). CIM critique identifies ≥3 assumption-vs-data divergences with specific page references.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Technical Thread — 'Why you CANNOT use DCF for a bank — and what to use instead'. Walk through DDM + Residual Income logic. Why NIM is the heartbeat of a bank's P&L.",
        },
        {
          day: 6,
          content:
            "📊 Model Drop — Share your GNPA waterfall screenshot. Show slippage → recovery → write-off mechanism + how credit cost hits PAT. Tag 2 observations.",
        },
        {
          day: 11,
          content:
            "🎤 Pitch Post — 1-page tear sheet image. BUY/SELL/NEUTRAL: growth vs credit risk in one paragraph. Include your target price.",
        },
      ],
    },
    build: {
      deliverable:
        "HDFC Bank Credit Memo + Mock CIM Read — Part A: 5-page credit memo with bank-specific metrics, bond spread analysis, downgrade scenario, credit recommendation; Part B: 2-page mock CIM critique with ≥3 assumption-vs-data divergences, 2 Q&A questions, DD chapter priority framework.",
      skillDemonstrated:
        "Credit Analysis & Debt Capacity; CIM / Information Memorandum — Buy-Side Reading; Q&A Process; Data Room Navigation; Advanced LBO — Covenant Modelling; Written Financial Communication",
      qualityBar:
        "Credit memo uses bank-specific metrics throughout. Bond spread analysis sourced with date and source. Downgrade scenario quantified in bps and ₹ crore. CIM critique identifies ≥3 assumption-vs-data gaps with page references.",
      deliverableRequired: true,
      acceptedFileTypes: [".pdf", ".docx", ".xlsx"],
    },
  },

  // ─── MODULE 13 — PITCHBOOKS & EQUITY RESEARCH (S133–S141, 9 steps: 7 learn + 1 company-step) ───
  {
    id: "M13-S133",
    type: "learn",
    phase: 13,
    courseName: "Excel, PowerPoint and Presentations for Investment Bankers",
    title: "Excel for Investment Bankers",
    courseUrl:
      "https://www.udemy.com/course/excel-powerpoint-presentations-for-investment-bankers/learn/lecture/7745360#overview",
    topic:
      "Use Excel like an analyst: keyboard-only navigation, M&A-specific formulas (financial functions, conditional statements, database lookups), and printing layout for client documents.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S134",
    type: "learn",
    phase: 13,
    courseName: "Excel, PowerPoint and Presentations for Investment Bankers",
    title: "PowerPoint for Investment Bankers",
    courseUrl:
      "https://www.udemy.com/course/excel-powerpoint-presentations-for-investment-bankers/learn/lecture/7753330#overview",
    topic:
      "Use PowerPoint with IB conventions: Slide Master setup, consistent text/table/shape styling, headers and footers, alignment guides, font hierarchy, and a restricted colour palette (black/grey/blue only).",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S135",
    type: "learn",
    phase: 13,
    courseName: "Excel, PowerPoint and Presentations for Investment Bankers",
    title: "Presentations",
    courseUrl:
      "https://www.udemy.com/course/excel-powerpoint-presentations-for-investment-bankers/learn/lecture/7753354#overview",
    topic:
      "Build every standard IB chart format to client-ready quality: column, bar, pie, line, scatter, bubble, sum-of-parts (football field), and dual-axis charts. Apply proper axis formatting, source notes, and footnoting.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S136",
    type: "learn",
    phase: 13,
    courseName: "Pitchbook | Pitch Deck for Investor Pitching",
    title: "Pitchbook Creation From Scratch",
    courseUrl:
      "https://www.udemy.com/course/pitchbook-pitch-deck-for-investor-pitching/learn/lecture/41394002#overview",
    topic:
      "Identify every section of an IB pitchbook (situation overview, deal rationale, valuation summary, comparable transactions, recommended approach). Differentiate a sell-side pitch book from a credentials book and a fairness opinion book.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S137",
    type: "learn",
    phase: 13,
    courseName: "Pitchbook | Pitch Deck for Investor Pitching",
    title: "Pitchbook Preparation",
    courseUrl:
      "https://www.udemy.com/course/pitchbook-pitch-deck-for-investor-pitching/learn/lecture/41394224#overview",
    topic:
      "Prepare the components of a pitchbook: situation analysis, company overview, industry analysis, valuation summary, recommended approach. Understand how each section supports the overall investment recommendation.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S138",
    type: "learn",
    phase: 13,
    courseName: "Pitchbook | Pitch Deck for Investor Pitching",
    title: "Anatomy Of A Pitch Book",
    courseUrl:
      "https://www.udemy.com/course/pitchbook-pitch-deck-for-investor-pitching/learn/lecture/41394578#overview",
    topic:
      "Analyse the anatomy of an IB pitchbook: how each slide type (cover, exec summary, situation overview, valuation, recommendation) functions within the overall narrative arc. Produce a structured pitchbook outline for a sell-side mandate.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S139",
    type: "learn",
    phase: 13,
    courseName: "Pitchbook | Pitch Deck for Investor Pitching",
    title: "Create Strip Profiles For Pitchbooks",
    courseUrl:
      "https://www.udemy.com/course/pitchbook-pitch-deck-for-investor-pitching/learn/lecture/41394324#overview",
    topic:
      "Build strip profile pages for pitchbooks: condensed peer-by-peer overview with logo, business summary, key financials, comparable multiples, and investor highlights — all in a tight, repeatable format.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S140",
    type: "learn",
    phase: 13,
    courseName: "Pitchbook | Pitch Deck for Investor Pitching",
    title: "Create Private Company Profiles For Pitchbooks",
    courseUrl:
      "https://www.udemy.com/course/pitchbook-pitch-deck-for-investor-pitching/learn/lecture/41394390#overview",
    topic:
      "Build private company profile pages for pitchbooks: company snapshot, ownership, business model, revenue mix, customer concentration, and comparable benchmark — using only AR data and press releases.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M13-S141",
    type: "company-step",
    phase: 13,
    title: "Zalando — Sell-Side Pitchbook",
    companyId: "zalando-m13",
    locked: true,
    apply: {
      focusDo:
        "Full 15-slide sell-side pitchbook for hypothetical Zalando sell-side mandate (€25/share assumed) + strip profiles for Infosys, ITC, and GYG using Course 16 teaser structure. Built on M1 Accounting Workbook + fresh DCF + comps tailored for the pitch.",
      focusIgnore:
        "Building new valuation models — pitchbook compiles existing work from M1 + M3 + M6 + M11 into pitch format",
      learnBeforeValuation: [
        "Sell-side pitchbook narrative arc (situation → strategic rationale → valuation → process)",
        "Football field chart construction",
        "Logo placement and consistent formatting",
        "Strip profile page format",
      ],
      valuationMethods: [
        "DCF (FCFF) — fresh build tailored for the pitchbook",
        "Trading Comps: EV/EBITDA, EV/Revenue (ASOS, Boohoo, Boozt, Nykaa)",
        "Precedent Transactions: European e-commerce M&A deals",
        "Football field chart aggregating DCF, Trading Comps, Precedent Transactions, 52-week trading range",
      ],
      financialModels: [
        "Zalando Pitchbook (15 slides): Cover → Executive Summary → Situation Overview → Industry Attractiveness (Porter's 5 Forces) → Company Overview → Strip Profile → Financial Performance → Valuation Summary (Football Field) → DCF Output → Trading Comps Output → Precedent Transactions → Deal Rationale → Recommended Approach (Buyer Universe + Process Timeline) → Key Risks → Recommendation",
        "Zalando DCF tab built on M1 IFRS Workbook (FCFF-based)",
        "Zalando comps (European e-commerce: ASOS, Boohoo, Boozt; broader: Nykaa, Meesho proxy)",
        "Football field chart aggregating all valuation methods",
        "3 strip profiles: Infosys (from M6 model), ITC (from M11 model), GYG (from M3 model)",
      ],
      additionalRequirements:
        "Slide Master consistently applied (every slide uses same template). Football field chart drawn to scale. Valuation bridge shows every bridge item: EV → net debt → minority interests → options/warrants → equity value per diluted share. Recommended price range explicitly cites M4 precedent transaction premiums with deals named. Strip profiles fit on one page each with source notes on every data point.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Personal Coverage Post — 'The return rate problem no one talks about in e-commerce valuations'. Zalando's contribution margin logic applied to Nykaa + Meesho.",
        },
        {
          day: 6,
          content:
            "📊 Model Drop — GMV → Revenue bridge screenshot (from the pitchbook). Take rate split: own inventory vs partner. One insight that changes how you value platforms.",
        },
        {
          day: 11,
          content:
            "🎤 Pitch Post — Tear sheet + EV/GMV comp vs Nykaa. BUY/SELL/NEUTRAL: what multiple does the market need to believe?",
        },
      ],
    },
    build: {
      deliverable:
        "Zalando Sell-Side Pitchbook — final deliverable: (1) 15-slide Zalando pitchbook PDF; (2) underlying Excel file containing IFRS workbook + DCF + comps + football field; (3) 3 strip profiles (Infosys, ITC, GYG) in IB format.",
      skillDemonstrated:
        "PowerPoint (IB Style); Slide Storytelling; Charts & Visuals — Football Field, Comps Tables; Full Pitchbook Creation; Strip Profiles; Written Financial Communication; Trading Comparables; DCF — FCFF-Based",
      qualityBar:
        "Slide Master consistently applied. Football field chart to scale. Valuation bridge shows every component. Recommended price range references M4 precedent transaction premiums explicitly with deals named. Strip profiles fit on one page each with source notes.",
      deliverableRequired: true,
      acceptedFileTypes: [".pptx", ".pdf", ".xlsx"],
    },
  },

  // ─── MODULE 14 — INTERVIEW PREP, DEAL TRACKING & NETWORKING (S143–S145, 3 steps: 1 learn + 1 watch + 1 company-step) ───
  {
    id: "M14-S142",
    type: "learn",
    phase: 14,
    courseName: "The Complete Investment Banking Course 2026",
    title: "Careers & Bonus",
    courseUrl:
      "https://www.udemy.com/course/the-complete-investment-banking-course-2016/learn/lecture/23629616#overview",
    topic:
      "Walk through IB career paths: Analyst → Associate → VP → Director → MD progression, bonus structures, exit options (PE, HF, corporate development, MBA). Identify the difference between bulge bracket vs elite boutique vs middle market trajectories.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M14-S143",
    type: "watch",
    phase: 14,
    courseName: "YouTube — Mergers & Inquisitions / Breaking Into Wall Street",
    title: "Merger Model Interview Questions: What to Expect (Final Re-watch)",
    courseUrl: "https://youtu.be/4jmyDxVHrGE?si=z2knJ8cQLTG6nNjN",
    topic:
      "Final re-watch from M9 as pre-interview prep. Answer 10+ merger model technical questions under interview pressure. After this final watch, answer each one fluently in under 60 seconds without reference to a model.",
    pattern: "A",
    learnChain: null,
    locked: true,
  },
  {
    id: "M14-S144",
    type: "company-step",
    phase: 14,
    title: "All Companies — Interview Prep, Deal Tracking & Networking",
    companyId: "all-m14",
    locked: true,
    apply: {
      focusDo:
        "Deal Log (4 weekly entries minimum, 3-sentence format) + Cold Outreach Tracker (10 active connections) + 10 recorded 3-minute pitch videos (one per practice company) + 3 mock interviews with self-critique notes + final 5 Paper LBO mental math drills",
      focusIgnore:
        "Building any new financial analysis — M14 uses completed model outputs from all prior BUILD steps only",
      learnBeforeValuation: [
        "Live deal sourcing: Mergermarket / Bloomberg / Reuters / Indian deal tracking (VCCircle, Inc42)",
        "Cold outreach pacing (5 messages/day × 9 days = 45 contacts)",
        "Mock interview rubric: technical accuracy, recommendation framing, communication clarity",
        "How to integrate live deals into networking conversations",
      ],
      valuationMethods: [],
      financialModels: [
        "Coverage Portfolio: single Excel file with one tab per company (Infosys, HDFC, Sun Pharma, Zalando, GYG, ITC, Zomato, L&T Tech, L&T, VW, Genting). Each tab summarises model, valuation range, current trading price, recommendation.",
        "Live Deal Tracker: 10 deals/week × 12 weeks = 120 deals minimum (deal type, sector, EV, multiples, advisors, key thesis, source)",
        "Outreach Tracker: 45 cold messages with mapping to specific company coverage and live deal context. 7-day follow-up cadence.",
        "Mock Interview Log: 4 mocks (DCF, LBO, M&A, Behavioural). Self-graded PDF rubric (technical accuracy / recommendation framing / communication clarity / time management). 90+ score on 4th attempt. Video recordings kept locally by the user — not uploaded to the platform.",
      ],
      additionalRequirements:
        "Coverage Portfolio file is single Excel — tabs match each company. Live Deal Tracker minimum 120 entries over 12 weeks (10/week pace must be sustained). Outreach messages reference a specific live deal or model output. Mock interview rubric tracks improvement quantitatively across the 4 attempts.",
      linkedInSchedule: [
        {
          day: 1,
          content:
            "🧵 Coverage Post — 'I built DCF, LBO, M&A, and credit models across 11 companies in 14 modules. Here's what I learned about how real analysts think about valuation.' Thread on the hardest insight from each module.",
        },
        {
          day: 6,
          content:
            "📊 Portfolio Drop — Coverage portfolio screenshot: 11 companies, one valuation range per company, one live deal tracked this week. The habit that separates analysts who get interviews from those who don't.",
        },
        {
          day: 12,
          content:
            "🎤 Pitch Post — Final tear sheet series. 10 companies. 10 investment recommendations. One consistent framework. Ready for the table.",
        },
      ],
    },
    build: {
      deliverable:
        "Final All-Companies Deliverable: (1) Coverage Portfolio Excel; (2) Live Deal Tracker — 12-week log; (3) Outreach Tracker — 45 messages with response logging; (4) Mock Interview Log PDF — self-graded rubric for 4 mocks (DCF, LBO, M&A, Behavioural) with scores and written commentary. Videos kept locally — not uploaded.",
      skillDemonstrated:
        "Technical Interview Preparation; Verbal Investment Thesis Articulation; Live Deal Tracking; Market Awareness; Cold Outreach & Networking Strategy; Paper LBO / Mental Math",
      qualityBar:
        "Coverage Portfolio summarises ALL prior modelling work. Live Deal Tracker has 120+ deals. Outreach references specific deals/models in each message. Mock interview rubric scores 90+ on the 4th attempt.",
      deliverableRequired: true,
      acceptedFileTypes: [".xlsx", ".pdf", ".docx"],
    },
  },
];
