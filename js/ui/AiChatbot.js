/**
 * AiChatbot.js
 * Intelligent Travel Concierge supporting Groq, NVIDIA, or built-in contextual fallback.
 * Allows users to ask questions, explore history, customize budgets, and find hidden spots.
 */

import { tripStore } from "../state/TripStore.js";
import { escapeHTML } from "../utils/helpers.js";

export class AiChatbot {
  constructor() {
    if (window.choloAiChatbot) {
      return window.choloAiChatbot;
    }
    window.choloAiChatbot = this;

    this.isOpen = false;
    this.conversationHistory = [];
    this.groqApiKey = localStorage.getItem("cga_groq_api_key") || "";
    this.nvidiaApiKey = localStorage.getItem("cga_nvidia_api_key") || "";
    this.activeProvider = localStorage.getItem("cga_ai_provider") || "groq";

    this.trigger = null;
    this.win = null;

    this.init();
  }

  init() {
    this.injectStyles();
    this.createDom();
    this.bindEvents();

    // Initial greeting (do not record in API chat history)
    this.addBotMessage(
      "Hello wanderer! ✈️ I'm your **Cholo AI Travel Assistant**.\n\nAsk me anything about your destinations, travel stories, realistic budgets, or best local foods! You can also click the ⚙️ icon to plug in your Groq or NVIDIA key if you'd like to use your own AI model.",
      false
    );
  }

  injectStyles() {
    if (document.getElementById("cga-chatbot-styles")) return;
    const style = document.createElement("style");
    style.id = "cga-chatbot-styles";
    style.textContent = `
      .cga-chatbot-trigger {
        position: fixed;
        bottom: 24px;
        left: 24px;
        z-index: 999999;
        display: flex;
        align-items: center;
        gap: 8px;
        background: rgba(18, 19, 24, 0.95);
        color: #fff;
        padding: 8px 16px 8px 10px;
        border-radius: 999px;
        border: 1px solid rgba(200, 150, 62, 0.4);
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.08);
        cursor: pointer;
        font-family: inherit;
        font-size: 13px;
        font-weight: 600;
        backdrop-filter: blur(12px);
        transition: transform 0.2s, box-shadow 0.2s;
        user-select: none;
      }

      .cga-chatbot-trigger:hover {
        transform: translateY(-2px);
        box-shadow: 0 14px 36px rgba(200, 150, 62, 0.3);
      }

      .cga-chatbot-avatar {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #c8963e, #f39c12);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
      }

      .cga-chatbot-window {
        position: fixed;
        bottom: 80px;
        left: 24px;
        width: 380px;
        max-width: calc(100vw - 48px);
        height: 520px;
        max-height: calc(100vh - 120px);
        background: rgba(18, 20, 26, 0.96);
        backdrop-filter: blur(24px);
        border: 1px solid rgba(200, 150, 62, 0.35);
        border-radius: 18px;
        box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.06);
        z-index: 9999999;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        animation: chatSlideUp 0.25s cubic-bezier(0.16, 1, 0.3, 1);
      }

      .cga-chatbot-window.hidden {
        display: none !important;
      }

      @keyframes chatSlideUp {
        from { opacity: 0; transform: translateY(16px) scale(0.96); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }

      .cga-chat-header {
        padding: 14px 16px;
        background: rgba(255, 255, 255, 0.03);
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .cga-chat-header-title {
        display: flex;
        align-items: center;
        gap: 10px;
      }

      .cga-chat-header-title h3 {
        margin: 0;
        font-size: 14px;
        font-weight: 700;
        color: #f1f3f5;
        letter-spacing: -0.2px;
      }

      .cga-chat-header-title span {
        font-size: 11px;
        color: #2ecc71;
        display: flex;
        align-items: center;
        gap: 4px;
      }

      .cga-chat-header-actions {
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .cga-chat-icon-btn {
        background: transparent;
        border: none;
        color: #8c919d;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 6px;
        font-size: 14px;
        transition: color 0.15s;
      }

      .cga-chat-icon-btn:hover {
        color: #fff;
        background: rgba(255, 255, 255, 0.06);
      }

      .cga-chat-messages {
        flex: 1;
        overflow-y: auto;
        padding: 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }

      .cga-chat-bubble {
        max-width: 90%;
        padding: 12px 15px;
        border-radius: 14px;
        font-size: 13px;
        line-height: 1.6;
        word-break: break-word;
      }

      .cga-chat-bubble.bot {
        align-self: flex-start;
        background: rgba(26, 30, 40, 0.9);
        color: #e4e7eb;
        border: 1px solid rgba(255, 255, 255, 0.09);
        border-bottom-left-radius: 4px;
      }

      .cga-chat-bubble.bot h3 {
        font-size: 14.5px;
        font-weight: 700;
        color: #f1c40f;
        margin: 12px 0 6px 0;
      }

      .cga-chat-bubble.bot h4 {
        font-size: 13.5px;
        font-weight: 700;
        color: #e6b86a;
        margin: 10px 0 4px 0;
      }

      .cga-chat-bubble.bot strong {
        color: #fff;
        font-weight: 700;
      }

      .cga-chat-bubble.bot em {
        color: #d1d5db;
        font-style: italic;
      }

      .cga-chat-bubble.bot ul, .cga-chat-bubble.bot ol {
        margin: 6px 0 8px 18px;
        padding: 0;
      }

      .cga-chat-bubble.bot li {
        margin-bottom: 5px;
        line-height: 1.5;
      }

      .cga-chat-bubble.bot blockquote {
        margin: 8px 0;
        padding: 6px 12px;
        background: rgba(200, 150, 62, 0.1);
        border-left: 3px solid #c8963e;
        border-radius: 4px;
        color: #e0e0e0;
      }

      .chat-table-wrap {
        width: 100%;
        overflow-x: auto;
        margin: 10px 0;
        border-radius: 8px;
        border: 1px solid rgba(255, 255, 255, 0.12);
        background: rgba(0, 0, 0, 0.35);
      }

      .chat-table-wrap table {
        width: 100%;
        border-collapse: collapse;
        font-size: 11.5px;
      }

      .chat-table-wrap th, .chat-table-wrap td {
        padding: 6px 10px;
        border-bottom: 1px solid rgba(255, 255, 255, 0.08);
        border-right: 1px solid rgba(255, 255, 255, 0.08);
        text-align: left;
      }

      .chat-table-wrap th {
        background: rgba(200, 150, 62, 0.25);
        color: #f1c40f;
        font-weight: 700;
        white-space: nowrap;
      }

      .chat-table-wrap tr:last-child td {
        border-bottom: none;
      }

      .cga-chat-bubble.user {
        align-self: flex-end;
        background: #c8963e;
        color: #121318;
        font-weight: 600;
        border-bottom-right-radius: 4px;
      }

      .cga-chat-input-bar {
        padding: 12px 14px;
        background: rgba(0, 0, 0, 0.3);
        border-top: 1px solid rgba(255, 255, 255, 0.08);
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .cga-chat-input {
        flex: 1;
        background: rgba(255, 255, 255, 0.05);
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 999px;
        padding: 8px 14px;
        font-size: 12.5px;
        color: #fff;
        outline: none;
        font-family: inherit;
      }

      .cga-chat-input:focus {
        border-color: #c8963e;
      }

      .cga-chat-send-btn {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        background: #c8963e;
        color: #121318;
        border: none;
        font-size: 14px;
        font-weight: bold;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: transform 0.15s;
      }

      .cga-chat-send-btn:hover {
        transform: scale(1.05);
      }

      /* Settings Modal */
      .cga-chat-settings-modal {
        position: absolute;
        inset: 0;
        background: rgba(18, 20, 26, 0.98);
        padding: 20px;
        z-index: 10;
        display: flex;
        flex-direction: column;
        gap: 14px;
        color: #fff;
      }
    `;
    document.head.appendChild(style);
  }

  createDom() {
    // Remove existing duplicates to guarantee clean DOM
    document.getElementById("cga-chatbot-btn")?.remove();
    document.getElementById("cga-chatbot-window")?.remove();

    // 1. Floating Trigger Button
    const trigger = document.createElement("button");
    trigger.className = "cga-chatbot-trigger";
    trigger.id = "cga-chatbot-btn";
    trigger.type = "button";
    trigger.innerHTML = `
      <div class="cga-chatbot-avatar">✨</div>
      <span>AI Travel Assistant</span>
    `;
    document.body.appendChild(trigger);
    this.trigger = trigger;

    // 2. Chat Window
    const win = document.createElement("div");
    win.className = "cga-chatbot-window hidden";
    win.id = "cga-chatbot-window";
    win.innerHTML = `
      <div class="cga-chat-header">
        <div class="cga-chat-header-title">
          <div class="cga-chatbot-avatar">✨</div>
          <div>
            <h3>Cholo AI Travel Assistant</h3>
            <span>● Ready</span>
          </div>
        </div>
        <div class="cga-chat-header-actions">
          <button class="cga-chat-icon-btn" id="cga-chat-clear-btn" title="Reset Conversation">🔄</button>
          <button class="cga-chat-icon-btn" id="cga-chat-settings-btn" title="Configure Groq / NVIDIA API Key">⚙️</button>
          <button class="cga-chat-icon-btn" id="cga-chat-close-btn" title="Minimize Chat">✕</button>
        </div>
      </div>

      <div class="cga-chat-messages" id="cga-chat-messages"></div>

      <form class="cga-chat-input-bar" autocomplete="off" onsubmit="event.preventDefault();" data-form-type="other">
        <input type="text" id="cga-chat-input" class="cga-chat-input" placeholder="Ask about places, budget, food, routes..." autocomplete="off" name="cga_chat_query_field" data-lpignore="true">
        <button type="submit" id="cga-chat-send-btn" class="cga-chat-send-btn">➤</button>
      </form>

      <div class="cga-chat-settings-modal" id="cga-chat-settings" style="display: none;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h4 style="margin: 0; font-size: 14px; color: #c8963e;">AI Model Configuration</h4>
          <button id="cga-close-settings" style="background: transparent; border: none; color: #fff; font-size: 16px; cursor: pointer;">✕</button>
        </div>
        <p style="font-size: 12px; color: #9aa0ac; margin: 0;">
          Optionally plug in your <strong>Groq</strong> (Free & Ultra-Fast) or <strong>NVIDIA NIM</strong> API key. Without a key, our built-in location intelligence engine works automatically!
        </p>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: #c8963e; text-transform: uppercase;">Provider</label>
          <select id="cga-select-provider" style="width: 100%; padding: 8px; margin-top: 4px; background: #0c0d11; border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; font-size: 12px;">
            <option value="groq" ${this.activeProvider === "groq" ? "selected" : ""}>Groq (GPT-OSS 120B / Qwen 27B - Ultra Fast)</option>
            <option value="nvidia" ${this.activeProvider === "nvidia" ? "selected" : ""}>NVIDIA NIM (Llama 3.2 Vision / Nemotron)</option>
          </select>
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: #c8963e; text-transform: uppercase;">Groq API Key (gsk_...)</label>
          <input type="text" id="cga-input-groq" style="width: 100%; box-sizing: border-box; padding: 8px; margin-top: 4px; background: #0c0d11; border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; font-size: 12px; -webkit-text-security: disc; text-security: disc;" autocomplete="off" data-lpignore="true" placeholder="Paste gsk_..." value="${this.groqApiKey}">
        </div>

        <div>
          <label style="font-size: 11px; font-weight: 700; color: #c8963e; text-transform: uppercase;">NVIDIA API Key (nvapi-...)</label>
          <input type="text" id="cga-input-nvidia" style="width: 100%; box-sizing: border-box; padding: 8px; margin-top: 4px; background: #0c0d11; border: 1px solid rgba(255,255,255,0.15); color: #fff; border-radius: 6px; font-size: 12px; -webkit-text-security: disc; text-security: disc;" autocomplete="off" data-lpignore="true" placeholder="Paste nvapi-..." value="${this.nvidiaApiKey}">
        </div>

        <button id="cga-save-keys-btn" style="background: #c8963e; color: #111; font-weight: 700; border: none; padding: 10px; border-radius: 8px; cursor: pointer; font-size: 12px; margin-top: auto;">
          Save API Settings
        </button>
      </div>
    `;
    document.body.appendChild(win);
    this.win = win;
  }

  toggleOpen(forceState) {
    this.isOpen = typeof forceState === "boolean" ? forceState : !this.isOpen;
    if (this.win) {
      this.win.classList.toggle("hidden", !this.isOpen);
    }
    if (this.isOpen) {
      setTimeout(() => {
        const input = document.getElementById("cga-chat-input");
        if (input) input.focus();
      }, 100);
    }
  }

  bindEvents() {
    const closeBtn = document.getElementById("cga-chat-close-btn");
    const settingsBtn = document.getElementById("cga-chat-settings-btn");
    const settingsModal = document.getElementById("cga-chat-settings");
    const closeSettings = document.getElementById("cga-close-settings");
    const saveKeysBtn = document.getElementById("cga-save-keys-btn");
    const input = document.getElementById("cga-chat-input");
    const sendBtn = document.getElementById("cga-chat-send-btn");

    this.trigger?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleOpen();
    });

    closeBtn?.addEventListener("click", (e) => {
      e.stopPropagation();
      this.toggleOpen(false);
    });

    const clearBtn = document.getElementById("cga-chat-clear-btn");
    clearBtn?.addEventListener("click", () => {
      this.conversationHistory = [];
      const list = document.getElementById("cga-chat-messages");
      if (list) list.innerHTML = "";
      this.addBotMessage(
        "Conversation cleared! ✈️ Where shall we journey next? Ask me about destinations, custom budgets, hidden spots, or local food delicacies!",
        false
      );
    });

    settingsBtn?.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "flex";
    });

    closeSettings?.addEventListener("click", () => {
      if (settingsModal) settingsModal.style.display = "none";
    });

    saveKeysBtn?.addEventListener("click", () => {
      const groq = document.getElementById("cga-input-groq")?.value.trim() || "";
      const nvidia = document.getElementById("cga-input-nvidia")?.value.trim() || "";
      const provider = document.getElementById("cga-select-provider")?.value || "groq";

      this.groqApiKey = groq;
      this.nvidiaApiKey = nvidia;
      this.activeProvider = provider;

      localStorage.setItem("cga_groq_api_key", groq);
      localStorage.setItem("cga_nvidia_api_key", nvidia);
      localStorage.setItem("cga_ai_provider", provider);

      if (settingsModal) settingsModal.style.display = "none";
      this.addBotMessage(
        "Settings updated! I'm configured to use " + (provider === "groq" ? "Groq (GPT-OSS 120B / Qwen 27B)" : "NVIDIA NIM (Llama 3.2 Vision)") + ".",
        false
      );
    });

    const handleSend = () => {
      const text = input?.value.trim();
      if (!text) return;
      input.value = "";
      this.addUserMessage(text);
      this.processUserQuery(text);
    };

    const form = this.win?.querySelector(".cga-chat-input-bar");
    form?.addEventListener("submit", (e) => {
      e.preventDefault();
      handleSend();
    });

    sendBtn?.addEventListener("click", (e) => {
      e.preventDefault();
      handleSend();
    });

    input?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    });
  }

  addUserMessage(text, recordHistory = true) {
    if (recordHistory) {
      this.conversationHistory.push({ role: "user", content: text });
    }
    const list = document.getElementById("cga-chat-messages");
    if (!list) return;
    const bubble = document.createElement("div");
    bubble.className = "cga-chat-bubble user";
    bubble.textContent = text;
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
  }

  formatMarkdown(md) {
    if (!md) return "";
    let html = md;

    // 1. Process Markdown Tables into scrollable, styled cards
    html = html.replace(/((?:\|[^\n]+\|\r?\n)+)/g, (match) => {
      const lines = match.trim().split(/\r?\n/).filter(l => l.trim().startsWith("|"));
      if (lines.length < 2) return match;

      // Check if second line is separator |---|---|
      const isSep = /^\|[\s-:]+\|/.test(lines[1]);
      if (!isSep) return match;

      const headerCols = lines[0].split("|").slice(1, -1).map(c => c.trim());
      const bodyRows = lines.slice(2);

      let tableHtml = `<div class="chat-table-wrap"><table><thead><tr>`;
      headerCols.forEach(col => {
        tableHtml += `<th>${col}</th>`;
      });
      tableHtml += `</tr></thead><tbody>`;

      bodyRows.forEach(row => {
        const cols = row.split("|").slice(1, -1).map(c => c.trim());
        if (cols.length > 0 && cols.some(c => c.length > 0)) {
          tableHtml += `<tr>`;
          cols.forEach(col => {
            tableHtml += `<td>${col}</td>`;
          });
          tableHtml += `</tr>`;
        }
      });
      tableHtml += `</tbody></table></div>`;
      return tableHtml;
    });

    // 2. Headings (###, ##, #)
    html = html.replace(/^### (.*$)/gim, '<h4 style="color: #f1c40f; margin: 12px 0 6px 0; font-size: 13.5px; font-weight: 700;">$1</h4>');
    html = html.replace(/^## (.*$)/gim, '<h3 style="color: #c8963e; margin: 14px 0 8px 0; font-size: 14.5px; font-weight: 700;">$1</h3>');
    html = html.replace(/^# (.*$)/gim, '<h3 style="color: #c8963e; margin: 14px 0 8px 0; font-size: 15px; font-weight: 700;">$1</h3>');

    // 3. Bold & Italic
    html = html.replace(/\*\*\*(.*?)\*\*\*/g, '<strong><em>$1</em></strong>');
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');

    // 4. Inline code
    html = html.replace(/`([^`]+)`/g, '<code style="background: rgba(255,255,255,0.1); padding: 2px 5px; border-radius: 4px; font-family: monospace;">$1</code>');

    // 5. Blockquotes
    html = html.replace(/^> (.*$)/gim, '<blockquote>$1</blockquote>');

    // 6. Lists
    html = html.replace(/^[\*\-] (.*$)/gim, '<li style="margin-bottom: 5px;">$1</li>');
    html = html.replace(/(<li style="margin-bottom: 5px;">.*<\/li>\s*)+/gim, '<ul style="margin: 6px 0 8px 18px; padding: 0;">$&</ul>');

    // 7. Paragraphs & Linebreaks
    html = html.replace(/\n\n+/g, '<div style="height: 10px;"></div>');
    html = html.replace(/\n/g, '<br>');

    return html;
  }

  addBotMessage(text, recordHistory = true) {
    if (recordHistory) {
      this.conversationHistory.push({ role: "assistant", content: text });
    }
    const list = document.getElementById("cga-chat-messages");
    if (!list) return;
    const bubble = document.createElement("div");
    bubble.className = "cga-chat-bubble bot";
    bubble.innerHTML = this.formatMarkdown(text);
    list.appendChild(bubble);
    list.scrollTop = list.scrollHeight;
  }

  async processUserQuery(query) {
    // Current trip/place context
    const currentDest = tripStore.state.currentDestination || tripStore.state.activeTrip?.stops?.[0] || null;
    const destName = currentDest?.shortName || currentDest?.name || "Global Explorer";

    // Show luxury 3-dot bouncing typing indicator
    const list = document.getElementById("cga-chat-messages");
    const typingBubble = document.createElement("div");
    typingBubble.className = "cga-chat-bubble bot";
    typingBubble.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span style="font-size: 12.5px; color: rgba(255,255,255,0.85);">Thinking of ideas for you...</span>
        <div class="chat-typing-dots">
          <span></span><span></span><span></span>
        </div>
      </div>
    `;
    list.appendChild(typingBubble);
    list.scrollTop = list.scrollHeight;

    // Detect language across the conversation: Hinglish vs English
    const historyText = this.conversationHistory.map(m => m.content).join(" ");
    const isHinglishRequested = /hinglish|hindi|desi|bhai|yaar/i.test(query) ||
      /[\u0900-\u097F]|kaha|kaise|ghumne|jagah|batao|kya|hai|kitna|paisa|kharcha|bataiye|chalo|bhi|nahi|nahin|aur|kuch|desh|videsh/i.test(historyText);

    const systemPrompt = `You are Cholo AI Concierge, the elite, world-class personal travel advisor for "Cholo Ghure Asssiii".

CURRENT APP CONTEXT:
- Active map focus pin: "${destName}".

CONVERSATION LOGIC & 10/10 CONCIERGE RULES:
1. THE PRECEDENCE RULE (DIRECT VERDICT UPFRONT):
   - Whenever the user asks an open-ended recommendation or destination question (e.g., "out of India trip with ₹50,000 budget"), ALWAYS start in the opening 2-3 lines with an instant Executive Verdict & Top 2 Direct Picks before listing detailed cards!
   - Example opening: "**Executive Verdict:** 1️⃣ Nepal – Full nature vibe, trekking aur lake views (~₹22k). 2️⃣ Thailand / Vietnam – Street-food heaven, beaches aur night-markets (~₹38k). Bacha hua ₹12k–₹15k aapka safe buffer aur shopping fund rahega!"

2. CRITICAL LANGUAGE SCRIPT RULE (HINGLISH DEFINITION):
   ${isHinglishRequested ? `The user wants natural conversational HINGLISH (Hindi spoken language written 100% using the English/Latin alphabet, exactly like Indians text on WhatsApp or Instagram).
   • STRICT NEGATIVE RULE 1: NEVER USE DEVANAGARI SCRIPT! Absolutely ZERO Hindi/Devanagari characters (do NOT write नेपाल, थाईलैंड, मंदिर, बजट, यात्रा, etc.). Everything MUST be written in English alphabets (Nepal, Thailand, Mandir, Kharcha, etc.).
   • STRICT NEGATIVE RULE 2: NEVER USE 100% PURE FORMAL ENGLISH! Do NOT use English headers like "Why Visit", "Estimated Budget", "Insider Tip", or "If your budget is...".
   • STRICT POSITIVE RULE: Use natural WhatsApp-style Hinglish vocabulary and sentence structure:
     ### 1. Nepal (Kathmandu + Pokhara) 🏔️
     • **Kyun Jaayein**: Pokhara ki shaant Phewa Lake, Sarangkot ka sunrise aur bina visa ke pocket-friendly trekking routes (Mardi Himal, Ghandruk) – backpackers ke liye absolute heaven!
     • **Kharcha Breakdown (INR)**: Flight/train (Ex-Delhi/Kolkata/Gorakhpur ~₹10,000) + 4 din guesthouse stay (~₹7,000) + Local khana aur transport (~₹5,000) = **Total ≈ ₹22,000** (₹28,000 buffer bachta hai!)
     • **Desi Insider Tip**: Lakeside cafes mein chilled mango shake try karo aur Sarangkot sunrise ke liye subah 4 baje nikalna – zero extra cost!` : `Answer in crisp, elegant, friendly English with standard structured cards.`}

3. STRICT FACTUAL ACCURACY & ZERO FAKE FREEBIES (CRITICAL):
   • ABSOLUTELY ZERO FAKE FREEBIES OR FAKE HACKS: Strictly NEVER invent imaginary food tricks, fake sample phrases, or non-existent free food hacks (e.g. NEVER claim saying "free sample", "extra chutney", or asking for lime gives free food/dishes!). Street vendors do NOT give free food.
   • All insider tips MUST be 100% real, legal, and practically verified:
     - Bangkok: Grand Palace entry is 500 THB (~₹1,250 INR) — budget travelers often prefer Wat Arun (100 THB / ~₹250 INR) or watching sunset across the Chao Phraya river. For drinks, recommend Octave Rooftop or Tichuca during happy hours.
     - Vietnam: Ha Long Bay 6-hour deluxe day cruise is $35–$45 (~₹3,000–₹3,800 INR). Overnight cruises are $120+ (not suitable for a ₹50k overall trip).
     - Sri Lanka: Kandy to Ella 2nd class train ticket is ~500–800 LKR (~₹150–₹250 INR) with tea estate vistas. Temple of the Tooth entry is 2000 LKR (~₹550 INR) for SAARC nationals.
     - Nepal: Sarangkot sunrise is free; Phewa Lake boat ride is ~500–800 NPR (~₹300–₹500 INR).

4. SCOPE & COMPLETE FINISH (TOP 3-4 PICKS ONLY):
   • Provide exactly 3 to 4 best destinations (do not overload with 5+ huge essays) so that every card is factually rich, and the response ALWAYS finishes completely with a final emergency buffer summary without getting truncated mid-sentence!

5. ANTI-REPETITION & NATURAL ADAPTATION:
   - When the user asks you to adjust language (e.g. "pura jawab hinglish mai do", "sab hinglish mai not hindi") or asks follow-up questions, NEVER rigidly copy-paste previous responses verbatim!
   - Acknowledge naturally in 1 quick line (e.g., "Arre bilkul dost, chalo ekdum mast desi Hinglish mein fresh recommendations batata hoon!") and provide fresh, dynamic recommendations.

6. MULTI-HUB FLIGHT PRICING (NO SINGLE-CITY ASSUMPTIONS):
   - If the user has NOT specified their departure city, NEVER assume only one city (like Mumbai or Delhi).
   - Always state multi-hub ranges: e.g. "Ex-Delhi / Kolkata / Mumbai / Bengaluru round-trip: ₹13,000–₹17,000 on budget carriers (AirAsia, IndiGo, VietJet)".

7. REALISTIC BUDGET-CONSCIOUS RECOMMENDATIONS (NO TOURIST TRAPS):
   - For budget trips (₹50,000 INR envelope), NEVER recommend ultra-luxury spots (such as Lebua Sky Bar with ₹2,500–₹3,500 drinks or luxury overnight yachts).

8. MULTI-TURN MEMORY & CONTINUITY:
   - Always maintain complete context and continuity with previous conversation turns.
   - If the user asks follow-up questions ("aur minimum 4-5 place suggest karo", "what about hotels there", "inme se best kaunsi hai"), stay strictly within the ongoing thread.

9. DYNAMIC INTENT & NO FORCED MAP LOCKING:
   - If the user explicitly asks about the active map pin ("${destName}"), provide rich details for it.
   - CRITICAL OVERRIDE: If the user asks about other destinations, international / foreign trips ("out of India", "videsh", "abroad"), beaches, mountains, or a specific budget, NEVER force or inject "${destName}". Always prioritize the user's explicit request!

10. FINANCIAL SAFETY BUFFER TRANSPARENCY:
    - Explicitly highlight the remaining unspent buffer (e.g., ₹10,000–₹15,000) for visa fees, shopping, and emergencies so the user knows they are safe.`;

    // Multi-turn messages payload including conversation memory
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...this.conversationHistory.slice(-10)
    ];

    // 1. Try Vercel Serverless Function (/api/chat) where keys are secured in Vercel Env Variables
    try {
      const serverlessRes = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: apiMessages,
          provider: this.activeProvider
        })
      });

      if (serverlessRes.ok) {
        const data = await serverlessRes.json();
        if (data?.reply) {
          typingBubble.remove();
          this.addBotMessage(data.reply);
          return;
        }
      }
    } catch (e) {
      // /api/chat not available (e.g. running on local static dev server without Vercel backend)
    }

    // 2. Direct client-side call if user configured personal key in Settings modal
    if (this.activeProvider === "groq" && this.groqApiKey) {
      const groqModels = ["openai/gpt-oss-120b", "qwen/qwen3.8-27b", "openai/gpt-oss-20b"];
      for (const model of groqModels) {
        try {
          const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.groqApiKey}`
            },
            body: JSON.stringify({
              model,
              messages: apiMessages,
              temperature: 0.5,
              max_tokens: 2200
            })
          });

          if (response.ok) {
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              typingBubble.remove();
              this.addBotMessage(reply);
              return;
            }
          }
        } catch (err) {
          console.warn(`[AiChatbot] Groq API call error on ${model}:`, err);
        }
      }
    }

    // 2. If NVIDIA NIM API Key is configured
    if (this.activeProvider === "nvidia" && this.nvidiaApiKey) {
      const nvidiaModels = ["meta/llama-3.2-11b-vision-instruct", "mistralai/mistral-large-2-instruct", "nvidia/llama-3.1-nemotron-70b-instruct"];
      for (const model of nvidiaModels) {
        try {
          const response = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${this.nvidiaApiKey}`
            },
            body: JSON.stringify({
              model,
              messages: apiMessages,
              temperature: 0.5,
              max_tokens: 2200
            })
          });

          if (response.ok) {
            const data = await response.json();
            const reply = data.choices?.[0]?.message?.content;
            if (reply) {
              typingBubble.remove();
              this.addBotMessage(reply);
              return;
            }
          }
        } catch (err) {
          console.warn(`[AiChatbot] NVIDIA API call error on ${model}:`, err);
        }
      }
    }

    // 3. Intelligent Contextual Engine (Instant Fallback - 0 keys needed)
    setTimeout(() => {
      typingBubble.remove();
      const q = query.toLowerCase();
      const fullConvoText = this.conversationHistory.map(m => m.content.toLowerCase()).join(" ");

      const isOutOfIndia = q.includes("out of india") || q.includes("videsh") || q.includes("abroad") || q.includes("international") || q.includes("foreign") ||
        (fullConvoText.includes("out of india") && (q.includes("aur") || q.includes("more") || q.includes("place") || q.includes("suggest")));
      const isBudgetQuery = q.includes("50000") || q.includes("budget") || q.includes("paisa") || q.includes("kharcha") || q.includes("cost");

      if (isOutOfIndia) {
        this.addBotMessage(
          `**Executive Verdict:** 1️⃣ Nepal – Himalaya ki thandi hawa, serene lakes aur budget trekking (~₹22k). 2️⃣ Thailand / Vietnam – Street-food paradise, vibrant night markets aur beaches (~₹38k–₹40k). Bacha hua ₹10k–₹15k aapka visa fees, shopping aur emergency buffer rahega!\n\n` +
          `Arre bilkul dost, chalo ekdum mast desi Hinglish mein top international destinations dekhte hain:\n\n` +
          `### 1. Nepal (Kathmandu + Pokhara) 🏔️\n` +
          `• **Kyun Jaayein**: Annapurna range ka mesmerizing view, serene Phewa Lake, aur bina kisi visa hassle ke instant travel.\n` +
          `• **Kharcha Breakdown (INR)**: Flight/train (Ex-Delhi/Kolkata/Gorakhpur ~₹9,000–₹11,000) + 4 din guesthouse stay (~₹7,000) + Khana aur cab (~₹5,000) = **Total ≈ ₹22,000** (₹28,000 Buffer bachta hai!)\n` +
          `• **Desi Insider Tip**: Sarangkot sunrise bilkul free hai, subah 4:30 AM nikal jao. Phewa Lake mein evening wooden boat ride sirf ₹300–₹500 mein hoti hai.\n\n` +
          `### 2. Thailand (Bangkok + Pattaya) 🇹🇭\n` +
          `• **Kyun Jaayein**: Celebrated night bazaars, ornate Buddhist temples, aur world-class street food hubs.\n` +
          `• **Kharcha Breakdown (INR)**: Low-cost carrier (Ex-Kolkata/Delhi/Mumbai ~₹14,000–₹17,000) + 4 din 3-star hotel (~₹13,000) + Khana & BTS Skytrain (~₹8,000) = **Total ≈ ₹37,000**\n` +
          `• **Desi Insider Tip**: Grand Palace ki ticket ₹1,250 (500 THB) hoti hai; agar budget tight ho toh Wat Arun sirf ₹250 (100 THB) mein visit karo ya river ke dusri taraf se sunset view free enjoy karo!\n\n` +
          `### 3. Vietnam (Hanoi + Ha Long Bay) 🏮\n` +
          `• **Kyun Jaayein**: Lantern-lit heritage canals, stunning limestone karsts, aur exceptionally affordable world-class street food.\n` +
          `• **Kharcha Breakdown (INR)**: VietJet/AirAsia promo (Ex-Delhi/Kolkata/Mumbai ~₹17,000–₹19,000) + 4 din riverside stay (~₹9,000) + Khana & Ha Long Bay 6-hour deluxe day-cruise (~₹10,000) = **Total ≈ ₹37,000**\n` +
          `• **Desi Insider Tip**: Mehenge overnight cruise ($120+) ki jagah 6-hour deluxe day cruise ($35–$45 / ₹3,000–₹3,800) lo — saare caves aur islands cover ho jaate hain aur budget pura safe rehta hai!\n\n` +
          `### 4. Sri Lanka (Colombo + Kandy + Ella) 🌴\n` +
          `• **Kyun Jaayein**: Golden tropical beaches, lush tea plantations, aur Dutch colonial fortresses.\n` +
          `• **Kharcha Breakdown (INR)**: Budget flight (Ex-Chennai/Bengaluru/Mumbai ~₹15,000–₹17,000) + 4 din boutique homestay (~₹12,000) + Khana & coastal train (~₹8,000) = **Total ≈ ₹36,000**\n` +
          `• **Desi Insider Tip**: Kandy se Ella tak ki 2nd class scenic train ticket sirf ₹150–₹250 (500–800 LKR) ki hoti hai — tea gardens aur waterfalls ka view unmissable hai!\n\n` +
          `**Quick Emergency Buffer Summary:**\n` +
          `Sabhi destinations ka total estimate ₹36,000–₹38,000 ke beech aata hai. Aapke ₹50,000 budget mein se ₹12,000–₹14,000 ka solid buffer bachta hai jise aap visa-on-arrival, emergency cash aur shopping ke liye aaram se use kar sakte ho!`
        );
      } else if (isBudgetQuery) {
        this.addBotMessage(
          `### 💰 Realistic Travel Budget Breakdown for ₹50,000:\n\n` +
          `• **Flights / Transit (Multi-Hub)**: Allocate ₹14,000 - ₹18,000 (book 3-4 weeks in advance on budget carriers).\n` +
          `• **Stay (4-5 Nights)**: Allocate ₹12,000 - ₹16,000 (high-rated boutique homestays or 3-star hotels).\n` +
          `• **Food & Dining**: Allocate ₹7,000 - ₹9,000 (savor authentic local street food and charming cafes).\n` +
          `• **Local Transit & Activities**: Allocate ₹6,000 - ₹8,000 (metro, shared cabs, and monument entry passes).\n` +
          `• **Emergency Buffer**: Keep ₹3,000 - ₹5,000 reserve.\n\n` +
          `Let me know which type of trip you love most (mountains 🏔️, beaches 🏖️, or heritage cities 🏛️) and I'll tailor the exact itinerary!`
        );
      } else if (q.includes("food") || q.includes("eat") || q.includes("dish") || q.includes("culinary") || q.includes("cuisine") || q.includes("drink")) {
        this.addBotMessage(
          `When exploring culinary delights, don't miss out on these authentic gastronomic experiences:\n\n1. **Authentic Regional Delicacies**: Traditional century-old family recipes and local herbs.\n2. **Historic Tea & Coffee Salons**: Signature artisanal beverages steeped with heritage.\n3. **Vibrant Evening Food Promenades**: Freshly prepared street delicacies and confectioneries.\n4. **Fine Heritage Dining**: Ambient courtyard restaurants serving royal regional platters.`
        );
      } else if (q.includes("weather") || q.includes("season") || q.includes("time to visit") || q.includes("climate") || q.includes("when")) {
        this.addBotMessage(
          `For the best travel experience, peak travel seasons usually offer crisp skies and pleasant walks. Check our live weather widgets in the destination guide before packing!`
        );
      } else {
        this.addBotMessage(
          `Fascinating query! I can help you plan personalized itineraries, calculate realistic budgets, or find hidden spots worldwide. Tell me where you want to travel, your budget, or trip style!`
        );
      }
    }, 500);
  }
}

// Auto-mount safely once
function initChatbot() {
  if (!window.choloAiChatbot) {
    new AiChatbot();
  }
}

if (typeof window !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initChatbot);
  } else {
    initChatbot();
  }
}
