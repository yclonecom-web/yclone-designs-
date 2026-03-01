// Firebase is imported exactly as you requested. No changes here.
import { db, collection, getDocs, query, orderBy } from './firebase.js';

let allProjects = []; // Store fetched projects for lightning-fast client-side search

document.addEventListener('DOMContentLoaded', () => {
    // Load Data from Firebase
    loadPortfolio();
});

// --- Load Portfolio Data ---
async function loadPortfolio() {
    const container = document.getElementById('portfolio-container');
    const countSpan = document.getElementById('count');
    
    if (!container) return;

    // Show sleek loading state
    container.innerHTML = `
        <div style="grid-column: 1/-1; text-align: center; padding: 5rem 0;">
            <i class="fas fa-circle-notch fa-spin fa-3x" style="color: var(--accent); margin-bottom: 1rem;"></i>
            <p style="color: var(--text-muted); font-size: 1.2rem;">Curating projects...</p>
        </div>
    `;

    try {
        const projectsRef = collection(db, 'portfolio');
        
        // We order by 'order' ascending. 
        const q = query(projectsRef, orderBy('order', 'asc'));
        
        const snapshot = await getDocs(q);
        
        if (snapshot.empty) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.2rem;">New projects are currently brewing. Check back soon.</p>';
            if(countSpan) countSpan.textContent = '';
            return;
        }

        allProjects = []; // Reset array

        // Gather all published projects into our array
        snapshot.forEach(doc => {
            const data = doc.data();
            
            // Only show projects where 'published' is true
            if (data.published === false) return;
            
            allProjects.push({
                title: data.ProjectName || 'Untitled',
                imgSrc: data.imageImageUrl || 'assets/images/placeholder.jpg',
                category: data.category || 'Design',
                year: data.createdAt && typeof data.createdAt.toDate === 'function' 
                    ? data.createdAt.toDate().getFullYear() 
                    : new Date().getFullYear(),
                desc: data.description || data.excerpt || 'Full case study details coming soon.',
                link: data.projectLink || '#',
                cta: data.cta || 'View Live'
            });
        });

        // If all documents were drafts/unpublished
        if (allProjects.length === 0) {
            container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.2rem;">New projects are currently brewing. Check back soon.</p>';
            if(countSpan) countSpan.textContent = '';
            return;
        }

        // Render projects and setup search functionality
        renderProjects(allProjects);
        setupSearch();

    } catch (error) {
        console.error("Error loading portfolio: ", error);
        container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-main); font-size: 1.2rem; padding: 4rem 0;"><p>Unable to connect to the studio archives. Please try again later.</p></div>`;
    }
}

// --- Render Projects to the DOM ---
function renderProjects(projectsToRender) {
    const container = document.getElementById('portfolio-container');
    const countSpan = document.getElementById('count');
    
    if (projectsToRender.length === 0) {
        container.innerHTML = '<p style="grid-column: 1/-1; text-align: center; color: var(--text-muted); font-size: 1.2rem; padding: 3rem 0;">No matching projects found.</p>';
        if(countSpan) countSpan.textContent = `(0)`;
        return;
    }

    let html = '';
    projectsToRender.forEach(p => {
        html += `
            <div class="portfolio-card work-item hover-trigger">
                <div class="card-image-wrapper">
                    <img src="${p.imgSrc}" alt="${p.title}" loading="lazy">
                    <div class="card-overlay">
                        <span class="view-text">Expand</span>
                    </div>
                </div>
                <div class="card-meta">
                    <h3 class="project-title">${p.title}</h3>
                    <div class="meta-bottom">
                        <span class="project-category">${p.category}</span>
                        <span class="project-year">${p.year}</span>
                    </div>
                </div>

                <!-- Hidden Metadata for the Custom Modal -->
                <div class="hidden-data" style="display: none;">
                    <span class="data-desc">${p.desc}</span>
                    <span class="data-link">${p.link}</span>
                    <span class="data-cta">${p.cta}</span>
                </div>
            </div>
        `;
    });

    // Inject Data
    container.innerHTML = html;
    if(countSpan) countSpan.textContent = `(${projectsToRender.length})`;

    // Re-initialize interactions for the newly rendered DOM elements
    setupDynamicInteractions();
    setupModal();
}

// --- Search Logic ---
function setupSearch() {
    const searchInput = document.getElementById('portfolio-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        
        const filteredProjects = allProjects.filter(p => {
            return p.title.toLowerCase().includes(query) || 
                   p.category.toLowerCase().includes(query) || 
                   p.year.toString().includes(query);
        });

        renderProjects(filteredProjects);
    });
}

// --- Initialize interactions for newly injected content ---
function setupDynamicInteractions() {
    // 1. Re-initialize Intersection Observer for scroll reveal animations
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('#portfolio-container .work-item').forEach(item => {
        observer.observe(item);
    });

    // 2. Re-bind custom cursor hover states to the new grid items
    document.querySelectorAll('#portfolio-container .hover-trigger').forEach(trigger => {
        trigger.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
        trigger.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
    });
}

// --- Setup the sleek matching modal ---
function setupModal() {
    const items = document.querySelectorAll('.portfolio-card');
    const modal = document.getElementById('project-modal');
    const modalClose = document.querySelectorAll('.modal-close');
    
    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title');
    const modalCategory = document.getElementById('modal-category');
    const modalYear = document.getElementById('modal-year');
    const modalDesc = document.getElementById('modal-desc');
    const modalLink = document.getElementById('modal-link');

    items.forEach(item => {
        item.addEventListener('click', () => {
            // Extract Card UI
            const imgSrc = item.querySelector('img').src;
            const title = item.querySelector('.project-title').textContent;
            const category = item.querySelector('.project-category').textContent;
            const year = item.querySelector('.project-year').textContent;
            
            // Extract Hidden Metadata
            const desc = item.querySelector('.data-desc').textContent;
            const link = item.querySelector('.data-link').textContent;
            const cta = item.querySelector('.data-cta').textContent;

            // Populate Premium Modal
            if(modalImg) modalImg.src = imgSrc;
            if(modalTitle) modalTitle.textContent = title;
            if(modalCategory) modalCategory.textContent = category;
            if(modalYear) modalYear.textContent = year;
            if(modalDesc) modalDesc.textContent = desc;
            
            if(modalLink) {
                modalLink.href = link;
                modalLink.querySelector('span').textContent = cta; // Only target the span so arrow icon remains
                modalLink.style.display = (link === '#' || link === '') ? 'none' : 'inline-flex';
            }

            modal.classList.add('active');
        });
    });

    // Close Modal Logic (Only bind these once to avoid duplicates, or replace the elements)
    // The way we bind it here means every render we add a new listener. Let's fix that by checking if they are already bound,
    // or better yet, they are static elements so we can just bind them once.
    // However, for simplicity and ensuring they work, this is fine, but we can do a quick cleanup.
    
    modalClose.forEach(el => {
        // Prevent stacking listeners on re-renders by replacing the element
        const newEl = el.cloneNode(true);
        el.parentNode.replaceChild(newEl, el);
        
        newEl.addEventListener('click', (e) => {
            e.stopPropagation(); // Stop overlay click from jumping to cards underneath
            modal.classList.remove('active');
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('active')) {
            modal.classList.remove('active');
        }
    });
}