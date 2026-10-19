export class ProfileManager {
  constructor(feedManager, chatManager) {
    this.feedManager = feedManager;
    this.chatManager = chatManager;
    this.activeAuthor = null;
    this.activeTab = 'posts';
  }

  openProfile(authorName, currentUser) {
    this.activeAuthor = authorName;
    this.activeTab = 'posts';
    
    let displayName = authorName;
    let handle = `@${authorName.toLowerCase().replace(/\s+/g, '_')}`;
    let course = "Information Technology & Software Dev";
    let interests = ["Football", "Coding", "Hip-Hop", "UI/UX"];

    // Check if the profile being opened is the current logged-in user
    const isSelf = authorName === "Randima Ndivho" || 
                   /^ST\d+/i.test(authorName) || 
                   authorName.includes('@') ||
                   (currentUser && (authorName.toLowerCase() === currentUser.toLowerCase()));

    if (isSelf) {
      displayName = "Randima Ndivho";
      handle = "@RandimaNdivho";
    }

    const userPost = this.feedManager.posts.find(p => p.author.toLowerCase() === authorName.toLowerCase() || p.author === displayName);
    const avatar = userPost ? userPost.avatar : "js\\Assets\\Me.jpg";
    const institution = "University Campus Community";

    // Only render SLIDE Chat button if inspecting ANOTHER student
    const chatButtonHtml = isSelf ? '' : `
      <button onclick="openChatFromProfile('${displayName}')" style="background:var(--bg-secondary); border:1px solid var(--border); padding:6px 12px; border-radius:6px; font-size:12px; font-weight:600; cursor:pointer; color:var(--text-main);">SLIDE Chat</button>
    `;

    // Populate Header
    document.getElementById('profileHeaderInfo').innerHTML = `
      <img src="${avatar}" alt="${displayName}" style="width: 64px; height: 64px; border-radius: 50%; object-fit: cover; border: 2px solid var(--accent);">
      <div style="flex:1;">
        <h3 style="font-size: 18px; font-weight: 700; margin-bottom: 2px;">${displayName}${isSelf ? '<span style="font-size:11px; color:var(--accent); font-weight:normal;">(You)</span>' : ''}</h3>
        <p style="font-size: 12px; color: var(--text-muted); margin-bottom: 4px;">${handle} •${institution}</p>
        <p style="font-size: 12px; font-weight: 600; color: var(--text-main);">${course}</p>
      </div>
      ${chatButtonHtml}
    `;

    // Populate Interests
    const interestsContainer = document.getElementById('profileInterests');
    interestsContainer.innerHTML = interests.map(tag => `
      <span style="background:var(--bg-secondary); border:1px solid var(--border); padding:4px 10px; border-radius:12px; font-size:11px; font-weight:600; color:var(--text-muted);">
        ${tag}
      </span>
    `).join('');

    this.renderTabContent(isSelf);
    document.getElementById('profileModal').style.display = 'flex';
  }

  switchTab(tabName) {
    this.activeTab = tabName;
    const postsBtn = document.getElementById('tabPostsBtn');
    const actsBtn = document.getElementById('tabActsBtn');

    if (tabName === 'posts') {
      postsBtn.style.color = 'var(--accent)';
      postsBtn.style.borderBottom = '2px solid var(--accent)';
      actsBtn.style.color = 'var(--text-muted)';
      actsBtn.style.borderBottom = 'none';
    } else {
      actsBtn.style.color = 'var(--accent)';
      actsBtn.style.borderBottom = '2px solid var(--accent)';
      postsBtn.style.color = 'var(--text-muted)';
      postsBtn.style.borderBottom = 'none';
    }

    const isSelf = this.activeAuthor === "Randima Ndivho" || /^ST\d+/i.test(this.activeAuthor) || this.activeAuthor.includes('@');
    this.renderTabContent(isSelf);
  }

  renderTabContent(isSelf = false) {
    const container = document.getElementById('profileTabContent');
    container.innerHTML = '';

    const userItems = this.feedManager.posts.filter(p => {
      const isAuthor = p.author.toLowerCase() === this.activeAuthor.toLowerCase() || 
                       (isSelf && p.author === "Randima Ndivho");
      if (this.activeTab === 'posts') {
        return isAuthor && p.type === 'post';
      } else {
        return isAuthor && p.type === 'activity';
      }
    });

    if (userItems.length === 0) {
      container.innerHTML = `
        <div style="text-align:center; padding:24px; color:var(--text-muted); font-size:13px;">
          No ${this.activeTab} shared yet. Share a post or activity to see it here!
        </div>`;
      return;
    }

    userItems.forEach(item => {
      const card = document.createElement('div');
      card.style.cssText = "background:var(--bg-secondary); border:1px solid var(--border); border-radius:8px; padding:12px; display:flex; gap:10px; align-items:center;";
      card.innerHTML = `
        <img src="${item.image}" alt="Preview" style="width:50px; height:50px; border-radius:6px; object-fit:cover;">
        <div style="flex:1; overflow:hidden;">
          <p style="font-size:12px; font-weight:600; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${item.caption}</p>
          <span style="font-size:10px; color:var(--text-muted);">${item.type === 'activity' ? '📍 ' + item.venue : 'Standard Post'}</span>
        </div>
      `;
      container.appendChild(card);
    });
  }

  closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
  }
}