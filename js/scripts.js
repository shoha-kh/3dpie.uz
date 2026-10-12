(function () {
    'use strict';

    // Mobile menu
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('main-nav');
    if (toggle && nav) {
        var setOpen = function (open) {
            nav.classList.toggle('is-open', open);
            toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
            document.documentElement.style.overflow = open ? 'hidden' : '';
        };
        toggle.addEventListener('click', function () {
            setOpen(!nav.classList.contains('is-open'));
        });
        nav.addEventListener('click', function (e) {
            if (e.target.closest('a')) setOpen(false);
        });
        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && nav.classList.contains('is-open')) {
                setOpen(false);
                toggle.focus();
            }
        });
        window.matchMedia('(min-width: 961px)').addEventListener('change', function (mq) {
            if (mq.matches) setOpen(false);
        });
    }

    var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Scroll reveal. Elements already on screen are shown at once, so nothing flashes;
    // the hiding class is added only here, so without JS everything stays visible.
    var revealSel = '.section-head, .svc-list li, .work-card, .steps li, .facts li, .faq-item, ' +
        '.table-wrap, .contact-grid > *, .prose-grid > *, .related li, .price-grid > *, .cta-band-inner';
    if ('IntersectionObserver' in window && !reduceMotion) {
        var items = document.querySelectorAll(revealSel);
        var vh = window.innerHeight;
        var revealIO = new IntersectionObserver(function (entries) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('is-in');
                revealIO.unobserve(entry.target);
            });
        }, { rootMargin: '0px 0px -8% 0px' });
        items.forEach(function (el) {
            el.classList.add('reveal');
            if (el.getBoundingClientRect().top < vh) {
                el.classList.add('is-in');
            } else {
                // small stagger inside grids and lists
                var idx = Array.prototype.indexOf.call(el.parentNode.children, el) % 4;
                el.style.transitionDelay = (idx * 70) + 'ms';
                revealIO.observe(el);
            }
        });
        document.documentElement.classList.add('js-reveal');
    }

    // Pause the hero animations (scan line, print panel) while the hero is off-screen.
    var hero = document.querySelector('.hero, .page-hero');
    if (hero && 'IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
            hero.classList.toggle('is-paused', !entries[0].isIntersecting);
        }).observe(hero);
    }

    // Conversion goals: phone, Telegram and STL-calculator link clicks.
    // In Yandex.Metrika create JavaScript-event goals with ids "click_phone", "click_telegram", "click_calc".
    document.addEventListener('click', function (e) {
        var link = e.target.closest('a[href]');
        if (!link) return;
        var href = link.getAttribute('href');
        var goal = null;
        if (href.indexOf('tel:') === 0) goal = 'click_phone';
        else if (href.indexOf('t.me/') !== -1) goal = 'click_telegram';
        else if (href.indexOf('#calc') !== -1) goal = 'click_calc';
        if (!goal) return;
        try { if (typeof ym === 'function') ym(105486503, 'reachGoal', goal); } catch (err) {}
        try { if (typeof gtag === 'function') gtag('event', goal, { link_url: href, page_path: location.pathname }); } catch (err) {}
    });
})();
