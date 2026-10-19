import { AuthManager } from './AuthManager.js';
import { ThemeManager } from './ThemeManager.js';
import { ChatManager } from './ChatManager.js';
import { FeedManager } from './FeedManager.js';
import { ModalManager } from './ModalManager.js';
import { ProfileManager } from './ProfileManager.js';

const auth = new AuthManager();
const theme = new ThemeManager();
const chat = new ChatManager();
const feed = new FeedManager();
const modal = new ModalManager();
const profile = new ProfileManager(feed, chat);

let isResNightsActive = false;

window.addEventListener('DOMContentLoaded', () => {
  if (auth.isLoggedIn()) {
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'block';
    refreshFeed();
  }

  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  document.getElementById('createForm').addEventListener('submit', handleCreatePost);
  document.getElementById('searchInput').addEventListener('input', (e) => refreshFeed(e.target.value));
  
  // Res Nights Toggle Wiring
 window.toggleResNights = () => {
    const res = ThemeManager.toggleResNights();
    isResNightsActive = document.documentElement.getAttribute('data-theme') === 'res-nights';
    
    const logoBtn = document.querySelector('.logo-btn');
    const logoSubtitle = document.getElementById('logoSubtitle');

    if (isResNightsActive) {
      logoBtn.innerText = "SLIDE // RES NIGHTS";
      logoBtn.style.color = "var(--accent)";
      if (logoSubtitle) logoSubtitle.innerText = "Tap to switch to Daytime";
    } else {
      logoBtn.innerText = "SLIDE";
      logoBtn.style.color = "";
      if (logoSubtitle) logoSubtitle.innerText = "Tap to switch to Res Nights";
    }

    refreshFeed();
    modal.showToast(res);
  };

  // Expose global profile handlers
  window.closeProfileModal = () => profile.closeProfile();
  window.switchProfileTab = (tab) => profile.switchTab(tab);
  window.openChatFromProfile = (author) => {
    profile.closeProfile();
    chat.openChat(author);
  };

  window.openCreateModal = () => modal.openCreateModal();
  window.closeCreateModal = () => modal.closeCreateModal();
  window.toggleActivityFields = () => modal.toggleActivityFields();
  window.closeChat = () => chat.closeChat();
  window.sendChatMessage = () => {
    const input = document.getElementById('chatInput');
    const res = chat.sendMessage(input.value);
    if (res) {
      input.value = '';
      modal.showToast(res);
    }
  };
 // Expose global notification modal handlers
  window.toggleNotifications = () => {
    document.getElementById('notificationModal').style.display = 'flex';
  };

  window.closeNotificationModal = () => {
    document.getElementById('notificationModal').style.display = 'none';
  };
  
  window.openProfile = () => {
    const user = auth.getCurrentUser();
    const cleanName = user ? (user.includes('@') ? user.split('@')[0] : user) : "Student";
    profile.openProfile(cleanName);
  };
});

function handleLogin(e) {
  e.preventDefault();
  const inputVal = document.getElementById('studentNum').value;
  const selectedSchool = document.getElementById('schoolSelect').value;
  const errorElement = document.getElementById('loginError');

  try {
    errorElement.style.display = 'none';
    auth.login(inputVal, selectedSchool);
    
    document.getElementById('authScreen').style.display = 'none';
    document.getElementById('appShell').style.display = 'block';
    refreshFeed();
    modal.showToast("Welcome to SLIDE, verified student!");
  } catch (err) {
    errorElement.innerText = err.message;
    errorElement.style.display = 'block';
  }
}

function refreshFeed(filter = '') {
  feed.render(filter, isResNightsActive, handleChatClick, handleProfileClick, handleWave, handleBoost, handleJoin);
}

function handleProfileClick(authorName) {
  profile.openProfile(authorName, auth.getCurrentUser());
}

function handleChatClick(author) {
  chat.openChat(author);
}

function handleWave(postId) {
  feed.triggerWave(postId);
  refreshFeed(document.getElementById('searchInput').value);
  modal.showToast("Private Wave sent to author!");
}

function handleBoost(postId) {
  const isBoosted = feed.triggerBoost(postId);
  refreshFeed(document.getElementById('searchInput').value);
  modal.showToast(isBoosted ? "Post boosted for 20 minutes!" : "Boost removed.");
}

function handleJoin(postId) {
  const isJoined = feed.toggleJoinActivity(postId);
  refreshFeed(document.getElementById('searchInput').value);
  modal.showToast(isJoined ? "Successfully joined campus activity! Added to schedule." : "Cancelled activity participation.");
}

function handleCreatePost(e) {
  e.preventDefault();
  const type = document.getElementById('contentType').value;
  const fileInput = document.getElementById('postImageFile');
  const caption = document.getElementById('postCaption').value;
  const venue = document.getElementById('activityVenue')?.value || '';
  const limit = document.getElementById('activityLimit')?.value || '';
  
  const rawUser = auth.getCurrentUser();
  
  // Clean author name and handle resolution
  let authorName = "Randima Ndivho";
  let handle = "@RandimaNdivho";

  // If the raw login is another custom name (not matching ST number or email), fallback to clean text
  if (rawUser && !/^ST\d+/i.test(rawUser) && !rawUser.includes('@')) {
    authorName = rawUser;
    handle = "@" + rawUser.toLowerCase().replace(/\s+/g, '_');
  }

  // Helper function to finalize and push the post
  const savePostWithImage = (imageUrl) => {
    const newPost = {
      id: Date.now(),
      author: authorName,
      handle: handle,
      avatar: "js\\Assets\\Me.jpg",
      image: imageUrl || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=600",
      caption: caption,
      type: type,
      mode: isResNightsActive ? 'res' : 'day',
      venue: venue,
      limit: limit,
      waves: 0,
      joined: false,
      boosted: false
    };

    feed.addPost(newPost);
    modal.closeCreateModal();
    refreshFeed();
    modal.showToast("Successfully published to campus feed!");
  };

  // If a device file was selected, read it as a Data URL
  if (fileInput && fileInput.files && fileInput.files[0]) {
    const reader = new FileReader();
    reader.onload = function (uploadEvent) {
      savePostWithImage(uploadEvent.target.result);
    };
    reader.readAsDataURL(fileInput.files[0]);
  } else {
    savePostWithImage(null);
  }
}