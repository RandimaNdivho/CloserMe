export class ChatManager {
  constructor() {
    this.recipient = "";
  }

  openChat(recipientName) {
    this.recipient = recipientName;
    document.getElementById('chatRecipientName').innerText = `SLIDE Chat with ${recipientName}`;
    document.getElementById('chatModal').style.display = 'flex';
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML = `
      <div style="background:var(--bg-secondary); padding:8px 12px; border-radius:8px; font-size:12px; max-width:80%;">
        <b>${recipientName}:</b> Hey! Saw your post on the campus feed. Are you heading to the session later?
      </div>
    `;
  }

  closeChat() {
    document.getElementById('chatModal').style.display = 'none';
  }

  sendMessage(text) {
    if (!text.trim()) return null;
    
    const chatMessages = document.getElementById('chatMessages');
    chatMessages.innerHTML += `
      <div style="background:var(--accent); color:white; padding:8px 12px; border-radius:8px; font-size:12px; max-width:80%; margin-left:auto;">
        ${text}
      </div>
    `;
    chatMessages.scrollTop = chatMessages.scrollHeight;
    return "Private message delivered ✓";
  }
}