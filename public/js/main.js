// WorkHub v2.0 - Main JavaScript

function filterLinks() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const cards = document.querySelectorAll('.card');
    
    cards.forEach(card => {
        const title = card.querySelector('h3')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        
        if (title.includes(searchTerm) || description.includes(searchTerm)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Also filter section headers if all cards in section are hidden
    document.querySelectorAll('.section').forEach(section => {
        const visibleCards = section.querySelectorAll('.card:not([style*="display: none"])');
        if (visibleCards.length === 0 && searchTerm.length > 0) {
            section.style.display = 'none';
        } else {
            section.style.display = '';
        }
    });
}

// Keyboard shortcut for search
document.addEventListener('keydown', function(e) {
    if (e.key === '/' && document.activeElement.tagName === 'BODY') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
});

// Toast notification helper (optional enhancement)
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed; bottom: 30px; right: 30px; 
        background: ${type === 'success' ? '#166534' : '#991b1b'}; 
        color: white; padding: 14px 24px; border-radius: 10px;
        box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.3);
        z-index: 9999; display: flex; align-items: center; gap: 10px;
    `;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.style.transition = 'all 0.3s';
        toast.style.opacity = '0';
        setTimeout(() => toast.remove(), 300);
    }, 2800);
}

// Auto-hide success messages
document.addEventListener('DOMContentLoaded', () => {
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            if (alert.parentNode) alert.parentNode.removeChild(alert);
        }, 4500);
    });
});