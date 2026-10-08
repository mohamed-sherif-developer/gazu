// 1. قاعدة بيانات المنتجات
const productsDB = [
  {
    id: "m1",
    name: "GAZU Chunky Crewneck Knit",
    category: "men",
    price: 250,
    image: "img/m1.jpg"
  },
  {
    id: "m2",
    name: "GAZU Tailored Oversized Blazer",
    category: "men",
    price: 200,
    image: "img/m2.jpg"
  },
  {
    id: "w1",
    name: "GAZU x Porsche Graphic Windbreaker",
    category: "women",
    price: 150,
    image: "img/w1.jpg"
  },
  {
    id: "w2",
    name: "GAZU x Porsche Graphic Windbreaker",
    category: "women",
    price: 150,
    image: "img/w2.jpg"
  },
  {
    id: "k1",
    name: "Kids Essential Hoodie",
    category: "kids",
    price: 100,
    image: "img/k1.jpg"
  },
];

// 2. إداريات الـ State والسلة (session-aware)
let cart = typeof readCart === 'function' ? readCart() : [];
let wishlist = typeof readWishlist === 'function' ? readWishlist() : [];

const updateCartCounter = () => {
  const cartCountEl = document.getElementById("cart-count");
  if (cartCountEl) {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.textContent = totalCount;
  }
};

const updateWishlistCounter = () => {
  const wishlistCountEl = document.getElementById("wishlist-count");
  if (wishlistCountEl) {
    wishlistCountEl.textContent = wishlist.length;
  }

  const wishlistLink = document.getElementById("wishlist-link");
  if (wishlistLink) {
    wishlistLink.classList.toggle("font-medium", wishlist.length > 0);
    wishlistLink.classList.toggle("text-[#1a1a1a]", wishlist.length > 0);
    wishlistLink.setAttribute("aria-label", `${wishlist.length} items in wishlist`);
  }
};

const addToCart = (productId) => {
  const product = productsDB.find(p => p.id === productId);
  if (!product) return;

  const existingIndex = cart.findIndex(item => item.id === productId);
  if (existingIndex > -1) {
    cart[existingIndex].quantity += 1;
  } else {
    cart.push({ ...product, quantity: 1 });
  }

  if (typeof writeCart === 'function') writeCart(cart);
  updateCartCounter();
};

const toggleWishlist = (productId) => {
  const hasProduct = wishlist.includes(productId);

  if (hasProduct) {
    wishlist = wishlist.filter(id => id !== productId);
  } else {
    wishlist.push(productId);
  }

  if (typeof writeWishlist === 'function') writeWishlist(wishlist);
  updateWishlistCounter();

  document.querySelectorAll(".wishlist-btn").forEach((button) => {
    const buttonId = button.getAttribute("data-id");
    const isActive = wishlist.includes(buttonId);

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
    button.innerHTML = isActive ? "♥" : "♡";
  });
};

const syncWishlistButtons = () => {
  document.querySelectorAll(".wishlist-btn").forEach((button) => {
    const buttonId = button.getAttribute("data-id");
    const isActive = wishlist.includes(buttonId);

    button.classList.toggle("active", isActive);
    button.setAttribute("aria-label", isActive ? "Remove from wishlist" : "Add to wishlist");
    button.innerHTML = isActive ? "♥" : "♡";
  });
};

// 3. جلب الـ Category من URL
const getCategoryFromURL = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("category") || "all";
};

// 4. تهيئة الصفحة ورندر المنتجات
const initShop = () => {
  const category = getCategoryFromURL();
  const container = document.getElementById("products-grid");
  const titleElement = document.getElementById("category-title");

  // تحديث عنوان القسم
  if (titleElement) {
    titleElement.textContent = category === "all" ? "ALL PRODUCTS" : `${category.toUpperCase()} COLLECTION`;
  }

  // تحديث الـ underline للقسم النشط
  const activeCategory = category.toLowerCase();
  const filterLinks = document.querySelectorAll("#category-filter-links a");

  filterLinks.forEach(link => {
    const linkCat = link.getAttribute("data-category");
    if (linkCat === activeCategory) {
      link.classList.add("underline", "underline-offset-4", "font-medium");
    } else {
      link.classList.remove("underline", "underline-offset-4", "font-medium");
    }
  });

  // تحديث عداد السلة من الـ LocalStorage
  updateCartCounter();
  updateWishlistCounter();
  updateActiveNavLinks();

  const searchTerm = getSearchTerm();
  const searchInput = document.getElementById("global-search-input");
  // لا نحدث قيمة input من URL لأن المستخدم قد يكون لا يزال يكتب

  if (!container) return;

  // فلترة المنتجات
  const filtered = category === "all"
    ? productsDB
    : productsDB.filter(p => p.category.toLowerCase() === category.toLowerCase());

  const finalFiltered = searchTerm.trim()
    ? filtered.filter(product => product.name.toLowerCase().includes(searchTerm.trim().toLowerCase()))
    : filtered;

  if (finalFiltered.length === 0) {
    container.innerHTML = `<p class="col-span-full text-center text-neutral-500 py-20 uppercase tracking-widest text-sm">No items found in this collection.</p>`;
    return;
  }

  // رندر المنتجات
  container.innerHTML = finalFiltered.map(product => `
    <div class="product-card group flex flex-col gap-3">
      <div class="w-full aspect-[3/4] overflow-hidden rounded-[2px] bg-neutral-900">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover grayscale contrast-[1.1] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105">
      </div>
      <div class="flex justify-between items-start uppercase tracking-wider text-xs mt-1">
        <div>
          <h3 class="font-medium text-[#1a1a1a]">${highlightMatch(product.name, searchTerm)}</h3>
          <p class="text-neutral-500 font-sans mt-0.5">$${product.price}</p>
        </div>
        <button 
          data-id="${product.id}" 
          data-name="${product.name}"
          type="button"
          class="add-to-cart-btn bg-[#0a0a0a] text-[#f1f1f1] px-4 py-1.5 rounded-[2px] hover:scale-[1.02] transition-transform cursor-pointer">
          Add
        </button>
      </div>
      <div class="mt-1 flex justify-end">
        <button 
          type="button"
          data-id="${product.id}"
          data-name="${product.name}"
          class="wishlist-btn ${wishlist.includes(product.id) ? "active" : ""} flex h-10 w-10 items-center justify-center rounded-full border border-[#1a1a1a]/20 bg-white/70 text-lg transition-all duration-200 hover:scale-105 hover:border-[#1a1a1a]/40"
          aria-label="${wishlist.includes(product.id) ? "Remove from wishlist" : "Add to wishlist"}">
          ${wishlist.includes(product.id) ? "♥" : "♡"}
        </button>
      </div>
    </div>
  `).join("");

  // إضافة Event Listeners لأزرار الـ Add
  document.querySelectorAll(".add-to-cart-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      addToCart(id);
    });
  });

  document.querySelectorAll(".wishlist-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const id = e.currentTarget.getAttribute("data-id");
      toggleWishlist(id);
    });
  });

  syncWishlistButtons();
  // تشغيل أنيميشن المنتجات بعد اكتمال الرندر
  animateProducts();
};

// دالة أنيميشن بسيطة تستخدم GSAP (تتحقق إن كانت GSAP محمّلة)
function animateProducts() {
  if (typeof gsap === 'undefined') return;
  // عملنا المايسترو (التايم لاين)
const maintl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 1. أول حاجة الـ Nav ينزل وينور الشاشة
  maintl.from(".main-nav", {
    opacity: 0,
    y: -20,
    stagger: 0.1,
    duration: 0.5
});
maintl.from(".second-section", {
  opacity: 0,
  x: -20,
  stagger: 0.1,
  duration: 0.5
},"-=0.2");
maintl.from(".link-filter", {
  opacity: 0,
  x: 20,
  stagger: 0,
  duration: 0.5
},"-=0.5");
maintl.from(".product-card", {
    opacity: 0,
    y: 20,
    stagger: 0.15,
    duration: 0.4
},"-=0.3");
// 1. دخول الـ 4 كروت بتتابُع راقي (Stagger)
  gsap.from(".final-section .grid > div", {
    scrollTrigger: {
      trigger: ".final-section", // يبدأ لما أول الـ Footer يظهر
      start: "top 85%",          // أول ما يوصل لـ 85% من ارتفاع الشاشة
      toggleActions: "play none none none"
    },
    opacity: 0,
    y: 30,                       // يرتفع 30px لفوق
    scale: 0.9,                  // يصغر شوية في الأول
    duration: 0.7,
    stagger: 0.15,               // فرق 0.15 ثانية بين كل كارت والتاني
    ease: "power2.out"
  });

  // 2. دخول سطر الـ Copyright في الآخر بجمالية
  gsap.from(".final-section .text-center", {
    scrollTrigger: {
      trigger: ".final-section .text-center",
      start: "top 95%",
    },
    opacity: 0,
    y: 15,
    duration: 0.6,
    delay: 0.4,                  // ينزل بعد ما الكروت تخلص دخول
    ease: "power2.out"
  });
};
const setActiveNavLink = (link) => {
  if (!link) return;

  link.classList.add("font-medium", "text-[#1a1a1a]", "scale-105");
  link.style.fontSize = "0.9rem";
};

const updateActiveNavLinks = () => {
  const page = window.location.pathname.split("/").pop();
  const params = new URLSearchParams(window.location.search);
  const category = params.get("category");

  const navLinks = document.querySelectorAll("#nav-men, #nav-women, #nav-kids, #wishlist-link, #cart-link");
  navLinks.forEach(link => {
    link.classList.remove("font-medium", "text-[#1a1a1a]", "scale-105");
    link.style.fontSize = "";
  });

  if (page === "wishlist.html") {
    setActiveNavLink(document.getElementById("wishlist-link"));
    return;
  }

  if (page === "cart.html") {
    setActiveNavLink(document.getElementById("cart-link"));
    return;
  }

  if (page === "shop.html" && category) {
    const targetId = {
      men: "nav-men",
      women: "nav-women",
      kids: "nav-kids"
    }[category.toLowerCase()];

    setActiveNavLink(document.getElementById(targetId));
  }
};

const escapeRegExp = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const highlightMatch = (text, query) => {
  if (!query) return text;

  const pattern = new RegExp(`(${escapeRegExp(query)})`, 'ig');
  return text.replace(pattern, '<span class="search-match">$1</span>');
};

const getSearchTerm = () => {
  const params = new URLSearchParams(window.location.search);
  return params.get("search") || "";
};

const setupSearchToggle = () => {
  const searchToggle = document.getElementById("search-toggle");
  const searchInput = document.getElementById("global-search-input");

  if (!searchToggle || !searchInput) return;
  if (searchToggle.dataset.bound === "true") return;
  searchToggle.dataset.bound = "true";

  const hideSearchInput = () => {
    if (!searchInput.classList.contains("hidden")) {
      searchInput.classList.add("hidden");
      searchInput.blur();
    }
  };

  searchToggle.addEventListener("click", (event) => {
    event.preventDefault();
    event.stopPropagation();

    const isHidden = searchInput.classList.contains("hidden");
    if (isHidden) {
      searchInput.classList.remove("hidden");
      setTimeout(() => {
        searchInput.focus();
        searchInput.select();
      }, 0);
    } else {
      hideSearchInput();
    }
  });

  searchInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      hideSearchInput();
    }

    if (event.key === "Escape") {
      hideSearchInput();
      searchToggle.focus();
    }
  });

  document.addEventListener("click", (event) => {
    const clickedInsideSearch = searchInput.contains(event.target);
    const clickedToggle = searchToggle.contains(event.target);

    if (!clickedInsideSearch && !clickedToggle) {
      hideSearchInput();
    }
  }, true);
};

const attachSearchHandler = () => {
  setupSearchToggle();

  const searchInput = document.getElementById("global-search-input");
  if (!searchInput) return;

  const syncSearchValue = () => {
    searchInput.value = getSearchTerm();
  };

  syncSearchValue();

  searchInput.addEventListener("input", (e) => {
    const value = e.target.value;
    const url = new URL(window.location.href);

    if (value.trim()) {
      url.searchParams.set("search", value);
    } else {
      url.searchParams.delete("search");
    }

    window.history.replaceState({}, "", url);
    initShop();
  });
};

// التشغيل
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    attachSearchHandler();
    initShop();
    updateActiveNavLinks();
  });
} else {
  attachSearchHandler();
  initShop();
  updateActiveNavLinks();
}