/* ==========================================================================
   إدارة قسم الإنتاج الجنوبي - Single Live News Announcement Ticker (من اليسار إلى اليمين)
   ========================================================================== */

function renderAnnouncementBar() {
  const user = window.auth.getCurrentUser();
  if (!user) return '';

  const sovereignBroadcast = localStorage.getItem('spd_active_broadcast');
  if (sovereignBroadcast) {
    return `
      <div class="central-announcement-bar urgent" id="centralAnnouncementBar" style="background: linear-gradient(90deg, #78350f 0%, #064e3b 50%, #78350f 100%); border-bottom: 1.5px solid #fbbf24;">
        <div class="announcement-bar-content">
          <div class="announcement-badge" style="background: #fbbf24; color: #0f172a; font-weight: 800;">
            <span class="ticker-pulse-dot" style="background: #b45309;"></span>
            <span>🛡️ تعميم سيادي من المؤسس</span>
          </div>
          <div class="announcement-ticker-track" style="overflow: hidden; width: 100%; display: flex; align-items: center;">
            <marquee behavior="scroll" direction="right" scrollamount="5" onmouseover="this.stop();" onmouseout="this.start();" style="width: 100%; font-size: 0.95rem; font-weight: 700; color: #ffffff; cursor: default;">
              <span style="color: #fef08a;">${sovereignBroadcast}</span>
            </marquee>
          </div>
        </div>
        <button class="announcement-close-btn" onclick="document.getElementById('centralAnnouncementBar').style.display='none'" title="إخفاء الشريط">
          ✕
        </button>
      </div>
    `;
  }

  const announcements = window.store.getAnnouncements(user.departmentId).filter(a => a.status === 'PUBLISHED');
  
  if (announcements.length === 0) return '';
  
  // اختيار إعلان واحد فقط: إما الإعلان المثبت حالياً، أو أحدث إعلان تم نشره
  const pinned = announcements.find(a => a.isPinned);
  const activeAnnouncement = pinned || announcements[0];

  const isUrgent = activeAnnouncement.importance === 'URGENT';

  return `
    <div class="central-announcement-bar ${isUrgent ? 'urgent' : ''}" id="centralAnnouncementBar">
      <div class="announcement-bar-content">
        <div class="announcement-badge">
          <span class="ticker-pulse-dot"></span>
          <span>${isUrgent ? '🔴 خبر عاجل' : '📢 إعلان رسمي'}</span>
        </div>
        <div class="announcement-ticker-track" style="overflow: hidden; width: 100%; display: flex; align-items: center;">
          <marquee behavior="scroll" direction="right" scrollamount="5" onmouseover="this.stop();" onmouseout="this.start();" style="width: 100%; font-size: 0.95rem; font-weight: 600; color: #ffffff; cursor: default;">
            <span style="font-size: 1rem; font-weight: 800; color: #ffe082; margin-left: 0.5rem;">[ ${activeAnnouncement.title} ]</span>
            <span style="color: #ffffff; font-size: 0.95rem;">${activeAnnouncement.content}</span>
          </marquee>
        </div>
      </div>
      <button class="announcement-close-btn" onclick="document.getElementById('centralAnnouncementBar').style.display='none'" title="إخفاء الشريط">
        ✕
      </button>
    </div>
  `;
}

window.renderAnnouncementBar = renderAnnouncementBar;