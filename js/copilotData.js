/**
 * SAGE AI HUB - MICROSOFT COPILOT PROMPT RECIPES
 * Ready-to-use prompts designed to copy and paste directly into Microsoft Copilot.
 */

const COPILOT_PROMPTS = [
  {
    id: 'kolb-leadership-reflection',
    title: "Weekly Leadership Reflection & Planner (Kolb's Cycle)",
    category: 'Leadership',
    tag: 'Reflection & Coaching',
    shortDesc: "Reflect on your week of work using Kolb’s 4-Stage Learning Cycle and extract concrete priorities, behavioral insights, and recognition opportunities.",
    promptText: `I want to reflect on my last week of work using Kolb’s learning cycle and plan for the week ahead.

Please help me work through the following:

1. Concrete Experience
Based on what I share (and my recent calendar, meetings, and interactions), summarise the key things that stood out this week — including people interactions, decisions I made, and anything I didn’t get to as planned.

2. Reflective Observation
Help me reflect on:
• What worked well
• What didn’t work as well or felt uncomfortable
• Where I may have delayed action, avoided something, or relied too heavily on one perspective

3. Abstract Conceptualisation
Help me identify:
• What this week taught me about my leadership, accountability, or decision-making
• Any patterns (e.g. recognition, feedback, prioritisation, trust, challenge)

4. Active Experimentation
Help me define:
• 3 specific actions I will take next week
• Any behaviours I want to repeat or stop
• Where I need to be more deliberate or timely

Recognition focus
Please also help me identify:
• Who demonstrated positive behaviours or impact this week
• Who may be at risk of feeling unseen or undervalued
• At least one recognition action I should take next week that is visible outside my team

Output requirements
• Keep the tone reflective, practical and human
• Avoid corporate language or generic leadership phrases
• Be concise but specific
• End with a short “Next week focus” section I can copy into my planner`
  },
  {
    id: 'meeting-action-extractor',
    title: 'Cross-Meeting Decisions & Action Item Digest',
    category: 'Productivity',
    tag: 'Meeting Synthesis',
    shortDesc: 'Summarise key decisions made across your recent meetings, highlight owned commitments, and flag unresolved blockers.',
    promptText: `Please review my recent meetings, transcripts, and notes from this week and provide a concise summary:

1. Key Decisions Made
• List the concrete decisions agreed upon across my meetings, including the context and stakeholders.

2. Action Items & Next Steps
• Task description
• Owner (highlight my actions in bold)
• Target deadline or next milestone

3. Unresolved Questions & Risks
• Any open topics where consensus wasn't reached or where risks were raised.

Keep the tone concise, practical, and formatted in clean bullet points.`
  },
  {
    id: 'inbox-morning-triage',
    title: 'Morning Inbox & Priority Triage',
    category: 'Productivity',
    tag: 'Email & Triage',
    shortDesc: 'Filter through recent messages to highlight urgent decisions requiring your input, key FYIs, and follow-ups you owe.',
    promptText: `Please review my recent unread emails and thread updates from the past 24 hours and draft an executive briefing:

1. Immediate Attention (Need my input, decision, or approval today)
• Sender | Topic | Specific ask & deadline

2. Key Updates & FYIs (Important context, no action required from me)
• 1-sentence summary per critical thread

3. Follow-Ups I Owe
• Who is waiting on a reply from me and what is the pending item?

Filter out routine notifications and generic newsletters. Keep it sharp and actionable.`
  },
  {
    id: '1on1-coaching-prep',
    title: '1:1 Check-In & Coaching Agenda',
    category: 'Leadership',
    tag: 'Team & 1:1s',
    shortDesc: 'Structure a thoughtful 1:1 agenda covering recent wins, current in-flight deliverables, blockers, and growth questions.',
    promptText: `Help me prepare for an upcoming 1:1 catch-up with a team member.

Based on our recent interactions, shared projects, and meetings:

1. Wins & Contributions
• What recent achievements or positive contributions should I recognize and celebrate?

2. In-Flight Work & Support Needed
• What key deliverables are currently in progress?
• Are there any blockers or dependencies where I can help remove friction?

3. Coaching Questions
• Suggest 3 open-ended questions to explore their workload balance, development goals, and feedback for me.

Keep the tone supportive, encouraging, and focused on enablement.`
  },
  {
    id: 'complexity-reduction',
    title: 'Process Simplification & Friction Audit',
    category: 'Operations',
    tag: 'Simplify Work',
    shortDesc: 'Take any routine workflow or process and break down friction points, redundant handoffs, and automation opportunities.',
    promptText: `Act as a Business Process Simplification and Lean Operations specialist.

Please review the following process/workflow I describe below:

1. Complexity & Friction Analysis
• What steps appear redundant, slow, or prone to bottlenecks?
• Where are unnecessary handoffs or manual re-work happening?

2. Simplified 4-Step Flow
• Propose a streamlined version of this process in 4 clear, sequential steps.

3. Automation & AI Opportunities
• Suggest 2 quick-win automation or AI ideas to save time for the team.

Keep the recommendations pragmatic, simple, and easy to adopt.`
  },
  {
    id: 'executive-status-update',
    title: 'Executive Project Status & Risk Radar',
    category: 'Operations',
    tag: 'Reporting & Status',
    shortDesc: 'Draft a crisp, zero-fluff project status update ready to share with senior stakeholders.',
    promptText: `Help me draft an Executive Status Update for my project based on recent progress:

1. Overall Status
• Current RAG status (Red / Amber / Green) with a 2-sentence executive summary.

2. Highlights & Deliverables
• Top 3 achievements completed in this cycle.

3. Risks & Dependencies
• Key challenges, potential impacts, and proposed mitigations.

4. Next Cycle Focus
• Top 2 priorities for the upcoming week.

Format with clear headers and bullet points ready to paste into an email or presentation.`
  }
];

if (typeof window !== 'undefined') {
  window.COPILOT_PROMPTS = COPILOT_PROMPTS;
}
