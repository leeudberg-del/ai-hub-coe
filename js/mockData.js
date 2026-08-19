/**
 * SAGE AI HUB - MOCK DATA (CUSTOMER SERVICE & OPERATIONS MULTI-GEO)
 */

const INITIAL_DATA = {
  // Customer Service & Operations Ideas across global geos
  ideas: [
    {
      id: "idea-101",
      title: "Real-time multilingual translation for live chat",
      category: "automation",
      categoryLabel: "Chat & Support",
      description: "Automatically translates incoming customer chat messages and agent replies between English, French, Spanish, and German with accounting term accuracy.",
      impact: "Reduces response delays and enables cross-region queue sharing",
      author: "Claire Martin",
      region: "France",
      dept: "Customer Service",
      upvotes: 48,
      status: "under_review",
      createdAt: "2026-08-12"
    },
    {
      id: "idea-102",
      title: "Payroll year-end query synthesizer",
      category: "capability",
      categoryLabel: "New Tool",
      description: "A quick assistant that listens to payroll year-end call transcripts and pulls up relevant HMRC and regional tax guidance instantly for the agent.",
      impact: "Cuts average call handling time by 4 minutes during peak season",
      author: "Liam O'Connor",
      region: "UKI",
      dept: "Customer Operations",
      upvotes: 72,
      status: "in_development",
      createdAt: "2026-08-15"
    },
    {
      id: "idea-103",
      title: "Direct debit dispute classification",
      category: "automation",
      categoryLabel: "Automation",
      description: "Reads incoming billing dispute emails, extracts bank transaction IDs, and validates billing status against customer accounts before assigning to an agent.",
      impact: "Speeds up billing resolution from 48 hours to under 2 hours",
      author: "Carlos Ruiz",
      region: "Iberia",
      dept: "Customer Operations",
      upvotes: 39,
      status: "under_review",
      createdAt: "2026-08-16"
    },
    {
      id: "idea-104",
      title: "Customer churn risk flag on support tickets",
      category: "capability",
      categoryLabel: "New Tool",
      description: "Analyzes repeat ticket history and tone sentiment to flag at-risk accounts directly in the support console so agents can offer tailored support.",
      impact: "Improves first-contact customer retention by 22%",
      author: "Jessica Miller",
      region: "North America",
      dept: "Customer Service",
      upvotes: 65,
      status: "in_development",
      createdAt: "2026-08-17"
    },
    {
      id: "idea-105",
      title: "Electronic invoicing error triage (Factur-X & SII)",
      category: "process",
      categoryLabel: "Workflow",
      description: "Parses electronic invoice validation error codes for regional compliance (France Factur-X & Spanish SII) and provides plain-language fixes to the customer.",
      impact: "Automates resolution for over 60% of invoice format rejections",
      author: "Stefan Becker",
      region: "CEU",
      dept: "Customer Support",
      upvotes: 54,
      status: "pilot",
      createdAt: "2026-08-18"
    },
    {
      id: "idea-106",
      title: "WhatsApp & SMS appointment re-scheduler",
      category: "automation",
      categoryLabel: "Automation",
      description: "Interactive messaging bot to automatically confirm or re-book onboarding setup calls with new small business customers.",
      impact: "Reduces onboarding call no-show rates by 40%",
      author: "Nadia Mansoor",
      region: "AME",
      dept: "Customer Operations",
      upvotes: 41,
      status: "discovery",
      createdAt: "2026-08-19"
    }
  ],

  // Active Solutions Roadmap & Dev Board (Customer Service Tools)
  activeProjects: [
    {
      id: "proj-1",
      title: "Case auto-summary & wrap-up tool",
      stage: "active",
      stageLabel: "In Development",
      summary: "Drafts instant case summaries and resolution notes when a support call or chat ends, saving agents manual typing.",
      progress: 75,
      lead: "Global Service Tech",
      region: "All Regions",
      tech: "Support Agent Copilot",
      targetRelease: "Q3"
    },
    {
      id: "proj-2",
      title: "Knowledge base article matcher",
      stage: "pilot",
      stageLabel: "Testing with Team",
      summary: "Recommends verified help articles and step-by-step guides directly inside the agent console based on customer problem description.",
      progress: 90,
      lead: "UKI & NA Support Pod",
      region: "UKI / North America",
      tech: "Semantic Search",
      targetRelease: "Next sprint"
    },
    {
      id: "proj-3",
      title: "Complaints & escalation early triage",
      stage: "discovery",
      stageLabel: "Review & Planning",
      summary: "Scans open ticket queues for sensitive escalation cues to route high-priority customer issues to senior specialist teams faster.",
      progress: 30,
      lead: "Customer Experience Team",
      region: "CEU / Iberia",
      tech: "Sentiment Classifier",
      targetRelease: "Q4"
    },
    {
      id: "proj-4",
      title: "License key & activation assistant",
      stage: "live",
      stageLabel: "In Production",
      summary: "Automated identity check and license key retrieval workflow for customers locked out of desktop software installations.",
      progress: 100,
      lead: "Customer Ops Engineering",
      region: "All Regions",
      tech: "Verification Flow",
      targetRelease: "Live"
    }
  ]
};
