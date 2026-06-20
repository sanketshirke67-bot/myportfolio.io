// Helper: Toast notifications (Day 32: click to dismiss)
function showToast(message, type = 'success') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  toast.addEventListener('click', () => toast.remove());
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.remove(); }, 4000);
}

// Mobile menu toggle
const hamburger = document.getElementById('hamburger');
const navLinks = document.querySelector('.nav-links');
if (hamburger) {
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navLinks.classList.toggle('active');
  });
}
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('active');
    navLinks.classList.remove('active');
  });
});

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const targetId = this.getAttribute('href').substring(1);
    if (targetId) {
      e.preventDefault();
      const target = document.getElementById(targetId);
      if (target) target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
document.getElementById('hero-btn')?.addEventListener('click', () => {
  document.getElementById('projects').scrollIntoView({ behavior: 'smooth' });
});

// Dark mode with system preference and 'D' key
const toggleBtn = document.getElementById('theme-toggle');
const body = document.body;
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
let savedTheme = localStorage.getItem('theme');
if (!savedTheme) savedTheme = prefersDark ? 'dark' : 'light';
if (savedTheme === 'light') {
  body.classList.add('light-mode');
  toggleBtn.textContent = '☀️';
} else {
  body.classList.remove('light-mode');
  toggleBtn.textContent = '🌙';
}
toggleBtn.addEventListener('click', () => {
  body.classList.toggle('light-mode');
  const isLight = body.classList.contains('light-mode');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
  toggleBtn.textContent = isLight ? '☀️' : '🌙';
});

// Typing animation
const typingText = document.querySelector('.typing-text');
const phrases = ["I build websites.", "I love coding.", "I learn every day.", "Welcome to my portfolio!"];
let phraseIdx = 0, charIdx = 0, deleting = false;
function typeEffect() {
  const current = phrases[phraseIdx];
  if (deleting) {
    typingText.textContent = current.substring(0, charIdx - 1);
    charIdx--;
  } else {
    typingText.textContent = current.substring(0, charIdx + 1);
    charIdx++;
  }
  if (!deleting && charIdx === current.length) {
    deleting = true;
    setTimeout(typeEffect, 2000);
  } else if (deleting && charIdx === 0) {
    deleting = false;
    phraseIdx = (phraseIdx + 1) % phrases.length;
    setTimeout(typeEffect, 500);
  } else {
    setTimeout(typeEffect, deleting ? 50 : 100);
  }
}
typeEffect();

// Stats counter
const statNumbers = document.querySelectorAll('.stat-number:not(#visitor-count)');
const statObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const target = entry.target;
      const targetNumber = parseInt(target.dataset.target);
      let current = 0;
      const increment = targetNumber / 50;
      const interval = setInterval(() => {
        if (current < targetNumber) {
          current += increment;
          target.textContent = Math.floor(current);
        } else {
          target.textContent = targetNumber;
          clearInterval(interval);
        }
      }, 20);
      statObserver.unobserve(target);
    }
  });
}, { threshold: 0.5 });
statNumbers.forEach(stat => statObserver.observe(stat));

// Circular skills
const circles = document.querySelectorAll('.circular-progress');
const circObs = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const progress = entry.target.dataset.progress;
      const percentSpan = entry.target.querySelector('.skill-percent');
      let currentPercent = 0;
      const targetPercent = parseInt(progress);
      const increment = targetPercent / 50;
      const interval = setInterval(() => {
        if (currentPercent < targetPercent) {
          currentPercent += increment;
          const val = Math.min(Math.floor(currentPercent), targetPercent);
          percentSpan.textContent = val + '%';
          const deg = (val / 100) * 360;
          entry.target.style.background = `conic-gradient(#e94560 ${deg}deg, ${body.classList.contains('light-mode') ? '#ddd' : '#333'} ${deg}deg)`;
        } else {
          percentSpan.textContent = targetPercent + '%';
          const deg = (targetPercent / 100) * 360;
          entry.target.style.background = `conic-gradient(#e94560 ${deg}deg, ${body.classList.contains('light-mode') ? '#ddd' : '#333'} ${deg}deg)`;
          clearInterval(interval);
        }
      }, 20);
      circObs.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });
circles.forEach(c => circObs.observe(c));

// ========== GitHub Projects ==========
const githubUsername = 'sanketshirke67-bot'; // CHANGE TO YOUR USERNAME
let allRepos = [];
let displayedCount = 6;
let currentFilter = 'all';
let currentSearch = '';
const projectsContainer = document.getElementById('github-projects');
const loadMoreBtn = document.getElementById('load-more-btn');
const searchInput = document.getElementById('project-search');

async function fetchGitHubRepos() {
  projectsContainer.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const sk = document.createElement('div');
    sk.className = 'skeleton-card';
    projectsContainer.appendChild(sk);
  }
  try {
    const res = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=100`);
    if (!res.ok) throw new Error();
    allRepos = await res.json();
    displayedCount = 6;
    applyFiltersAndRender();
    const syncTime = new Date();
    localStorage.setItem('lastProjectsSync', syncTime.toISOString());
    const lastSyncedDiv = document.getElementById('last-synced');
    if (lastSyncedDiv) lastSyncedDiv.textContent = `🔄 Last synced: ${syncTime.toLocaleString()}`;
    if (allRepos.length) {
      const sorted = [...allRepos].sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at));
      const latest = sorted[0];
      const daysAgo = Math.floor((Date.now() - new Date(latest.updated_at)) / 86400000);
      const latestDiv = document.getElementById('last-updated-repo');
      if (latestDiv) latestDiv.innerHTML = `📦 Most recent update: <strong>${latest.name}</strong> – ${daysAgo === 0 ? 'today' : `${daysAgo} day${daysAgo !== 1 ? 's' : ''} ago`}`;
    }
  } catch (e) {
    projectsContainer.innerHTML = '<div class="loader">Failed to load projects</div>';
  }
}

function filterRepos() {
  let filtered = allRepos;
  if (currentFilter !== 'all') filtered = filtered.filter(r => r.language === currentFilter);
  if (currentSearch) filtered = filtered.filter(r => r.name.toLowerCase().includes(currentSearch) || (r.description && r.description.toLowerCase().includes(currentSearch)));
  return filtered;
}

function renderProjects() {
  const filtered = filterRepos();
  const toDisplay = filtered.slice(0, displayedCount);
  if (toDisplay.length === 0) {
    projectsContainer.innerHTML = '<div class="loader">No projects match</div>';
    loadMoreBtn.style.display = 'none';
    return;
  }
  projectsContainer.innerHTML = '';
  toDisplay.forEach(repo => {
    const card = document.createElement('div');
    card.classList.add('project-card');
    card.setAttribute('data-language', repo.language || 'Unknown');
    card.innerHTML = `<i class="fab fa-github"></i><h3>${repo.name}</h3><p>${repo.description || 'No description'}</p><a href="${repo.html_url}" target="_blank">View on GitHub →</a>`;
    
    // Language badge
    const badge = document.createElement('span');
    badge.className = 'lang-badge';
    badge.textContent = repo.language || 'Unknown';
    card.querySelector('h3').appendChild(badge);
    
    // Last commit date
    const commitDiv = document.createElement('div');
    commitDiv.className = 'last-commit-date';
    commitDiv.innerHTML = `<i class="far fa-calendar-alt"></i> ${new Date(repo.updated_at).toLocaleDateString()}`;
    card.appendChild(commitDiv);
    
    // Details toggle
    const detailsDiv = document.createElement('div');
    detailsDiv.className = 'project-details';
    detailsDiv.innerHTML = `⭐ ${repo.stargazers_count || 0} stars | 🍴 ${repo.forks_count || 0} forks<br>🕒 Updated: ${new Date(repo.updated_at).toLocaleString()}`;
    const toggleBtn = document.createElement('button');
    toggleBtn.textContent = '📋 Show details';
    toggleBtn.className = 'toggle-details-btn';
    toggleBtn.addEventListener('click', () => {
      detailsDiv.classList.toggle('show');
      toggleBtn.textContent = detailsDiv.classList.contains('show') ? '🔽 Hide details' : '📋 Show details';
    });
    card.appendChild(toggleBtn);
    card.appendChild(detailsDiv);
    
    // Double-click to open repo
    card.addEventListener('dblclick', () => {
      window.open(repo.html_url, '_blank');
      showToast(`🔗 Opening ${repo.name}...`, 'success');
    });
    
    // Click on repo name to copy
    const h3 = card.querySelector('h3');
    h3.style.cursor = 'pointer';
    h3.addEventListener('click', (e) => {
      e.stopPropagation();
      navigator.clipboard.writeText(repo.name).then(() => showToast(`📋 Copied "${repo.name}"`, 'success')).catch(() => showToast('Failed', 'error'));
    });
    
    projectsContainer.appendChild(card);
  });
  loadMoreBtn.style.display = filtered.length > displayedCount ? 'inline-block' : 'none';
}

function applyFiltersAndRender() {
  displayedCount = 6;
  renderProjects();
}
function loadMore() {
  const filtered = filterRepos();
  if (displayedCount < filtered.length) {
    displayedCount += 6;
    renderProjects();
  }
}
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.dataset.filter;
    applyFiltersAndRender();
  });
});
searchInput?.addEventListener('input', e => {
  currentSearch = e.target.value;
  applyFiltersAndRender();
});
loadMoreBtn?.addEventListener('click', loadMore);
fetchGitHubRepos();

// Random project button and 'R' key
const randomBtn = document.getElementById('random-project-btn');
function openRandomProject() {
  if (!allRepos.length) { showToast('Projects not loaded yet', 'error'); return; }
  const rand = allRepos[Math.floor(Math.random() * allRepos.length)];
  window.open(rand.html_url, '_blank');
  showToast(`🎲 Opening random: ${rand.name}`, 'success');
}
randomBtn?.addEventListener('click', openRandomProject);

// ========== GitHub Activity ==========
const repoInput = document.getElementById('repo-input');
const refreshBtn = document.getElementById('refresh-activity');
const prOpenSpan = document.getElementById('pr-open'), prClosedSpan = document.getElementById('pr-closed'), prProgress = document.getElementById('pr-progress');
const issuesOpenSpan = document.getElementById('issues-open'), issuesClosedSpan = document.getElementById('issues-closed'), issuesProgress = document.getElementById('issues-progress');
const revReviewed = document.getElementById('review-reviewed'), revPending = document.getElementById('review-pending'), revProgress = document.getElementById('review-progress');
const demoPRs = { open: 3, closed: 7 }, demoIssues = { open: 2, closed: 5 }, demoReviews = { reviewed: 2, pending: 1 };

async function fetchGitHubActivity() {
  const repo = repoInput.value.trim();
  if (!repo) return showToast('Enter owner/repo', 'error');
  prOpenSpan.textContent = '...'; prClosedSpan.textContent = '...'; issuesOpenSpan.textContent = '...'; issuesClosedSpan.textContent = '...';
  revReviewed.textContent = '...'; revPending.textContent = '...';
  try {
    const prs = await (await fetch(`https://api.github.com/repos/${repo}/pulls?state=all&per_page=100`)).json();
    const issuesData = await (await fetch(`https://api.github.com/repos/${repo}/issues?state=all&per_page=100`)).json();
    const issues = issuesData.filter(i => !i.pull_request);
    let openPRs = prs.filter(p => p.state === 'open'), closedPRs = prs.filter(p => p.state === 'closed');
    let openIssues = issues.filter(i => i.state === 'open'), closedIssues = issues.filter(i => i.state === 'closed');
    const hasRealPRs = openPRs.length + closedPRs.length > 0, hasRealIssues = openIssues.length + closedIssues.length > 0;
    if (!hasRealPRs) { openPRs = demoPRs.open; closedPRs = demoPRs.closed; }
    if (!hasRealIssues) { openIssues = demoIssues.open; closedIssues = demoIssues.closed; }
    prOpenSpan.textContent = typeof openPRs === 'number' ? openPRs : openPRs.length;
    prClosedSpan.textContent = typeof closedPRs === 'number' ? closedPRs : closedPRs.length;
    const prTotal = (typeof openPRs === 'number' ? openPRs : openPRs.length) + (typeof closedPRs === 'number' ? closedPRs : closedPRs.length);
    prProgress.style.width = prTotal === 0 ? 0 : ((typeof closedPRs === 'number' ? closedPRs : closedPRs.length) / prTotal * 100) + '%';
    issuesOpenSpan.textContent = typeof openIssues === 'number' ? openIssues : openIssues.length;
    issuesClosedSpan.textContent = typeof closedIssues === 'number' ? closedIssues : closedIssues.length;
    const issuesTotal = (typeof openIssues === 'number' ? openIssues : openIssues.length) + (typeof closedIssues === 'number' ? closedIssues : closedIssues.length);
    issuesProgress.style.width = issuesTotal === 0 ? 0 : ((typeof closedIssues === 'number' ? closedIssues : closedIssues.length) / issuesTotal * 100) + '%';
    let reviewed = 0, pending = 0;
    if (hasRealPRs && openPRs.length > 0) {
      const reviewPromises = openPRs.slice(0, 30).map(async pr => {
        try {
          const revs = await (await fetch(pr.url + '/reviews')).json();
          return revs.length > 0 ? 1 : 0;
        } catch (e) { return 0; }
      });
      const results = await Promise.all(reviewPromises);
      reviewed = results.reduce((a, b) => a + b, 0);
      pending = openPRs.length - reviewed;
    } else if (!hasRealPRs && openPRs > 0) { reviewed = demoReviews.reviewed; pending = demoReviews.pending; }
    revReviewed.textContent = reviewed;
    revPending.textContent = pending;
    revProgress.style.width = (reviewed + pending) === 0 ? 0 : (reviewed / (reviewed + pending) * 100) + '%';
  } catch (e) {
    showToast('Error loading activity, using demo', 'error');
  }
}
refreshBtn?.addEventListener('click', fetchGitHubActivity);
fetchGitHubActivity();

// ========== Testimonials Carousel ==========
const slides = document.querySelectorAll('.testimonial-card');
const slideContainer = document.querySelector('.carousel-slide');
const prev = document.querySelector('.carousel-prev'), next = document.querySelector('.carousel-next');
let carIndex = 0, carInterval;
function updateCarousel() { if (slideContainer && slides[0]) slideContainer.style.transform = `translateX(-${carIndex * slides[0].clientWidth}px)`; }
function updateDots() { document.querySelectorAll('.dot').forEach((d, i) => { if (i === carIndex) d.classList.add('active'); else d.classList.remove('active'); }); }
function createDots() {
  const dotsDiv = document.querySelector('.carousel-dots');
  dotsDiv.innerHTML = '';
  slides.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.classList.add('dot');
    if (i === carIndex) dot.classList.add('active');
    dot.addEventListener('click', () => { clearInterval(carInterval); carIndex = i; updateCarousel(); updateDots(); startAutoSlide(); });
    dotsDiv.appendChild(dot);
  });
}
function nextSlide() { carIndex = (carIndex + 1) % slides.length; updateCarousel(); updateDots(); }
function prevSlide() { carIndex = (carIndex - 1 + slides.length) % slides.length; updateCarousel(); updateDots(); }
function startAutoSlide() { carInterval = setInterval(nextSlide, 5000); }
prev?.addEventListener('click', () => { clearInterval(carInterval); prevSlide(); startAutoSlide(); });
next?.addEventListener('click', () => { clearInterval(carInterval); nextSlide(); startAutoSlide(); });
window.addEventListener('resize', updateCarousel);
if (slides.length) { createDots(); updateCarousel(); startAutoSlide(); }

// ========== Streak Calendar ==========
const STORAGE_KEY = 'workStreakData';
function getStreakData() { const stored = localStorage.getItem(STORAGE_KEY); return stored ? JSON.parse(stored) : { dates: [], lastUpdated: null }; }
function saveStreakData(data) { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
function calculateStreak(dates) {
  if (!dates.length) return 0;
  const sorted = [...dates].sort();
  let streak = 0;
  let today = new Date(); today.setHours(0,0,0,0);
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = new Date(sorted[i]); d.setHours(0,0,0,0);
    const diff = (today - d) / 86400000;
    if (diff === streak) streak++;
    else break;
  }
  return streak;
}
function renderCalendar() {
  const data = getStreakData();
  const today = new Date();
  const y = today.getFullYear(), m = today.getMonth();
  const firstDay = new Date(y, m, 1).getDay(), daysInMonth = new Date(y, m + 1, 0).getDate();
  const calDiv = document.getElementById('calendar');
  if (!calDiv) return;
  calDiv.innerHTML = '';
  ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].forEach(d => {
    const l = document.createElement('div');
    l.textContent = d;
    l.style.textAlign = 'center';
    l.style.fontWeight = 'bold';
    l.style.color = '#e94560';
    calDiv.appendChild(l);
  });
  for (let i = 0; i < firstDay; i++) calDiv.appendChild(document.createElement('div'));
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const worked = data.dates.includes(dateStr);
    const isToday = today.getDate() === d;
    const dayDiv = document.createElement('div');
    dayDiv.textContent = d;
    dayDiv.classList.add('calendar-day');
    if (worked) dayDiv.classList.add('worked');
    if (isToday) dayDiv.classList.add('today');
    calDiv.appendChild(dayDiv);
  }
  document.getElementById('current-streak').textContent = calculateStreak(data.dates);
  document.getElementById('total-days').textContent = data.dates.length;
}
function markToday() {
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const data = getStreakData();
  if (!data.dates.includes(todayStr)) {
    data.dates.push(todayStr);
    saveStreakData(data);
    renderCalendar();
    showToast('🔥 Day marked! Streak updated.', 'success');
  } else {
    showToast('Already marked today', 'info');
  }
}
document.getElementById('mark-today-btn')?.addEventListener('click', markToday);
document.getElementById('export-streak-btn')?.addEventListener('click', () => {
  const data = getStreakData();
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `streak-${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Exported streak data', 'success');
});
renderCalendar();

// ========== Reading Time ==========
function addReadingTimes() {
  document.querySelectorAll('.blog-card').forEach(card => {
    const p = card.querySelector('p:not(.blog-date):not(.reading-time)');
    if (p) {
      const words = p.textContent.trim().split(/\s+/).length;
      const mins = Math.max(1, Math.ceil(words / 200));
      const span = card.querySelector('.reading-time span');
      if (span) span.textContent = mins;
    }
  });
}
addReadingTimes();

// ========== Visit message & counter ==========
(function updateVisitMessage() {
  const span = document.getElementById('visit-message');
  if (span) {
    let c = localStorage.getItem('portfolioVisitCount');
    if (c === null) {
      c = 1;
      span.textContent = '✨ Welcome! Thanks for visiting. ✨';
    } else {
      c = parseInt(c) + 1;
      span.textContent = `👋 Welcome back! You've visited ${c} time${c !== 1 ? 's' : ''}.`;
    }
    localStorage.setItem('portfolioVisitCount', c);
  }
})();
async function updateVisitorCount() {
  const vSpan = document.getElementById('visitor-count');
  try {
    const res = await fetch('https://api.countapi.xyz/hit/sanket_portfolio_final/visitors');
    const data = await res.json();
    if (vSpan) vSpan.textContent = data.value;
  } catch (e) {
    if (vSpan) vSpan.textContent = '?';
  }
}
updateVisitorCount();

// ========== Copy email & copy link ==========
document.getElementById('copy-email-btn')?.addEventListener('click', () => {
  navigator.clipboard.writeText('sanketshirke67@gmail.com').then(() => showToast('📧 Email copied!', 'success')).catch(() => showToast('Failed', 'error'));
});
document.getElementById('copy-link-btn')?.addEventListener('click', () => {
  navigator.clipboard.writeText(window.location.href).then(() => showToast('🔗 Link copied!', 'success')).catch(() => showToast('Failed', 'error'));
});

// ========== Back to top with smooth animation ==========
const backBtn = document.getElementById('back-to-top');
window.addEventListener('scroll', () => { backBtn.style.display = window.scrollY > 300 ? 'flex' : 'none'; });
const progressCircle = document.querySelector('.progress-ring-circle');
const radiusVal = 26, circum = 2 * Math.PI * radiusVal;
progressCircle.style.strokeDasharray = `${circum}`;
function setProgress(percent) {
  const offset = circum - (percent / 100) * circum;
  progressCircle.style.strokeDashoffset = offset;
  document.querySelector('.scroll-percent').textContent = `${Math.floor(percent)}%`;
}
window.addEventListener('scroll', () => {
  const docH = document.documentElement.scrollHeight - window.innerHeight;
  const p = (window.scrollY / docH) * 100;
  setProgress(p);
});
backBtn?.addEventListener('click', () => {
  const start = window.scrollY, duration = 500, startTime = performance.now();
  function animate(now) {
    const elapsed = now - startTime;
    const prog = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - prog, 3);
    window.scrollTo(0, start * (1 - ease));
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    setProgress((window.scrollY / docH) * 100);
    if (prog < 1) requestAnimationFrame(animate);
    else setProgress(0);
  }
  requestAnimationFrame(animate);
});
document.querySelector('.scroll-progress')?.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ========== Particle background ==========
const canvas = document.getElementById('particle-canvas');
if (canvas) {
  const ctx = canvas.getContext('2d');
  let particles = [];
  function resizeCanvas() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
  window.addEventListener('resize', resizeCanvas);
  resizeCanvas();
  class Particle {
    constructor() {
      this.x = Math.random() * canvas.width;
      this.y = Math.random() * canvas.height;
      this.size = Math.random() * 3 + 1;
      this.speedX = (Math.random() - 0.5) * 1;
      this.speedY = (Math.random() - 0.5) * 1;
      this.color = `rgba(233, 69, 96, ${Math.random() * 0.5 + 0.2})`;
    }
    update() {
      this.x += this.speedX;
      this.y += this.speedY;
      if (this.x < 0) this.x = canvas.width;
      if (this.x > canvas.width) this.x = 0;
      if (this.y < 0) this.y = canvas.height;
      if (this.y > canvas.height) this.y = 0;
    }
    draw() { ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fillStyle = this.color; ctx.fill(); }
  }
  function initParticles() { particles = []; for (let i = 0; i < 100; i++) particles.push(new Particle()); }
  function animateParticles() { ctx.clearRect(0, 0, canvas.width, canvas.height); particles.forEach(p => { p.update(); p.draw(); }); requestAnimationFrame(animateParticles); }
  initParticles();
  animateParticles();
}

// ========== Custom cursor ==========
const cursor = document.querySelector('.cursor'), cursorFollower = document.querySelector('.cursor-follower');
document.addEventListener('mousemove', e => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
  cursorFollower.style.left = e.clientX + 'px';
  cursorFollower.style.top = e.clientY + 'px';
});
document.addEventListener('mouseleave', () => { cursor.style.display = 'none'; cursorFollower.style.display = 'none'; });
document.addEventListener('mouseenter', () => { cursor.style.display = 'block'; cursorFollower.style.display = 'block'; });

// ========== Keyboard shortcuts ==========
document.addEventListener('keydown', (e) => {
  if (e.key === 'd' || e.key === 'D') {
    e.preventDefault();
    document.getElementById('theme-toggle').click();
    showToast('🌓 Dark mode toggled', 'success');
  }
  if (e.key === '?' || (e.shiftKey && e.key === '/')) {
    e.preventDefault();
    showToast('⌨️ Shortcuts: D (dark mode), L (copy link), R (random project), ? (help)', 'info');
  }
  if (e.key === 'l' || e.key === 'L') {
    e.preventDefault();
    navigator.clipboard.writeText(window.location.href).then(() => showToast('🔗 Link copied!', 'success')).catch(() => showToast('Failed', 'error'));
  }
  if (e.key === 'r' || e.key === 'R') {
    e.preventDefault();
    openRandomProject();
  }
});

// ========== Random developer tip on page load ==========
const tips = ['💡 Tip: Press "?" for shortcuts!', '🔥 Double-click a project card to open repo.', '📋 Click any repo name to copy it.', '⚡ Press "R" for a random project.', '🎨 Press "D" for dark mode.', '📁 Export streak data with the button.', '🚀 "The best way to predict the future is to create it."'];
setTimeout(() => {
  const tip = tips[Math.floor(Math.random() * tips.length)];
  showToast(tip, 'info');
}, 1000);

// ========== Easter egg: triple click logo ==========
let clickCount = 0, clickTimer = null;
const logoDiv = document.querySelector('.logo');
logoDiv?.addEventListener('click', () => {
  clickCount++;
  logoDiv.classList.add('logo-pulse');
  setTimeout(() => logoDiv.classList.remove('logo-pulse'), 300);
  clearTimeout(clickTimer);
  clickTimer = setTimeout(() => clickCount = 0, 800);
  if (clickCount === 3) {
    showToast('🎉 You found the secret! Keep learning! 🚀', 'success');
    clickCount = 0;
  }
});

// ========== Scroll fade animations ==========
const fadeElements = document.querySelectorAll('section, .skill-card, .project-card, .timeline-item, .blog-card');
fadeElements.forEach(el => el.classList.add('fade-in'));
const fadeObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('appear');
      fadeObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });
fadeElements.forEach(el => fadeObserver.observe(el));

// ========== Contact form (EmailJS – replace with your keys) ==========
const contactForm = document.getElementById('contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    showToast('EmailJS not configured – this would send!', 'info');
  });
}

// ========== Load stored last sync display ==========
const storedSync = localStorage.getItem('lastProjectsSync');
if (storedSync && document.getElementById('last-synced')) {
  const syncDate = new Date(storedSync);
  document.getElementById('last-synced').textContent = `🔄 Last synced: ${syncDate.toLocaleString()}`;
}
// Day 34: Double-click on empty space to scroll to top
document.addEventListener('dblclick', (e) => {
  // Ignore double-clicks on interactive elements
  const target = e.target;
  const ignoreTags = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'I', 'SPAN', 'H3', 'H2'];
  const isInteractive = ignoreTags.includes(target.tagName) || target.closest('.project-card') || target.closest('.streak-btn') || target.closest('.carousel-prev') || target.closest('.carousel-next');
  if (!isInteractive) {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
});
// Day 35: Random programming quote on project card hover
const quotes = [
  "💻 Code is poetry.",
  "🐛 First solve the problem, then write the code.",
  "⚡ Simplicity is the soul of efficiency.",
  "🔧 It works on my machine!",
  "📚 Any fool can write code that a computer understands. Good programmers write code that humans understand.",
  "🎯 Make it work, make it right, make it fast.",
  "🧠 The only way to learn a new programming language is by writing programs in it.",
  "🚀 Done is better than perfect.",
  "💡 Programming isn't about what you know; it's about what you can figure out.",
  "🌟 Code is like humor. When you have to explain it, it’s bad."
];

const cards = document.querySelectorAll('.project-card');
cards.forEach(card => {
  let timeout;
  card.addEventListener('mouseenter', () => {
    timeout = setTimeout(() => {
      const randomQuote = quotes[Math.floor(Math.random() * quotes.length)];
      showToast(randomQuote, 'info');
    }, 500);
  });
  card.addEventListener('mouseleave', () => {
    clearTimeout(timeout);
  });
});
// Day 36: Time-based greeting
function updateGreeting() {
  const greetingSpan = document.getElementById('greeting');
  if (!greetingSpan) return;
  const hour = new Date().getHours();
  let greeting = '';
  let emoji = '';
  if (hour < 12) {
    greeting = 'Good morning';
    emoji = '🌅';
  } else if (hour < 18) {
    greeting = 'Good afternoon';
    emoji = '☀️';
  } else {
    greeting = 'Good evening';
    emoji = '🌙';
  }
  greetingSpan.textContent = `${greeting}, visitor! ${emoji}`;
}
updateGreeting();
// Day 37: Dynamic copyright year
const yearSpan = document.getElementById('current-year');
if (yearSpan) yearSpan.textContent = new Date().getFullYear();
// Day 38: Page load time
const startTime = performance.now();
window.addEventListener('load', () => {
  const loadTimeSpan = document.getElementById('load-time');
  if (loadTimeSpan) {
    const loadTime = ((performance.now() - startTime) / 1000).toFixed(2);
    loadTimeSpan.textContent = `⏱️ Page loaded in ${loadTime}s`;
  }
});
// Day 40: Active navigation link highlighting
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-links a');

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const id = entry.target.id;
      navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${id}`) {
          link.classList.add('active');
        }
      });
    }
  });
}, { threshold: 0.4 }); // 40% of the section visible triggers the change

sections.forEach(section => observer.observe(section));s