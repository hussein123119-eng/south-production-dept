/* ==========================================================================
   NEXORA Intelligence Platform — Master Application Controller
   Brand: NEXORA | Intelligence Beyond Data
   Interactive Views: Dashboard, Command Center, Analytics, AI Feed, Projects,
                      Team, Data Infrastructure, Permissions & Security
   ========================================================================== */

const NexoraApp = {
  currentView: 'dashboard',
  searchQuery: '',

  init: function() {
    this.store = window.NexoraStore;
    if (!this.store) {
      console.error('NexoraStore not initialized.');
      return;
    }

    // Subscribe to central reactive store updates
    this.store.subscribe(() => {
      this.renderCurrentView();
      this.renderTopStatus();
    });

    // Start live clock and status ticker
    this.startLiveTickers();

    // Render initial layout
    this.renderCurrentView();
    this.renderTopStatus();

    // Global Keybindings (Cmd/Ctrl + K for search)
    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        this.openSearchModal();
      }
      if (e.key === 'Escape') {
        this.closeAllModals();
      }
    });

    console.log('✨ NEXORA Intelligence Platform (v85) initialized in Deep Space mode.');
  },

  // Switch Active View from Sidebar or Breadcrumb
  switchView: function(viewKey) {
    this.currentView = viewKey;

    // Update sidebar navigation pills
    document.querySelectorAll('.nav-item-btn').forEach(btn => {
      btn.classList.remove('active');
    });
    const activeBtn = document.getElementById(`navBtn-${viewKey}`);
    if (activeBtn) activeBtn.classList.add('active');

    // Render the view
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // Live seconds and clock ticker
  startLiveTickers() {
    setInterval(() => {
      const el = document.getElementById('liveStatusTickerText');
      if (el) {
        this.store.systemStatus.lastUpdatedSec++;
        el.textContent = `Updated ${this.store.systemStatus.lastUpdatedSec}s ago`;
      }
    }, 1000);
  },

  renderTopStatus: function() {
    const statusText = document.getElementById('systemStatusPillText');
    if (statusText) statusText.textContent = this.store.systemStatus.state;
  },

  // =========================================================================
  // Master View Switcher
  // =========================================================================
  renderCurrentView: function() {
    const container = document.getElementById('nexoraMainContentTarget');
    if (!container) return;

    switch (this.currentView) {
      case 'dashboard':
        container.innerHTML = this.templateDashboard();
        this.drawAnalyticsSvgChart();
        this.drawRadialAiMeter();
        break;
      case 'command_center':
        container.innerHTML = this.templateCommandCenter();
        break;
      case 'analytics':
        container.innerHTML = this.templateAnalyticsPage();
        this.drawDeepAnalyticsSvg();
        break;
      case 'ai_insights':
        container.innerHTML = this.templateAiInsightsPage();
        break;
      case 'projects':
        container.innerHTML = this.templateProjectsPage();
        break;
      case 'team':
        container.innerHTML = this.templateTeamPage();
        break;
      case 'data_sources':
        container.innerHTML = this.templateDataSourcesPage();
        break;
      case 'security':
        container.innerHTML = this.templateSecurityPermissionsPage();
        break;
      default:
        container.innerHTML = this.templateDashboard();
        this.drawAnalyticsSvgChart();
        this.drawRadialAiMeter();
        break;
    }
  },

  // =========================================================================
  // VIEW 1: EXECUTIVE DASHBOARD (Overview)
  // =========================================================================
  templateDashboard: function() {
    const kpi = this.store.getCalculatedKpis();
    const user = this.store.currentUser;

    return `
      <!-- Dashboard Executive Header -->
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Good morning, ${user.name.split(' ')[0]}.</h1>
          <p class="header-greeting-subtext">
            Your organization is performing <span class="highlight-stat-pill">18.4% better</span> than last month. Here is your live intelligence overview.
          </p>
        </div>

        <div class="header-live-metadata-card">
          <div class="metadata-datetime-block">
            <div class="meta-date">September 04, 2026 • 11:40 AM</div>
            <div class="meta-location">${this.store.context.workspaceId === 'ws-basrah' ? 'Basrah Workspace' : 'Nexora Global'}</div>
          </div>
          <span class="meta-badge-live">● LIVE</span>
        </div>
      </div>

      <!-- 4 Primary KPI Cards Grid -->
      <div class="primary-kpis-grid">
        <!-- KPI 1: Total Revenue -->
        <div class="glass-card">
          <div class="kpi-card-header">
            <span class="kpi-title-label">Total Revenue</span>
            <div class="kpi-icon-container" style="color: var(--aurora-cyan);">💰</div>
          </div>
          <div class="kpi-main-metric-value">${kpi.revenueFormatted}</div>
          <div class="kpi-trend-pill-row">
            <span class="trend-badge-positive">↑ 18.4%</span>
            <span class="trend-comparison-text">Compared to last month</span>
          </div>
          <!-- Sparkline Area SVG -->
          <div class="kpi-sparkline-box">
            <svg viewBox="0 0 200 45" style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <linearGradient id="sparklineGrad1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#00dfd8" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#00dfd8" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,35 Q25,28 50,30 T100,20 T150,15 T200,6 L200,45 L0,45 Z" fill="url(#sparklineGrad1)"/>
              <path d="M0,35 Q25,28 50,30 T100,20 T150,15 T200,6" fill="none" stroke="#00dfd8" stroke-width="2.5"/>
            </svg>
          </div>
        </div>

        <!-- KPI 2: Active Users -->
        <div class="glass-card">
          <div class="kpi-card-header">
            <span class="kpi-title-label">Active Users</span>
            <div class="kpi-icon-container" style="color: var(--cyber-blue);">👥</div>
          </div>
          <div class="kpi-main-metric-value">${kpi.activeUsersFormatted}</div>
          <div class="kpi-trend-pill-row">
            <span class="trend-badge-positive">↑ 12.8%</span>
            <span class="trend-comparison-text"><b>${kpi.onlineUsersFormatted}</b> currently online</span>
          </div>
          <!-- Sparkline Area SVG -->
          <div class="kpi-sparkline-box">
            <svg viewBox="0 0 200 45" style="width: 100%; height: 100%; overflow: visible;">
              <defs>
                <linearGradient id="sparklineGrad2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stop-color="#0070f3" stop-opacity="0.35"/>
                  <stop offset="100%" stop-color="#0070f3" stop-opacity="0"/>
                </linearGradient>
              </defs>
              <path d="M0,32 Q30,30 60,25 T120,22 T160,18 T200,8 L200,45 L0,45 Z" fill="url(#sparklineGrad2)"/>
              <path d="M0,32 Q30,30 60,25 T120,22 T160,18 T200,8" fill="none" stroke="#0070f3" stroke-width="2.5"/>
            </svg>
          </div>
        </div>

        <!-- KPI 3: Active Projects -->
        <div class="glass-card">
          <div class="kpi-card-header">
            <span class="kpi-title-label">Active Projects</span>
            <div class="kpi-icon-container" style="color: var(--electric-violet);">🚀</div>
          </div>
          <div class="kpi-main-metric-value">${kpi.activeProjects}</div>
          <div class="kpi-trend-pill-row" style="flex-wrap: wrap; gap: 0.4rem;">
            <span style="color: var(--emerald-success); font-weight: 700; font-size: 0.78rem;">${kpi.projectsOnTrack} On Track</span>
            <span style="color: var(--amber-warning); font-weight: 700; font-size: 0.78rem;">• ${kpi.projectsAtRisk} At Risk</span>
            <span style="color: var(--rose-danger); font-weight: 700; font-size: 0.78rem;">• ${kpi.projectsDelayed} Delayed</span>
          </div>
          <!-- Circular Progress SVG Row -->
          <div style="display: flex; align-items: center; justify-content: space-between; margin-top: 1rem;">
            <div style="font-size: 0.75rem; color: var(--text-dim);">Portfolio Health</div>
            <div style="font-size: 0.85rem; font-weight: 800; color: var(--soft-white); font-family: var(--font-mono);">86.4% Efficiency</div>
          </div>
        </div>

        <!-- KPI 4: AI Performance Score -->
        <div class="glass-card">
          <div class="kpi-card-header">
            <span class="kpi-title-label">AI Performance Score</span>
            <div class="kpi-icon-container" style="color: var(--aurora-cyan);">⚡</div>
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between;">
            <div>
              <div class="kpi-main-metric-value">${kpi.aiScore}</div>
              <div class="kpi-trend-pill-row">
                <span class="trend-badge-positive">↑ ${kpi.aiScoreGrowth}%</span>
                <span style="color: var(--emerald-success); font-weight: 800;">Excellent</span>
              </div>
            </div>
            <!-- Radial Meter Container -->
            <div id="radialAiMeterBox" style="width: 64px; height: 64px;"></div>
          </div>
        </div>
      </div>

      <!-- Main Analytics + AI Insights (2 Columns) -->
      <div class="dashboard-grid-row-primary">
        <!-- Column 1: Performance Analytics (Last 30 Days Line + Area) -->
        <div class="glass-card" style="padding: 1.75rem;">
          <div class="card-header-bar">
            <div>
              <h2 class="section-headline-title">Business Performance</h2>
              <span style="font-size: 0.8rem; color: var(--text-dim);">Revenue Trajectory & Pipeline Velocity</span>
            </div>
            <span class="section-sub-badge">Last 30 Days</span>
          </div>

          <!-- SVG Canvas Chart -->
          <div class="analytics-chart-canvas-wrapper" id="analyticsChartWrapper">
            <!-- Dynamically injected SVG -->
          </div>

          <!-- Chart Legend -->
          <div class="chart-legend-row">
            <div class="legend-item">
              <span class="legend-dot-cyan"></span>
              <span>Current Period (Aug 06 – Sep 04)</span>
            </div>
            <div class="legend-item">
              <span class="legend-dot-dim"></span>
              <span>Previous Period</span>
            </div>
          </div>
        </div>

        <!-- Column 2: AI Intelligence Feed -->
        <div class="glass-card" style="padding: 1.75rem;">
          <div class="card-header-bar">
            <div>
              <h2 class="section-headline-title">AI Intelligence</h2>
              <span style="font-size: 0.8rem; color: var(--text-dim);">Continuous Autonomous Synthesis</span>
            </div>
            <span class="section-sub-badge" style="color: var(--electric-violet-light);">3 Active</span>
          </div>

          <div class="ai-insights-stack">
            ${this.renderAiInsightsList()}
          </div>
        </div>
      </div>

      <!-- Secondary Section: Active Projects + Live Activity Timeline -->
      <div class="dashboard-grid-row-secondary">
        <!-- Projects Overview Card -->
        <div class="glass-card" style="padding: 1.75rem;">
          <div class="card-header-bar">
            <div>
              <h2 class="section-headline-title">Active Projects</h2>
              <span style="font-size: 0.8rem; color: var(--text-dim);">Click any project to adjust live progress</span>
            </div>
            <button class="section-sub-badge" style="cursor: pointer;" onclick="NexoraApp.switchView('projects')">View Portfolio →</button>
          </div>

          <div class="projects-list-container">
            ${this.renderProjectsRows()}
          </div>
        </div>

        <!-- Live Activity Stream Card -->
        <div class="glass-card" style="padding: 1.75rem;">
          <div class="card-header-bar">
            <div>
              <h2 class="section-headline-title">Live Activity</h2>
              <span style="font-size: 0.8rem; color: var(--text-dim);">Real-time System Audit Stream</span>
            </div>
            <span class="section-sub-badge" style="color: var(--emerald-success);">Live Feed</span>
          </div>

          <div class="activity-timeline-stream">
            ${this.renderActivityStream()}
          </div>
        </div>
      </div>

      <!-- Tertiary Section: Team Performance + Global Operations Map + Data Infrastructure -->
      <div class="dashboard-grid-row-tertiary">
        <!-- 1. Team Performance -->
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="card-header-bar">
            <h2 class="section-headline-title" style="font-size: 1.1rem;">Team Performance</h2>
            <span class="section-sub-badge">Q3 2026</span>
          </div>
          <div class="team-performance-list">
            ${this.renderTeamMembersList()}
          </div>
        </div>

        <!-- 2. Real-Time Global Operations Map -->
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="card-header-bar">
            <h2 class="section-headline-title" style="font-size: 1.1rem;">Global Operations</h2>
            <span class="meta-badge-live">5 Hubs</span>
          </div>

          <div class="global-operations-map-box">
            <!-- Simulated Global Continents Grid Background -->
            <svg width="100%" height="100%" style="opacity: 0.25; position: absolute; inset: 0;">
              <defs>
                <pattern id="gridPattern" width="20" height="20" patternUnits="userSpaceOnUse">
                  <circle cx="2" cy="2" r="1" fill="#94a3b8" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#gridPattern)" />
            </svg>

            <!-- Pulse Nodes -->
            ${this.store.globalOperations.nodes.map(n => `
              <div class="map-radar-pulse-node" style="top: ${n.y}%; left: ${n.x}%;" title="${n.city} • Latency: ${n.latency} • Throughput: ${n.throughput}">
                <span class="map-node-label">${n.city}</span>
              </div>
            `).join('')}
          </div>

          <div class="global-map-stats-footer">
            <div>
              <div class="map-stat-col-value">${this.store.globalOperations.activeSessions.toLocaleString()}</div>
              <div class="map-stat-col-label">Active Sessions</div>
            </div>
            <div>
              <div class="map-stat-col-value">${this.store.globalOperations.globalTeams}</div>
              <div class="map-stat-col-label">Global Teams</div>
            </div>
            <div>
              <div class="map-stat-col-value">${this.store.globalOperations.liveOperations}</div>
              <div class="map-stat-col-label">Live Operations</div>
            </div>
          </div>
        </div>

        <!-- 3. Data Infrastructure -->
        <div class="glass-card" style="padding: 1.5rem;">
          <div class="card-header-bar">
            <h2 class="section-headline-title" style="font-size: 1.1rem;">Data Infrastructure</h2>
            <span class="section-sub-badge" style="color: var(--emerald-success);">99.98% Sync</span>
          </div>
          <div class="data-sources-list">
            ${this.renderDataSourcesList()}
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW 2: COMMAND CENTER
  // =========================================================================
  templateCommandCenter: function() {
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Command Center</h1>
          <p class="header-greeting-subtext">
            Autonomous Organization Orchestration, Global Threat Containment, and NEXORA AI Synthesis.
          </p>
        </div>
        <div class="header-live-metadata-card">
          <span style="font-size: 0.85rem; font-weight: 800; color: var(--emerald-success);">● Full Master Control Enabled</span>
        </div>
      </div>

      <!-- Global System Health Quad-Meter -->
      <div class="system-health-quad-meter">
        <div class="health-meter-cell">
          <div class="health-percentage-number">${this.store.systemStatus.infrastructureHealth}%</div>
          <div class="health-system-name">Infrastructure</div>
        </div>
        <div class="health-meter-cell">
          <div class="health-percentage-number">${this.store.systemStatus.dataSystemsHealth}%</div>
          <div class="health-system-name">Data Systems</div>
        </div>
        <div class="health-meter-cell">
          <div class="health-percentage-number" style="color: var(--emerald-success);">${this.store.systemStatus.aiHealth}%</div>
          <div class="health-system-name">AI Engine</div>
        </div>
        <div class="health-meter-cell">
          <div class="health-percentage-number">${this.store.systemStatus.securityHealth}%</div>
          <div class="health-system-name">Security</div>
        </div>
      </div>

      <!-- Ask NEXORA AI Master Interface -->
      <div class="ai-command-console-box" style="margin-bottom: 2rem;">
        <div class="ai-console-header">
          <span style="font-size: 1.4rem;">🤖</span>
          <div>
            <h2 class="ai-console-title">Ask NEXORA AI</h2>
            <p style="font-size: 0.8rem; color: var(--text-dim);">Real-time semantic reasoning across telemetry, revenue data, tasks, and system logs</p>
          </div>
        </div>

        <div class="ai-prompt-input-row">
          <input 
            type="text" 
            id="aiCommandConsoleInput" 
            class="ai-prompt-input-field" 
            placeholder="Ask anything about your organization (e.g. 'Analyze revenue trends', 'Detect risks')..."
            onkeydown="if (event.key === 'Enter') NexoraApp.executeAiQuery()"
          />
          <button class="ai-submit-query-btn" onclick="NexoraApp.executeAiQuery()" title="Send query">➔</button>
        </div>

        <div class="quick-commands-chips-row">
          <span style="font-size: 0.78rem; font-weight: 800; color: var(--text-dim); margin-right: 0.5rem;">Quick Commands:</span>
          <button class="quick-command-chip-btn" onclick="NexoraApp.runQuickCommand('Analyze revenue trends')">Analyze revenue trends</button>
          <button class="quick-command-chip-btn" onclick="NexoraApp.runQuickCommand('Detect operational risks')">Detect operational risks</button>
          <button class="quick-command-chip-btn" onclick="NexoraApp.runQuickCommand('Forecast next quarter')">Forecast next quarter</button>
          <button class="quick-command-chip-btn" onclick="NexoraApp.runQuickCommand('Summarize performance')">Summarize performance</button>
        </div>

        <div id="aiResponseContainer" class="ai-interactive-response-bubble"></div>
      </div>

      <!-- Operational Controls Grid -->
      <div class="glass-card" style="padding: 1.75rem;">
        <div class="card-header-bar">
          <h2 class="section-headline-title">Executive Operations & Safety Protocols</h2>
          <span class="section-sub-badge">Direct Execution</span>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.25rem;">
          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 1.25rem;">
            <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--soft-white); margin-bottom: 0.4rem;">Emergency Data Freeze</h3>
            <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">Isolates transaction pipelines and initiates immutable snapshot ledger.</p>
            <button class="quick-command-chip-btn" style="color: var(--amber-warning);" onclick="NexoraApp.showToast('Data Freeze protocol simulated: All ledger entries write-locked.', 'info')">Arm Freeze Protocol</button>
          </div>

          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 1.25rem;">
            <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--soft-white); margin-bottom: 0.4rem;">Auto-Scale Compute Grids</h3>
            <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">Expands edge cluster capacity in London and Singapore by 250%.</p>
            <button class="quick-command-chip-btn" style="color: var(--aurora-cyan);" onclick="NexoraApp.showToast('Compute clusters scaled +250% across 5 edge points.', 'success')">Deploy Scaling</button>
          </div>

          <div style="background: rgba(255, 255, 255, 0.02); border: 1px solid rgba(255, 255, 255, 0.06); border-radius: 14px; padding: 1.25rem;">
            <h3 style="font-size: 0.95rem; font-weight: 800; color: var(--soft-white); margin-bottom: 0.4rem;">High-Frequency Ingestion</h3>
            <p style="font-size: 0.8rem; color: var(--text-dim); margin-bottom: 1rem;">Forces sub-second microbatch sync across Salesforce and internal database.</p>
            <button class="quick-command-chip-btn" style="color: var(--emerald-success);" onclick="NexoraApp.showToast('High-frequency telemetry stream synced successfully.', 'success')">Trigger Live Sync</button>
          </div>
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW 3: ANALYTICS PAGE (Deep Dive)
  // =========================================================================
  templateAnalyticsPage: function() {
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Advanced Analytics</h1>
          <p class="header-greeting-subtext">
            Enterprise Intelligence & Historical Cohort Exploration.
          </p>
        </div>
        <div style="display: flex; gap: 0.75rem;">
          <button class="quick-command-chip-btn" onclick="NexoraApp.exportAnalyticsData('csv')">📥 Export CSV</button>
          <button class="quick-command-chip-btn" onclick="NexoraApp.exportAnalyticsData('json')">📥 Export JSON</button>
        </div>
      </div>

      <div class="glass-card" style="padding: 1.75rem; margin-bottom: 2rem;">
        <div class="card-header-bar">
          <h2 class="section-headline-title">Revenue & User Expansion (Aug 06 – Sep 04)</h2>
          <span class="section-sub-badge">Single Source Verified</span>
        </div>
        <div class="analytics-chart-canvas-wrapper" id="deepAnalyticsChartWrapper" style="height: 340px;"></div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 1.5rem;">
        <div class="glass-card">
          <span class="kpi-title-label">Conversion Performance</span>
          <div class="kpi-main-metric-value" style="font-size: 1.8rem; margin: 0.5rem 0;">4.82%</div>
          <span class="trend-badge-positive">↑ 0.64%</span> vs industry benchmark (3.2%)
        </div>

        <div class="glass-card">
          <span class="kpi-title-label">Operational Efficiency</span>
          <div class="kpi-main-metric-value" style="font-size: 1.8rem; margin: 0.5rem 0;">92.4%</div>
          <span class="trend-badge-positive">↑ 3.1%</span> tasks completed within SLA
        </div>

        <div class="glass-card">
          <span class="kpi-title-label">Customer Retention (Enterprise)</span>
          <div class="kpi-main-metric-value" style="font-size: 1.8rem; margin: 0.5rem 0;">98.6%</div>
          <span class="trend-badge-positive">↑ 14.2%</span> expansion in enterprise tier
        </div>
      </div>
    `;
  },

  // =========================================================================
  // VIEW 4: AI INSIGHTS PAGE ("Intelligence Feed")
  // =========================================================================
  templateAiInsightsPage: function() {
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Intelligence Feed</h1>
          <p class="header-greeting-subtext">
            Synthesized AI Insights categorized by Confidence, Impact Score, and Origin Source.
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${this.store.aiInsights.map(item => `
          <div class="glass-card" style="padding: 1.75rem; border-left: 4px solid ${item.type === 'Critical' ? 'var(--rose-danger)' : item.type === 'Opportunity' ? 'var(--aurora-cyan)' : 'var(--electric-violet)'};">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.65rem;">
              <span class="badge-role" style="background: rgba(255,255,255,0.06); color: var(--soft-white); font-weight: 800;">${item.type.toUpperCase()}</span>
              <div style="display: flex; gap: 0.75rem; align-items: center;">
                <span class="insight-confidence-badge">Confidence: ${item.confidence}%</span>
                <span style="font-size: 0.78rem; color: var(--text-dim);">${item.timestamp}</span>
              </div>
            </div>
            <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--soft-white); margin-bottom: 0.5rem;">${item.title}</h3>
            <p style="font-size: 0.92rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 1rem;">${item.description}</p>
            <div style="display: flex; align-items: center; justify-content: space-between; font-size: 0.8rem; color: var(--text-dim);">
              <span>Source: <b>${item.source}</b></span>
              <button class="insight-action-link-btn" onclick="NexoraApp.showToast('Action acknowledged: ${item.actionText} executing in sandbox.', 'info')">${item.actionText} →</button>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // =========================================================================
  // VIEW 5: PROJECTS & PORTFOLIO (Interactive Single Source of Truth)
  // =========================================================================
  templateProjectsPage: function() {
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Project Portfolio</h1>
          <p class="header-greeting-subtext">
            Live Project Engine. Adjust any progress slider to see instant propagation to KPIs, Team, and Activity!
          </p>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 1.25rem;">
        ${this.store.projects.map(p => `
          <div class="glass-card" style="padding: 1.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="project-id-icon-circle">${p.name.substring(0, 2)}</div>
                <div>
                  <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--soft-white);">${p.name}</h3>
                  <p style="font-size: 0.82rem; color: var(--text-dim);">${p.description}</p>
                </div>
              </div>
              <span class="project-status-badge ${p.status === 'On Track' ? 'status-on-track' : p.status === 'At Risk' ? 'status-at-risk' : 'status-planning'}">
                ● ${p.status}
              </span>
            </div>

            <div style="margin: 1.25rem 0;">
              <div style="display: flex; justify-content: space-between; font-size: 0.85rem; font-weight: 700; margin-bottom: 0.5rem;">
                <span>Progress: <b style="color: var(--aurora-cyan); font-size: 1.1rem;">${p.progress}%</b></span>
                <span style="color: var(--text-dim);">Deadline: ${p.deadline} • Team: ${p.teamSize} Members</span>
              </div>
              <input 
                type="range" 
                min="0" 
                max="100" 
                value="${p.progress}" 
                style="width: 100%; accent-color: var(--aurora-cyan); cursor: pointer;"
                oninput="NexoraStore.updateProjectProgress('${p.id}', this.value)"
              />
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // =========================================================================
  // VIEW 6: TEAM MANAGEMENT
  // =========================================================================
  templateTeamPage: function() {
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Team Performance Matrix</h1>
          <p class="header-greeting-subtext">
            Individual Performance Scores Computed from Tasks, Timeliness & Project Velocity.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
        ${this.store.teamMembers.map(m => `
          <div class="glass-card" style="padding: 1.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <div style="display: flex; align-items: center; gap: 1rem;">
                <div class="user-avatar-glow" style="width: 48px; height: 48px; font-size: 1.1rem;">${m.avatar}</div>
                <div>
                  <h3 style="font-size: 1.1rem; font-weight: 800; color: var(--soft-white);">${m.name}</h3>
                  <p style="font-size: 0.82rem; color: var(--text-dim);">${m.role}</p>
                </div>
              </div>
              <div style="text-align: right;">
                <div style="font-size: 1.8rem; font-weight: 900; color: var(--emerald-success); font-family: var(--font-mono);">${m.performance}%</div>
                <div style="font-size: 0.72rem; color: var(--text-dim); text-transform: uppercase;">Productivity Score</div>
              </div>
            </div>

            <div style="display: flex; justify-content: space-between; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.06); font-size: 0.82rem; color: var(--text-muted);">
              <span>Completed Tasks: <b>${m.tasksCompleted}</b></span>
              <span>On-Time Rate: <b>${m.onTimeRate}%</b></span>
              <span>Status: <b style="color: var(--emerald-success);">${m.status}</b></span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // =========================================================================
  // VIEW 7: DATA INFRASTRUCTURE
  // =========================================================================
  templateDataSourcesPage: function() {
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Data Infrastructure & Pipelines</h1>
          <p class="header-greeting-subtext">
            Active Data Connectors, Endpoints, Latency and Streaming Verification.
          </p>
        </div>
      </div>

      <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem;">
        ${this.store.dataSources.map(s => `
          <div class="glass-card" style="padding: 1.75rem;">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 1rem;">
              <h3 style="font-size: 1.2rem; font-weight: 800; color: var(--soft-white);">${s.name}</h3>
              <span class="status-on-track" style="padding: 0.25rem 0.75rem; font-size: 0.75rem; border-radius: 999px;">● ${s.status}</span>
            </div>
            <div style="display: flex; justify-content: space-between; font-size: 0.85rem; color: var(--text-dim); margin-top: 1rem;">
              <span>Sync Mode: <b style="color: var(--soft-white);">${s.sync}</b></span>
              <span>Latency: <b style="color: var(--aurora-cyan);">${s.latency}</b></span>
              <span>Health: <b style="color: var(--emerald-success);">${s.health}</b></span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  },

  // =========================================================================
  // VIEW 8: PERMISSIONS & SECURITY ARCHITECTURE
  // =========================================================================
  templateSecurityPermissionsPage: function() {
    const pDb = this.store.permissionsDb;
    return `
      <div class="dashboard-executive-header">
        <div>
          <h1 class="header-greeting-title">Security & Permissions Architecture</h1>
          <p class="header-greeting-subtext">
            Multi-Tenant Zero-Trust Model: RBAC, ABAC, Scoped Data Access, and Real-Time Authorization Audit.
          </p>
        </div>
      </div>

      <!-- Current Identity Card -->
      <div class="glass-card" style="padding: 1.75rem; margin-bottom: 2rem;">
        <h2 class="section-headline-title" style="margin-bottom: 0.5rem;">Active Identity & Evaluated Scope</h2>
        <div style="display: flex; align-items: center; gap: 2rem; flex-wrap: wrap;">
          <div>User: <b style="color: var(--soft-white);">${this.store.currentUser.name}</b></div>
          <div>Role: <b style="color: var(--electric-violet-light);">${this.store.currentUser.role}</b></div>
          <div>Workspace: <b style="color: var(--aurora-cyan);">${this.store.currentUser.workspaceName}</b></div>
          <div>Data Scope: <b style="color: var(--emerald-success);">${this.store.currentUser.dataScope}</b></div>
          <div>Status: <b style="color: var(--emerald-success);">${this.store.currentUser.status}</b></div>
        </div>
      </div>

      <!-- Access Audit Logs Table -->
      <div class="glass-card" style="padding: 1.75rem;">
        <div class="card-header-bar">
          <h2 class="section-headline-title">Authorization Access Audit Logs</h2>
          <span class="section-sub-badge">Real-Time Ledger</span>
        </div>
        <table class="security-permissions-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>User</th>
              <th>Action</th>
              <th>Resource</th>
              <th>Decision</th>
            </tr>
          </thead>
          <tbody>
            ${pDb.auditLogs.map(l => `
              <tr>
                <td style="font-family: var(--font-mono); font-size: 0.78rem;">${l.timestamp}</td>
                <td style="font-weight: 700; color: var(--soft-white);">${l.user}</td>
                <td style="font-family: var(--font-mono);">${l.action}</td>
                <td style="color: var(--aurora-cyan);">${l.resource}</td>
                <td><span style="color: var(--emerald-success); font-weight: 800;">${l.result}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  },

  // =========================================================================
  // Sub-renderers & Components
  // =========================================================================
  renderAiInsightsList: function() {
    return this.store.aiInsights.map(item => `
      <div class="ai-insight-single-card ${item.type === 'Critical' ? 'critical' : item.type === 'Prediction' ? 'prediction' : ''}">
        <div class="insight-header-row">
          <span class="insight-category-tag">${item.title}</span>
          <span class="insight-confidence-badge">${item.confidence}%</span>
        </div>
        <p class="insight-main-body-text">${item.description}</p>
        <button class="insight-action-link-btn" onclick="NexoraApp.showToast('Insight: ${item.actionText} opened in analytical workspace.', 'info')">
          ${item.actionText} →
        </button>
      </div>
    `).join('');
  },

  renderProjectsRows: function() {
    return this.store.projects.map(p => `
      <div class="project-card-row" onclick="NexoraApp.openProjectEditorModal('${p.id}')">
        <div class="project-brand-info">
          <div class="project-id-icon-circle">${p.name.substring(0, 2)}</div>
          <div>
            <div class="project-name-code">${p.name}</div>
            <span class="project-status-badge ${p.status === 'On Track' ? 'status-on-track' : p.status === 'At Risk' ? 'status-at-risk' : 'status-planning'}">
              ● ${p.status}
            </span>
          </div>
        </div>

        <div class="project-progress-container">
          <div class="progress-labels-row">
            <span>Progress</span>
            <span style="color: var(--soft-white);">${p.progress}%</span>
          </div>
          <div class="progress-track-bg">
            <div class="progress-fill-bar" style="width: ${p.progress}%;"></div>
          </div>
        </div>

        <div class="project-meta-details">
          <span>${p.teamSize} Members</span>
          <span style="color: var(--text-dim);">Due ${p.deadline}</span>
        </div>
      </div>
    `).join('');
  },

  renderActivityStream: function() {
    return this.store.liveActivity.slice(0, 5).map(item => `
      <div class="timeline-event-item">
        <span class="timeline-node-pin"></span>
        <div class="timeline-time-ago">${item.time}</div>
        <div class="timeline-actor-name">${item.actor}</div>
        <div class="timeline-action-desc">${item.action}</div>
      </div>
    `).join('');
  },

  renderTeamMembersList: function() {
    return this.store.teamMembers.map(m => `
      <div class="team-member-item-row">
        <div class="member-avatar-info">
          <div class="member-avatar-circle">${m.avatar}</div>
          <div>
            <div class="member-name-text">${m.name}</div>
            <div class="member-role-subtext">${m.role}</div>
          </div>
        </div>
        <div class="member-score-badge">${m.performance}%</div>
      </div>
    `).join('');
  },

  renderDataSourcesList: function() {
    return this.store.dataSources.map(s => `
      <div class="data-source-item-card">
        <div class="source-name-logo">
          <span style="font-size: 1.1rem;">⚡</span>
          <span>${s.name}</span>
        </div>
        <div style="text-align: right;">
          <div style="color: var(--emerald-success); font-weight: 700; font-size: 0.78rem;">● ${s.status}</div>
          <div class="source-sync-pill">${s.sync || s.health}</div>
        </div>
      </div>
    `).join('');
  },

  // =========================================================================
  // SVG Chart Renderers (Pixel-Perfect, Zero-Dependency Canvas/SVG)
  // =========================================================================
  drawAnalyticsSvgChart: function() {
    const wrapper = document.getElementById('analyticsChartWrapper');
    if (!wrapper) return;

    const data = this.store.revenueDataPoints;
    const width = wrapper.clientWidth || 600;
    const height = 280;
    const padding = { top: 20, right: 30, bottom: 40, left: 50 };

    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const maxVal = 120; // in K

    // Compute coordinate points
    const points = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - (d.revenue / maxVal) * chartH;
      return { x, y, ...d };
    });

    const prevPoints = data.map((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - (d.prevRevenue / maxVal) * chartH;
      return { x, y };
    });

    // Build smooth bezier curves
    const buildPath = (pts) => {
      let d = `M ${pts[0].x} ${pts[0].y}`;
      for (let i = 0; i < pts.length - 1; i++) {
        const xc = (pts[i].x + pts[i + 1].x) / 2;
        const yc = (pts[i].y + pts[i + 1].y) / 2;
        d += ` Q ${pts[i].x} ${pts[i].y}, ${xc} ${yc}`;
      }
      d += ` T ${pts[pts.length - 1].x} ${pts[pts.length - 1].y}`;
      return d;
    };

    const mainLineD = buildPath(points);
    const prevLineD = buildPath(prevPoints);
    const areaD = `${mainLineD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

    let gridLinesSvg = '';
    for (let v = 0; v <= 120; v += 30) {
      const y = padding.top + chartH - (v / maxVal) * chartH;
      gridLinesSvg += `
        <line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="rgba(255,255,255,0.06)" stroke-dasharray="3,3" />
        <text x="${padding.left - 10}" y="${y + 4}" fill="#64748b" font-size="11" text-anchor="end" font-family="JetBrains Mono">${v}K</text>
      `;
    }

    let xLabelsSvg = '';
    points.forEach(p => {
      xLabelsSvg += `
        <text x="${p.x}" y="${height - 12}" fill="#94a3b8" font-size="11" text-anchor="middle" font-weight="600">${p.date}</text>
      `;
    });

    let nodesSvg = '';
    points.forEach(p => {
      nodesSvg += `
        <circle class="chart-data-node" cx="${p.x}" cy="${p.y}" r="4.5" fill="#060813" stroke="#00dfd8" stroke-width="2.5">
          <title>${p.date}: $${p.revenue}K</title>
        </circle>
      `;
    });

    wrapper.innerHTML = `
      <svg class="chart-svg-surface" viewBox="0 0 ${width} ${height}">
        <defs>
          <linearGradient id="mainAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#00dfd8" stop-opacity="0.3"/>
            <stop offset="60%" stop-color="#8b5cf6" stop-opacity="0.08"/>
            <stop offset="100%" stop-color="#8b5cf6" stop-opacity="0"/>
          </linearGradient>
        </defs>
        ${gridLinesSvg}
        ${xLabelsSvg}
        <path d="${prevLineD}" fill="none" stroke="rgba(148, 163, 184, 0.35)" stroke-width="2" stroke-dasharray="4,4"/>
        <path d="${areaD}" fill="url(#mainAreaGradient)"/>
        <path d="${mainLineD}" fill="none" stroke="#00dfd8" stroke-width="3" filter="drop-shadow(0 0 8px rgba(0,223,216,0.5))"/>
        ${nodesSvg}
      </svg>
    `;
  },

  // Radial Intelligence Meter for AI Score
  drawRadialAiMeter: function() {
    const box = document.getElementById('radialAiMeterBox');
    if (!box) return;

    const score = this.store.getCalculatedKpis().aiScore;
    const strokeDash = (score / 100) * 157; // 2 * PI * 25 ~ 157

    box.innerHTML = `
      <svg viewBox="0 0 64 64" style="width: 100%; height: 100%; transform: rotate(-90deg);">
        <circle cx="32" cy="32" r="25" fill="none" stroke="rgba(255, 255, 255, 0.08)" stroke-width="6"/>
        <circle cx="32" cy="32" r="25" fill="none" stroke="url(#radialMeterGrad)" stroke-width="6" stroke-dasharray="${strokeDash} 157" stroke-linecap="round"/>
        <defs>
          <linearGradient id="radialMeterGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#8b5cf6"/>
            <stop offset="100%" stop-color="#00dfd8"/>
          </linearGradient>
        </defs>
      </svg>
    `;
  },

  drawDeepAnalyticsSvg: function() {
    const wrapper = document.getElementById('deepAnalyticsChartWrapper');
    if (wrapper) {
      this.drawAnalyticsSvgChart();
    }
  },

  // =========================================================================
  // AI Command Execution & Interaction
  // =========================================================================
  executeAiQuery: function() {
    const input = document.getElementById('aiCommandConsoleInput');
    if (!input) return;
    const q = input.value.trim();
    if (!q) return;

    this.runQuickCommand(q);
    input.value = '';
  },

  runQuickCommand: function(queryText) {
    const container = document.getElementById('aiResponseContainer');
    if (!container) return;

    container.style.display = 'block';
    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 0.5rem; color: var(--aurora-cyan);">
        <span class="pulse-indicator-emerald"></span>
        <span>Synthesizing neural enterprise graphs...</span>
      </div>
    `;

    setTimeout(() => {
      const response = this.store.askNexoraAI(queryText);
      // Format markdown bold points
      const formatted = response.replace(/\*\*(.*?)\*\*/g, '<b style="color: var(--soft-white);">$1</b>');
      container.innerHTML = `
        <div style="font-size: 0.82rem; color: var(--electric-violet-light); margin-bottom: 0.4rem; font-weight: 700;">
          Query: "${queryText}"
        </div>
        <div>${formatted}</div>
      `;
    }, 450);
  },

  // =========================================================================
  // Interactive Modals & Profile Dropdowns
  // =========================================================================
  openProjectEditorModal: function(projectId) {
    const project = this.store.projects.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('nexoraGlobalModal');
    const content = document.getElementById('nexoraModalContentTarget');
    if (!modal || !content) return;

    content.innerHTML = `
      <h2 style="font-size: 1.4rem; font-weight: 900; color: var(--soft-white); margin-bottom: 0.5rem;">Project ${project.name}</h2>
      <p style="font-size: 0.85rem; color: var(--text-dim); margin-bottom: 1.5rem;">Adjust progress live. Watch KPIs and Team performance recalculate across the platform.</p>

      <div style="margin-bottom: 1.5rem;">
        <div style="display: flex; justify-content: space-between; font-weight: 800; margin-bottom: 0.5rem;">
          <span>Current Progress:</span>
          <span style="color: var(--aurora-cyan); font-size: 1.2rem;">${project.progress}%</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value="${project.progress}" 
          style="width: 100%; accent-color: var(--aurora-cyan);"
          oninput="NexoraStore.updateProjectProgress('${project.id}', this.value); document.getElementById('modalProgVal').textContent = this.value + '%';"
        />
        <div style="text-align: right; font-size: 0.78rem; color: var(--text-dim); margin-top: 0.2rem;">New: <span id="modalProgVal">${project.progress}%</span></div>
      </div>

      <div style="display: flex; justify-content: flex-end; gap: 0.75rem;">
        <button class="quick-command-chip-btn" onclick="NexoraApp.closeAllModals()">Close</button>
      </div>
    `;

    modal.style.display = 'flex';
  },

  openProfileMenu: function() {
    const user = this.store.currentUser;
    const modal = document.getElementById('nexoraGlobalModal');
    const content = document.getElementById('nexoraModalContentTarget');
    if (!modal || !content) return;

    content.innerHTML = `
      <div style="display: flex; align-items: center; gap: 1.25rem; margin-bottom: 1.5rem;">
        <div class="user-avatar-glow" style="width: 56px; height: 56px; font-size: 1.3rem;">${user.name.split(' ').map(n=>n[0]).join('')}</div>
        <div>
          <h2 style="font-size: 1.3rem; font-weight: 900; color: var(--soft-white);">${user.name}</h2>
          <p style="font-size: 0.85rem; color: var(--aurora-cyan); font-weight: 700;">${user.role} • ${user.workspaceName}</p>
          <span style="font-size: 0.75rem; color: var(--emerald-success);">● ${user.status}</span>
        </div>
      </div>

      <div style="display: flex; flex-direction: column; gap: 0.5rem; margin-bottom: 1.5rem;">
        <button class="nav-item-btn" onclick="NexoraApp.closeAllModals(); NexoraApp.switchView('security')">
          <span class="nav-icon">🛡️</span> <span>Permissions & Security Matrix</span>
        </button>
        <button class="nav-item-btn" onclick="NexoraApp.closeAllModals(); NexoraApp.showToast('Workspace: Nexora Global active.', 'info')">
          <span class="nav-icon">🌐</span> <span>Workspace: Nexora Global</span>
        </button>
        <button class="nav-item-btn" onclick="NexoraApp.closeAllModals(); NexoraApp.showToast('Preferences: Ambient Aurora enabled.', 'info')">
          <span class="nav-icon">⚙️</span> <span>Preferences</span>
        </button>
      </div>

      <div style="display: flex; justify-content: flex-end;">
        <button class="quick-command-chip-btn" style="color: var(--rose-danger);" onclick="NexoraApp.closeAllModals(); NexoraApp.showToast('Signed out of executive session.', 'info')">Sign Out</button>
      </div>
    `;

    modal.style.display = 'flex';
  },

  openNotificationsModal: function() {
    const modal = document.getElementById('nexoraGlobalModal');
    const content = document.getElementById('nexoraModalContentTarget');
    if (!modal || !content) return;

    content.innerHTML = `
      <h2 style="font-size: 1.3rem; font-weight: 900; color: var(--soft-white); margin-bottom: 1rem;">Executive Notifications</h2>
      <div style="display: flex; flex-direction: column; gap: 0.85rem;">
        ${this.store.notifications.map(n => `
          <div style="padding: 1rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.06);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.25rem;">
              <span style="font-size: 0.75rem; font-weight: 800; color: var(--aurora-cyan);">${n.level}</span>
              <span style="font-size: 0.72rem; color: var(--text-dim);">${n.time}</span>
            </div>
            <div style="font-size: 0.88rem; font-weight: 700; color: var(--soft-white);">${n.text}</div>
          </div>
        `).join('')}
      </div>
      <div style="display: flex; justify-content: flex-end; margin-top: 1.5rem;">
        <button class="quick-command-chip-btn" onclick="NexoraApp.closeAllModals()">Close</button>
      </div>
    `;

    modal.style.display = 'flex';
  },

  openSearchModal: function() {
    const modal = document.getElementById('nexoraGlobalModal');
    const content = document.getElementById('nexoraModalContentTarget');
    if (!modal || !content) return;

    content.innerHTML = `
      <h2 style="font-size: 1.2rem; font-weight: 900; color: var(--soft-white); margin-bottom: 0.75rem;">Smart Global Search</h2>
      <input 
        type="text" 
        id="globalModalSearchInput" 
        class="smart-search-input" 
        placeholder="Search analytics, projects, team or insights..."
        style="margin-bottom: 1rem; padding-left: 1rem;"
        oninput="NexoraApp.filterGlobalSearch(this.value)"
      />
      <div id="searchResultsTarget" style="display: flex; flex-direction: column; gap: 0.5rem; max-height: 280px; overflow-y: auto;">
        <div style="color: var(--text-dim); font-size: 0.85rem;">Type to query projects, team members, or system metrics...</div>
      </div>
    `;

    modal.style.display = 'flex';
    setTimeout(() => {
      document.getElementById('globalModalSearchInput')?.focus();
    }, 100);
  },

  filterGlobalSearch: function(q) {
    const target = document.getElementById('searchResultsTarget');
    if (!target) return;
    const query = (q || '').toLowerCase().trim();
    if (!query) {
      target.innerHTML = `<div style="color: var(--text-dim); font-size: 0.85rem;">Type to query projects, team members, or system metrics...</div>`;
      return;
    }

    const matchedProjects = this.store.projects.filter(p => p.name.toLowerCase().includes(query) || p.description.toLowerCase().includes(query));
    const matchedTeam = this.store.teamMembers.filter(t => t.name.toLowerCase().includes(query) || t.role.toLowerCase().includes(query));

    let html = '';
    matchedProjects.forEach(p => {
      html += `
        <div class="project-card-row" style="cursor: pointer;" onclick="NexoraApp.closeAllModals(); NexoraApp.switchView('projects')">
          <div>🚀 Project: <b>${p.name}</b> (${p.progress}%)</div>
          <span class="project-status-badge status-on-track">● View</span>
        </div>
      `;
    });
    matchedTeam.forEach(t => {
      html += `
        <div class="project-card-row" style="cursor: pointer;" onclick="NexoraApp.closeAllModals(); NexoraApp.switchView('team')">
          <div>👤 ${t.name} (${t.role})</div>
          <span style="color: var(--emerald-success); font-weight: 800;">${t.performance}%</span>
        </div>
      `;
    });

    if (!html) {
      html = `<div style="color: var(--text-dim); font-size: 0.85rem;">No matching entities found for "${q}".</div>`;
    }

    target.innerHTML = html;
  },

  closeAllModals: function() {
    const modal = document.getElementById('nexoraGlobalModal');
    if (modal) modal.style.display = 'none';
  },

  // Export Utilities
  exportAnalyticsData: function(format) {
    const data = {
      platform: 'NEXORA Intelligence Platform',
      version: 'v85',
      exportDate: new Date().toISOString(),
      kpis: this.store.getCalculatedKpis(),
      revenueTimeSeries: this.store.revenueDataPoints,
      projects: this.store.projects,
      team: this.store.teamMembers
    };

    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexora_intelligence_export_${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      let csv = "Date,Revenue(K),Previous(K)\n";
      this.store.revenueDataPoints.forEach(r => {
        csv += `${r.date},${r.revenue},${r.prevRevenue}\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `nexora_performance_${Date.now()}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }

    this.showToast(`Export generated in ${format.toUpperCase()} successfully!`, 'success');
  },

  // Toast Notification
  showToast: function(message, type = 'info') {
    const container = document.getElementById('nexoraToastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'nexora-toast-card';
    toast.style.borderColor = type === 'success' ? 'var(--emerald-success)' : 'var(--aurora-cyan)';
    toast.innerHTML = `
      <span>${type === 'success' ? '✅' : '⚡'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }
};

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  NexoraApp.init();
});
