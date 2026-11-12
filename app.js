let savedRaw = localStorage.getItem("SLIDE_APP_STATE");
let state = savedRaw ? JSON.parse(savedRaw) : null;
if (!state || state.schemaVersion !== INITIAL_STATE.schemaVersion) {
  state = structuredClone(INITIAL_STATE);
  localStorage.setItem("SLIDE_APP_STATE", JSON.stringify(state));
}

let currentFilter = "all";
let isResNights = false;
let activeCommentPostId = null;

function saveState() {
  localStorage.setItem("SLIDE_APP_STATE", JSON.stringify(state));
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");
  if (!container) return;
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

function safeAssetPath(path) {
  return encodeURI(path);
}

/* ==================== 1. AUTHENTICATION & ONBOARDING ==================== */
function switchAuthTab(tab) {
  document.getElementById("tab-login").classList.toggle("active", tab === "login");
  document.getElementById("tab-signup").classList.toggle("active", tab === "signup");
  document.getElementById("login-form").classList.toggle("hidden", tab !== "login");
  document.getElementById("signup-form").classList.toggle("hidden", tab !== "signup");
}

function togglePass(id) {
  const input = document.getElementById(id);
  input.type = input.type === "password" ? "text" : "password";
}

function checkUsername(val) {
  const fb = document.getElementById("username-feedback");
  const clean = val.trim().toLowerCase();
  if (!clean) { fb.textContent = ""; return; }
  const exists = state.registeredUsers.some(u => u.username === clean);
  fb.textContent = exists ? "❌ Username already taken." : "✅ Username available!";
  fb.style.color = exists ? "var(--danger)" : "var(--success)";
}

function checkPasswordStrength(val) {
  const bar = document.getElementById("strength-bar");
  const txt = document.getElementById("strength-text");
  let score = 0;
  if (val.length >= 8) score++;
  if (/[0-9]/.test(val)) score++;
  if (/[^A-Za-z0-9]/.test(val)) score++;

  if (score === 0) { bar.style.width = "0%"; txt.textContent = ""; }
  else if (score === 1) { bar.style.width = "33%"; bar.style.background = "var(--danger)"; txt.textContent = "Weak"; }
  else if (score === 2) { bar.style.width = "66%"; bar.style.background = "#f59e0b"; txt.textContent = "Moderate"; }
  else { bar.style.width = "100%"; bar.style.background = "var(--success)"; txt.textContent = "Strong"; }
}

function handleSignup(e) {
  e.preventDefault();
  const username = document.getElementById("reg-username").value.trim().toLowerCase();
  const email = document.getElementById("reg-email").value.trim().toLowerCase();
  const password = document.getElementById("reg-pass").value;
  const dob = new Date(document.getElementById("reg-dob").value);

  if (!email.endsWith(".ac.za") && !email.endsWith(".edu.za")) {
    showToast("Institutional verification requires a .ac.za or .edu.za email.", "error");
    return;
  }

  const age = new Date().getFullYear() - dob.getFullYear();
  if (age < 16) {
    showToast("Minimum age requirement is 16 years old.", "error");
    return;
  }

  if (state.registeredUsers.some(u => u.username === username || u.email === email)) {
    showToast("An account with this username or email already exists.", "error");
    return;
  }

  window.pendingUser = { username, email, password };
  document.getElementById("auth-screen").classList.remove("active");
  document.getElementById("onboarding-screen").classList.add("active");
  showToast("Institutional email verified! Complete your profile.");
}

function toggleChip(btn) {
  btn.classList.toggle("selected");
}

function nextOnboarding(step) {
  document.querySelectorAll(".ob-step").forEach(el => el.classList.add("hidden"));
  document.getElementById(`ob-step-${step}`).classList.remove("hidden");
  document.getElementById("ob-step-num").textContent = step;
}

function finishOnboarding() {
  const avatar = document.getElementById("ob-avatar").value;
  const name = document.getElementById("ob-name").value.trim();
  const inst = document.getElementById("ob-institution").value;
  const course = document.getElementById("ob-course").value.trim();
  const bio = document.getElementById("ob-bio").value.trim() || "Verified student on SLIDE.";

  if (!name || !course) {
    showToast("Please enter your display name and course.", "error");
    return;
  }

  const interests = Array.from(document.querySelectorAll("#ob-interests .selected")).map(c => c.textContent);
  const newUser = {
    id: "u_" + Date.now(),
    username: window.pendingUser.username,
    email: window.pendingUser.email,
    password: window.pendingUser.password,
    displayName: name,
    institution: inst,
    course,
    bio,
    avatar,
    interests,
    settings: { allowWaves: true, isPrivate: false }
  };

  state.registeredUsers.push(newUser);
  state.currentUser = newUser;
  state.notifications.unshift({
    id: "n_" + Date.now(),
    text: `🎉 Welcome to SLIDE, ${name}! Your institutional account is verified.`,
    time: "Just now",
    unread: true
  });
  saveState();

  document.getElementById("onboarding-screen").classList.remove("active");
  document.getElementById("app-shell").classList.remove("hidden");
  renderAll();
  showToast(`Welcome to SLIDE, ${name}!`);
}

function handleLogin(e) {
  e.preventDefault();
  const identifier = document.getElementById("login-id").value.trim().toLowerCase();
  const pass = document.getElementById("login-pass").value;

  const found = state.registeredUsers.find(
    u => (u.username === identifier || u.email === identifier) && u.password === pass
  );

  if (!found) {
    showToast("Account not found or wrong password. Create an account first.", "error");
    return;
  }

  state.currentUser = found;
  saveState();

  document.getElementById("auth-screen").classList.remove("active");
  document.getElementById("app-shell").classList.remove("hidden");
  renderAll();
  showToast(`Welcome back, ${found.displayName}!`);
}

function logoutUser() {
  closeModal("settings-modal");
  state.currentUser = null;
  saveState();
  document.getElementById("app-shell").classList.add("hidden");
  document.getElementById("auth-screen").classList.add("active");
  showToast("Signed out securely.", "info");
}

/* ==================== 2. NAVIGATION & SLIDE / RES NIGHTS ==================== */
function openView(viewId, navBtn = null) {
  document.querySelectorAll(".app-view").forEach(v => v.classList.add("hidden"));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove("hidden");

  if (navBtn) {
    document.querySelectorAll(".nav-btn").forEach(b => b.classList.remove("active"));
    navBtn.classList.add("active");
  }

  if (viewId === "profile-view") renderProfile();
  if (viewId === "notifications-view") renderNotifications();
  if (viewId === "messages-view") renderMessages();
  if (viewId === "search-view") handleSearch(document.getElementById("global-search-input")?.value || "");
}

function toggleResNights() {
  isResNights = !isResNights;
  document.body.classList.toggle("res-nights", isResNights);
  document.getElementById("res-nights-banner").classList.toggle("hidden", !isResNights);
  document.getElementById("mode-badge").textContent = isResNights ? "RES NIGHTS" : "DAY";
  renderFeed();
  showToast(isResNights ? "🌙 Switched to SLIDE / Res Nights" : "☀️ Switched to SLIDE / Day", "info");
}

/* ==================== 3. HOME FEED & ASSETS ==================== */
function renderStories() {
  const bar = document.getElementById("stories-bar");
  if (!bar) return;
  bar.innerHTML = state.stories.map(s => `
    <div class="story-item" onclick="showToast('${s.user}: ${s.caption}', 'info')">
      <div class="story-ring"><img src="${safeAssetPath(s.avatar)}" alt="${s.user}" /></div>
      <span>${s.user}</span>
    </div>
  `).join("");
}

function renderFeed() {
  const stream = document.getElementById("feed-stream");
  const boostSpot = document.getElementById("boosted-banner-container");
  if (!stream) return;

  const now = Date.now();
  const boostedPost = state.posts.find(p => p.boostedUntil && p.boostedUntil > now && p.isResNights === isResNights);

  if (boostedPost && boostSpot) {
    const mins = Math.ceil((boostedPost.boostedUntil - now) / 60000);
    boostSpot.innerHTML = `
      <div class="boosted-spotlight">
        <span class="boost-tag">⚡ CAMPUS SPOTLIGHT • ${mins} MIN REMAINING</span>
        <p><strong>${boostedPost.authorName}</strong> (${boostedPost.institution}): ${boostedPost.caption}</p>
      </div>`;
  } else if (boostSpot) {
    boostSpot.innerHTML = "";
  }

  // Strictly separates SLIDE / Day (isResNights: false) from SLIDE / Res Nights (isResNights: true)
  const filtered = state.posts.filter(p => {
    if (p.isResNights !== isResNights) return false;
    if (currentFilter === "activities" && !p.activity) return false;
    if (currentFilter === "saved" && !p.saved) return false;
    return true;
  });

  if (filtered.length === 0) {
    stream.innerHTML = `<div class="card-panel" style="text-align:center;"><p class="muted-text">No posts in this view yet.</p></div>`;
    return;
  }

  stream.innerHTML = filtered.map(post => {
    const isBoosted = post.boostedUntil && post.boostedUntil > now;
    let activityHtml = "";

    if (post.activity) {
      const act = post.activity;
      const uname = state.currentUser ? state.currentUser.username : "guest";
      const joined = act.participants.includes(uname);
      const spacesLeft = act.maxParticipants - act.participants.length;

      let badgeText = `${spacesLeft} spaces left`;
      let badgeClass = "";
      let btnHtml = "";

      if (act.status === "cancelled") {
        badgeText = "CANCELLED BY ORGANISER";
        badgeClass = "cancelled";
        btnHtml = `<button class="btn-secondary" disabled>Activity Cancelled</button>`;
      } else if (joined) {
        badgeText = "JOINED ✓";
        btnHtml = `<button class="btn-secondary" onclick="toggleJoinActivity('${post.id}')">Leave Activity</button>`;
      } else if (spacesLeft <= 0 || act.status === "full") {
        badgeText = "ACTIVITY FULL";
        badgeClass = "full";
        btnHtml = `<button class="btn-secondary" disabled>Full (${act.maxParticipants}/${act.maxParticipants})</button>`;
      } else {
        btnHtml = `<button class="btn-primary" onclick="toggleJoinActivity('${post.id}')">Join Activity</button>`;
      }

      activityHtml = `
        <div class="activity-box">
          <div class="activity-box-top">
            <strong>📍 ${act.title}</strong>
            <span class="status-badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="activity-meta">
            <div>🕒 ${act.time} • 📌 ${act.location}</div>
            <div>👥 Going (${act.participants.length}/${act.maxParticipants}): ${act.participants.join(", ")}</div>
          </div>
          ${btnHtml}
        </div>`;
    }

    return `
      <article class="post-card">
        <div class="post-header">
          <div class="post-user">
            <img src="${safeAssetPath(post.avatar)}" class="avatar" alt="${post.authorName}" />
            <div class="user-meta">
              <strong>${post.authorName} ${post.isResNights ? "🌙" : "☀️"}</strong>
              <small>@${post.username} • ${post.institution} • ${post.timestamp}</small>
            </div>
          </div>
          <button class="btn-text" onclick="reportPost('${post.id}')" title="Report content">🚩</button>
        </div>

        <img src="${safeAssetPath(post.image)}" class="post-image" alt="${post.alt}" />

        <div class="post-body">
          <p class="post-caption">${post.caption}</p>
          ${activityHtml}
        </div>

        <div class="post-actions">
        <div class="action-group">
            <button class="act-btn ${post.waved ? 'waved' : ''}" onclick="sendWave('${post.id}')">
              👋 ${post.waved ? 'Waved' : 'Wave'}
            </button>
            ${!post.activity ? `
              <button class="act-btn" onclick="openSlideDm('${post.id}')">
                📩 SLIDE
              </button>
            ` : ""}
            <button class="act-btn" onclick="openComments('${post.id}')">
              💬 Discuss (${post.comments.length})
            </button>
            <button class="act-btn ${isBoosted ? 'boosted' : ''}" onclick="activateBoost('${post.id}')">
              ⚡ ${isBoosted ? 'Boosted' : 'Boost'}
            </button>
          </div>
      </article>`;
  }).join("");
}

function setFeedFilter(filter, btn) {
  currentFilter = filter;
  document.querySelectorAll(".feed-tab").forEach(t => t.classList.remove("active"));
  if (btn) btn.classList.add("active");
  renderFeed();
}

/* ==================== 4. SIGNATURE MECHANICS ==================== */
function sendWave(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  if (post.waved) {
    showToast("Private Wave already sent.", "info");
    return;
  }
  post.waved = true;
  state.notifications.unshift({
    id: "n_" + Date.now(),
    text: `👋 Private Wave sent to ${post.authorName} (Zero public counter)`,
    time: "Just now",
    unread: true
  });
  saveState();
  renderFeed();
  showToast("Private Wave sent!");
}

function activateBoost(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  post.boostedUntil = Date.now() + 15 * 60 * 1000;
  saveState();
  renderFeed();
  showToast("⚡ Boost activated! Pinned to Campus Spotlight for 15 minutes.");
}

function toggleSave(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post) return;
  post.saved = !post.saved;
  saveState();
  renderFeed();
  showToast(post.saved ? "Saved to your private collection." : "Removed from saved.", "info");
}

function toggleJoinActivity(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post || !post.activity) return;

  const act = post.activity;
  if (act.status === "cancelled") {
    showToast("Cannot join a cancelled activity.", "error");
    return;
  }

  const uname = state.currentUser.username;
  const idx = act.participants.indexOf(uname);

  if (idx > -1) {
    act.participants.splice(idx, 1);
    if (act.status === "full") act.status = "open";
    showToast("You left the activity. Spot reopened.", "info");
  } else {
    if (act.participants.length >= act.maxParticipants) {
      act.status = "full";
      showToast("Activity is already full!", "error");
      renderFeed();
      return;
    }
    act.participants.push(uname);
    if (act.participants.length >= act.maxParticipants) {
      act.status = "full";
    }
    showToast("Joined activity! Organiser notified.");
  }
  saveState();
  renderFeed();
}

/* ==================== 5. PUBLISHING, COMMENTS, SEARCH & PROFILE ==================== */
function switchCreateType(type) {
  document.getElementById("create-type-post").classList.toggle("active", type === "post");
  document.getElementById("create-type-activity").classList.toggle("active", type === "activity");
  document.getElementById("activity-fields").classList.toggle("hidden", type !== "activity");
}

function publishContent(e) {
  e.preventDefault();
  const image = document.getElementById("post-media-preset").value;
  const alt = document.getElementById("post-alt").value.trim();
  const caption = document.getElementById("post-caption").value.trim();
  const resFlag = document.getElementById("post-is-res-nights").checked;

  let activity = null;
  if (!document.getElementById("activity-fields").classList.contains("hidden")) {
    activity = {
      title: document.getElementById("act-title").value.trim() || "Campus Meetup",
      location: document.getElementById("act-location").value.trim() || "Main Campus",
      time: document.getElementById("act-time").value.trim() || "Today, 18:00",
      maxParticipants: parseInt(document.getElementById("act-max").value, 10) || 5,
      participants: [state.currentUser.username],
      status: "open"
    };
  }

  state.posts.unshift({
    id: "p_" + Date.now(),
    authorName: state.currentUser.displayName,
    username: state.currentUser.username,
    institution: state.currentUser.institution,
    avatar: state.currentUser.avatar,
    image,
    alt,
    caption,
    timestamp: "Just now",
    isResNights: resFlag,
    waved: false,
    saved: false,
    boostedUntil: null,
    comments: [],
    activity
  });

  saveState();
  document.getElementById("create-form").reset();
  openView("home-view", document.querySelector(".nav-btn"));
  renderFeed();
  showToast(resFlag ? "Published to SLIDE / Res Nights!" : "Published to SLIDE / Day!");
}

function openComments(postId) {
  activeCommentPostId = postId;
  const post = state.posts.find(p => p.id === postId);
  const list = document.getElementById("comments-list");
  list.innerHTML = post.comments.length
    ? post.comments.map(c => `<div class="comment-item"><strong>@${c.user}:</strong> ${c.text}</div>`).join("")
    : `<p class="muted-text">No comments yet. Start the discussion!</p>`;
  openModal("comments-modal");
}

function submitComment(e) {
  e.preventDefault();
  const input = document.getElementById("comment-input");
  const text = input.value.trim();
  if (!text) return;

  const post = state.posts.find(p => p.id === activeCommentPostId);
  post.comments.push({ id: "c_" + Date.now(), user: state.currentUser.username, text });
  input.value = "";
  saveState();
  openComments(activeCommentPostId);
  renderFeed();
  showToast("Comment posted.");
}
function openSlideDm(postId) {
  const post = state.posts.find(p => p.id === postId);
  if (!post || post.activity) return; // Guard: strictly unavailable on activity posts

  activeSlidePostId = postId;
  document.getElementById("slide-dm-context").innerHTML = `
    <div style="display:flex; align-items:center; gap:10px;">
      <img src="${safeAssetPath(post.image)}" style="width:48px; height:48px; border-radius:8px; object-fit:cover;" alt="${post.alt}" />
      <div>
        <strong>To: ${post.authorName} (@${post.username})</strong>
        <p class="muted-text" style="margin:2px 0 0;">Re: "${post.caption.slice(0, 60)}${post.caption.length > 60 ? '...' : ''}"</p>
      </div>
    </div>
  `;
  openModal("slide-dm-modal");
}

function submitSlideDm(e) {
  e.preventDefault();
  const input = document.getElementById("slide-dm-input");
  const text = input.value.trim();
  if (!text) return;

  const post = state.posts.find(p => p.id === activeSlidePostId);
  if (!post || post.activity) return;

  state.messages.unshift({
    id: "dm_" + Date.now(),
    sender: state.currentUser.username,
    recipient: post.username,
    recipientName: post.authorName,
    recipientAvatar: post.avatar,
    postRef: {
      id: post.id,
      image: post.image,
      caption: post.caption
    },
    text,
    time: "Just now"
  });

  state.notifications.unshift({
    id: "n_" + Date.now(),
    text: `📩 You slid into ${post.authorName}'s DMs regarding their post.`,
    time: "Just now",
    unread: true
  });

  input.value = "";
  saveState();
  closeModal("slide-dm-modal");
  showToast(`📩 Slid into @${post.username}'s DMs!`);
}

function handleSearch(q) {
  const query = q.toLowerCase().trim();
  const container = document.getElementById("search-results");
  if (!container) return;

  const results = state.posts.filter(p =>
    p.caption.toLowerCase().includes(query) ||
    p.authorName.toLowerCase().includes(query) ||
    p.institution.toLowerCase().includes(query) ||
    (p.activity && p.activity.title.toLowerCase().includes(query))
  );

  container.innerHTML = results.length
    ? results.map(r => `
        <div class="notif-card" style="flex-direction:column; align-items:flex-start; gap:4px;">
          <strong>${r.authorName} <small class="muted-text">• ${r.institution} (${r.isResNights ? "Res Nights" : "Day"})</small></strong>
          <span>${r.caption}</span>
        </div>`).join("")
    : `<p class="muted-text">No matching posts, institutions, or activities.</p>`;
}

function renderNotifications() {
  const list = document.getElementById("notifications-list");
  if (!list) return;
  list.innerHTML = state.notifications.length
    ? state.notifications.map(n => `<div class="notif-card ${n.unread ? 'unread' : ''}"><span>${n.text}</span><small>${n.time}</small></div>`).join("")
    : `<p class="muted-text">No notifications yet.</p>`;
}

function markAllNotificationsRead() {
  state.notifications.forEach(n => n.unread = false);
  saveState();
  renderNotifications();
  showToast("All notifications marked as read.");
}

function renderProfile() {
  const u = state.currentUser;
  if (!u) return;
  const userPosts = state.posts.filter(p => p.username === u.username);
  const container = document.getElementById("profile-container");
  if (!container) return;

  const interestsHtml = (u.interests && u.interests.length)
    ? `<div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:6px;">${u.interests.map(i => `<span class="badge-pill">${i}</span>`).join("")}</div>`
    : "";

  container.innerHTML = `
    <div class="profile-header-card">
      <div class="profile-top">
        <img src="${safeAssetPath(u.avatar)}" class="profile-avatar-lg" alt="${u.displayName}" />
        <div>
          <h2>${u.displayName}</h2>
          <p class="muted-text">@${u.username} • ${u.institution}</p>
          <span class="badge-pill">${u.course}</span>
        </div>
      </div>
      <p style="margin-top:12px;">${u.bio}</p>
      ${interestsHtml}
      <div class="profile-stats" style="margin-top:14px;">
        <span><strong>${userPosts.length}</strong> Your Posts</span> •
        <span>🔒 <strong>Zero Public Follower Clout</strong></span>
      </div>
    </div>`;
}

function renderMessages() {
  const container = document.getElementById("dm-container");
  if (!container) return;

  if (!state.messages.length) {
    container.innerHTML = `
      <div class="card-panel" style="text-align:center;">
        <p class="muted-text">No SLIDE conversations yet. Tap <strong>📩 SLIDE</strong> on any standard post in the feed to start a private conversation.</p>
      </div>`;
    return;
  }

  container.innerHTML = state.messages.map(m => `
    <div class="dm-thread">
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-color); padding-bottom:8px;">
        <div style="display:flex; align-items:center; gap:8px;">
          <img src="${safeAssetPath(m.recipientAvatar || 'Assets/Me.jpg')}" class="avatar" alt="${m.recipientName || m.recipient}" />
          <div>
            <strong>${m.recipientName || '@' + m.recipient}</strong>
            <small class="muted-text" style="display:block;">@${m.recipient} • ${m.time}</small>
          </div>
        </div>
        <span class="badge-pill">SLIDE DM</span>
      </div>
      ${m.postRef ? `
        <div style="display:flex; align-items:center; gap:8px; background:var(--bg-subtle); padding:8px; border-radius:8px; margin-top:10px;">
          <img src="${safeAssetPath(m.postRef.image)}" style="width:36px; height:36px; border-radius:6px; object-fit:cover;" alt="Post preview" />
          <small class="muted-text">Post: "${m.postRef.caption.slice(0, 55)}..."</small>
        </div>
      ` : ""}
      <div class="dm-bubbles">
        <div class="bubble me">${m.text}</div>
      </div>
    </div>
  `).join("");
}

function sendDm(e) {
  e.preventDefault();
  const input = document.getElementById("dm-input");
  const text = input.value.trim();
  if (!text) return;
  state.messages.push({ sender: state.currentUser.username, text, time: "Just now" });
  input.value = "";
  saveState();
  renderMessages();
}

function reportPost(postId) {
  state.reports.unshift({
    id: "rep_" + Date.now(),
    targetType: "Post",
    targetId: postId,
    reason: "Flagged by verified student for moderation review",
    status: "Pending Review"
  });
  saveState();
  showToast("Post reported to Campus Moderation Console.", "info");
}

function openAdminConsole() {
  document.getElementById("admin-stats").innerHTML = `
    <div class="stat-box"><strong>${state.registeredUsers.length}</strong><small>Registered Users</small></div>
    <div class="stat-box"><strong>${state.posts.length}</strong><small>Active Posts</small></div>
    <div class="stat-box"><strong>${state.reports.length}</strong><small>Safety Reports</small></div>
  `;
  document.getElementById("admin-reports-list").innerHTML = state.reports.length
    ? state.reports.map(r => `<div class="notif-card"><span><strong>[${r.targetType} ${r.targetId}]</strong> ${r.reason}</span><span class="badge-pill">${r.status}</span></div>`).join("")
    : `<p class="muted-text">No safety reports in queue.</p>`;
  openModal("admin-modal");
}

function toggleSetting(key, val) {
  state.currentUser.settings[key] = val;
  saveState();
  showToast("Privacy setting updated.");
}

function exportUserData() {
  const blob = new Blob([JSON.stringify(state.currentUser, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "SLIDE_POPIA_Data_Export.json";
  a.click();
  showToast("POPIA personal data exported (JSON).");
}

function openModal(id) { document.getElementById(id).classList.remove("hidden"); }
function closeModal(id) { document.getElementById(id).classList.add("hidden"); }

function renderAll() {
  renderStories();
  renderFeed();
}

window.addEventListener("DOMContentLoaded", () => {
  if (state.currentUser) {
    document.getElementById("auth-screen").classList.remove("active");
    document.getElementById("app-shell").classList.remove("hidden");
    renderAll();
  } else {
    document.getElementById("auth-screen").classList.add("active");
    document.getElementById("app-shell").classList.add("hidden");
  }
});