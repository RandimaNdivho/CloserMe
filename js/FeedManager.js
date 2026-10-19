export class FeedManager {
  constructor() {
    this.initialPosts = [
         // Randima's Preset Post
      {
        id: 1,
        author: "Randima Ndivho",
        handle: "@RandimaNdivho",
        avatar: "js\\Assets\\Me.jpg",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600",
        caption: "Working on the SLIDE interface prototype in VS Code! Everything is fully functional 💻✨",
        type: "post",
        mode: "day",
        waves: 12,
        joined: false,
        boosted: true
      },
      // Day Mode Preset Posts
      {
        id: 2,
        author: "Rosebank Institute",
        handle: "@Rosebank International",
        avatar: "js\\Assets\\RI.jpg",
        image: "js\\Assets\\RI.jpg",
        caption: "Rosebank declare that all students should get at least 85% in HCIN P2",
        type: "post",
        mode: "day",
        venue: "Res Quad Turf",
        limit: "16 players",
        waves: 45000,
        joined: true,
        boosted: true
      },
      {
        id: 3,
        author: "Thabo Khumalo",
        handle: "@thabo_k",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100",
        image: "js\\Assets\\5 Football.jpg",
        caption: "Campus 5-a-side soccer tournament at the Res Quad this Friday afternoon. Come through!",
        type: "activity",
        mode: "day",
        venue: "Res Quad Turf",
        limit: "16 players",
        waves: 68,
        joined: true,
        boosted: true
      },
      {
        id: 4,
        author: "Jason Rndma",
        handle: "@Jason_Rndma",
        avatar: "js\\Assets\\Jason.jpg",
        image: "js\\Assets\\Library.jpg",
        caption: "Looking for a study buddy for the upcoming exams. Let's hit the library together and ace this!",
        type: "activity",
        mode: "day",
        venue: "Res Quad Turf",
        limit: "16 players",
        waves: 118,
        joined: true,
        boosted: true
      },
      {
        id: 5,
        author: "Dr. van der Merwe",
        handle: "@cs_faculty",
        avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
        image: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600",
        caption: "Reminder: HCIN is not Chemistry. Learners should pass comfortably if they're doing their work. #CampusLife",
        type: "post",
        mode: "day",
        waves: 15673,
        joined: false,
        boosted: false
      },
      // Res Nights Mode Preset Posts (Clubs, Game Night, Late Library)
      {
        id: 6,
        author: "Lerato Mokoena",
        handle: "@lerato_m",
        avatar: "js\\Assets\\Black Girl.jpg",
        image: "js\\Assets\\Girls Night.png",
        caption: "Out and About with the girls. @Tyla, tell them.",
        type: "post",
        mode: "res",
        waves: 14,
        joined: false,
        boosted: false
      },
      {
        id: 7,
        author: "Chloe van Der Merwe",
        handle: "@chloe_vdm",
        avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100",
        image: "js\\Assets\\Drama.webp",
        caption: "Looking for people I can club with.",
        type: "activity",
        mode: "res",
        venue: "Block B Common Room",
        limit: "8 people",
        waves: 452,
        joined: false,
        boosted: true
      },
      {
        id: 8,
        author: "Sipho Dlamini",
        handle: "@sipho_d",
        avatar: "js\\Assets\\View Guy.jpg",
        image: "js\\Assets\\Night View.webp",
        caption: "View Looking amazing from the Res Quad terrace tonight! 🌃✨",
        type: "post",
        mode: "res",
        waves: 19,
        joined: true,
        boosted: false
      },
     
    ];
const CURRENT_VERSION = 'v17'; // Increment this (v3, v4) whenever you change or add posts in code!
    let savedData = JSON.parse(localStorage.getItem('slide_data'));

    if (!savedData || savedData.version !== CURRENT_VERSION || savedData.posts.length !== this.initialPosts.length) {
      this.posts = this.initialPosts;
      localStorage.setItem('slide_data', JSON.stringify({
        version: CURRENT_VERSION,
        posts: this.posts
      }));
    } else {
      this.posts = savedData.posts;
    }
  }

  render(filterText = '', isResMode = false, onChatClick, onProfileClick, onWave, onBoost, onJoin) {
    const stream = document.getElementById('feedStream');
    stream.innerHTML = '';

    const filtered = this.posts.filter(p => {
      const matchesMode = isResMode ? p.mode === 'res' : p.mode === 'day';
      const matchesSearch = p.caption.toLowerCase().includes(filterText.toLowerCase()) ||
                            p.author.toLowerCase().includes(filterText.toLowerCase());
      return matchesMode && matchesSearch;
    });

    if (filtered.length === 0) {
      stream.innerHTML = `
        <div style="text-align:center; padding:40px; color:var(--text-muted);">
          <p style="font-size:15px; font-weight:600; margin-bottom:6px;">No ${isResMode ? 'Res Nights' : 'Daytime'} posts found.</p>
          <p style="font-size:12px;">Be the first to share a moment in this mode using the '+' button above!</p>
        </div>`;
      return;
    }

    filtered.forEach(post => {
      const card = document.createElement('div');
      card.className = 'post-card';
      
      const isSelfPost = post.author === "Randima Ndivho";
      const chatBtnHtml = isSelfPost ? '' : `
        <button class="chat-trigger-btn" style="background:var(--bg-secondary); border:1px solid var(--border); padding:4px 10px; border-radius:6px; font-size:11px; font-weight:600; cursor:pointer; color:var(--text-main);">SLIDE Chat</button>
      `;

      let actionButtons = `
        <button class="action-btn wave-btn" data-id="${post.id}">👋 Wave (${post.waves})</button>
        <button class="action-btn comment-btn">💬 Comments</button>
        <button class="action-btn boost-btn" data-id="${post.id}">${post.boosted ? '⚡ Boosted (Active)' : '⚡ Boost'}</button>
      `;

      if (post.type === 'activity') {
        actionButtons += `
          <button class="action-btn join-btn ${post.joined ? 'joined' : ''}" data-id="${post.id}">
            ${post.joined ? '✓ Joined' : 'Join Activity'}
          </button>
        `;
      }

      card.innerHTML = `
        <div class="post-header">
          <div class="user-meta profile-trigger" data-author="${post.author}" style="cursor:pointer; display:flex; gap:10px; align-items:center;">
            <img src="${post.avatar}" alt="${post.author}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
            <div>
              <h4 style="font-size:14px; font-weight:700;">${post.author} ${isSelfPost ? '<span style="font-size:10px; color:var(--accent); font-weight:normal;">(You)</span>' : ''}</h4>
              <span>${post.handle} • Verified Student</span>
            </div>
          </div>
          ${chatBtnHtml}
        </div>
        
        <div class="post-img-container">
          <img src="${post.image}" alt="Post campus image" style="width:100%; max-height:450px; object-fit:cover;">
        </div>

        <div class="post-body">
          <p>${post.caption}</p>
          ${post.type === 'activity' ? `<p style="font-size:12px; font-weight:600; color:var(--accent); margin-top:6px;">📍 Venue: ${post.venue} \vert{} Max:${post.limit}</p>` : ''}
        </div>

        <div class="post-actions">
          ${actionButtons}
        </div>
      `;

      card.querySelector('.profile-trigger').addEventListener('click', () => onProfileClick(post.author));
      if (!isSelfPost) {
        card.querySelector('.chat-trigger-btn').addEventListener('click', () => onChatClick(post.author));
      }
      card.querySelector('.wave-btn').addEventListener('click', () => onWave(post.id));
      card.querySelector('.boost-btn').addEventListener('click', () => onBoost(post.id));
      if (post.type === 'activity') {
        card.querySelector('.join-btn').addEventListener('click', () => onJoin(post.id));
      }

      stream.appendChild(card);
    });
  }

  addPost(newPostData) {
    this.posts.unshift(newPostData);
    localStorage.setItem('slide_posts', JSON.stringify(this.posts));
  }

  triggerWave(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.waves += 1;
      localStorage.setItem('slide_posts', JSON.stringify(this.posts));
    }
  }

  triggerBoost(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.boosted = !post.boosted;
      localStorage.setItem('slide_posts', JSON.stringify(this.posts));
      return post.boosted;
    }
  }

  toggleJoinActivity(postId) {
    const post = this.posts.find(p => p.id === postId);
    if (post) {
      post.joined = !post.joined;
      localStorage.setItem('slide_posts', JSON.stringify(this.posts));
      return post.joined;
    }
  }
}