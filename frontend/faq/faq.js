// FAQ JavaScript
class FAQPage {
    constructor() {
        this.currentCategory = 'all';
        this.searchTerm = '';
        this.faqItems = [];
        
        this.init();
    }

    init() {
        this.initNavbar();
        this.initEventListeners();
        this.initAnimations();
        this.cacheFAQItems();
    }

    initNavbar() {
        // Load navbar component
        fetch('../components/navbar.html')
            .then(response => response.text())
            .then(html => {
                document.getElementById('navbar').innerHTML = html;
                if (window.AdvancedNavbar) {
                    new AdvancedNavbar();
                }
            })
            .catch(error => console.error('Error loading navbar:', error));
    }

    initEventListeners() {
        // Category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                this.switchCategory(btn.dataset.category);
            });
        });

        // FAQ item toggles
        document.querySelectorAll('.faq-question').forEach(question => {
            question.addEventListener('click', () => {
                this.toggleFAQItem(question.parentElement);
            });
        });

        // Search functionality
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.handleSearch(e.target.value);
            });

            // Search button
            const searchBtn = document.querySelector('.search-btn');
            if (searchBtn) {
                searchBtn.addEventListener('click', () => {
                    this.handleSearch(searchInput.value);
                });
            }
        }

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.clearSearch();
            }
            if (e.ctrlKey && e.key === 'f') {
                e.preventDefault();
                searchInput?.focus();
            }
        });
    }

    initAnimations() {
        // Animate FAQ items on scroll
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateFAQItem(entry.target);
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.faq-item').forEach(item => {
            observer.observe(item);
        });

        // Add hover animations to category tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('mouseenter', () => {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1.05,
                    ease: 'power2.out'
                });
            });

            btn.addEventListener('mouseleave', () => {
                gsap.to(btn, {
                    duration: 0.3,
                    scale: 1,
                    ease: 'power2.out'
                });
            });
        });
    }

    cacheFAQItems() {
        this.faqItems = Array.from(document.querySelectorAll('.faq-item')).map(item => {
            const section = item.closest('.faq-section');
            const category = section ? section.dataset.category : 'all';
            const keywords = item.dataset.keywords || '';
            const questionText = item.querySelector('.faq-question h3')?.textContent || '';
            const answerText = item.querySelector('.answer-content')?.textContent || '';
            
            return {
                element: item,
                category,
                keywords,
                questionText: questionText.toLowerCase(),
                answerText: answerText.toLowerCase(),
                searchText: (questionText + ' ' + answerText + ' ' + keywords).toLowerCase()
            };
        });
    }

    switchCategory(category) {
        this.currentCategory = category;
        
        // Update active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.category === category);
        });

        // Filter FAQ sections and items
        this.filterContent();
        
        // Add sound effect
        this.playSound('click');
        
        // Add visual feedback
        const activeTab = document.querySelector(`.tab-btn[data-category="${category}"]`);
        if (activeTab) {
            gsap.fromTo(activeTab, 
                { scale: 1.1 },
                { scale: 1, duration: 0.3, ease: 'power2.out' }
            );
        }
    }

    toggleFAQItem(faqItem) {
        const isActive = faqItem.classList.contains('active');
        
        if (isActive) {
            // Close the item
            faqItem.classList.remove('active');
            this.playSound('click');
        } else {
            // Close all other items (optional - for accordion behavior)
            // document.querySelectorAll('.faq-item.active').forEach(item => {
            //     if (item !== faqItem) {
            //         item.classList.remove('active');
            //     }
            // });
            
            // Open this item
            faqItem.classList.add('active');
            this.playSound('success');
            
            // Scroll item into view if needed
            setTimeout(() => {
                const rect = faqItem.getBoundingClientRect();
                const windowHeight = window.innerHeight;
                
                if (rect.bottom > windowHeight) {
                    faqItem.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'nearest' 
                    });
                }
            }, 400); // Wait for animation to complete
        }

        // Analytics tracking
        if (window.gtag && !isActive) {
            gtag('event', 'faq_opened', {
                'faq_question': faqItem.querySelector('h3')?.textContent || 'Unknown'
            });
        }
    }

    handleSearch(searchTerm) {
        this.searchTerm = searchTerm.toLowerCase().trim();
        
        if (this.searchTerm.length === 0) {
            this.clearSearch();
            return;
        }

        // Filter content based on search
        this.filterContent();
        
        // Highlight search terms
        this.highlightSearchTerms();
        
        // Show search results count
        this.showSearchResults();
    }

    filterContent() {
        const sections = document.querySelectorAll('.faq-section');
        let visibleItemsCount = 0;
        
        sections.forEach(section => {
            const sectionCategory = section.dataset.category;
            let sectionHasVisibleItems = false;
            
            // Check if section should be visible based on category
            const categoryMatch = this.currentCategory === 'all' || 
                                  this.currentCategory === sectionCategory;
            
            if (!categoryMatch) {
                section.classList.add('hidden');
                return;
            }
            
            // Filter items within the section
            const items = section.querySelectorAll('.faq-item');
            items.forEach(item => {
                const faqData = this.faqItems.find(f => f.element === item);
                let shouldShow = true;
                
                // Apply search filter
                if (this.searchTerm && faqData) {
                    shouldShow = faqData.searchText.includes(this.searchTerm);
                }
                
                if (shouldShow) {
                    item.style.display = 'block';
                    item.style.opacity = '1';
                    sectionHasVisibleItems = true;
                    visibleItemsCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            
            // Show/hide section based on whether it has visible items
            if (sectionHasVisibleItems) {
                section.classList.remove('hidden');
            } else {
                section.classList.add('hidden');
            }
        });
        
        // Show "no results" message if needed
        this.showNoResultsMessage(visibleItemsCount === 0);
    }

    highlightSearchTerms() {
        if (!this.searchTerm) return;
        
        document.querySelectorAll('.faq-item:not([style*="display: none"])').forEach(item => {
            const question = item.querySelector('.faq-question h3');
            const answer = item.querySelector('.answer-content');
            
            if (question) {
                question.innerHTML = this.highlightText(question.textContent, this.searchTerm);
            }
            
            if (answer) {
                // Only highlight in text nodes, not in HTML tags
                this.highlightInElement(answer, this.searchTerm);
            }
        });
    }

    highlightText(text, searchTerm) {
        if (!searchTerm) return text;
        
        const regex = new RegExp(`(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
        return text.replace(regex, '<span class="highlight">$1</span>');
    }

    highlightInElement(element, searchTerm) {
        const walker = document.createTreeWalker(
            element,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        const textNodes = [];
        let node;
        
        while (node = walker.nextNode()) {
            textNodes.push(node);
        }
        
        textNodes.forEach(textNode => {
            const highlightedText = this.highlightText(textNode.textContent, searchTerm);
            if (highlightedText !== textNode.textContent) {
                const span = document.createElement('span');
                span.innerHTML = highlightedText;
                textNode.parentNode.replaceChild(span, textNode);
            }
        });
    }

    clearSearch() {
        this.searchTerm = '';
        const searchInput = document.getElementById('faqSearch');
        if (searchInput) {
            searchInput.value = '';
        }
        
        // Remove highlights
        document.querySelectorAll('.highlight').forEach(highlight => {
            const parent = highlight.parentNode;
            parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
            parent.normalize();
        });
        
        // Re-filter content
        this.filterContent();
        
        // Hide search results message
        this.hideSearchResults();
    }

    showSearchResults() {
        const visibleItems = document.querySelectorAll('.faq-item:not([style*="display: none"])').length;
        
        let resultsMessage = document.getElementById('searchResults');
        if (!resultsMessage) {
            resultsMessage = document.createElement('div');
            resultsMessage.id = 'searchResults';
            resultsMessage.className = 'search-results-message';
            document.querySelector('.faq-content .container').insertBefore(
                resultsMessage, 
                document.querySelector('.faq-section')
            );
        }
        
        resultsMessage.innerHTML = `
            <div class="results-text">
                <i class="fas fa-search"></i>
                Found ${visibleItems} result${visibleItems !== 1 ? 's' : ''} for "${this.searchTerm}"
                <button class="clear-search" onclick="window.faqPage.clearSearch()">
                    <i class="fas fa-times"></i> Clear
                </button>
            </div>
        `;
        
        resultsMessage.style.display = 'block';
    }

    hideSearchResults() {
        const resultsMessage = document.getElementById('searchResults');
        if (resultsMessage) {
            resultsMessage.style.display = 'none';
        }
    }

    showNoResultsMessage(show) {
        let noResultsMessage = document.getElementById('noResults');
        
        if (show && !noResultsMessage) {
            noResultsMessage = document.createElement('div');
            noResultsMessage.id = 'noResults';
            noResultsMessage.className = 'no-results-message';
            noResultsMessage.innerHTML = `
                <div class="no-results-content">
                    <i class="fas fa-question-circle"></i>
                    <h3>No results found</h3>
                    <p>We couldn't find any FAQ items matching "${this.searchTerm}"</p>
                    <p>Try different keywords or <a href="../contact/contact.html">contact our support team</a> for help.</p>
                    <button class="btn btn-primary" onclick="window.faqPage.clearSearch()">
                        Clear Search
                    </button>
                </div>
            `;
            
            document.querySelector('.faq-content .container').appendChild(noResultsMessage);
        }
        
        if (noResultsMessage) {
            noResultsMessage.style.display = show ? 'block' : 'none';
        }
    }

    animateFAQItem(item) {
        gsap.fromTo(item, 
            { opacity: 0, y: 30 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 0.6, 
                ease: 'power2.out' 
            }
        );
    }

    playSound(soundName) {
        // Try multiple sound managers
        if (window.ClutchZone?.sound?.play) {
            window.ClutchZone.sound.play(soundName);
        } else if (window.soundManager?.playSound) {
            window.soundManager.playSound(soundName);
        } else if (window.utils?.playSound) {
            window.utils.playSound(soundName);
        }
    }
}

// Global functions for buttons
window.openLiveChat = function() {
    // Open live chat (implement based on your chat system)
    if (window.ClutchZone?.notifications) {
        window.ClutchZone.notifications.show('Opening live chat...', 'info');
    }
    
    // Redirect to support page with chat parameter
    window.location.href = '../support/support.html?action=chat';
};

window.createTicket = function() {
    // Redirect to support page
    window.location.href = '../support/support.html?action=ticket';
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.faqPage = new FAQPage();
});

// Add CSS for dynamic elements
const dynamicCSS = `
.search-results-message {
    background: rgba(0, 255, 255, 0.1);
    border: 1px solid var(--faq-primary);
    border-radius: 10px;
    padding: 15px 20px;
    margin-bottom: 30px;
    display: none;
}

.results-text {
    display: flex;
    align-items: center;
    gap: 10px;
    color: var(--faq-primary);
    font-weight: 600;
}

.clear-search {
    background: transparent;
    border: 1px solid var(--faq-primary);
    color: var(--faq-primary);
    padding: 5px 10px;
    border-radius: 15px;
    cursor: pointer;
    font-size: 0.8rem;
    margin-left: auto;
    transition: all 0.3s ease;
}

.clear-search:hover {
    background: var(--faq-primary);
    color: var(--faq-dark);
}

.no-results-message {
    text-align: center;
    padding: 60px 20px;
    display: none;
}

.no-results-content {
    max-width: 500px;
    margin: 0 auto;
}

.no-results-content i {
    font-size: 4rem;
    color: var(--faq-secondary);
    margin-bottom: 20px;
}

.no-results-content h3 {
    font-size: 1.5rem;
    color: var(--faq-primary);
    margin-bottom: 15px;
}

.no-results-content p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 15px;
    line-height: 1.6;
}

.no-results-content a {
    color: var(--faq-primary);
    text-decoration: none;
}

.no-results-content a:hover {
    text-decoration: underline;
}
`;

// Inject dynamic CSS
const style = document.createElement('style');
style.textContent = dynamicCSS;
document.head.appendChild(style);
