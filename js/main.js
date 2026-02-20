
        document.addEventListener('DOMContentLoaded', () => {
            
            /* --- 1. Preloader & Reveal Sequence --- */
            const preloader = document.querySelector('.preloader');
            const heroText = document.querySelector('.display-text');
            const heroLabel = document.querySelector('.hero-label');

            setTimeout(() => {
                // Lift Curtain
                preloader.classList.add('hidden');
                
                // Trigger Text Animation AFTER curtain is moving
                setTimeout(() => {
                    heroText.classList.add('visible');
                    heroLabel.classList.add('visible');
                }, 400); // Slight delay for dramatic effect
            }, 1500);

            /* --- 2. Custom Cursor --- */
            const cursorDot = document.querySelector('.cursor-dot');
            const cursorOutline = document.querySelector('.cursor-outline');
            
            window.addEventListener('mousemove', (e) => {
                const posX = e.clientX;
                const posY = e.clientY;

                cursorDot.style.left = `${posX}px`;
                cursorDot.style.top = `${posY}px`;

                cursorOutline.animate({
                    left: `${posX}px`,
                    top: `${posY}px`
                }, { duration: 500, fill: "forwards" });
            });

            /* --- 3. Hover Interactions --- */
            const hoverTriggers = document.querySelectorAll('a, button, .hover-trigger');
            hoverTriggers.forEach(trigger => {
                trigger.addEventListener('mouseenter', () => document.body.classList.add('hovering'));
                trigger.addEventListener('mouseleave', () => document.body.classList.remove('hovering'));
            });

            /* --- 4. Sidebar Toggle --- */
            const menuToggle = document.getElementById('menuToggle');
            const sidebar = document.getElementById('sidebar');
            
            menuToggle.addEventListener('click', () => {
                sidebar.classList.toggle('active');
                menuToggle.classList.toggle('open');
            });

            /* --- 5. Scroll Animations --- */
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('in-view');
                    }
                });
            }, { threshold: 0.1 });

            document.querySelectorAll('.work-item').forEach(item => observer.observe(item));

            /* --- 6. Parallax Mouse Move --- */
            document.addEventListener('mousemove', (e) => {
                const shapes = document.querySelectorAll('.shape');
                const x = (window.innerWidth - e.pageX * 2) / 100;
                const y = (window.innerHeight - e.pageY * 2) / 100;

                shapes.forEach(shape => {
                    const speed = shape.getAttribute('data-speed');
                    shape.style.transform = `translate(${x * speed}px, ${y * speed}px)`;
                });
            });
        });
    