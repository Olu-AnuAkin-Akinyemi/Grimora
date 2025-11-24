// client/JS/app/coverTooltips.js

/**
 * Handle tooltips for cover view buttons
 */
export class CoverTooltips {
  constructor() {
    this.tooltips = new Map();
    console.log('[CoverTooltips] Initializing...');
    this.init();
  }

  init() {
    // Find all buttons with tooltip data attributes
    const buttons = document.querySelectorAll('[data-tooltip]');
    console.log('[CoverTooltips] Found buttons:', buttons.length);
    
    buttons.forEach(button => {
      const tooltipId = button.getAttribute('data-tooltip');
      const tooltip = document.getElementById(tooltipId);
      
      console.log(`[CoverTooltips] Button:`, button.id, 'Tooltip ID:', tooltipId, 'Found:', !!tooltip);
      
      if (tooltip) {
        this.tooltips.set(button, tooltip);
        this.attachEvents(button, tooltip);
      } else {
        console.warn(`[CoverTooltips] Tooltip not found:`, tooltipId);
      }
    });
    
    console.log('[CoverTooltips] Tooltips initialized:', this.tooltips.size);
  }

  attachEvents(button, tooltip) {
    let hideTimer = null;
    
    button.addEventListener('mouseenter', (e) => {
      this.showTooltip(e, button, tooltip);
      
      // Clear any existing timer
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      
      // Auto-hide after 5 seconds
      hideTimer = setTimeout(() => {
        this.hideTooltip(tooltip);
      }, 5000);
    });
    
    button.addEventListener('mousemove', (e) => this.positionTooltip(e, tooltip));
    
    button.addEventListener('mouseleave', () => {
      // Clear timer and hide immediately
      if (hideTimer) {
        clearTimeout(hideTimer);
      }
      this.hideTooltip(tooltip);
    });
    
    console.log('[CoverTooltips] Events attached to:', button.id);
  }

  showTooltip(event, button, tooltip) {
    console.log('[CoverTooltips] Showing tooltip for:', button.id);
    tooltip.classList.remove('hidden');
    this.positionTooltip(event, tooltip);
  }

  positionTooltip(event, tooltip) {
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    
    // Position tooltip above the cursor
    const offsetX = 10;
    const offsetY = -60;
    
    tooltip.style.left = `${mouseX + offsetX}px`;
    tooltip.style.top = `${mouseY + offsetY}px`;
  }

  hideTooltip(tooltip) {
    console.log('[CoverTooltips] Hiding tooltip');
    tooltip.classList.add('hidden');
  }

  cleanup() {
    this.tooltips.forEach((tooltip, button) => {
      button.removeEventListener('mouseenter', this.showTooltip);
      button.removeEventListener('mousemove', this.positionTooltip);
      button.removeEventListener('mouseleave', this.hideTooltip);
    });
    this.tooltips.clear();
  }
}
