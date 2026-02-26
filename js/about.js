document.addEventListener('DOMContentLoaded', () => {
            
            // --- Hamburger Menu Logic ---
            const hamburger = document.querySelector('.hamburger');
            const navMenu = document.querySelector('.nav-menu');
            
            if (hamburger) {
                hamburger.addEventListener('click', () => {
                    hamburger.classList.toggle('active');
                    navMenu.classList.toggle('active');
                });
            }

            // Close menu when clicking a link
            document.querySelectorAll('.nav-menu a').forEach(link => {
                link.addEventListener('click', () => {
                    hamburger.classList.remove('active');
                    navMenu.classList.remove('active');
                });
            });

            // --- Scroll Reveal Animation Logic ---
            // This detects when elements enter the screen and adds the 'active' class
            const revealElements = document.querySelectorAll('.reveal');
            
            const revealObserver = new IntersectionObserver((entries, observer) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        // Optional: Unobserve after revealing if you only want it to happen once
                        // observer.unobserve(entry.target); 
                    }
                });
            }, {
                root: null,
                threshold: 0.15, // Trigger when 15% of the element is visible
                rootMargin: "0px 0px -50px 0px" // Slightly offset trigger point
            });

            revealElements.forEach(el => {
                revealObserver.observe(el);
            });

            // --- Animate Skills on Scroll ---
            const skillsSection = document.querySelector('.skills-section');
            const progressBars = document.querySelectorAll('.skill-level');
            
            if (skillsSection) {
                const skillsObserver = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            progressBars.forEach(bar => {
                                // Read the target width from a data attribute
                                const targetWidth = bar.getAttribute('data-width');
                                // Use a timeout to ensure the CSS transition fires smoothly
                                setTimeout(() => {
                                    bar.style.width = targetWidth; 
                                }, 300);
                            });
                            // We only want the bars to animate once
                            skillsObserver.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.3 });
                
                skillsObserver.observe(skillsSection);
            }
        });