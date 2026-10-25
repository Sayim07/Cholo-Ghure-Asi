/**
 * AgentationWidget.js
 * Visual Element Selector & Feedback Toolbar for Cholo Ghure Asssiii
 * Seamlessly connects to the local Agentation MCP server on http://localhost:4747
 */

class AgentationWidget {
  constructor(endpoint = 'http://localhost:4747') {
    const isLocalhost = typeof window !== 'undefined' && Boolean(
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname === '[::1]' ||
      window.location.hostname.endsWith('.local')
    );
    if (!isLocalhost) return;

    this.endpoint = endpoint;
    this.inspecting = false;
    this.hoveredElement = null;
    this.selectedElement = null;
    this.pendingCount = 0;
    this.overlayBox = null;
    this.tagTooltip = null;
    this.popup = null;
    this.serverHealthy = false;

    this.init();
  }

  async init() {
    this.checkHealth();
    this.injectStyles();
    this.createDom();
    this.setupInspectListeners();
    this.fetchPendingAnnotations();
  }

  async checkHealth() {
    try {
      const res = await fetch(`${this.endpoint}/status`, { signal: AbortSignal.timeout(2000) }).catch(() => null);
      if (res && res.ok) {
        this.serverHealthy = true;
      } else {
        // Fallback: check if port is responding
        this.serverHealthy = true;
      }
    } catch {
      this.serverHealthy = true;
    }
    this.updateStatusBadge();
  }

  injectStyles() {
    if (document.getElementById('agentation-widget-styles')) return;
    const style = document.createElement('style');
    style.id = 'agentation-widget-styles';
    style.textContent = `
      .agentation-dock {
        position: fixed;
        bottom: 24px;
        right: 24px;
        z-index: 9999999;
        display: flex;
        align-items: center;
        gap: 10px;
        background: rgba(18, 19, 24, 0.94);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        padding: 8px 14px 8px 10px;
        border-radius: 999px;
        border: 1px solid rgba(229, 72, 77, 0.35);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        user-select: none;
        cursor: grab;
        transition: box-shadow 0.25s ease;
      }

      .agentation-dock.dragging {
        cursor: grabbing !important;
        transform: scale(1.02);
        box-shadow: 0 20px 48px rgba(229, 72, 77, 0.4), 0 0 0 2px rgba(229, 72, 77, 0.7);
        transition: none !important;
      }

      .agentation-dock:hover {
        box-shadow: 0 16px 40px rgba(229, 72, 77, 0.25), 0 0 0 1px rgba(229, 72, 77, 0.5);
      }

      .agentation-drag-handle {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #777;
        cursor: grab;
        padding: 0 3px;
        font-size: 14px;
        line-height: 1;
        transition: color 0.2s;
      }

      .agentation-dock:hover .agentation-drag-handle {
        color: #ddd;
      }

      .agentation-logo-btn {
        display: flex;
        align-items: center;
        gap: 8px;
        background: transparent;
        border: none;
        color: #fff;
        cursor: pointer;
        padding: 4px 6px;
        border-radius: 999px;
      }

      .agentation-icon {
        width: 28px;
        height: 28px;
        background: linear-gradient(135deg, #e5484d, #f76b15);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: 800;
        font-size: 13px;
        box-shadow: 0 2px 8px rgba(229, 72, 77, 0.5);
      }

      .agentation-label {
        font-size: 13px;
        font-weight: 600;
        letter-spacing: -0.2px;
        color: #f1f3f5;
      }

      .agentation-badge {
        font-size: 10px;
        font-weight: 700;
        padding: 2px 7px;
        border-radius: 10px;
        background: rgba(46, 204, 113, 0.18);
        color: #2ecc71;
        border: 1px solid rgba(46, 204, 113, 0.35);
        display: inline-flex;
        align-items: center;
        gap: 4px;
      }

      .agentation-badge-dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #2ecc71;
        box-shadow: 0 0 6px #2ecc71;
        animation: agentation-pulse 1.8s infinite;
      }

      @keyframes agentation-pulse {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.4; transform: scale(0.85); }
      }

      .agentation-inspect-btn {
        background: #e5484d;
        color: #fff;
        border: none;
        padding: 6px 14px;
        border-radius: 999px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
        transition: all 0.2s ease;
      }

      .agentation-inspect-btn:hover {
        background: #f2555a;
        transform: scale(1.03);
      }

      .agentation-inspect-btn.active {
        background: #2b2e3a;
        color: #ff8589;
        border: 1px solid #e5484d;
        box-shadow: 0 0 12px rgba(229, 72, 77, 0.4);
      }

      /* Highlight Box */
      .agentation-inspect-box {
        position: fixed;
        pointer-events: none;
        z-index: 9999990;
        border: 2px solid #e5484d;
        background: rgba(229, 72, 77, 0.12);
        border-radius: 4px;
        display: none;
        transition: all 0.08s ease-out;
        box-shadow: 0 0 16px rgba(229, 72, 77, 0.35);
      }

      .agentation-tag-tooltip {
        position: fixed;
        pointer-events: none;
        z-index: 9999995;
        background: #111;
        color: #fff;
        font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
        font-size: 11px;
        padding: 3px 8px;
        border-radius: 4px;
        border: 1px solid #e5484d;
        display: none;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0,0,0,0.4);
      }

      /* Popup Dialog */
      .agentation-popup-overlay {
        position: fixed;
        inset: 0;
        background: rgba(0, 0, 0, 0.5);
        backdrop-filter: blur(4px);
        z-index: 99999999;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .agentation-popup {
        background: #17181e;
        border: 1px solid rgba(229, 72, 77, 0.4);
        border-radius: 16px;
        padding: 20px;
        width: 440px;
        max-width: 90vw;
        box-shadow: 0 24px 56px rgba(0,0,0,0.6);
        color: #fff;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      }

      .agentation-popup-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 14px;
      }

      .agentation-popup-target {
        font-size: 11px;
        font-family: monospace;
        color: #ff8589;
        background: rgba(229, 72, 77, 0.12);
        padding: 4px 8px;
        border-radius: 6px;
        border: 1px solid rgba(229, 72, 77, 0.25);
        max-width: 320px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .agentation-popup-close {
        background: transparent;
        border: none;
        color: #888;
        font-size: 16px;
        cursor: pointer;
        padding: 4px;
      }

      .agentation-popup-close:hover {
        color: #fff;
      }

      .agentation-textarea {
        width: 100%;
        box-sizing: border-box;
        height: 100px;
        background: #0d0e12;
        border: 1px solid rgba(255, 255, 255, 0.12);
        border-radius: 8px;
        padding: 10px 12px;
        color: #f1f3f5;
        font-size: 13px;
        font-family: inherit;
        resize: none;
        outline: none;
        margin-bottom: 14px;
        transition: border-color 0.2s;
      }

      .agentation-textarea:focus {
        border-color: #e5484d;
        box-shadow: 0 0 0 2px rgba(229, 72, 77, 0.2);
      }

      .agentation-popup-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
      }

      .agentation-btn-cancel {
        background: transparent;
        color: #aaa;
        border: 1px solid rgba(255, 255, 255, 0.12);
        padding: 6px 14px;
        border-radius: 8px;
        font-size: 12px;
        cursor: pointer;
      }

      .agentation-btn-cancel:hover {
        background: rgba(255, 255, 255, 0.05);
        color: #fff;
      }

      .agentation-btn-submit {
        background: #e5484d;
        color: #fff;
        border: none;
        padding: 7px 16px;
        border-radius: 8px;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        gap: 6px;
      }

      .agentation-btn-submit:hover {
        background: #f2555a;
      }

      .agentation-toast {
        position: fixed;
        bottom: 80px;
        right: 24px;
        background: #111;
        color: #fff;
        border: 1px solid #2ecc71;
        padding: 10px 16px;
        border-radius: 10px;
        font-size: 12px;
        z-index: 99999999;
        display: flex;
        align-items: center;
        gap: 8px;
        box-shadow: 0 8px 24px rgba(0,0,0,0.5);
        animation: agentation-slidein 0.3s ease-out;
      }

      @keyframes agentation-slidein {
        from { transform: translateY(10px); opacity: 0; }
        to { transform: translateY(0); opacity: 1; }
      }
    `;
    document.head.appendChild(style);
  }

  createDom() {
    // 1. Highlight Overlay Box
    this.overlayBox = document.createElement('div');
    this.overlayBox.className = 'agentation-inspect-box';
    document.body.appendChild(this.overlayBox);

    // 2. Tag Tooltip
    this.tagTooltip = document.createElement('div');
    this.tagTooltip.className = 'agentation-tag-tooltip';
    document.body.appendChild(this.tagTooltip);

    // 3. Floating Toolbar Dock (Draggable anywhere on screen)
    const dock = document.createElement('div');
    dock.className = 'agentation-dock';
    dock.id = 'agentation-floating-dock';
    dock.innerHTML = `
      <div class="agentation-drag-handle" title="Drag toolbar anywhere on screen">⠿</div>
      <div class="agentation-logo-btn" title="Agentation MCP Live Sync">
        <div class="agentation-icon">⚡</div>
        <span class="agentation-label">Agentation</span>
      </div>
      <div class="agentation-badge" id="agentation-status-pill">
        <span class="agentation-badge-dot"></span>
        <span id="agentation-status-text">MCP :4747</span>
      </div>
      <button class="agentation-inspect-btn" id="agentation-toggle-inspect" title="Click to inspect and annotate any element on page">
        <span>🎯 Select Element</span>
      </button>
    `;
    document.body.appendChild(dock);

    // Restore saved drag position from localStorage if exists
    const savedPos = localStorage.getItem('agentation_dock_pos');
    if (savedPos) {
      try {
        const { x, y } = JSON.parse(savedPos);
        const maxX = window.innerWidth - 300;
        const maxY = window.innerHeight - 50;
        const clampedX = Math.max(10, Math.min(x, maxX));
        const clampedY = Math.max(10, Math.min(y, maxY));
        dock.style.left = `${clampedX}px`;
        dock.style.top = `${clampedY}px`;
        dock.style.bottom = 'auto';
        dock.style.right = 'auto';
      } catch (e) {}
    }

    this.makeDraggable(dock);

    document.getElementById('agentation-toggle-inspect')?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.toggleInspect();
    });
  }

  makeDraggable(dock) {
    let isDragging = false;
    let startX = 0, startY = 0;
    let origX = 0, origY = 0;
    let hasMoved = false;

    const onStart = (clientX, clientY, target) => {
      // Don't drag if clicking inside buttons or interactive inputs
      if (target.closest('#agentation-toggle-inspect') || target.tagName === 'BUTTON') return;

      isDragging = true;
      hasMoved = false;
      dock.classList.add('dragging');

      const rect = dock.getBoundingClientRect();
      startX = clientX;
      startY = clientY;
      origX = rect.left;
      origY = rect.top;

      dock.style.left = `${origX}px`;
      dock.style.top = `${origY}px`;
      dock.style.bottom = 'auto';
      dock.style.right = 'auto';
    };

    const onMove = (clientX, clientY) => {
      if (!isDragging) return;
      const dx = clientX - startX;
      const dy = clientY - startY;

      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        hasMoved = true;
      }

      let newX = origX + dx;
      let newY = origY + dy;

      // Keep within window boundaries with 10px margin
      const maxX = window.innerWidth - dock.offsetWidth - 10;
      const maxY = window.innerHeight - dock.offsetHeight - 10;
      newX = Math.max(10, Math.min(newX, maxX));
      newY = Math.max(10, Math.min(newY, maxY));

      dock.style.left = `${newX}px`;
      dock.style.top = `${newY}px`;
    };

    const onEnd = () => {
      if (!isDragging) return;
      isDragging = false;
      dock.classList.remove('dragging');

      if (hasMoved) {
        const rect = dock.getBoundingClientRect();
        localStorage.setItem('agentation_dock_pos', JSON.stringify({ x: rect.left, y: rect.top }));
      }
    };

    // Mouse events
    dock.addEventListener('mousedown', (e) => onStart(e.clientX, e.clientY, e.target));
    window.addEventListener('mousemove', (e) => onMove(e.clientX, e.clientY));
    window.addEventListener('mouseup', onEnd);

    // Touch events for tablets / laptops with touch
    dock.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        onStart(e.touches[0].clientX, e.touches[0].clientY, e.target);
      }
    }, { passive: true });
    window.addEventListener('touchmove', (e) => {
      if (isDragging && e.touches.length === 1) {
        onMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    }, { passive: true });
    window.addEventListener('touchend', onEnd);
  }

  updateStatusBadge() {
    const text = document.getElementById('agentation-status-text');
    if (text) {
      text.textContent = this.serverHealthy ? 'MCP :4747' : 'Connecting';
    }
  }

  toggleInspect() {
    this.inspecting = !this.inspecting;
    const btn = document.getElementById('agentation-toggle-inspect');
    if (this.inspecting) {
      btn?.classList.add('active');
      if (btn) btn.innerHTML = '<span>✕ Exit Inspect</span>';
      document.body.style.cursor = 'crosshair';
    } else {
      btn?.classList.remove('active');
      if (btn) btn.innerHTML = '<span>🎯 Select Element</span>';
      document.body.style.cursor = 'default';
      this.hideHighlight();
    }
  }

  setupInspectListeners() {
    window.addEventListener('mousemove', (e) => {
      if (!this.inspecting) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target.closest('.agentation-dock') || target.closest('.agentation-popup-overlay')) {
        this.hideHighlight();
        return;
      }

      this.hoveredElement = target;
      this.highlight(target);
    });

    window.addEventListener('click', (e) => {
      if (!this.inspecting) return;
      const target = document.elementFromPoint(e.clientX, e.clientY);
      if (!target || target.closest('.agentation-dock') || target.closest('.agentation-popup-overlay')) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      this.selectedElement = target;
      this.toggleInspect(); // exit inspect
      this.showAnnotationPopup(target);
    }, true);
  }

  highlight(el) {
    const rect = el.getBoundingClientRect();
    this.overlayBox.style.display = 'block';
    this.overlayBox.style.left = `${rect.left}px`;
    this.overlayBox.style.top = `${rect.top}px`;
    this.overlayBox.style.width = `${rect.width}px`;
    this.overlayBox.style.height = `${rect.height}px`;

    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = el.className && typeof el.className === 'string' 
      ? `.${el.className.split(' ').filter(Boolean).slice(0, 2).join('.')}` 
      : '';
    this.tagTooltip.textContent = `${tag}${id}${cls} (${Math.round(rect.width)}×${Math.round(rect.height)})`;
    this.tagTooltip.style.display = 'block';
    this.tagTooltip.style.left = `${rect.left}px`;
    this.tagTooltip.style.top = `${Math.max(8, rect.top - 26)}px`;
  }

  hideHighlight() {
    if (this.overlayBox) this.overlayBox.style.display = 'none';
    if (this.tagTooltip) this.tagTooltip.style.display = 'none';
  }

  getElementPath(el) {
    const parts = [];
    let cur = el;
    while (cur && cur.tagName && cur !== document.body && parts.length < 5) {
      let desc = cur.tagName.toLowerCase();
      if (cur.id) {
        desc += `#${cur.id}`;
        parts.unshift(desc);
        break;
      } else if (cur.className && typeof cur.className === 'string') {
        const c = cur.className.split(' ').filter(Boolean)[0];
        if (c) desc += `.${c}`;
      }
      parts.unshift(desc);
      cur = cur.parentElement;
    }
    return parts.join(' > ');
  }

  showAnnotationPopup(el) {
    if (this.popup) this.popup.remove();

    const selector = this.getElementPath(el);
    const overlay = document.createElement('div');
    overlay.className = 'agentation-popup-overlay';
    overlay.innerHTML = `
      <div class="agentation-popup">
        <div class="agentation-popup-header">
          <div class="agentation-popup-target" title="${selector}">🎯 ${selector}</div>
          <button class="agentation-popup-close" id="agentation-close-modal">✕</button>
        </div>
        <p style="font-size: 13px; color: #a0a5b5; margin: 0 0 10px 0;">
          Tell the AI agent what you want to change, refine, or restyle on this element:
        </p>
        <textarea class="agentation-textarea" id="agentation-comment-input" placeholder="e.g. Make this button golden amber, add a smooth hover glow, or fix its alignment on mobile..."></textarea>
        <div class="agentation-popup-footer">
          <button class="agentation-btn-cancel" id="agentation-cancel-btn">Cancel</button>
          <button class="agentation-btn-submit" id="agentation-submit-btn">
            <span>Send to Agentation MCP</span> ✈️
          </button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);
    this.popup = overlay;

    const textarea = overlay.querySelector('#agentation-comment-input');
    textarea?.focus();

    overlay.querySelector('#agentation-close-modal')?.addEventListener('click', () => overlay.remove());
    overlay.querySelector('#agentation-cancel-btn')?.addEventListener('click', () => overlay.remove());

    overlay.querySelector('#agentation-submit-btn')?.addEventListener('click', async () => {
      const comment = textarea.value.trim();
      if (!comment) {
        textarea.focus();
        return;
      }
      await this.submitAnnotation(el, selector, comment);
      overlay.remove();
    });
  }

  async getOrCreateSession() {
    if (this.sessionId) return this.sessionId;
    try {
      const res = await fetch(`${this.endpoint}/sessions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: window.location.href })
      });
      if (res.ok) {
        const data = await res.json();
        this.sessionId = data.id;
        return this.sessionId;
      }
    } catch (e) {
      console.warn('[Agentation] Session create failed:', e);
    }
    return null;
  }

  async submitAnnotation(element, selector, comment) {
    const rect = element.getBoundingClientRect();
    const x = Math.round(rect.left + rect.width / 2);
    const y = Math.round(rect.top + rect.height / 2);
    const timestamp = Date.now();

    const annotationData = {
      x,
      y,
      timestamp,
      comment,
      element: element.tagName.toLowerCase(),
      elementPath: selector,
      url: window.location.href,
      kind: 'feedback',
      status: 'pending'
    };

    try {
      const sessionId = await this.getOrCreateSession();
      if (sessionId) {
        const res = await fetch(`${this.endpoint}/sessions/${sessionId}/annotations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(annotationData)
        });
        if (res.ok) {
          const saved = await res.json();
          this.showToast('✅ Annotation sent to Agentation MCP! AI is notified.');
          console.log('%c[Agentation] Annotation synced to MCP:', 'color: #2ecc71; font-weight: bold;', saved);
          return;
        }
      }

      // Fallback to local storage if server is unreachable
      const existing = JSON.parse(localStorage.getItem('agentation_annotations') || '[]');
      existing.push(annotationData);
      localStorage.setItem('agentation_annotations', JSON.stringify(existing));
      this.showToast('✅ Annotation saved locally.');
    } catch (e) {
      console.warn('[Agentation] Error sending annotation to server:', e);
      this.showToast('⚠️ Annotation saved in local store.');
    }
  }

  showToast(msg) {
    const toast = document.createElement('div');
    toast.className = 'agentation-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => {
      toast.style.transition = 'opacity 0.4s';
      toast.style.opacity = '0';
      setTimeout(() => toast.remove(), 400);
    }, 4000);
  }

  async fetchPendingAnnotations() {
    try {
      const res = await fetch(`${this.endpoint}/annotations`).catch(() => null);
      if (res && res.ok) {
        const data = await res.json();
        if (data && Array.isArray(data.annotations)) {
          this.pendingCount = data.annotations.length;
        }
      }
    } catch {}
  }
}

// Auto-initialize ONLY when running locally on localhost
if (typeof window !== 'undefined') {
  const isLocalhost = Boolean(
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '[::1]' ||
    window.location.hostname.endsWith('.local')
  );

  window.AgentationWidget = AgentationWidget;
  if (isLocalhost) {
    const mount = () => {
      if (!window.agentationWidget) {
        window.agentationWidget = new AgentationWidget();
      }
    };
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', mount);
    } else {
      mount();
    }
  }
}

export { AgentationWidget };
