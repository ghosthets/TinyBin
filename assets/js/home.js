var Home = (function() {
    'use strict';
    var toggle = document.getElementById('mobileToggle');
    var nav = document.getElementById('mainNav');
    var header = document.getElementById('siteHeader');
    var lastScroll = 0;
    var currentTheme = localStorage.getItem('tb_web_theme') || 'dark';

    function init() {
        applyWebTheme(currentTheme);

        if (toggle && nav) {
            toggle.addEventListener('click', function() {
                nav.classList.toggle('open');
                var spans = toggle.querySelectorAll('span');
                if (nav.classList.contains('open')) {
                    spans[0].style.transform = 'rotate(45deg) translate(4px, 4px)';
                    spans[1].style.opacity = '0';
                    spans[2].style.transform = 'rotate(-45deg) translate(4px, -4px)';
                } else {
                    spans[0].style.transform = '';
                    spans[1].style.opacity = '';
                    spans[2].style.transform = '';
                }
            });
        }

        var themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.addEventListener('click', function() {
                var newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                applyWebTheme(newTheme);
            });
        }

        window.addEventListener('scroll', function() {
            var current = window.pageYOffset;
            if (current > 50 && header) header.classList.add('scrolled');
            else if (header) header.classList.remove('scrolled');
            lastScroll = current;
        });

        document.querySelectorAll('a[href^="#"]').forEach(function(a) {
            a.addEventListener('click', function(e) {
                var target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    if (nav) nav.classList.remove('open');
                }
            });
        });

        var observer = new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, { threshold: 0.1 });

        document.querySelectorAll('.feature-card, .board-card, .step-card, .blog-card').forEach(function(el) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(20px)';
            el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(el);
        });
    }

    function applyWebTheme(theme) {
        currentTheme = theme;
        localStorage.setItem('tb_web_theme', theme);
        if (theme === 'light') {
            document.documentElement.setAttribute('data-theme', 'light');
        } else {
            document.documentElement.removeAttribute('data-theme');
        }
        var themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) {
            themeBtn.innerHTML = theme === 'dark'
                ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3a9 9 0 109 9c0-.46-.04-.92-.1-1.36a5.389 5.389 0 01-4.4 2.26 5.403 5.403 0 01-3.14-9.8c-.44-.06-.9-.1-1.36-.1z"/></svg>'
                : '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>';
        }
    }

    return { init: init };
})();

document.addEventListener('DOMContentLoaded', Home.init);
