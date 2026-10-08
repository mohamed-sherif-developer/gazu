// عملنا المايسترو (التايم لاين)
const maintl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 1. أول حاجة الـ Nav ينزل وينور الشاشة
maintl.from(".main-nav a, .main-nav h2", {
    opacity: 0,
    y: -20,
    stagger: 0.1,
    duration: 0.5
});

// 2. الكلمة الكبيرة في الخلفية والموديل يدخلوا مع بعض بـ تداخل خفيف
maintl.from(".hero-big-title", {
    opacity: 0,
    y: 50,
    duration: 1
}, "-=0.3"); // الـ -=0.3 بتخليه يدخل قبل ما الـ Nav يخلص بحاجة بسيطة

maintl.from(".hero-model", {
    opacity: 0, // زي ما أنت عاملها بالظبط عشان يفضل ظاهر خفيف في الأول
    scale: 0.8,
    duration: 1.1,
}, "-=0.8"); // يدخل في نص حركة الكلمة الكبيرة

// 3. آخر حاجة التفاصيل والأزرار تفرش على الأطراف وتكمل اللوحة
maintl.from(".hero-subtitle", {
    opacity: 0,
    x: -20,
    duration: 1,
}, "-=0.5");

maintl.from(".second-subtitle", {
    opacity: 0,
    x: 30,
    duration: 0.95,
}, "-=0.8");

maintl.from(".left-buttons", {
    opacity: 0,
    y: 20,
    duration: 0.8,
}, "-=0.6");


// تايم لاين منفصل بـ ScrollTriggerللسكشن التاني
const categoriesTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".category-card", // اسم كلاس السيكشن نفسه
        start: "top 80%", // يبدأ لما قمة السيكشن توصل 80% من الشاشة
    }
});

categoriesTl.from(".category-card", {
    opacity: 0,
    y: 40,
    duration: 0.8,
    stagger: 0.2,
    ease: "power2.out"
});

//animation for the third section (NEW VIBES) with ScrollTrigger السكشن الثالث (NEW VIBES) مع ScrollTrigger
// ضيف كلاس أسهل للـ span زي: gazu-bg-text
const newVibesTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".new-vibes-section", // اسم كلاس السيكشن الثالث
        start: "top 70%", // يبدأ لما قمة السيكشن توصل لـ 70% من الشاشة
    }
});

// 1. كلمة GAZU العملاقة تفرش في الخلفية بسينمائية
newVibesTl.from(".gazu-bg-text", {
    opacity: 0,
    scale: 1.15,          // تبدأ أكبر سنة وتقرب
    letterSpacing: "0.2em", // تبدأ الحروف متباعدة وتقل للمساحة الأصلية
    duration: 1.2,
    ease: "power3.out"
})

    // 2. الموديل والنصوص يدخلوا مع بعض في نفس الوقت بتداخل رايق
    .from(".new-vibes-model", {
        opacity: 0,
        x: 50,                // يدخل من اليمين
        duration: 1,
        ease: "power2.out"
    }, "-=0.7")              // يدخل قبل ما الكلمة تخلص بـ 0.7 ثانية

    .from(".new-vibes-content", { // الوعاء اللي فيه النصوص والزرار على الشمال
        opacity: 0,
        x: -40,               // يدخل من الشمال
        duration: 0.9,
        ease: "power2.out"
    }, "<");                 // علامة "<" بتخليه يبدأ في نفس لحظة دخول الموديل بالضبط!

// final section (footer) animation with ScrollTrigger
const footerTl = gsap.timeline({
    scrollTrigger: {
        trigger: ".final-section", // اسم كلاس السيكشن الرابع (Footer)
        start: "top 70%", // يبدأ لما قمة السيكشن توصل 80% من الشاشة
    }
});
footerTl.from(".f1, .f2, .f3, .f4", {
    opacity: 0,
    y: 40,
    scale: 0.9,
    stagger: 0.1,
    duration: 0.5,
    ease: "power2.out"
});

// نلقط زرار shop now
const shopNowBtn = document.querySelector('a[href="#categories-section"]');

if (shopNowBtn) {
    shopNowBtn.addEventListener('click', (e) => {
        e.preventDefault(); // نمنع القفزة المفاجئة الافتراضية

        const target = document.getElementById('categories-section');

        if (target) {
            // نحسب مكان السيكشن بالظبط ونزود عليه لتحت
            const extraOffset = 50; // تقدر تزود أو تقلل الرقم ده براحتك (مثلاً 80 أو 120)
            const targetPosition = target.getBoundingClientRect().top + window.pageYOffset + extraOffset;

            // سكرول ناعم مخصص
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
        }
    });
}

// تحديث عداد الـ Wishlist في الـ Navbar
const updateWishlistCounter = () => {
    const wishlistCountEl = document.getElementById('wishlist-count');
    const wishlistLink = document.getElementById('wishlist-link');

    if (!wishlistCountEl) return;

    const wishlist = (typeof readWishlist === 'function') ? readWishlist() : (JSON.parse(localStorage.getItem('gazu_wishlist')) || []);
    wishlistCountEl.textContent = wishlist.length;

    if (wishlistLink) {
        wishlistLink.classList.toggle('font-medium', wishlist.length > 0);
        wishlistLink.classList.toggle('text-[#1a1a1a]', wishlist.length > 0);
    }
};

updateWishlistCounter();

// تحديث عداد الـ Cart في الـ Navbar
const updateCartCounter = () => {
    const cartCountEl = document.getElementById('cart-count');

    if (!cartCountEl) return;

    let cart = [];

    try {
        cart = (typeof readCart === 'function') ? readCart() : (function(){
            const raw = localStorage.getItem('gazu_cart');
            if (!raw) return [];
            try {
                const parsed = JSON.parse(raw);
                if (!Array.isArray(parsed)) { localStorage.removeItem('gazu_cart'); return []; }
                const safe = parsed.filter(item => item && item.id && Number(item.quantity) > 0);
                localStorage.setItem('gazu_cart', JSON.stringify(safe));
                return safe;
            } catch (e){ localStorage.removeItem('gazu_cart'); return []; }
        })();
    } catch (error) {
        if (typeof readCart !== 'function') localStorage.removeItem('gazu_cart');
        cart = [];
    }

    const totalCount = cart.reduce((acc, item) => acc + Number(item.quantity || 0), 0);
    cartCountEl.textContent = totalCount;
};

updateCartCounter();

const setActiveNavLink = (link) => {
    if (!link) return;

    link.classList.add('font-medium', 'text-[#1a1a1a]', 'scale-105');
    link.style.fontSize = '0.9rem';
};

const updateActiveNavLink = () => {
    const page = window.location.pathname.split('/').pop();
    const params = new URLSearchParams(window.location.search);
    const category = params.get('category');

    const activeSelectors = {
        'wishlist.html': 'wishlist-link',
        'cart.html': 'cart-link',
        'shop.html-men': 'nav-men',
        'shop.html-women': 'nav-women',
        'shop.html-kids': 'nav-kids'
    };

    const selectedKey = page === 'shop.html' && category
        ? `shop.html-${category}`
        : page;

    const activeId = activeSelectors[selectedKey];
    const navLinks = document.querySelectorAll('#wishlist-link, #cart-link, #nav-men, #nav-women, #nav-kids');

    navLinks.forEach(link => {
        link.classList.remove('font-medium', 'text-[#1a1a1a]', 'scale-105');
        link.style.fontSize = '';
    });

    if (activeId) {
        const activeLink = document.getElementById(activeId);
        setActiveNavLink(activeLink);
    }
};

updateActiveNavLink();

const setupGlobalSearch = () => {
    const searchInput = document.getElementById('global-search-input');
    if (!searchInput) return;

    const params = new URLSearchParams(window.location.search);
    searchInput.value = params.get('search') || '';

    searchInput.addEventListener('input', (e) => {
        const value = e.target.value;

        if (window.location.pathname.endsWith('shop.html')) {
            const url = new URL(window.location.href);
            if (value.trim()) {
                url.searchParams.set('search', value.trim());
            } else {
                url.searchParams.delete('search');
            }
            window.history.replaceState({}, '', url);
            return;
        }
    });

    searchInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const value = e.target.value;
            if (value.trim() && !window.location.pathname.endsWith('shop.html')) {
                window.location.href = `shop.html?search=${encodeURIComponent(value.trim())}`;
            }
        }
    });
};

setupGlobalSearch();

const setupSearchToggle = () => {
    const searchToggle = document.getElementById('search-toggle');
    const searchInput = document.getElementById('global-search-input');

    if (!searchToggle || !searchInput) return;
    if (searchToggle.dataset.bound === 'true') return;
    searchToggle.dataset.bound = 'true';

    const hideSearchInput = () => {
        searchInput.classList.add('hidden');
        searchInput.blur();
    };

    searchToggle.addEventListener('click', (event) => {
        event.preventDefault();
        event.stopPropagation();

        const isHidden = searchInput.classList.contains('hidden');
        if (isHidden) {
            searchInput.classList.remove('hidden');
            setTimeout(() => {
                searchInput.focus();
                searchInput.select();
            }, 0);
        } else {
            hideSearchInput();
        }
    });

    searchInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            hideSearchInput();
        }

        if (event.key === 'Escape') {
            hideSearchInput();
            searchToggle.focus();
        }
    });

    document.addEventListener('click', (event) => {
        const clickedInsideSearch = searchInput.contains(event.target);
        const clickedToggle = searchToggle.contains(event.target);

        if (!clickedInsideSearch && !clickedToggle) {
            hideSearchInput();
        }
    }, true);
};

setupSearchToggle();