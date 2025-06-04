import { isFallbackModeActive, nomoMnemonicBackupExisted } from 'nomo-webon-kit';

if (typeof window !== 'undefined') {
    let modalShown = false;

    function injectStyles() {
        if (document.getElementById('backup-modal-styles')) return;

        const style = document.createElement('style');
        style.id = 'backup-modal-styles';
        style.textContent = `
      .backup-modal-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.8);
        backdrop-filter: blur(8px);
        -webkit-backdrop-filter: blur(8px);
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      }

      .backup-modal {
        background: white;
        border-radius: 16px;
        max-width: 90%;
        width: 400px;
        padding: 32px;
        text-align: center;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        border: 3px solid #ef4444;
        position: relative;
        animation: modalSlideIn 0.3s ease-out;
      }

      @keyframes modalSlideIn {
        from {
          opacity: 0;
          transform: scale(0.9) translateY(-20px);
        }
        to {
          opacity: 1;
          transform: scale(1) translateY(0);
        }
      }

      .backup-modal-icon {
        width: 64px;
        height: 64px;
        margin: 0 auto 24px;
        background: #fef2f2;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        border: 3px solid #fca5a5;
      }

      .backup-modal-alert-icon {
        width: 32px;
        height: 32px;
        color: #dc2626;
        stroke-width: 2;
      }

      .backup-modal h2 {
        margin: 0 0 16px 0;
        font-size: 24px;
        font-weight: 700;
        color: #dc2626;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .backup-modal p {
        margin: 0 0 24px 0;
        font-size: 16px;
        line-height: 1.6;
        color: #374151;
      }

      .backup-modal-path {
        background: #f3f4f6;
        padding: 12px;
        border-radius: 8px;
        font-family: monospace;
        font-size: 14px;
        color: #6b7280;
        margin: 16px 0;
        border-left: 4px solid #ef4444;
      }

      .backup-modal-button {
        width: 100%;
        background: #dc2626;
        color: white;
        border: none;
        padding: 16px 24px;
        border-radius: 12px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .backup-modal-button:hover {
        background: #b91c1c;
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
      }

      .backup-modal-button:active {
        transform: translateY(0);
      }

      @media (max-width: 480px) {
        .backup-modal {
          margin: 16px;
          padding: 24px;
        }
        
        .backup-modal h2 {
          font-size: 20px;
        }
        
        .backup-modal p {
          font-size: 15px;
        }
      }
    `;
        document.head.appendChild(style);
    }

    function createModal() {
        const overlay = document.createElement('div');
        overlay.className = 'backup-modal-overlay';
        overlay.id = 'backup-modal-overlay';

        overlay.innerHTML = `
      <div class="backup-modal">
        <div class="backup-modal-icon">
          <svg class="backup-modal-alert-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z"/>
          </svg>
        </div>
        <h2>Wallet Backup Required</h2>
        <p>You have not backed up your wallet. Apple or Google might require you to re-enter your recovery phrase after the next Nomo update. Please write it down and backup your recovery phrase now.</p>
        <div class="backup-modal-path">
          Nomo → Home → Settings → Security → Recovery Phrase
        </div>
        <button class="backup-modal-button" id="backup-modal-understand">
          I Understand
        </button>
      </div>
    `;

        return overlay;
    }

    function showModal() {
        if (modalShown) return;

        injectStyles();
        const modal = createModal();
        document.body.appendChild(modal);
        modalShown = true;

        const button = document.getElementById('backup-modal-understand');
        button.addEventListener('click', hideModal);

        document.body.style.overflow = 'hidden';
    }

    function hideModal() {
        const overlay = document.getElementById('backup-modal-overlay');
        if (overlay) {
            overlay.remove();
        }
        modalShown = false;
        document.body.style.overflow = '';
    }

    async function checkAndShowBackupModal() {
        try {
            if (isFallbackModeActive()) {
                showModal();
                return;
            }

            const backup = await nomoMnemonicBackupExisted();
            if (!backup?.mnemonicBackupExisted) {
                showModal();
            }
        } catch (err) {
            console.error('Error checking mnemonic backup:', err);
        }
    }

    // Expose to window for manual control
    window.BackupModal = {
        show: showModal,
        hide: hideModal,
        check: checkAndShowBackupModal
    };

    // Auto-initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', checkAndShowBackupModal);
    } else {
        setTimeout(checkAndShowBackupModal, 100);
    }
}
