/**
 * SAGE AI HUB - STATE MANAGEMENT STORE (API + FALLBACK + LOCAL CACHE)
 */

class SageStore {
  constructor() {
    this.storageKeyVotes = 'sage_aihub_cs_votes_v2';
    this.storageKeyProjects = 'sage_aihub_cs_projects_v2';
    this.storageKeyVoteCounts = 'sage_aihub_cs_counts_v2';
    
    this.ideas = [];
    this.projects = [];
    this.userVotes = new Set(this.load(this.storageKeyVotes, []));
    this.voteCounts = this.load(this.storageKeyVoteCounts, {});
    this.listeners = [];
    this.isLoading = false;
    this.loadError = null;
  }

  load(key, fallback) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : fallback;
    } catch (e) {
      console.warn("Storage load error:", e);
      return fallback;
    }
  }

  saveVotes() {
    try {
      localStorage.setItem(this.storageKeyVotes, JSON.stringify(Array.from(this.userVotes)));
      localStorage.setItem(this.storageKeyVoteCounts, JSON.stringify(this.voteCounts));
    } catch (e) {
      console.warn("Storage save error:", e);
    }
    this.notify();
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify() {
    this.listeners.forEach(fn => fn(this));
  }

  // Normalize DynamoDB / API record to standard frontend idea object
  normalizeIdea(item) {
    const categoryType = (item.type || 'Automation').toLowerCase();
    let categoryClass = 'automation';
    if (categoryType.includes('capability') || categoryType.includes('tool')) categoryClass = 'capability';
    else if (categoryType.includes('process') || categoryType.includes('improve')) categoryClass = 'process';
    else if (categoryType.includes('agent') || categoryType.includes('solve')) categoryClass = 'agent';

    const rawVotes = typeof item.upvotes === 'number' ? item.upvotes : 0;
    const isUserVoted = this.userVotes.has(item.id);
    const cachedCount = typeof this.voteCounts[item.id] === 'number' ? this.voteCounts[item.id] : null;

    let effectiveUpvotes = cachedCount !== null ? cachedCount : rawVotes;
    // If the user has voted for this item, ensure count is at least 1
    if (isUserVoted && effectiveUpvotes === 0) {
      effectiveUpvotes = 1;
      this.voteCounts[item.id] = 1;
      this.saveVotes();
    }

    return {
      id: item.id,
      title: item.title || 'Untitled Idea',
      description: item.description || '',
      type: item.type || 'Idea',
      category: categoryClass,
      categoryLabel: item.type || 'Idea',
      impact: item.benefit || 'Saves time on manual steps',
      benefit: item.benefit || '',
      author: item.submittedByName || 'Sage Colleague',
      email: item.submittedByEmail || '',
      status: item.status || 'Submitted',
      submittedAt: item.submittedAt || item.updatedAt || new Date().toISOString(),
      upvotes: effectiveUpvotes,
      raw: item
    };
  }

  async fetchIdeas() {
    this.isLoading = true;
    this.loadError = null;
    this.notify();

    try {
      const apiBase = typeof CONFIG !== 'undefined' && CONFIG.apiBase ? CONFIG.apiBase : '';
      if (!apiBase) throw new Error('CONFIG.apiBase is not defined');
      
      const res = await fetch(`${apiBase}/requests`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      const list = Array.isArray(data) ? data : (data.items || data.value || []);
      this.ideas = list.map(item => this.normalizeIdea(item));
      this.isLoading = false;
      this.notify();
      return this.ideas;
    } catch (err) {
      console.error('Failed to fetch ideas from API:', err);
      this.loadError = err;
      this.isLoading = false;
      this.ideas = [];
      this.notify();
      return this.ideas;
    }
  }

  getProjects() {
    // Map live ideas with pipeline status strictly from database
    return this.ideas
      .filter(i => ['discovery', 'prioritisation', 'prioritization', 'in sprint', 'done', 'live', 'pilot', 'testing'].includes((i.status || '').toLowerCase()))
      .map(i => {
        const s = (i.status || '').toLowerCase();
        const raw = i.raw || {};
        const disc = raw.discoveryNotes || {};
        const story = raw.userStory || {};

        let stage = 'discovery';
        let progress = 0;
        let progressLabel = 'DISCOVERY';
        let stagePill = 'Discovery';

        if (s === 'discovery') {
          stage = 'discovery';
          progressLabel = 'DISCOVERY READINESS';
          
          // Calculate discovery completion based on 7 interview questions + user story definition
          let completedQuestions = 0;
          const totalMilestones = 8;
          if (disc.outcome) completedQuestions++;
          if (disc.users) completedQuestions++;
          if (disc.current) completedQuestions++;
          if (disc.future) completedQuestions++;
          if (disc.data) completedQuestions++;
          if (disc.constraints) completedQuestions++;
          if (disc.value) completedQuestions++;
          if (story.role || story.want || story.soThat || raw.acceptanceCriteria) completedQuestions++;

          progress = Math.round((completedQuestions / totalMilestones) * 100);
          stagePill = progress === 100 ? 'Discovery Complete' : 'In Discovery';

        } else if (s === 'prioritisation' || s === 'prioritization') {
          stage = 'prioritisation';
          progressLabel = 'PRIORITISATION';
          progress = 0;
          stagePill = 'In Prioritisation';

        } else if (s === 'in sprint' || s === 'active') {
          stage = 'active';
          progressLabel = 'SPRINT PROGRESS';
          // In Sprint starts at 0% or active sprint progress
          progress = typeof raw.sprintProgress === 'number' ? raw.sprintProgress : 25;
          stagePill = 'In Sprint';

        } else if (s === 'pilot' || s.includes('test')) {
          stage = 'active';
          progressLabel = 'SPRINT VALIDATION';
          progress = typeof raw.pilotProgress === 'number' ? raw.pilotProgress : 85;
          stagePill = 'Testing / Pilot';

        } else if (s === 'done' || s === 'live') {
          stage = 'live';
          progressLabel = 'DELIVERED';
          progress = 100;
          stagePill = 'Live in Prod';
        }

        return {
          id: i.id,
          title: i.title,
          summary: i.description,
          stage,
          lead: raw.assignedLead || i.author || 'AI Hub Team',
          region: i.region || 'Global',
          progress,
          progressLabel,
          targetRelease: stagePill,
          sizing: raw.sizing || '',
          priority: raw.priority || 'Medium',
          tech: i.type || 'Automation',
          impact: i.benefit || '',
          userStory: raw.userStory || null,
          acceptanceCriteria: raw.acceptanceCriteria || null,
          rawItem: i
        };
      });
  }

  async toggleVote(ideaId) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    const hadVoted = this.userVotes.has(ideaId);

    // Optimistic local update
    if (hadVoted) {
      this.userVotes.delete(ideaId);
      idea.upvotes = Math.max(0, (idea.upvotes || 0) - 1);
    } else {
      this.userVotes.add(ideaId);
      idea.upvotes = (idea.upvotes || 0) + 1;
    }
    
    // Cache the exact vote count
    this.voteCounts[ideaId] = idea.upvotes;
    this.saveVotes();

    // Persist to backend if API base is present
    try {
      const apiBase = typeof CONFIG !== 'undefined' && CONFIG.apiBase ? CONFIG.apiBase : '';
      if (apiBase) {
        const res = await fetch(`${apiBase}/requests/${ideaId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decrement: hadVoted })
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.upvotes === 'number') {
            idea.upvotes = data.upvotes;
            this.voteCounts[ideaId] = data.upvotes;
            this.saveVotes();
          }
        }
      }
    } catch (e) {
      console.warn("Backend vote sync error:", e);
    }
  }

  hasVoted(ideaId) {
    return this.userVotes.has(ideaId);
  }

  getStats() {
    const totalIdeas = this.ideas.length;
    const currentProjects = this.getProjects();
    const activeProjectsCount = currentProjects.filter(p => p.stage === 'active' || p.stage === 'pilot').length;
    const deployedCount = currentProjects.filter(p => p.stage === 'live').length;
    const totalVotes = this.ideas.reduce((acc, curr) => acc + (curr.upvotes || 0), 0);

    return {
      totalIdeas,
      activeProjectsCount,
      deployedCount,
      totalVotes,
      hoursSavedEstimate: 850 + totalIdeas * 25
    };
  }
}

window.sageStore = new SageStore();

