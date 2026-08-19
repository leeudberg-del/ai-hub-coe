/**
 * SAGE AI HUB - STATE MANAGEMENT STORE (LOCALSTORAGE + REACTIVE STATE)
 */

class SageStore {
  constructor() {
    this.storageKeyIdeas = 'sage_aihub_cs_ideas_v2';
    this.storageKeyVotes = 'sage_aihub_cs_votes_v2';
    this.storageKeyProjects = 'sage_aihub_cs_projects_v2';
    
    this.ideas = this.load(this.storageKeyIdeas, INITIAL_DATA.ideas);
    this.projects = this.load(this.storageKeyProjects, INITIAL_DATA.activeProjects);
    this.userVotes = new Set(this.load(this.storageKeyVotes, []));

    this.listeners = [];
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

  save() {
    try {
      localStorage.setItem(this.storageKeyIdeas, JSON.stringify(this.ideas));
      localStorage.setItem(this.storageKeyProjects, JSON.stringify(this.projects));
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

  addIdea(newIdea) {
    const id = `idea-${Date.now()}`;
    const categoryLabels = {
      automation: "Automation",
      capability: "New Tool",
      process: "Workflow",
      agent: "Automation"
    };

    const ideaObj = {
      id,
      title: newIdea.title,
      category: newIdea.category,
      categoryLabel: categoryLabels[newIdea.category] || "Idea",
      description: newIdea.description,
      impact: newIdea.impact || "Saves time on manual steps",
      author: newIdea.author || "Service Agent",
      region: newIdea.region || "UKI",
      dept: newIdea.dept || "Customer Service",
      upvotes: 1,
      status: "under_review",
      createdAt: new Date().toISOString().split('T')[0]
    };

    this.ideas.unshift(ideaObj);
    this.userVotes.add(id);
    this.save();
    return ideaObj;
  }

  toggleVote(ideaId) {
    const idea = this.ideas.find(i => i.id === ideaId);
    if (!idea) return;

    if (this.userVotes.has(ideaId)) {
      this.userVotes.delete(ideaId);
      idea.upvotes = Math.max(0, idea.upvotes - 1);
    } else {
      this.userVotes.add(ideaId);
      idea.upvotes += 1;
    }
    this.save();
  }

  hasVoted(ideaId) {
    return this.userVotes.has(ideaId);
  }

  getStats() {
    const totalIdeas = this.ideas.length;
    const activeProjectsCount = this.projects.filter(p => p.stage === 'active' || p.stage === 'pilot').length;
    const deployedCount = this.projects.filter(p => p.stage === 'live').length;
    const totalVotes = this.ideas.reduce((acc, curr) => acc + curr.upvotes, 0);

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
