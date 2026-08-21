/**
 * SAGE AI HUB - STATE MANAGEMENT STORE (API + FALLBACK + LOCAL CACHE)
 */

class SageStore {
  constructor() {
    this.storageKeyVotes = 'sage_aihub_cs_votes_v2';
    this.storageKeyProjects = 'sage_aihub_cs_projects_v2';
    
    this.ideas = [];
    this.projects = this.load(this.storageKeyProjects, (typeof INITIAL_DATA !== 'undefined' ? INITIAL_DATA.activeProjects : []));
    this.userVotes = new Set(this.load(this.storageKeyVotes, []));
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
      upvotes: item.upvotes || 0,
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
      
      // Fallback to mock data if available
      if (this.ideas.length === 0 && typeof INITIAL_DATA !== 'undefined' && INITIAL_DATA.ideas) {
        this.ideas = INITIAL_DATA.ideas;
      }
      this.notify();
      return this.ideas;
    }
  }

  toggleVote(ideaId) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (this.userVotes.has(ideaId)) {
      this.userVotes.delete(ideaId);
      idea.upvotes = Math.max(0, (idea.upvotes || 0) - 1);
    } else {
      this.userVotes.add(ideaId);
      idea.upvotes = (idea.upvotes || 0) + 1;
    }
    this.saveVotes();
  }

  hasVoted(ideaId) {
    return this.userVotes.has(ideaId);
  }

  getStats() {
    const totalIdeas = this.ideas.length;
    const activeProjectsCount = this.projects.filter(p => p.stage === 'active' || p.stage === 'pilot').length;
    const deployedCount = this.projects.filter(p => p.stage === 'live').length;
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

