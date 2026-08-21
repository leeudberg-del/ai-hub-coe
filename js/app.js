/**
 * SAGE AI HUB - APPLICATION CONTROLLER & INTERACTIVE LOGIC
 */

document.addEventListener('DOMContentLoaded', () => {
  const store = window.sageStore;

  // Cache DOM Elements
  const navMenu = document.getElementById('nav-menu');
  const navLinks = document.querySelectorAll('.nav-link');
  const navIndicator = document.getElementById('nav-indicator');
  const ideasGrid = document.getElementById('ideas-grid');
  const ideaSearchInput = document.getElementById('idea-search');
  const regionFilterTabs = document.querySelectorAll('.region-filter-tab');
  const submitIdeaModal = document.getElementById('submit-modal');
  const openSubmitBtn = document.getElementById('btn-open-submit-modal');
  const heroSubmitBtn = document.getElementById('btn-hero-submit');
  const closeModalBtn = document.getElementById('modal-close-btn');
  const submitIdeaForm = document.getElementById('submit-idea-form');
  const roadmapContainer = document.getElementById('roadmap-board');

  let currentRegionFilter = 'all';
  let searchQuery = '';

  // --- DYNAMIC SLIDING & BOUNCING NAV UNDERLINE ---
  let isUserNavigating = false;
  let scrollTimeout = null;

  function updateNavIndicator(targetLink, shouldBounce = true) {
    if (!navIndicator || !targetLink || !navMenu) return;

    const targetItem = targetLink.closest('li') || targetLink;
    const left = targetItem.offsetLeft;
    const width = targetItem.offsetWidth;

    navIndicator.style.left = `${left}px`;
    navIndicator.style.width = `${width}px`;

    if (shouldBounce) {
      navIndicator.classList.remove('bouncing');
      void navIndicator.offsetWidth; // Force reflow
      navIndicator.classList.add('bouncing');
    }
  }

  // Setup click and hover transitions on nav links
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      isUserNavigating = true;
      clearTimeout(scrollTimeout);

      navLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
      updateNavIndicator(link, true);

      scrollTimeout = setTimeout(() => {
        isUserNavigating = false;
      }, 800);
    });

    link.addEventListener('mouseenter', () => {
      updateNavIndicator(link, false);
    });
  });

  if (navMenu) {
    navMenu.addEventListener('mouseleave', () => {
      const activeLink = document.querySelector('.nav-link.active');
      if (activeLink) updateNavIndicator(activeLink, false);
    });
  }

  // ScrollSpy
  const sections = [
    { id: 'hero', link: document.querySelector('.nav-link[href="#hero"]') },
    { id: 'ideas-section', link: document.querySelector('.nav-link[href="#ideas-section"]') },
    { id: 'roadmap-section', link: document.querySelector('.nav-link[href="#roadmap-section"]') }
  ];

  function onScrollSpy() {
    if (isUserNavigating) return;

    const scrollPos = window.scrollY + 200;
    for (let i = sections.length - 1; i >= 0; i--) {
      const sec = document.getElementById(sections[i].id);
      if (sec && sec.offsetTop <= scrollPos) {
        if (sections[i].link && !sections[i].link.classList.contains('active')) {
          navLinks.forEach(l => l.classList.remove('active'));
          sections[i].link.classList.add('active');
          updateNavIndicator(sections[i].link, true);
        }
        break;
      }
    }
  }

  window.addEventListener('scroll', onScrollSpy, { passive: true });

  window.addEventListener('resize', () => {
    const activeLink = document.querySelector('.nav-link.active');
    if (activeLink) updateNavIndicator(activeLink, false);
  });

  // --- STATS TICKER RENDERING ---
  function updateStats() {
    const stats = store.getStats();
    const elActive = document.getElementById('stat-active-projects');
    const elHours = document.getElementById('stat-hours-saved');
    const elIdeas = document.getElementById('stat-total-ideas');
    const elDeployed = document.getElementById('stat-deployed');

    if (elActive) elActive.innerHTML = `${stats.activeProjectsCount}<span></span>`;
    if (elHours) elHours.innerHTML = `${stats.hoursSavedEstimate.toLocaleString()}<span>h</span>`;
    if (elIdeas) elIdeas.innerHTML = `${stats.totalIdeas}<span></span>`;
    if (elDeployed) elDeployed.innerHTML = `${stats.deployedCount}<span></span>`;
  }

  // --- IDEAS GRID RENDERING (WITH DYNAMODB LIVE DATA & STATUS BADGES) ---
  function getStatusBadgeClass(status) {
    const s = (status || '').toLowerCase();
    if (s.includes('done') || s.includes('live')) return 'status-done';
    if (s.includes('sprint') || s.includes('dev')) return 'status-sprint';
    if (s.includes('discovery') || s.includes('story')) return 'status-discovery';
    if (s.includes('triage')) return 'status-triage';
    if (s.includes('rejected') || s.includes('duplicate')) return 'status-rejected';
    return 'status-submitted';
  }

  function formatDate(isoStr) {
    if (!isoStr) return '';
    try {
      const date = new Date(isoStr);
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
    } catch {
      return '';
    }
  }

  function renderIdeas() {
    if (!ideasGrid) return;

    if (store.isLoading && store.ideas.length === 0) {
      ideasGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: rgba(11,17,13,0.5); border: 1px dashed rgba(0,214,57,0.2); border-radius: 12px;">
          <div style="display: inline-block; width: 24px; height: 24px; border: 2px solid rgba(0,214,57,0.2); border-top-color: var(--sage-green-brilliant); border-radius: 50%; animation: spin 0.8s linear infinite; margin-bottom: 12px;"></div>
          <p style="color: var(--text-hero-secondary); font-size: 0.95rem;">Loading submitted ideas...</p>
        </div>
      `;
      return;
    }
    
    let filtered = store.ideas.filter(idea => {
      const matchRegion = currentRegionFilter === 'all' || 
                          (idea.region && idea.region.toLowerCase() === currentRegionFilter.toLowerCase());
      const matchSearch = (idea.title || '').toLowerCase().includes(searchQuery) ||
                          (idea.description || '').toLowerCase().includes(searchQuery) ||
                          (idea.type || '').toLowerCase().includes(searchQuery) ||
                          (idea.benefit || '').toLowerCase().includes(searchQuery) ||
                          (idea.author || '').toLowerCase().includes(searchQuery) ||
                          (idea.status || '').toLowerCase().includes(searchQuery);
      return matchRegion && matchSearch;
    });

    if (filtered.length === 0) {
      ideasGrid.innerHTML = `
        <div style="grid-column: 1 / -1; text-align: center; padding: 48px; background: rgba(11,17,13,0.5); border: 1px dashed rgba(0,214,57,0.2); border-radius: 12px;">
          <p style="color: var(--text-hero-secondary); font-size: 1.1rem; margin-bottom: 12px;">No customer service ideas found.</p>
          <button class="btn btn-outline-green btn-sm" id="btn-reset-filters">Reset filters</button>
        </div>
      `;
      const resetBtn = document.getElementById('btn-reset-filters');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          currentRegionFilter = 'all';
          searchQuery = '';
          if (ideaSearchInput) ideaSearchInput.value = '';
          regionFilterTabs.forEach(t => t.classList.toggle('active', t.dataset.region === 'all'));
          renderIdeas();
        });
      }
      return;
    }

    ideasGrid.innerHTML = filtered.map(idea => {
      const hasVoted = store.hasVoted(idea.id);
      const statusBadge = idea.status ? `
        <span class="idea-status-badge ${getStatusBadgeClass(idea.status)}">${escapeHTML(idea.status)}</span>
      ` : '';

      const isLong = (idea.description || '').length > 130;

      return `
        <article class="idea-card" data-id="${idea.id}">
          <div>
            <div class="idea-card-header idea-detail-trigger" data-id="${idea.id}" title="Click to view details">
              <span class="category-tag tag-${idea.category || 'automation'}">${escapeHTML(idea.categoryLabel || idea.type || 'Idea')}</span>
              <div style="display: flex; gap: 6px; align-items: center;">
                ${statusBadge}
                ${idea.region ? `<span class="region-badge">${escapeHTML(idea.region)}</span>` : ''}
              </div>
            </div>
            <h3 class="idea-title idea-detail-trigger" data-id="${idea.id}" title="Click to view details">${escapeHTML(idea.title)}</h3>
            
            <div class="idea-desc-wrapper">
              <p class="idea-desc" id="desc-${idea.id}">${escapeHTML(idea.description)}</p>
              ${isLong ? `
                <button class="btn-toggle-desc" data-id="${idea.id}" title="Click to view full details">
                  <span>Read more &rarr;</span>
                </button>
              ` : ''}
            </div>

            ${idea.impact || idea.benefit ? `
            <div class="idea-impact-banner">
              <strong>Impact / Benefit:</strong> ${escapeHTML(idea.benefit || idea.impact)}
            </div>
            ` : ''}
          </div>
          <div class="idea-card-footer">
            <div class="idea-author">
              <div class="author-avatar">${getInitials(idea.author)}</div>
              <div>
                <div style="font-weight: 500; color: #FFFFFF;">${escapeHTML(idea.author)}</div>
                <div style="font-size: 0.72rem; color: var(--text-hero-muted);">${formatDate(idea.submittedAt)}</div>
              </div>
            </div>
            <button class="upvote-btn ${hasVoted ? 'voted' : ''}" data-id="${idea.id}" aria-label="Upvote idea">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
              </svg>
              <span>${idea.upvotes || 0}</span>
            </button>
          </div>
        </article>
      `;
    }).join('');

    // Attach upvote triggers
    ideasGrid.querySelectorAll('.upvote-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;
        store.toggleVote(id);
        renderIdeas();
        updateStats();
        showToast("Vote recorded");
      });
    });

    // "Read more" and card triggers open the full detail modal
    ideasGrid.querySelectorAll('.btn-toggle-desc, .idea-detail-trigger').forEach(trigger => {
      trigger.addEventListener('click', (e) => {
        e.stopPropagation();
        const id = trigger.dataset.id;
        const idea = store.ideas.find(i => i.id === id);
        if (idea) openIdeaDetailModal(idea);
      });
    });
  }

  // --- IDEA DETAIL FULL MODAL HANDLING ---
  const detailModal = document.getElementById('idea-detail-modal');
  const detailCloseBtn = document.getElementById('modal-detail-close-btn');
  const detailDoneBtn = document.getElementById('modal-detail-done-btn');

  function openIdeaDetailModal(idea) {
    if (!detailModal) return;
    
    document.getElementById('modal-detail-title').textContent = idea.title;
    document.getElementById('modal-detail-desc').textContent = idea.description || 'No description provided.';
    document.getElementById('modal-detail-category').textContent = idea.categoryLabel || idea.type || 'Idea';
    document.getElementById('modal-detail-category').className = `category-tag tag-${idea.category || 'automation'}`;
    
    const statusEl = document.getElementById('modal-detail-status');
    statusEl.textContent = idea.status || 'Submitted';
    statusEl.className = `idea-status-badge ${getStatusBadgeClass(idea.status)}`;

    document.getElementById('modal-detail-region').textContent = idea.region || 'Global';
    document.getElementById('modal-detail-type').textContent = idea.type || 'Automation';
    document.getElementById('modal-detail-benefit').textContent = idea.benefit || idea.impact || 'General productivity';
    document.getElementById('modal-detail-author').textContent = idea.author || 'Sage Colleague';
    document.getElementById('modal-detail-avatar').textContent = getInitials(idea.author);
    document.getElementById('modal-detail-date').textContent = formatDate(idea.submittedAt);

    detailModal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeIdeaDetailModal() {
    if (!detailModal) return;
    detailModal.classList.remove('open');
    document.body.style.overflow = '';
  }

  if (detailCloseBtn) detailCloseBtn.addEventListener('click', closeIdeaDetailModal);
  if (detailDoneBtn) detailDoneBtn.addEventListener('click', closeIdeaDetailModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target === detailModal) closeIdeaDetailModal();
    });
  }

  // --- ROADMAP & DEV BOARD RENDERING ---
  function renderRoadmap() {
    if (!roadmapContainer) return;

    const columns = [
      { key: 'discovery', label: 'Discovery', dotClass: 'discovery', desc: '7 questions & user story' },
      { key: 'prioritisation', label: 'Prioritisation', dotClass: 'pilot', desc: 'Sized & scheduled for sprint' },
      { key: 'active', label: 'In Sprint', dotClass: 'active', desc: 'Active engineering & build' },
      { key: 'live', label: 'Delivered', dotClass: 'live', desc: 'Live in production' }
    ];

    roadmapContainer.innerHTML = columns.map(col => {
      const allProjects = store.getProjects();
      const projs = allProjects.filter(p => p.stage === col.key);

      return `
        <div class="roadmap-column">
          <div class="column-header">
            <div class="column-title-group">
              <span class="status-dot ${col.dotClass}"></span>
              <div>
                <strong style="font-size: 0.88rem; color: #FFFFFF; display: block;">${col.label}</strong>
                <span style="font-size: 0.68rem; color: var(--text-hero-muted);">${col.desc}</span>
              </div>
            </div>
            <span class="column-count">${projs.length}</span>
          </div>
          <div class="project-cards-container">
            ${projs.length === 0 ? '<p style="color: var(--text-hero-muted); font-size: 0.78rem; font-style: italic; padding: 16px 0; text-align: center;">No initiatives in this stage.</p>' : ''}
            ${projs.map(p => `
              <div class="dev-card" data-id="${p.id}" title="Click to view details">
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 6px; gap: 8px;">
                  <h4 class="dev-card-title">${escapeHTML(p.title)}</h4>
                  <span class="region-badge" style="font-size: 0.65rem; padding: 2px 6px; flex-shrink: 0;">${escapeHTML(p.region || 'Global')}</span>
                </div>
                <p class="dev-card-summary" style="display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; font-size: 0.8rem; color: var(--text-hero-secondary); margin-bottom: 12px; line-height: 1.45;">${escapeHTML(p.summary)}</p>
                ${p.stage === 'prioritisation' ? `
                  <div style="display: flex; gap: 8px; margin-bottom: 14px; align-items: center;">
                    <span style="background: rgba(211, 173, 247, 0.15); border: 1px solid rgba(211, 173, 247, 0.35); color: #D3ADF7; font-size: 0.72rem; font-weight: 700; padding: 2px 8px; border-radius: var(--radius-xs);">
                      Size: ${escapeHTML(p.sizing || 'Not Sized')}
                    </span>
                    <span style="background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #FFFFFF; font-size: 0.72rem; font-weight: 600; padding: 2px 8px; border-radius: var(--radius-xs);">
                      ${escapeHTML(p.priority || 'Medium')} Priority
                    </span>
                  </div>
                ` : `
                  <div class="dev-progress-wrapper">
                    <div class="progress-info">
                      <span>${escapeHTML(p.progressLabel || 'PROGRESS')}</span>
                      <span>${p.progress}%</span>
                    </div>
                    <div class="progress-bar-bg">
                      <div class="progress-bar-fill" style="width: ${p.progress}%;"></div>
                    </div>
                  </div>
                `}
                <div class="dev-meta-row">
                  <span class="lead-badge">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888888" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                    ${escapeHTML(p.lead)}
                  </span>
                  <span class="mono" style="color: var(--sage-green-brilliant); font-size: 0.7rem; font-weight: 600;">${escapeHTML(p.targetRelease)}</span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }).join('');

    // Attach click listeners to open detail modal on roadmap cards
    roadmapContainer.querySelectorAll('.dev-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.dataset.id;
        const allProjects = store.getProjects();
        const proj = allProjects.find(p => p.id === id);
        if (proj) {
          const idea = proj.rawItem || store.ideas.find(i => i.id === id) || {
            title: proj.title,
            description: proj.summary,
            type: proj.tech,
            benefit: proj.impact,
            author: proj.lead,
            region: proj.region,
            status: proj.stage === 'live' ? 'Done' : proj.stage === 'active' ? 'In Sprint' : 'Discovery'
          };
          openIdeaDetailModal(idea);
        }
      });
    });
  }

  // --- REGION FILTER & SEARCH LISTENERS ---
  if (regionFilterTabs) {
    regionFilterTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        regionFilterTabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentRegionFilter = tab.dataset.region;
        renderIdeas();
      });
    });
  }

  if (ideaSearchInput) {
    ideaSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      renderIdeas();
    });
  }

  // --- MODAL HANDLING ---
  function openModal() {
    if (submitIdeaModal) {
      submitIdeaModal.classList.add('open');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeModal() {
    if (submitIdeaModal) {
      submitIdeaModal.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  if (openSubmitBtn) openSubmitBtn.addEventListener('click', openModal);
  if (heroSubmitBtn) heroSubmitBtn.addEventListener('click', openModal);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

  const cancelModalBtn = document.getElementById('modal-cancel-btn');
  if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

  if (submitIdeaModal) {
    submitIdeaModal.addEventListener('click', (e) => {
      if (e.target === submitIdeaModal) closeModal();
    });
  }

  // Handle Form Submission
  if (submitIdeaForm) {

    // Pill selectors — single select (intent)
    document.querySelectorAll('.pill-option:not(.pill-multi)').forEach(pill => {
      pill.addEventListener('click', () => {
        const group = pill.dataset.group;
        document.querySelectorAll(`.pill-option[data-group="${group}"]`).forEach(p => p.classList.remove('selected'));
        pill.classList.add('selected');
        const hidden = document.getElementById(`form-idea-${group}`);
        if (hidden) hidden.value = pill.dataset.value;
      });
    });

    // Pill selectors — multi select (benefit)
    document.querySelectorAll('.pill-option.pill-multi').forEach(pill => {
      pill.addEventListener('click', () => {
        pill.classList.toggle('selected');
        const group = pill.dataset.group;
        const selected = [...document.querySelectorAll(`.pill-option.pill-multi[data-group="${group}"].selected`)]
          .map(p => p.dataset.value);
        const hidden = document.getElementById(`form-idea-${group}`);
        if (hidden) hidden.value = selected.join(', ');
      });
    });

    submitIdeaForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const title = document.getElementById('form-idea-title').value.trim();
      const description = document.getElementById('form-idea-desc').value.trim();
      const intent = document.getElementById('form-idea-intent')?.value || '';
      const benefit = document.getElementById('form-idea-benefit')?.value || '';

      if (!title || !description) {
        showToast("Please fill in the required fields.");
        return;
      }

      const user = typeof getCurrentUser === 'function' ? getCurrentUser() : null;
      const detectedRegion = typeof getUserRegion === 'function' ? getUserRegion(user) : 'Global';

      try {
        const res = await fetch(`${CONFIG.apiBase}/requests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            type: intent,
            description,
            benefit,
            region: detectedRegion,
            submittedByName: user?.name || 'Anonymous',
            submittedByEmail: user?.username || '',
          }),
        });
        if (!res.ok) throw new Error('API error');
        
        // Refresh store with newest submissions from API
        await store.fetchIdeas();
      } catch (err) {
        showToast("Submission failed — please try again.");
        return;
      }

      // Reset pills
      document.querySelectorAll('.pill-option').forEach(p => p.classList.remove('selected'));
      document.querySelectorAll('input[type="hidden"]').forEach(h => h.value = '');

      submitIdeaForm.reset();
      closeModal();
      showToast("Idea submitted! It has entered Step 2: Initial Triage.");

      const ideasSec = document.getElementById('ideas-section');
      if (ideasSec) ideasSec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // --- UTILITY FUNCTIONS ---
  function showToast(msg) {
    let container = document.querySelector('.toast-container');
    if (!container) {
      container = document.createElement('div');
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--sage-green-brilliant)" stroke-width="2.5">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${escapeHTML(msg)}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }

  function getInitials(name) {
    if (!name) return "CS";
    const parts = name.replace(/,/g, '').trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // Global subscriptions
  store.subscribe(() => {
    updateStats();
    renderIdeas();
    renderRoadmap();
  });

  // Initial Boot
  updateStats();
  renderIdeas();
  renderRoadmap();
  store.fetchIdeas();

  // Initialize Nav indicator position
  setTimeout(() => {
    const activeLink = document.querySelector('.nav-link.active') || navLinks[0];
    if (activeLink) updateNavIndicator(activeLink, false);
  }, 100);
});
