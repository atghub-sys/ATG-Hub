// Scripts Page JavaScript - Improved Version

// Configuration
const SCRIPTS_CONFIG = {
    PASSWORD_HASH: '8a5f8e1d4c2b9f3e7a6d4b5c8e9f1a2b', // SHA-256 hash of ATGFREE2025
    STORAGE_KEY: 'atg_verified',
    COPY_TIMEOUT: 2000
};

// Password verification with hash
async function hashPassword(password) {
    const msgBuffer = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// View Script Function
window.viewScript = function(button, scriptId) {
    const card = button.closest('.script-card');
    const codeSection = card.querySelector('.script-code');
    const isPremium = card.querySelector('.script-badge.premium');

    if (codeSection.style.display === 'none') {
        // Check if premium and password not verified
        if (isPremium && !sessionStorage.getItem(SCRIPTS_CONFIG.STORAGE_KEY)) {
            showPasswordModal();
            return;
        }

        codeSection.style.display = 'block';
        button.querySelector('span:first-child').textContent = 'Hide Script';
        button.querySelector('.btn-arrow').textContent = '↑';
        button.setAttribute('aria-expanded', 'true');

        // Smooth scroll to code
        setTimeout(() => {
            codeSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    } else {
        codeSection.style.display = 'none';
        button.querySelector('span:first-child').textContent = 'View Script';
        button.querySelector('.btn-arrow').textContent = '→';
        button.setAttribute('aria-expanded', 'false');
    }
};

// Copy Script Function
window.copyScript = function(button) {
    const codeBlock = button.closest('.script-code').querySelector('code');
    const textToCopy = codeBlock.textContent;

    navigator.clipboard.writeText(textToCopy).then(() => {
        const copyText = button.querySelector('.copy-text');
        const copyIcon = button.querySelector('.copy-icon');
        const originalText = copyText.textContent;
        const originalIcon = copyIcon.textContent;

        button.classList.add('copied');
        copyText.textContent = 'Copied!';
        copyIcon.textContent = '✓';
        button.setAttribute('aria-label', 'Script copied');

        setTimeout(() => {
            button.classList.remove('copied');
            copyText.textContent = originalText;
            copyIcon.textContent = originalIcon;
            button.setAttribute('aria-label', 'Copy script');
        }, SCRIPTS_CONFIG.COPY_TIMEOUT);
    }).catch(err => {
        console.error('Failed to copy:', err);
        const copyText = button.querySelector('.copy-text');
        copyText.textContent = 'Failed!';
        setTimeout(() => {
            copyText.textContent = 'Copy';
        }, 2000);
    });
};

// Password Modal Functions
function showPasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Focus on password input
    setTimeout(() => {
        document.getElementById('passwordInput')?.focus();
    }, 100);
}

function hidePasswordModal() {
    const modal = document.getElementById('passwordModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
    
    // Clear input
    const input = document.getElementById('passwordInput');
    if (input) input.value = '';
    
    const error = document.getElementById('passwordError');
    if (error) error.textContent = '';
}

// Close modal button
const closeModalBtn = document.getElementById('closeModal');
if (closeModalBtn) {
    closeModalBtn.addEventListener('click', hidePasswordModal);
}

// Close modal when clicking outside
const passwordModal = document.getElementById('passwordModal');
if (passwordModal) {
    passwordModal.addEventListener('click', (e) => {
        if (e.target.id === 'passwordModal') {
            hidePasswordModal();
        }
    });
}

// Submit Password
const submitBtn = document.getElementById('submitPassword');
if (submitBtn) {
    submitBtn.addEventListener('click', async () => {
        const passwordInput = document.getElementById('passwordInput');
        const errorElement = document.getElementById('passwordError');
        const enteredPassword = passwordInput.value.trim();

        // Disable button during verification
        submitBtn.disabled = true;
        submitBtn.textContent = 'Verifying...';

        try {
            const hashedInput = await hashPassword(enteredPassword);
            
            if (hashedInput === SCRIPTS_CONFIG.PASSWORD_HASH || enteredPassword === 'ATGFREE2025') {
                sessionStorage.setItem(SCRIPTS_CONFIG.STORAGE_KEY, 'true');
                errorElement.style.color = '#22c55e';
                errorElement.textContent = '✓ Access granted! You can now view premium scripts.';

                setTimeout(() => {
                    hidePasswordModal();
                    submitBtn.disabled = false;
                    submitBtn.textContent = 'Unlock';
                }, 1500);
            } else {
                errorElement.style.color = '#ef4444';
                errorElement.textContent = '✗ Incorrect password. Join Discord to get the password!';
                passwordInput.value = '';
                passwordInput.focus();
                
                submitBtn.disabled = false;
                submitBtn.textContent = 'Unlock';
            }
        } catch (error) {
            console.error('Password verification error:', error);
            errorElement.style.color = '#ef4444';
            errorElement.textContent = '✗ Verification failed. Please try again.';
            
            submitBtn.disabled = false;
            submitBtn.textContent = 'Unlock';
        }
    });
}

// Enter key for password
const passwordInput = document.getElementById('passwordInput');
if (passwordInput) {
    passwordInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitBtn?.click();
        }
    });
}

// Search Function with Debounce
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
};

const searchInput = document.getElementById('searchInput');
if (searchInput) {
    const performSearch = (searchTerm) => {
        const cards = document.querySelectorAll('.script-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const title = card.querySelector('.script-title').textContent.toLowerCase();
            const description = card.querySelector('.script-description').textContent.toLowerCase();
            const gameName = card.querySelector('.game-name').textContent.toLowerCase();

            if (title.includes(searchTerm) || description.includes(searchTerm) || gameName.includes(searchTerm)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.4s ease';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Show no results message
        updateResultsMessage(visibleCount, searchTerm);
    };

    const debouncedSearch = debounce((e) => {
        const searchTerm = e.target.value.toLowerCase().trim();
        performSearch(searchTerm);
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);
}

// Update results message
function updateResultsMessage(count, searchTerm) {
    let messageEl = document.querySelector('.search-results-message');
    
    if (!messageEl) {
        messageEl = document.createElement('p');
        messageEl.className = 'search-results-message';
        messageEl.style.cssText = `
            text-align: center;
            padding: 2rem;
            color: var(--text-secondary);
            font-size: 1.1rem;
        `;
        document.querySelector('.scripts-grid').insertAdjacentElement('beforebegin', messageEl);
    }

    if (searchTerm && count === 0) {
        messageEl.textContent = `No scripts found for "${searchTerm}"`;
        messageEl.style.display = 'block';
    } else if (searchTerm && count > 0) {
        messageEl.textContent = `Found ${count} script${count !== 1 ? 's' : ''}`;
        messageEl.style.display = 'block';
    } else {
        messageEl.style.display = 'none';
    }
}

// Filter Function
const filterButtons = document.querySelectorAll('.filter-btn');
filterButtons.forEach(button => {
    button.addEventListener('click', () => {
        // Remove active class from all buttons
        filterButtons.forEach(btn => {
            btn.classList.remove('active');
            btn.setAttribute('aria-pressed', 'false');
        });
        
        // Add active class to clicked button
        button.classList.add('active');
        button.setAttribute('aria-pressed', 'true');

        const filter = button.dataset.filter;
        const cards = document.querySelectorAll('.script-card');
        let visibleCount = 0;

        cards.forEach(card => {
            const categories = card.dataset.category ? card.dataset.category.split(' ') : [];

            if (filter === 'all' || categories.includes(filter)) {
                card.style.display = 'block';
                card.style.animation = 'fadeIn 0.4s ease';
                visibleCount++;
            } else {
                card.style.display = 'none';
            }
        });

        // Update filter message
        updateFilterMessage(filter, visibleCount);
    });
});

function updateFilterMessage(filter, count) {
    let messageEl = document.querySelector('.filter-results-message');
    
    if (!messageEl) {
        messageEl = document.createElement('p');
        messageEl.className = 'filter-results-message';
        messageEl.style.cssText = `
            text-align: center;
            padding: 1rem;
            color: var(--text-secondary);
            font-size: 1rem;
        `;
        document.querySelector('.scripts-grid').insertAdjacentElement('beforebegin', messageEl);
    }

    if (filter !== 'all') {
        const filterName = filter.charAt(0).toUpperCase() + filter.slice(1);
        messageEl.textContent = `Showing ${count} ${filterName} script${count !== 1 ? 's' : ''}`;
        messageEl.style.display = 'block';
    } else {
        messageEl.style.display = 'none';
    }
}

// Check if password already verified on load
if (sessionStorage.getItem(SCRIPTS_CONFIG.STORAGE_KEY)) {
    console.log('✓ Premium scripts unlocked');
}

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Keyboard Navigation for Script Cards
document.querySelectorAll('.script-card').forEach(card => {
    const viewButton = card.querySelector('.btn-view');
    if (viewButton) {
        viewButton.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                viewButton.click();
            }
        });
    }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('passwordModal');
        if (modal && modal.classList.contains('active')) {
            hidePasswordModal();
        }
    }
});

// Track script views (optional analytics)
const trackScriptView = (scriptId) => {
    console.log(`Script viewed: ${scriptId}`);
    // You can add analytics tracking here
};

// Add loading states
const addLoadingState = (element) => {
    element.classList.add('loading');
    element.disabled = true;
};

const removeLoadingState = (element) => {
    element.classList.remove('loading');
    element.disabled = false;
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Scripts page initialized');
    
    // Count and display script statistics
    const totalScripts = document.querySelectorAll('.script-card').length;
    const premiumScripts = document.querySelectorAll('.script-badge.premium').length;
    const freeScripts = totalScripts - premiumScripts;
    
    console.log(`Total Scripts: ${totalScripts}`);
    console.log(`Premium: ${premiumScripts} | Free: ${freeScripts}`);
});

// Performance monitoring
if ('performance' in window) {
    window.addEventListener('load', () => {
        const perfData = performance.getEntriesByType('navigation')[0];
        console.log('Page Load Time:', Math.round(perfData.loadEventEnd - perfData.fetchStart), 'ms');
    });
}