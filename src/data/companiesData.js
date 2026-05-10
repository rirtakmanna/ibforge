/**
 * companiesData.js — Layer B (User-owned)
 *
 * OPERATOR RULE: Do not restructure. Edit field values only.
 * Schema changes (adding/removing fields) are unsafe and must go through Claude Project.
 *
 * CHAIN WORKBOOK CARRY: When an EXCEL_FILE entry says "This file persists into M{N}", the same
 *   workbook is re-uploaded at that later module's session. The user retrieves the clean version
 *   saved at the end of the prior module session and uploads it again. No new file is created —
 *   the same .xlsm is extended. Components rendering filesToUpload must display EXCEL_FILE items
 *   with this carry note visible when chainPosition > 1.
 *
 * SCHEMA (per entry):
 *   id:                string   — "{companySlug}-m{moduleNumber}" — globally unique
 *   name:              string   — Display name of the company
 *   displaySubtitle:   string | undefined — Optional. Display-only subtitle shown beneath the
 *                                 company name in UI components (e.g. "All 10 Companies —
 *                                 Coverage Portfolio…"). Only use for entries where the `name`
 *                                 field alone is insufficient to identify the module's scope.
 *                                 Currently used only by all-m14.
 *   sector:            string   — Industry/sector label (free text, used for display only)
 *   geography:         string   — Country/region (free text, used for display only)
 *   exchange:          string   — Stock exchange(s) where the company is listed
 *   module:            number   — Curriculum Module number (M1–M14). NOTE: this is NOT a BuildPhase.
 *                                 See ATLAS glossary: Module = curriculum unit; BuildPhase = web-app build stage.
 *   complexity:        "Beginner" | "Intermediate" | "Advanced"
 *                                 Canonical value set — do not use "Foundational". This field wins over
 *                                 any inferred value from inferComplexity() in the setup file.
 *   track:             "primary" | "parallel" | "standalone"
 *                                 "primary"    — part of a named multi-module chain (company recurs)
 *                                 "parallel"   — standalone entry co-occupying a module with a chain entry
 *                                 "standalone" — only entry at its module; not part of any chain
 *   chainId:           string | null — shared identifier for chain entries; null for standalone/parallel
 *   chainPosition:     number | null — position within chain (1, 2, 3…); null for standalone/parallel
 *   focusPriorityDo:   string   — What the AI must focus on for this module. Chain callout included if applicable.
 *   focusPriorityIgnore: string — What the AI must explicitly not do (held for another module or out of scope).
 *   financialStructure: string  — Structural description of the company for AI context.
 *   taskTypes:         string[] — Array of task categories from closed set:
 *                                 "Accounting / FSA" | "Financial Modeling" | "Valuation" |
 *                                 "Strategic Analysis" | "Investment Write-Up" | "Pitchbook" |
 *                                 "Credit Analysis" | "Verbal Pitch / Interview Prep" |
 *                                 "Networking / Portfolio Presentation"
 *   skillsTested:      string[] — Array of skill labels tested in this module.
 *   filesToUpload:     object[] — Prompt-assembly checklist of source documents to gather BEFORE starting.
 *                                 This is NOT a file-input validator. See acceptedFileTypes in roadmapData.js
 *                                 for upload component configuration.
 *                                 NOTE: Array position is canonical. Do not auto-sort by category.
 *                                 MANDATORY items intentionally appear before CONDITIONAL, then EXCEL_FILE,
 *                                 then DO_NOT_UPLOAD. Any component rendering filesToUpload must preserve
 *                                 array order, not re-sort by category string.
 *     .category:       "MANDATORY" | "CONDITIONAL" | "EXCEL_FILE" | "DO_NOT_UPLOAD"
 *     .description:    string   — Human-readable instruction for what to gather and why.
 *
 * MODULE CO-OCCUPANCY:
 *   Module 6:  infosys-m6 (primary/chain) + zomato-m6 (standalone)
 *   Module 10: sunpharma-m10 (primary/chain) + genting-m10 (parallel)
 *   Module 11: itc-m11 (primary/itc-chain) + lt-m11 (primary/lt-chain) — two distinct chain finals
 *   All other modules: single entry.
 *
 * CHAIN MAP (multi-module company recurrences):
 *   Infosys:    infosys-m1 → infosys-m6
 *   HDFC:       hdfc-m1 → hdfc-m7 → hdfc-m12
 *   Sun Pharma: sunpharma-m1 → sunpharma-m10
 *   Zalando:    zalando-m1 → zalando-m13
 *   GYG:        gyg-m2 → gyg-m3
 *   ITC:        itc-m4 → itc-m5 → itc-m11
 *   L&T:        lt-m8 → lt-m11 (CAUTION: lt-m8 = L&T Technology Services; lt-m11 = L&T parent conglomerate — different legal entities)
 */
export const companiesData = [
  {
    id: "infosys-m1",
    name: "Infosys",
    sector: "IT Services",
    geography: "India",
    exchange: "NSE/BSE",
    module: 1,
    complexity: "Beginner",
    track: "primary",
    chainId: "infosys",
    chainPosition: 1,
    focusPriorityDo:
      "Three-statement extraction + non-recurring normalisation + working capital ratios (DSO/DIO/DPO/CCC from AR line items) + IND-AS 116 lease capitalisation schedule. Part 1 of 2 in the Infosys chain — Accounting Workbook continues into M6.",
    focusPriorityIgnore:
      "Driver-based revenue model (headcount × utilisation × billing rate) — held for M6 (infosys-m6) where this workbook is reopened and extended.",
    financialStructure:
      "Capital-light; high cash conversion; USD revenue/INR cost structure creating natural FX exposure; minimal capex requirements; negative working capital tendency driven by advance billing and deferred revenue mechanics in large enterprise contracts.",
    taskTypes: ["Accounting / FSA"],
    skillsTested: [
      "Financial Statement Literacy",
      "Non-Recurring Item Identification & Normalisation",
      "Working Capital Anomaly Detection",
      "Lease Accounting — IND-AS 116 / IFRS 16",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports / 20-F (primary source — IND-AS financials, segment disclosures, footnotes on lease accounting and deferred revenue mechanics)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (segment revenue split, headcount disclosures, attrition data, utilisation rates)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (management guidance on growth, margin commentary, FX impact disclosure)",
      },
      {
        category: "MANDATORY",
        description:
          "IND-AS 116 / IFRS 16 lease schedule disclosures — extract from AR footnotes; required for operating lease normalisation in M1",
      },
      {
        category: "CONDITIONAL",
        description:
          "RBI/SEBI regulatory filings — only if Infosys files any material corporate governance disclosures separately from the main AR",
      },
      {
        category: "EXCEL_FILE",
        description:
          "Infosys_AccountingWorkbook_v1.xlsm — upload clean version only. Never upload drafts. This file persists into M6.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — contaminate reasoning with consensus thinking.",
      },
    ],
  },
  {
    id: "hdfc-m1",
    name: "HDFC Bank",
    sector: "Financial Institution",
    geography: "India",
    exchange: "NSE/BSE",
    module: 1,
    complexity: "Beginner",
    track: "primary",
    chainId: "hdfc",
    chainPosition: 1,
    focusPriorityDo:
      "Bank-specific FSA — loan book composition, yield on advances, cost of deposits, NIM reconciliation, GNPA/NNPA/PCR actuals from AR. Part 1 of 3 in the HDFC chain.",
    focusPriorityIgnore:
      "DDM construction (held for M7 where this workbook is reopened) and credit memo work (held for M12 — third and final use of HDFC).",
    financialStructure:
      "Leveraged balance sheet; deposit-funded with CASA ratio as a key cost-of-funds driver; NIM-driven P&L where net interest income is the primary revenue line; regulated capital structure where DCF does not apply because deposits function simultaneously as product and liability.",
    taskTypes: ["Accounting / FSA"],
    skillsTested: [
      "Financial Statement Literacy",
      "Bank-Specific Accounting — NIM, NPA, PCR",
      "Loan Book Decomposition",
      "Working Capital Anomaly Detection (bank context — funding stability)",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports (IND-AS / RBI format — NII, NIM, GNPA, NNPA, PCR, CASA ratio, capital adequacy disclosures under Basel III)",
      },
      {
        category: "MANDATORY",
        description:
          "RBI Pillar 3 / Basel III Capital Adequacy and Risk Disclosures — mandatory regulatory filing; required for CET1 baseline and asset quality verification",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (loan book split by segment, yield by segment, deposit cost split, GNPA waterfall disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (NIM trajectory commentary, slippage rate guidance, CASA mobilisation, segment-level loan growth)",
      },
      {
        category: "CONDITIONAL",
        description:
          "RBI Master Circulars on IRAC norms and NPA classification — only if modelling NPA slippage under specific regulatory scenarios; not required for M1 baseline FSA",
      },
      {
        category: "EXCEL_FILE",
        description:
          "HDFCBank_FSAExtractionWorkbook_v1.xlsm — upload clean version only. Never upload drafts. This file persists into M7 and M12.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — bank modelling requires regulatory filing precision; consensus views distort NIM and NPA assumptions.",
      },
    ],
  },
  {
    id: "sunpharma-m1",
    name: "Sun Pharmaceuticals",
    sector: "Pharma — India + US Generics",
    geography: "India / US",
    exchange: "NSE/BSE",
    module: 1,
    complexity: "Beginner",
    track: "primary",
    chainId: "sunpharma",
    chainPosition: 1,
    focusPriorityDo:
      "Three-statement basics + revenue by geography (US generics / India branded / EM / RoW) + R&D capitalisation policy + inventory composition (raw / WIP / finished). Part 1 of 2 in the Sun Pharma chain.",
    focusPriorityIgnore:
      "Pipeline rNPV, USFDA regulatory risk quantification, and pipeline probability-weighting — held for M10 where this workbook is reopened.",
    financialStructure:
      "Capital-light in generics to capital-intensive in specialty; binary cash flows driven by FDA approval events and import alert risk; geography-diversified revenue with structural US generics erosion offset by new specialty launches; revenue concentration risk at specific manufacturing facilities.",
    taskTypes: ["Accounting / FSA"],
    skillsTested: [
      "Financial Statement Literacy",
      "Non-Recurring Item Identification & Normalisation",
      "Revenue Recognition — Geography Decomposition",
      "Working Capital Anomaly Detection",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports / 20-F (IND-AS — revenue by geography, R&D spend, capex by facility, segment-level financials)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (geography revenue split, US generics vs India branded breakdown, R&D guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (geography commentary, US pricing erosion, India branded growth trajectory)",
      },
      {
        category: "MANDATORY",
        description:
          "Sun Pharma R&D capitalisation note from AR — required for distinguishing capitalised vs expensed R&D in normalised earnings",
      },
      {
        category: "CONDITIONAL",
        description:
          "Inventory composition note from AR (raw materials / WIP / finished goods) — only if material breakdown is disclosed; required for inventory days analysis by stage",
      },
      {
        category: "EXCEL_FILE",
        description:
          "SunPharma_AccountingWorkbook_v1.xlsm — upload clean version only. Never upload drafts. This file persists into M10.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — contaminate reasoning with consensus thinking.",
      },
    ],
  },
  {
    id: "zalando-m1",
    name: "Zalando SE",
    sector: "E-Commerce / Fashion Platform",
    geography: "Germany / Europe",
    exchange: "XETRA / Frankfurt",
    module: 1,
    complexity: "Beginner",
    track: "primary",
    chainId: "zalando",
    chainPosition: 1,
    focusPriorityDo:
      "IFRS three-statement extraction + GMV vs net revenue distinction + return rate disclosure + own-inventory vs marketplace presentation under IFRS 15. Part 1 of 2 in the Zalando chain.",
    focusPriorityIgnore:
      "Pitchbook construction, valuation summary, and football field charts — held for M13 where this workbook is reopened.",
    financialStructure:
      "Asset-light platform model combined with asset-heavy own-inventory logistics; GMV-driven with take rate split across own inventory (higher margin) and partner marketplace (lower margin); structural return rate drag of 30–50% of orders uniquely impairs contribution margin in fashion; IFRS 15 revenue recognition creates own-inventory vs marketplace revenue presentation differences that affect headline take rate comparisons.",
    taskTypes: ["Accounting / FSA"],
    skillsTested: [
      "Financial Statement Literacy",
      "Revenue Recognition — IFRS 15 Marketplace vs Own Inventory",
      "Working Capital Anomaly Detection",
      "Non-Recurring Item Identification & Normalisation",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5 Annual Reports (IFRS — GMV, own-inventory revenue vs partner marketplace revenue, return rate disclosures, take rate disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (take rate by channel, return rate trajectory, IFRS 15 application in Q&A discussions)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (return rate management, marketplace mix shift, contribution margin guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "IFRS 15 revenue recognition note from AR — required for own-inventory vs marketplace presentation split; take rate comparisons are not valid without this distinction",
      },
      {
        category: "CONDITIONAL",
        description:
          "IFRS 16 lease disclosure (logistics warehouse leases) — only if warehouse lease obligations are material to FCF bridge; relevant for normalised EBITDA calculation",
      },
      {
        category: "EXCEL_FILE",
        description:
          "Zalando_AccountingWorkbook_v1.xlsm — upload clean version only. Never upload drafts. This file persists into M13.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, e-commerce industry reports — contaminate reasoning with consensus thinking.",
      },
    ],
  },
  {
    id: "gyg-m2",
    name: "Guzman y Gomez (GYG)",
    sector: "QSR / Franchise",
    geography: "Australia / Global",
    exchange: "ASX",
    module: 2,
    complexity: "Beginner",
    track: "primary",
    chainId: "gyg",
    chainPosition: 1,
    focusPriorityDo:
      "Driver-based 3-statement model — store rollout (company-owned vs franchise), AUV-based revenue build, royalty income as separate stream, working capital schedule using Days methodology (DSO/DIO/DPO from AR), PPE roll-forward. Part 1 of 2 in the GYG chain.",
    focusPriorityIgnore:
      "Valuation and DCF — held for M3 (gyg-m3) where this model is reopened and valuation tabs are built on top.",
    financialStructure:
      "Asset-light (franchise royalties) combined with asset-heavy (company-owned stores); unit economics driven by AUV and store rollout; high growth / negative FCF phase due to new store investment programme; royalty stream structurally higher-margin than company-owned revenue.",
    taskTypes: ["Financial Modeling", "Accounting / FSA"],
    skillsTested: [
      "3-Statement Integrated Model",
      "Working Capital Schedule (Days-Based)",
      "PPE Roll-Forward & Depreciation Schedule",
      "Driver-Based Revenue Model",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 3–5 Annual Reports (ASX Annual Report format — store count, AUV, franchise vs company-owned revenue split, royalty income disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (store rollout pipeline, AUV targets, network economics, segment revenue breakdown)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call / Investor Day Transcripts (management commentary on AUV trends, store economics, international rollout pace)",
      },
      {
        category: "MANDATORY",
        description:
          "ASX Appendix 4E / Half-Year Results (H1 financials — required for WC and PPE roll-forward at interim period)",
      },
      {
        category: "CONDITIONAL",
        description:
          "Lease schedule disclosures (AASB 16 right-of-use assets) — only if store lease obligations are separately disclosed outside the main AR; required for PPE roll-forward accuracy",
      },
      {
        category: "CONDITIONAL",
        description:
          "Franchise Disclosure Document or Franchise Agreement summary — only if publicly filed or disclosed; relevant to royalty rate assumption anchoring",
      },
      {
        category: "EXCEL_FILE",
        description:
          "GuzmanYGomez_3StatementModel_v1.xlsm — upload clean version only. Never upload drafts. This file persists into M3.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — contaminate reasoning with consensus thinking.",
      },
    ],
  },
  {
    id: "gyg-m3",
    name: "Guzman y Gomez (GYG)",
    sector: "QSR / Franchise",
    geography: "Australia / Global",
    exchange: "ASX",
    module: 3,
    complexity: "Beginner",
    track: "primary",
    chainId: "gyg",
    chainPosition: 2,
    focusPriorityDo:
      "WACC construction from market inputs (Australian 10-year G-bond rate, peer-unlevered beta re-levered to GYG, ERP 5.5%) + FCFF bridge mechanics + DCF with Gordon Growth and EV/EBITDA exit multiple terminal values + two sensitivity tables (WACC × growth; WACC × exit multiple) + Reverse DCF tab. Built on top of the M2 3-statement model. Part 2 of 2 (FINAL USE) in the GYG chain.",
    focusPriorityIgnore:
      "Deep terminal value sensitivity parameter expansion — run sensitivity after DCF is built, not before.",
    financialStructure:
      "Asset-light (franchise royalties) combined with asset-heavy (company-owned stores); unit economics driven by AUV and store rollout; high growth / negative FCF phase due to new store investment programme; royalty stream structurally higher-margin than company-owned revenue.",
    taskTypes: ["Financial Modeling", "Valuation", "Accounting / FSA"],
    skillsTested: [
      "DCF — FCFF-Based",
      "WACC Construction",
      "Terminal Value Mechanics & Sanity Checks",
      "Scenario & Sensitivity Analysis",
      "Reverse DCF",
      "Capex Classification",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 3–5 Annual Reports (ASX format — primary source for FCF history, capex by store type, debt structure)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (WACC inputs: beta reference, target capital structure, long-term growth targets disclosed by management)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (terminal growth anchors, long-run AUV guidance, management comments on reinvestment rate)",
      },
      {
        category: "MANDATORY",
        description:
          "ASX-listed peer Annual Reports or investor presentations — McDonald's Australia, Collins Foods — for trading comps beta and WACC triangulation",
      },
      {
        category: "CONDITIONAL",
        description:
          "Australian Government Bond yield data (10-year) — only needed as risk-free rate input for WACC construction; source from RBA or ASX publicly available data",
      },
      {
        category: "CONDITIONAL",
        description:
          "Bloomberg / Refinitiv beta export — only if peer beta unlevering requires data terminal access; otherwise calculate from price history of public ASX peers",
      },
      {
        category: "EXCEL_FILE",
        description:
          "GuzmanYGomez_DCFModel_v1.xlsm — upload clean version only. Never upload drafts. Built on the M2 model.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — DCF inputs must be built from primary disclosures and market data, not consensus.",
      },
    ],
  },
  {
    id: "itc-m4",
    name: "ITC Limited",
    sector: "Conglomerate FMCG",
    geography: "India",
    exchange: "NSE/BSE",
    module: 4,
    complexity: "Intermediate",
    track: "primary",
    chainId: "itc",
    chainPosition: 1,
    focusPriorityDo:
      "Per-segment trading comps (FMCG, Cigarettes, Hotels, Agri-Business) with pure-play peer selection + EBIT adjustments with footnote citations + EV bridge per peer + precedent transaction analysis (5 Indian FMCG/cigarette/hotel deals) with deal multiples and control premiums. Part 1 of 3 in the ITC chain.",
    focusPriorityIgnore:
      "Capital allocation analysis (held for M5 — itc-m5) and full SOTP valuation (held for M11 — itc-m11). Stay focused on comps mechanics only.",
    financialStructure:
      "Multi-segment conglomerate spanning Cigarettes (cash-generative, regulated, declining volume), FMCG (margin-scaling), Hotels (asset-heavy, cyclical), Agri-Business (commodity-linked), and Paper (capital-intensive). Each segment has different working capital, capex, and margin profiles — making blended multiples structurally misleading.",
    taskTypes: ["Financial Modeling", "Valuation"],
    skillsTested: [
      "Trading Comparables",
      "Precedent Transactions",
      "Segment-Level Modelling",
      "Peer Selection Rationale",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports (IND-AS — segment financials per IND-AS 108: Cigarettes, FMCG, Hotels, Agri-Business, Paper)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (segment growth targets, margin trajectory by segment, capital deployment guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "Pure-play peer Annual Reports — HUL, Britannia, Nestlé India (FMCG); Godfrey Phillips (Cigarettes); Indian Hotels, Lemon Tree (Hotels); Olam, Tata Consumer (Agri-Business)",
      },
      {
        category: "MANDATORY",
        description:
          "Indian FMCG, cigarette, and hotel M&A precedent transaction database — last 5 years; sourced from SEBI / VCCircle / press disclosures with deal multiples and control premiums",
      },
      {
        category: "CONDITIONAL",
        description:
          "Last 4 Earnings Call Transcripts — only if segment-level margin commentary is needed for peer EBIT adjustments",
      },
      {
        category: "EXCEL_FILE",
        description:
          "ITC_TradingCompsAndPrecedents_v1.xlsm — upload clean version only. Never upload drafts. This file persists into M5 and M11.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — peer multiples must be calculated from primary financial disclosures, not aggregator data.",
      },
    ],
  },
  {
    id: "itc-m5",
    name: "ITC Limited",
    sector: "Conglomerate FMCG",
    geography: "India",
    exchange: "NSE/BSE",
    module: 5,
    complexity: "Intermediate",
    track: "primary",
    chainId: "itc",
    chainPosition: 2,
    focusPriorityDo:
      "Capital allocation history (5 years per segment: capex, M&A, dividends, buybacks) + IRR of FMCG segment investment vs WACC + Porter's Five Forces per segment with quantitative anchors + moat assessment per segment (ROIC evidence) + cigarette excise sensitivity table (elasticity-driven) + FMCG margin bridge vs HUL benchmark. Part 2 of 3 in the ITC chain — built on top of M4 workbook.",
    focusPriorityIgnore:
      "Full SOTP valuation — held for M11 (itc-m11) where M4 + M5 outputs feed into the consolidated SOTP build.",
    financialStructure:
      "Multi-segment conglomerate spanning Cigarettes (cash-generative, regulated, declining volume), FMCG (margin-scaling), Hotels (asset-heavy, cyclical), Agri-Business (commodity-linked), and Paper (capital-intensive). Each segment has different working capital, capex, and margin profiles — making blended multiples structurally misleading.",
    taskTypes: ["Strategic Analysis", "Accounting / FSA"],
    skillsTested: [
      "Capital Allocation",
      "Porter's Five Forces",
      "Moat Analysis",
      "Volume-Price-Mix (VPM) Analysis",
      "Margin Bridge",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports (IND-AS — segment-level capex, segment EBIT, segment-level capital employed for IRR calculation)",
      },
      {
        category: "MANDATORY",
        description:
          "ITC capital allocation history — capex by segment, M&A spend, dividends, buybacks (extract from cash flow statements and notes for last 5 years)",
      },
      {
        category: "MANDATORY",
        description:
          "Indian cigarette excise duty history (Union Budget) — required for cigarette excise sensitivity table with realistic elasticity",
      },
      {
        category: "MANDATORY",
        description:
          "HUL Annual Reports (last 5 years) — required for FMCG margin bridge benchmarking at comparable revenue scale",
      },
      {
        category: "MANDATORY",
        description:
          "Britannia and Nestlé India Annual Reports — required for FMCG segment moat assessment quantitative anchors (ROIC, market share)",
      },
      {
        category: "CONDITIONAL",
        description:
          "Cigarette industry market share / consumption data — only if regulatory or industry sources publish formal volume data; required for VPM decomposition rigour",
      },
      {
        category: "EXCEL_FILE",
        description:
          "ITC_StrategicAnalysisWorkbook_v1.xlsm — upload clean version only. Never upload drafts. Built on M4 workbook. Persists into M11.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — strategic analysis must use primary segment disclosures; consensus moat narratives are not analytical.",
      },
    ],
  },
  {
    id: "infosys-m6",
    name: "Infosys",
    sector: "IT Services",
    geography: "India",
    exchange: "NSE/BSE",
    module: 6,
    complexity: "Advanced",
    track: "primary",
    chainId: "infosys",
    chainPosition: 2,
    focusPriorityDo:
      "Driver tree (headcount × utilisation × billing rate per service line sourced from AR) + attrition mechanism (attrition reduces utilisation via formula, not EBIT override) + FX sensitivity (USD/INR ±5%) + 3-statement model linked from driver tree + DCF with peer-derived beta (TCS, Wipro, HCL re-levered) + Reverse DCF solving for implied utilisation and headcount CAGR. Built on top of M1 Accounting Workbook. Part 2 of 2 (FINAL USE) in the Infosys chain.",
    focusPriorityIgnore:
      "Bank-style modelling, conglomerate SOTP, or merger model work — Infosys is an asset-light services business and the model should not borrow from those frameworks.",
    financialStructure:
      "Capital-light; high cash conversion; USD revenue/INR cost structure creating natural FX exposure; minimal capex requirements; revenue economically derived from billable headcount × utilisation × billing rate, with attrition impacting margin via utilisation drop and ramp-time loss.",
    taskTypes: ["Financial Modeling", "Valuation"],
    skillsTested: [
      "Driver-Based Revenue Model",
      "Segment-Level Modelling",
      "Scenario & Sensitivity Analysis",
      "DCF — FCFF-Based",
      "Reverse DCF",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5 Annual Reports (IND-AS / 20-F — service line revenue split: Digital, Cloud & Infra, Core Engineering, Data Analytics; headcount, utilisation, billing rate disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (service line growth guidance, attrition trajectory, utilisation targets, billing rate evolution)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (large deal TCV, attrition commentary, FX hedging policy disclosure, utilisation guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "Peer Annual Reports — TCS, Wipro, HCLTech — for peer beta unlevering and re-levering to Infosys capital structure",
      },
      {
        category: "MANDATORY",
        description:
          "Indian Government Bond yield data (10-year G-Sec) — risk-free rate input for Infosys WACC",
      },
      {
        category: "CONDITIONAL",
        description:
          "FX hedging note from AR — only if hedging programme is material to FX sensitivity scenarios; required for accurate translation vs transaction exposure modelling",
      },
      {
        category: "EXCEL_FILE",
        description:
          "Infosys_DriverModelAndDCF_v1.xlsm — upload clean version only. Built on M1 Accounting Workbook.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — driver model must reconcile to AR-disclosed headcount and utilisation; consensus growth assumptions distort the build.",
      },
    ],
  },
  {
    id: "zomato-m6",
    name: "Zomato (Eternal)",
    sector: "Platform / New-Age Tech",
    geography: "India",
    exchange: "NSE/BSE",
    module: 6,
    complexity: "Advanced",
    track: "standalone",
    chainId: null,
    chainPosition: null,
    focusPriorityDo:
      "Segment GMV driver model (orders × AOV by segment) + take-rate bridge per segment (sourced from AR — not assumed) + contribution margin per segment + path-to-EBITDA schedule (contribution margin − corporate overhead) + SOTP (Food Delivery at EV/EBITDA; Blinkit at EV/GMV or EV/Revenue; Hyperpure B2B at EV/Revenue) + bear case (ONDC + Swiggy take rate compression −150 bps + order volume −15%) + Reverse DCF implied GMV CAGR. Single use (FINAL).",
    focusPriorityIgnore:
      "Deep cohort modelling and customer LTV decomposition — keep contribution margin work at segment level only.",
    financialStructure:
      "Multi-segment platform: Food Delivery (asset-light, contribution-positive marketplace), Blinkit (q-commerce, asset-heavy dark stores, currently burning cash), Hyperpure (B2B supply business). GMV-driven revenue; take rate compression risk from competitive response; segment-level contribution margins differ by 20+ percentage points.",
    taskTypes: ["Financial Modeling", "Valuation", "Investment Write-Up"],
    skillsTested: [
      "Driver-Based Revenue Model",
      "Segment-Level Modelling",
      "Platform and Network Economics",
      "SOTP — Sum of the Parts Valuation",
      "Reverse DCF",
      "Scenario & Sensitivity Analysis",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 4 Annual Reports / Red Herring Prospectus (IND-AS — GMV, net revenue, contribution margin per segment: Food Delivery, Blinkit, Hyperpure, Going-Out)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation and Quarterly Shareholders Letters (segment-level GMV growth, take rate disclosure, contribution margin trajectory, EBITDA bridge)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 6 Earnings Call Transcripts (Blinkit dark store rollout pace, ONDC competitive commentary, Swiggy delta, AOV trajectory)",
      },
      {
        category: "MANDATORY",
        description:
          "ONDC public disclosures and partnership announcements — required for bear case mechanism (take rate compression scenario)",
      },
      {
        category: "MANDATORY",
        description:
          "Swiggy DRHP / IPO Prospectus (when filed) and any subsequent Annual Report — required for take rate and unit economics benchmarking",
      },
      {
        category: "CONDITIONAL",
        description:
          "Domino's India / Jubilant FoodWorks Annual Reports — only if direct online food delivery comp data is needed for AOV and margin benchmarking",
      },
      {
        category: "EXCEL_FILE",
        description:
          "Zomato_SOTPAndReverseDCF_v1.xlsm — upload clean version only. Never upload drafts.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, food-tech industry reports — take rates must be derived from disclosed GMV and revenue; assumed rates distort SOTP.",
      },
    ],
  },
  {
    id: "hdfc-m7",
    name: "HDFC Bank",
    sector: "Financial Institution",
    geography: "India",
    exchange: "NSE/BSE",
    module: 7,
    complexity: "Intermediate",
    track: "primary",
    chainId: "hdfc",
    chainPosition: 2,
    focusPriorityDo:
      "Bank P&L (NII → other income → opex → pre-provision profit → provisions → PAT) + GNPA waterfall (opening + slippages − recoveries − write-offs = closing) + capital adequacy tracker (CET1 ratio each year → maximum sustainable dividend) + DDM with CET1-constrained payout (5-year dividend projections → Gordon Growth terminal) + P/B comps (HDFC vs Kotak, ICICI, Axis) + bear case (NPA stress — slippage rate +200 bps). Built on top of M1 FSA Extraction Workbook. Part 2 of 3 in the HDFC chain.",
    focusPriorityIgnore:
      "Credit memo and CIM critique work — held for M12 (hdfc-m12) where this model becomes the financial backbone for credit analysis.",
    financialStructure:
      "Leveraged balance sheet; deposit-funded with CASA ratio as a key cost-of-funds driver; NIM-driven P&L where net interest income is the primary revenue line; regulated capital structure with CET1 adequacy ratio constraining sustainable dividend payout; provisions-driven earnings risk tied to credit cycle and GNPA slippage rates.",
    taskTypes: ["Financial Modeling", "Valuation", "Investment Write-Up"],
    skillsTested: [
      "Bank Financial Modelling (NII-Based)",
      "DDM — Dividend Discount Model",
      "Bank-Specific Accounting — NIM, NPA, PCR, CET1",
      "Scenario & Sensitivity Analysis",
      "Verbal Investment Thesis Articulation",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports (IND-AS / RBI format — NII, NIM, GNPA, NNPA, PCR, CASA ratio, capital adequacy disclosures under Basel III)",
      },
      {
        category: "MANDATORY",
        description:
          "RBI Pillar 3 / Basel III Capital Adequacy and Risk Disclosures — mandatory regulatory filing; required for CET1-constrained dividend model and capital ratio verification",
      },
      {
        category: "MANDATORY",
        description:
          "Financial Stability Report (FSR) — RBI semi-annual publication; required for systemic NPA slippage rate benchmarks and macro credit cycle inputs",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (NIM decomposition, segment loan book split, GNPA waterfall disclosures, DDM payout ratio guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4–6 Earnings Call Transcripts (NIM guidance, slippage rate commentary, credit cost trajectory, CASA mobilisation targets, CET1 buffer management)",
      },
      {
        category: "MANDATORY",
        description:
          "HDFC Bank–HDFC Ltd merger disclosures (exchange ratio, combined balance sheet, pro-forma NIM impact) — material to any post-merger NIM and capital model",
      },
      {
        category: "MANDATORY",
        description:
          "Peer bank Annual Reports — Kotak Mahindra Bank, ICICI Bank, Axis Bank — for P/B comps and ROE comparison",
      },
      {
        category: "CONDITIONAL",
        description:
          "RBI Master Circulars on IRAC norms and NPA classification — only if modelling NPA slippage and provision coverage under specific regulatory scenarios; required for bear case stress",
      },
      {
        category: "EXCEL_FILE",
        description:
          "HDFCBank_FinancialModelAndDDM_v1.xlsm — upload clean version only. Built on M1 FSA Extraction Workbook. Persists into M12.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles, credit agency summaries — bank modelling requires regulatory filing precision; consensus views distort NPA and NIM assumptions.",
      },
    ],
  },
  {
    id: "lt-m8",
    name: "L&T Technology Services",
    // CAUTION: lt-m8 is L&T Technology Services (listed subsidiary) — NOT Larsen & Toubro parent.
    // lt-m11 is the L&T parent conglomerate. Different companies, different models, same chain prefix.
    sector: "IT Services (Listed Subsidiary of L&T Conglomerate)",
    geography: "India",
    exchange: "NSE/BSE",
    module: 8,
    complexity: "Advanced",
    track: "primary",
    chainId: "lt",
    chainPosition: 1,
    focusPriorityDo:
      "Full LBO model for hypothetical PE buyout at 18× EV/EBITDA entry, 60% debt funded (senior 3.5× EBITDA; mezzanine 1.5× EBITDA; revolver), 3-year hold, 15× exit — sources & uses tab, opening BS at transaction (with goodwill), drivers sheet, 3-year P&L to EBITDA, working capital schedule, fixed asset roll-forward, debt schedule with cash sweep, revolver with circularity, IRR/MOIC at exit multiples 13×/15×/17×, sensitivity table (entry multiple × revenue CAGR), covenant tests tab (leverage ratio max 5.5×; ICR min 2.0×) with bear scenario remedy plan. Part 1 of 2 in the L&T chain (lt-m8 = L&T Technology Services; distinct entity from lt-m11 which is L&T parent conglomerate).",
    focusPriorityIgnore:
      "Full L&T conglomerate SOTP — that is a separate company and a separate exercise (lt-m11). L&T Tech is an LBO simulation candidate because its standalone financials are cleanly visible.",
    financialStructure:
      "Asset-light IT services subsidiary with stable EBITDA generation, predictable working capital, and a cash-generative profile — making it a natural LBO simulation target. Hypothetical buyout assumes 18× EV/EBITDA entry, 60% debt funded across senior secured (3.5× EBITDA) and mezzanine (1.5× EBITDA), 3-year hold, 15× exit. Covenant headroom is the critical risk under stress.",
    taskTypes: ["Financial Modeling", "Valuation"],
    skillsTested: [
      "LBO Model",
      "Debt Schedule & Interest Mechanics",
      "LBO Return Analysis (IRR / MOIC)",
      "Circularity Handling",
      "Advanced LBO — Covenant Modelling",
      "Scenario & Sensitivity Analysis",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5 Annual Reports (IND-AS — service line revenue, EBITDA, working capital, capex, debt structure, dividend history)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (service line growth, EBITDA margin trajectory, capital allocation history)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (deal pipeline, margin guidance, large deal TCV)",
      },
      {
        category: "MANDATORY",
        description:
          "Indian PE precedent transaction database (last 5 years, IT services acquisitions) — for entry multiple benchmarking and exit multiple anchoring",
      },
      {
        category: "MANDATORY",
        description:
          "Indian corporate bond yield data (5-year, 7-year — AA-rated and BB-rated) — required for senior and mezzanine debt cost assumptions",
      },
      {
        category: "CONDITIONAL",
        description:
          "Sample LBO covenant package from a public bond prospectus or syndicated loan term sheet — only if specific covenant ratios (leverage, ICR maintenance) need anchoring; otherwise use industry-standard ranges",
      },
      {
        category: "EXCEL_FILE",
        description:
          "LandTTechServices_LBOModel_v1.xlsm — upload clean version only. Never upload drafts.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — LBO mechanics must be built from primary financials; PE consensus exit assumptions distort IRR sensitivity.",
      },
    ],
  },
  {
    id: "vw-m9",
    name: "Volkswagen AG",
    sector: "Automotive — Conglomerate (VW + Porsche + Audi + Skoda + others)",
    geography: "Germany / Global",
    exchange: "Frankfurt / XETRA",
    module: 9,
    complexity: "Advanced",
    track: "standalone",
    chainId: null,
    chainPosition: null,
    focusPriorityDo:
      "Hypothetical merger of VW with Stellantis or Renault — standalone P&Ls, transaction assumptions (30% premium; 40% cash / 40% stock / 20% debt), PPA with 3 intangible categories (brand, customer relationships, technology IP) at 7-year amortisation + residual goodwill + DTL on write-ups, combined P&L with €500M synergies phased 25%/75%/100% over 3 years (tax-effected), EPS accretion/dilution table for Y1/Y2/Y3 across all three financing scenarios, sensitivity at 20%/30%/40% premium, Pro-forma vs GAAP EPS bridge for Y1, written 1-page investment memo (BUY/SELL). Single use (FINAL — VW had WATCH-only context in M3 and M4).",
    focusPriorityIgnore:
      "Brand-by-brand SOTP of VW — keep at standalone P&L level for the merger model. Deep currency hedging analysis.",
    financialStructure:
      "Multi-brand automotive conglomerate with capital-intensive operations, cyclical earnings, embedded financing arm (VW Financial Services) that creates deposit-like liabilities, and substantial NCI from listed Porsche stake. M&A synergies in auto typically come from procurement (largest), platform sharing, and R&D consolidation — phased 25/75/100 over 3 years.",
    taskTypes: ["Financial Modeling", "Valuation", "Investment Write-Up"],
    skillsTested: [
      "Accretion/Dilution Model (M&A)",
      "Advanced Merger Model — PPA, DTL, GAAP vs Cash EPS",
      "Goodwill & Purchase Price Allocation (Transaction)",
      "M&A Process — Buy-Side",
      "Valuation in M&A Context — Control Premium",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Volkswagen AG Last 5 Annual Reports (IFRS — segment financials by brand, NCI structure including Porsche AG listed stake, debt structure including VW Financial Services)",
      },
      {
        category: "MANDATORY",
        description:
          "Stellantis or Renault Last 3–5 Annual Reports (IFRS — target standalone financials for the hypothetical merger)",
      },
      {
        category: "MANDATORY",
        description:
          "VW Latest Investor Presentation and Capital Markets Day (brand-level performance, EV transition capex, partnership announcements)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts — VW and target (margin trajectory, regional commentary, EV transition costs)",
      },
      {
        category: "MANDATORY",
        description:
          "European auto M&A precedent transactions (last 10 years) — FCA/PSA merger to form Stellantis, Geely/Volvo, BMW/Mini — for premium and synergy benchmarking",
      },
      {
        category: "CONDITIONAL",
        description:
          "European Commission and German Federal Cartel Office filings on auto M&A — only if regulatory approval is part of the deal narrative; otherwise treat as 'subject to regulatory clearance' assumption",
      },
      {
        category: "CONDITIONAL",
        description:
          "Auto industry intangible asset valuation studies — only if PPA category amortisation periods (brand vs technology vs customer relationships) need third-party benchmarking",
      },
      {
        category: "EXCEL_FILE",
        description:
          "VW_MergerModel_v1.xlsm — upload clean version only. Never upload drafts.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, auto industry M&A consultant reports — synergy assumptions and premium ranges must be derived from precedent transactions, not consensus assumptions.",
      },
    ],
  },
  {
    id: "sunpharma-m10",
    name: "Sun Pharmaceuticals",
    sector: "Pharma — India + US Generics",
    geography: "India / US",
    exchange: "NSE/BSE",
    module: 10,
    complexity: "Advanced",
    track: "primary",
    chainId: "sunpharma",
    chainPosition: 2,
    focusPriorityDo:
      "Geography revenue model with mechanical US generics erosion (opening product revenue × (1 − erosion rate) + new launch ramp) + specialty pipeline rNPV (5 assets: probability-weighted cash flows × discount factor; unrisked vs risk-adjusted side-by-side; probabilities sourced from BIO/Trialtrove benchmarks) + USFDA warning letter downside (facility-level revenue at risk from AR concentration disclosure) + full 3-statement model + base business DCF (ex-pipeline) + SOTP (base DCF + pipeline rNPV) + bear case (FDA import alert on primary US facility). Built on top of M1 Accounting Workbook. Part 2 of 2 (FINAL USE) in the Sun Pharma chain.",
    focusPriorityIgnore:
      "Deep M&A history — focus on current business structure and pipeline, not historical deal analysis.",
    financialStructure:
      "Capital-light in generics to capital-intensive in specialty; binary cash flows driven by FDA approval events and import alert risk; geography-diversified revenue with structural US generics erosion offset by new specialty launches; USFDA regulatory risk concentrated at specific manufacturing facilities creates facility-level revenue concentration risk.",
    taskTypes: ["Financial Modeling", "Valuation", "Investment Write-Up"],
    skillsTested: [
      "Probability-Weighted NPV / rNPV (Pharma)",
      "Regulatory and Pipeline Risk Quantification",
      "SOTP — Sum of the Parts Valuation",
      "DCF — FCFF-Based",
      "Scenario & Sensitivity Analysis",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports / 20-F (IND-AS — revenue by geography: India branded generics, US generics, specialty; R&D spend, capex by facility)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (pipeline disclosure by molecule, probability of approval estimates, specialty vs generics revenue split guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4–6 Earnings Call Transcripts (USFDA import alert status, facility remediation updates, specialty launch trajectory, US pricing erosion commentary)",
      },
      {
        category: "MANDATORY",
        description:
          "USFDA 483 Observations, Warning Letters, and Import Alert notices for Sun Pharma facilities — public USFDA database; required for facility-level regulatory risk quantification",
      },
      {
        category: "MANDATORY",
        description:
          "Sun Pharma R&D pipeline disclosures — ANDA filings, NDA approvals, clinical trial status reports filed with SEC or disclosed in AR; required for rNPV probability-weighting",
      },
      {
        category: "MANDATORY",
        description:
          "BIO / Trialtrove industry probability of approval benchmarks by therapeutic area and trial stage — required as cited probability source for rNPV (do not assume probabilities)",
      },
      {
        category: "CONDITIONAL",
        description:
          "Royalty Pharma or comparable pharma royalty transaction precedents — only if rNPV terminal value requires triangulation against market-implied pipeline values",
      },
      {
        category: "CONDITIONAL",
        description:
          "IQVIA / IMS market share data for key molecules — only if publicly available; required for US generics erosion rate assumptions in bear case",
      },
      {
        category: "EXCEL_FILE",
        description:
          "SunPharma_GeographyAndPipelineModel_v1.xlsm — upload clean version only. Built on M1 Accounting Workbook.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, screener exports, Wikipedia, pharma industry newsletters, broker pipeline valuations — rNPV must be built from first principles using company-disclosed trial data and USFDA records only.",
      },
    ],
  },
  {
    id: "genting-m10",
    name: "Genting Singapore Ltd",
    sector: "Gaming / Integrated Resort",
    geography: "Singapore",
    exchange: "SGX",
    module: 10,
    complexity: "Advanced",
    track: "parallel",
    chainId: null,
    chainPosition: null,
    focusPriorityDo:
      "GGR driver model (VIP segment: rolling chip volume × hold rate; mass segment: visitor volume × spend per visitor × win rate) + VIP vs mass EBITDA margin bridge (margins differ by ≥25 ppts sourced from AR) + FCF bridge (EBITDA → CFO → FCF) + full 3-statement model + EV/EBITDA comps (Las Vegas Sands, Melco International, Wynn Macau, Galaxy Entertainment, Delta Corp) + DCF with capex intensity scenario (base: maintenance; bull: no expansion; bear: new expansion) + Reverse DCF (implied GGR CAGR at current EV) + bear case (GGR compression: arrivals −20%, VIP volume −30%, mass hold rate −50 bps). Single use (FINAL).",
    focusPriorityIgnore:
      "Deep regulatory licensing analysis — accept the Singapore duopoly structure as given (MBS vs RWS) and focus on operational and valuation work.",
    financialStructure:
      "Capital-intensive integrated resort with binary segment economics: VIP segment (10–15% EBITDA margin, volatile hold rate, high regulatory scrutiny) and mass segment (40–50% EBITDA margin, more stable, tourism-driven). Singapore duopoly with Marina Bay Sands creates structural pricing power but also regulatory cap on aggressive expansion.",
    taskTypes: ["Financial Modeling", "Valuation", "Investment Write-Up"],
    skillsTested: [
      "Driver-Based Revenue Model",
      "Trading Comparables",
      "DCF — FCFF-Based",
      "Reverse DCF",
      "Scenario & Sensitivity Analysis",
      "Segment-Level Modelling",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5 Annual Reports (SGX — segment financials: VIP rolling chip volume, hold rate, mass visitor count, spend per visitor, EBITDA margins by segment)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (RWS expansion plans, VIP vs mass mix evolution, tourism arrival data dependencies)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (China VIP recovery commentary, mass tourism trajectory, capex on RWS 2.0 expansion)",
      },
      {
        category: "MANDATORY",
        description:
          "Peer Annual Reports — Las Vegas Sands, Melco International, Wynn Macau, Galaxy Entertainment, Delta Corp (India) — for EV/EBITDA comps and DCF triangulation",
      },
      {
        category: "MANDATORY",
        description:
          "Singapore Tourism Board arrival statistics — required for mass segment driver model (visitor volume input)",
      },
      {
        category: "CONDITIONAL",
        description:
          "Macau VIP crackdown 2014–2015 historical data and 2020 COVID period data — required for bear case calibration; sourced from peer Annual Reports of Macau-exposed operators",
      },
      {
        category: "EXCEL_FILE",
        description:
          "GentingSingapore_GGRModel_v1.xlsm — upload clean version only. Never upload drafts.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, gaming industry publications — GGR mechanics and segment margins must be derived from primary disclosures.",
      },
    ],
  },
  {
    id: "itc-m11",
    name: "ITC Limited",
    sector: "Conglomerate FMCG",
    geography: "India",
    exchange: "NSE/BSE",
    module: 11,
    complexity: "Advanced",
    track: "primary",
    chainId: "itc",
    chainPosition: 3,
    focusPriorityDo:
      "Full SOTP model — segment 3-statement (Cigarettes, FMCG, Hotels, Agri-Business, Paper) using M1 Workbook + M4 segment splits as starting point + separate WACC per segment using M5 capital allocation analysis + M4 peer betas + EV per segment (trading multiples from M4 cross-checked against segment DCF) + consolidated EV bridge (sum of segment EVs − net debt − conglomerate discount = equity value) + conglomerate discount calculation [(sum of segment-implied EV − current market cap) / sum] + cigarette excise sensitivity rolling forward from M5 + tear sheet (BUY/SELL/NEUTRAL). Part 3 of 3 (FINAL USE) in the ITC chain.",
    focusPriorityIgnore:
      "Deep international FX work — segment models can use INR throughout; cross-border exposure on cigarettes is a marginal effect.",
    financialStructure:
      "Multi-segment conglomerate spanning Cigarettes (cash-generative, regulated, declining volume), FMCG (margin-scaling), Hotels (asset-heavy, cyclical), Agri-Business (commodity-linked), and Paper (capital-intensive). Each segment has different working capital, capex, and margin profiles — making blended multiples structurally misleading and SOTP the appropriate valuation framework.",
    taskTypes: ["Financial Modeling", "Valuation", "Investment Write-Up"],
    skillsTested: [
      "SOTP — Sum of the Parts Valuation",
      "Segment-Level Modelling",
      "WACC Construction (per segment)",
      "Capital Allocation",
      "Conglomerate Discount Quantification",
      "Verbal Investment Thesis Articulation",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports (IND-AS — segment-level revenue, EBIT, capital employed, segment capex; required for per-segment 3-statement build)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation (segment growth targets, margin trajectory by segment, capital deployment outlook)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (segment commentary, FMCG margin trajectory vs HUL benchmark, hotel cycle commentary)",
      },
      {
        category: "MANDATORY",
        description:
          "Pure-play peer Annual Reports (segment-by-segment) — HUL/Britannia/Nestlé India (FMCG); Godfrey Phillips (Cigarettes); Indian Hotels/Lemon Tree (Hotels); Olam/Tata Consumer (Agri); JK Paper (Paper) — for segment-level WACC and exit multiples",
      },
      {
        category: "MANDATORY",
        description:
          "Indian Government Bond yield data (10-year G-Sec) — risk-free rate input for per-segment WACC construction",
      },
      {
        category: "CONDITIONAL",
        description:
          "Indian conglomerate discount research (Reliance, Tata Sons, Aditya Birla holding structure) — only if conglomerate discount range needs benchmarking against other Indian holding companies",
      },
      {
        category: "EXCEL_FILE",
        description:
          "ITC_FullSOTPModel_v1.xlsm — upload clean version only. Built on M4 + M5 workbooks.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, FMCG industry reports — conglomerate discount must be calculated from segment-implied EV vs market cap, not asserted from broker consensus.",
      },
    ],
  },
  {
    id: "lt-m11",
    name: "Larsen & Toubro",
    // CAUTION: lt-m11 is the L&T parent conglomerate — NOT L&T Technology Services (lt-m8).
    // The chain prefix "lt-" covers two different legal entities. Do not merge their models.
    sector: "Infrastructure / Industrial Conglomerate",
    geography: "India",
    exchange: "NSE/BSE",
    module: 11,
    complexity: "Advanced",
    track: "primary",
    chainId: "lt",
    chainPosition: 2,
    focusPriorityDo:
      "Backlog waterfall per segment (opening + inflows − revenue recognised = closing) for actuals + 3-year forecast using IND-AS 115 PoC method + stress test (−30% order inflows → revenue shortfall → FCF impact) + segment 3-statement (EPC / Infra + Energy; IT Services; Financial Services) + WC intensity per segment (DSO and DPO from AR segment notes — not consolidated or benchmarks) + SOTP (EPC at EV/EBITDA peers: NCC, KEC International; IT Services at L&T Tech listed market cap mark-to-market; Financial Services at P/B) + DCF for EPC + IT combined + 1-page tear sheet. Part 2 of 2 (FINAL USE) in the L&T chain (lt-m11 = Larsen & Toubro parent conglomerate; distinct entity from lt-m8 which is L&T Technology Services).",
    focusPriorityIgnore:
      "Deep international FX — first-pass treat international EPC revenue at consolidated level. Brand-level analysis within L&T Tech (already handled in M8 LBO — those mechanics do not feed conglomerate SOTP).",
    financialStructure:
      "Capital-intensive EPC business with order book-driven revenue recognition under IND-AS 115 (percentage of completion); working capital-heavy due to receivables in long-cycle EPC contracts; multi-segment conglomerate spanning EPC, IT services (L&T Tech, separately listed), and financial services; execution risk and order inflow trajectory are the primary value drivers.",
    taskTypes: ["Financial Modeling", "Valuation", "Accounting / FSA"],
    skillsTested: [
      "Order Book and Backlog Analysis",
      "SOTP — Sum of the Parts Valuation",
      "Working Capital Anomaly Detection",
      "Segment-Level Modelling",
      "Revenue Recognition — Percentage of Completion",
      "Capital Allocation",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5–10 Annual Reports (IND-AS — consolidated and segment financials: EPC, IT services, financial services, other; order book and order inflow disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation and Lakshya 2026 / Strategic Plan documents (segment SOTP targets, order inflow guidance, margin targets per segment)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4–6 Earnings Call Transcripts (order inflow trajectory, execution pace commentary, working capital normalisation timeline, segment EBIT margin guidance)",
      },
      {
        category: "MANDATORY",
        description:
          "L&T Technology Services Annual Report (separately listed subsidiary — required for SOTP standalone valuation of the IT services segment; mark-to-market the listed market cap)",
      },
      {
        category: "MANDATORY",
        description:
          "IND-AS 115 revenue recognition disclosures (Percentage of Completion method) — extract from AR footnotes; required for order book to revenue waterfall mechanics",
      },
      {
        category: "MANDATORY",
        description:
          "EPC peer Annual Reports — NCC, KEC International, Kalpataru Projects — for EPC segment EV/EBITDA peer multiples",
      },
      {
        category: "CONDITIONAL",
        description:
          "L&T Finance Holdings Annual Report — only if financial services segment requires standalone NIM/NPA modelling within the SOTP; treat as a FIG sub-model if included",
      },
      {
        category: "CONDITIONAL",
        description:
          "Government infrastructure capex budget data (Union Budget infrastructure allocation) — only for order inflow growth assumption anchoring in the EPC segment; publicly available from Ministry of Finance",
      },
      {
        category: "EXCEL_FILE",
        description:
          "LarsenAndToubro_SOTPModel_v1.xlsm — upload clean version only. Never upload drafts.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, screener exports, Wikipedia, infrastructure industry reports, news articles — order book mechanics must be built from IND-AS disclosures; consensus order inflow estimates contaminate the model.",
      },
    ],
  },
  {
    id: "hdfc-m12",
    name: "HDFC Bank",
    sector: "Financial Institution",
    geography: "India",
    exchange: "NSE/BSE",
    module: 12,
    complexity: "Advanced",
    track: "primary",
    chainId: "hdfc",
    chainPosition: 3,
    focusPriorityDo:
      "5-page credit memo (bank-specific credit metrics: NIM stability, GNPA/NNPA/PCR trend, CASA + CD ratio for funding stability, CET1 headroom vs regulatory minimum, ROA, cost-to-income; bond spread analysis — HDFC vs ICICI/Axis/Kotak sourced from NSE/Bloomberg with date stamp; downgrade scenario quantifying cost-of-funds impact in bps and PAT impact in ₹ crore; credit BUY/HOLD/SELL recommendation with 3-line justification) + 2-page mock CIM critique of HDFC Bank's most recent AR (≥3 assumption-vs-data divergences with page references; 2 Q&A questions; DD chapter priority framework from Course 17). Built using M1 + M7 outputs as backbone. Part 3 of 3 (FINAL USE) in the HDFC chain.",
    focusPriorityIgnore:
      "Re-running the DDM — already done in M7. Re-extracting financial statements — already done in M1. Use existing outputs as the financial backbone and add credit/DD analytical layers on top.",
    financialStructure:
      "Leveraged balance sheet; deposit-funded with CASA ratio as a key cost-of-funds driver; NIM-driven P&L where net interest income is the primary revenue line; regulated capital structure with CET1 adequacy ratio constraining sustainable dividend payout; from a credit standpoint, asset quality (GNPA), funding stability (CASA + CD ratio), and earnings stability (NIM volatility) are the primary credit metrics — not Net Debt/EBITDA.",
    taskTypes: ["Credit Analysis", "Investment Write-Up"],
    skillsTested: [
      "Credit Analysis & Debt Capacity",
      "CIM / Information Memorandum — Buy-Side Reading",
      "Q&A Process",
      "Data Room Navigation",
      "Management Presentations",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "HDFC Bank Last 5 Annual Reports (treated as a CIM in this module — read for assumption-vs-data gaps; identify ≥3 assumption divergences with specific page references)",
      },
      {
        category: "MANDATORY",
        description:
          "RBI Pillar 3 / Basel III Capital Adequacy disclosures — required for credit memo CET1 buffer analysis and downgrade scenario stress",
      },
      {
        category: "MANDATORY",
        description:
          "HDFC Bank outstanding bond / NCD issuance details — yields, spreads, ratings; sourced from NSE / BSE debt market data with date stamp",
      },
      {
        category: "MANDATORY",
        description:
          "Peer bank bond data — ICICI Bank, Axis Bank, Kotak Mahindra Bank — bond yields and spreads; required for spread-vs-peer credit analysis",
      },
      {
        category: "MANDATORY",
        description:
          "CRISIL / ICRA / India Ratings credit rating reports for HDFC Bank — most recent rating action with rationale; required for downgrade scenario calibration",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation and Earnings Call Transcripts (treated as Management Presentations in this module — apply DD Q&A framework to identify the 2 questions you would submit if this were a real M&A transaction)",
      },
      {
        category: "CONDITIONAL",
        description:
          "Indian corporate bond benchmark yield curve (FBIL / CCIL data) — only if downgrade scenario requires precise cost-of-funds modelling at different rating bands",
      },
      {
        category: "EXCEL_FILE",
        description:
          "HDFCBank_CreditMemoAndCIMCritique_v1.xlsm — upload clean version only. Uses M1 + M7 financial outputs as backbone; this module produces written deliverables (memo + critique), not a new financial model.",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles — credit analysis must use bank-specific metrics derived from regulatory filings; corporate-style metrics (Net Debt/EBITDA) do not apply to a deposit-funded bank.",
      },
    ],
  },
  {
    id: "zalando-m13",
    name: "Zalando SE",
    sector: "E-Commerce / Fashion Platform",
    geography: "Germany / Europe",
    exchange: "XETRA / Frankfurt",
    module: 13,
    complexity: "Advanced",
    track: "primary",
    chainId: "zalando",
    chainPosition: 2,
    focusPriorityDo:
      "Full 15-slide sell-side pitchbook for hypothetical Zalando sell-side mandate (Cover, Executive Summary, Situation Overview, Industry Attractiveness with Porter's 5 Forces, Company Overview, Strip Profile, Financial Performance, Valuation Summary with Football Field chart drawn to scale, DCF Output, Trading Comps Output, Precedent Transactions, Deal Rationale, Recommended Approach, Key Risks, Recommendation) + strip profiles for Infosys, ITC, and GYG using Course 16 teaser structure (Company overview / Key investment highlights / Brands/Products / Key financials). Built on M1 Accounting Workbook + fresh DCF/comps tailored for the pitch. Slide Master consistently applied throughout. Recommended price range must cite M4 precedent transaction premiums explicitly. Part 2 of 2 (FINAL USE) in the Zalando chain.",
    focusPriorityIgnore:
      "Pure modelling work — that has been completed across earlier modules. M13 is about communication: PowerPoint IB style, slide storytelling, football field charts, and pitchbook narrative.",
    financialStructure:
      "Asset-light platform model combined with asset-heavy own-inventory logistics; GMV-driven with take rate split across own inventory (higher margin) and partner marketplace (lower margin); structural return rate drag of 30–50% of orders uniquely impairs contribution margin in fashion; IFRS 15 revenue recognition creates own-inventory vs marketplace revenue presentation differences that affect headline take rate comparisons.",
    taskTypes: ["Pitchbook", "Investment Write-Up", "Valuation"],
    skillsTested: [
      "PowerPoint (IB Style)",
      "Slide Storytelling",
      "Charts & Visuals — Football Field, Comps Tables",
      "Full Pitchbook Creation",
      "Strip Profiles",
      "Written Financial Communication",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Last 5 Annual Reports (IFRS — GMV, own-inventory revenue vs partner marketplace revenue, contribution margin per order, return rate disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "Latest Investor Presentation and Capital Markets Day materials (take rate by channel, return rate trajectory, logistics capex targets, partner programme KPIs)",
      },
      {
        category: "MANDATORY",
        description:
          "Last 4 Earnings Call Transcripts (contribution margin guidance, return rate management commentary, logistics cost efficiency targets, EBIT bridge disclosures)",
      },
      {
        category: "MANDATORY",
        description:
          "IFRS 15 revenue recognition note from AR — required for own-inventory vs marketplace presentation split; take rate comparisons are not valid without this distinction",
      },
      {
        category: "MANDATORY",
        description:
          "Peer e-commerce Annual Reports — ASOS, About You, Farfetch, Boozt, Nykaa — for take rate, contribution margin per order, and EV/Revenue benchmarking in the pitchbook comps",
      },
      {
        category: "MANDATORY",
        description:
          "European e-commerce M&A precedent transactions (last 5 years) — required for precedent transactions slide; sourced from press disclosures and M&A databases",
      },
      {
        category: "MANDATORY",
        description:
          "Strip profile source data for Infosys, ITC, GYG — pulled from each company's M1/M4/M2 workbooks respectively; required for the 3 supplementary strip profiles",
      },
      {
        category: "CONDITIONAL",
        description:
          "IFRS 16 lease disclosure (logistics warehouse leases) — only if warehouse lease obligations are material to FCF bridge and net debt calculation; extract from AR footnotes",
      },
      {
        category: "EXCEL_FILE",
        description:
          "Zalando_PitchbookAndStripProfiles_v1.xlsm — upload clean Excel underlying for the pitchbook (DCF, comps, football field source data). PowerPoint pitchbook deliverable is separate (.pptx).",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, e-commerce industry reports, pitchbook templates from Slidebean / SlideTeam — pitchbook valuation summary must be built from filing-sourced financials; pre-built templates embed structural assumptions.",
      },
    ],
  },
  {
    // NOTE: "10 companies" = 10 distinct practice companies counted by the curriculum.
    // L&T Technology Services (lt-m8) is the LBO simulation vehicle — a listed subsidiary used
    // as the buyout target for M8; Larsen & Toubro parent (lt-m11) is the named practice company
    // in the L&T chain. The curriculum counts L&T once (the parent conglomerate), not twice.
    // Full entity list: Infosys, HDFC Bank, Sun Pharma, Zalando, GYG, ITC, Larsen & Toubro,
    // Volkswagen, Zomato, Genting Singapore = 10 practice companies across 14 modules.
    id: "all-m14",
    name: "Portfolio Capstone",
    displaySubtitle: "All 10 Companies — Coverage Portfolio, Deal Tracking & Outreach",
    sector: "Cross-Sector",
    geography: "India / Australia / Germany / Singapore",
    exchange: "NSE/BSE / ASX / XETRA / SGX",
    module: 14,
    complexity: "Advanced",
    track: "standalone",
    chainId: null,
    chainPosition: null,
    focusPriorityDo:
      "Deal Log (4 weekly entries minimum, 3-sentence format with cited valuation views) + Cold Outreach Tracker (10 active connections at target banks with documented conversations and follow-ups) + 10 recorded 3-minute pitch videos (one per practice company, structured: company → thesis → valuation → risks → catalysts) + 3 mock interviews (30-min technical; 30-min behavioural; 60-min combined) with self-critique notes identifying weakest 3 answers + final 5 Paper LBO mental math drills (varied entry/leverage/hold/exit assumptions, verbal completion under 3 minutes).",
    focusPriorityIgnore:
      "Building any new financial analysis — M14 uses completed model outputs from all prior BUILD steps only. Do not add new modelling work in this module; it dilutes interview prep time.",
    financialStructure:
      "Cross-sector portfolio spanning IT services, QSR/franchise, conglomerate FMCG, banking, pharma, platform/new-age, infrastructure, automotive, gaming, and e-commerce — covering capital-light and capital-heavy structures, regulated and unregulated businesses, and positive and negative FCF profiles across 4 geographies.",
    taskTypes: ["Investment Write-Up", "Verbal Pitch / Interview Prep", "Networking / Portfolio Presentation"],
    skillsTested: [
      "Technical Interview Preparation",
      "Verbal Investment Thesis Articulation",
      "Live Deal Tracking",
      "Market Awareness",
      "Cold Outreach & Networking Strategy",
      "Paper LBO / Mental Math",
      "Pitch Defence Under Pushback",
      "Model Walkthrough — Logic, Not Outputs",
    ],
    filesToUpload: [
      {
        category: "MANDATORY",
        description:
          "Completed Excel models for all 10 companies — final clean versions only; these are the source of all numbers cited in tear sheets, pitches, and deal tracker entries",
      },
      {
        category: "MANDATORY",
        description:
          "Tear sheet template (blank) — if a standard format has been established across the program; ensures consistent output format across all 10 pitches",
      },
      {
        category: "MANDATORY",
        description:
          "Investment memo drafts for all 10 companies — written outputs from prior phases; required as reference documents during verbal pitch preparation",
      },
      {
        category: "MANDATORY",
        description:
          "Target bank list (10–15 BB and EB banks across geographies of interest) with 2–3 contacts per bank from LinkedIn — required for Cold Outreach Tracker setup",
      },
      {
        category: "EXCEL_FILE",
        description:
          "AllCompanies_PortfolioSummary_v1.xlsm + DealLog_v1.xlsx + OutreachTracker_v1.xlsx — upload clean versions only. Pitch videos uploaded as private link (not file).",
      },
      {
        category: "DO_NOT_UPLOAD",
        description:
          "Analyst reports, broker notes, screener exports, Wikipedia, news articles, or any new primary source documents — M14 uses only completed model outputs. Uploading new source material introduces unreviewed assumptions into the portfolio presentation.",
      },
    ],
  },
];
