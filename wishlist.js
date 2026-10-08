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
const getCart = () => (typeof readCart === 'function') ? readCart() : (function(){
  try {
    const raw = localStorage.getItem("gazu_cart");
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) { localStorage.removeItem("gazu_cart"); return []; }
    const safeCart = parsed.filter(item => item && item.id && Number(item.quantity) > 0);
    localStorage.setItem("gazu_cart", JSON.stringify(safeCart));
    return safeCart;
  } catch (e) { localStorage.removeItem("gazu_cart"); return []; }
})();

const getWishlist = () => (typeof readWishlist === 'function') ? readWishlist() : (JSON.parse(localStorage.getItem("gazu_wishlist")) || []);

const updateWishlistCounter = () => {
  const wishlistCountEl = document.getElementById("wishlist-count");
  const wishlistLink = document.getElementById("wishlist-link");
  const wishlist = getWishlist();

  if (wishlistCountEl) {
    wishlistCountEl.textContent = wishlist.length;
  }

  if (wishlistLink) {
    wishlistLink.classList.toggle("font-medium", wishlist.length > 0);
    wishlistLink.classList.toggle("text-[#1a1a1a]", wishlist.length > 0);
  }
};

const setActiveNavLink = (link) => {
  if (!link) return;

  link.classList.add("font-medium", "text-[#1a1a1a]", "scale-105");
  link.style.fontSize = "0.9rem";
};

const updateActiveNavLinks = () => {
  const navLinks = document.querySelectorAll("#nav-men, #nav-women, #nav-kids, #wishlist-link, #cart-link");

  navLinks.forEach(link => {
    link.classList.remove("font-medium", "text-[#1a1a1a]", "scale-105");
    link.style.fontSize = "";
  });

  setActiveNavLink(document.getElementById("wishlist-link"));
};

const updateCartCounter = () => {
  const cartCountEl = document.getElementById("cart-count");
  const cart = getCart();

  if (cartCountEl) {
    const totalCount = cart.reduce((acc, item) => acc + item.quantity, 0);
    cartCountEl.textContent = totalCount;
  }

  const wishlistCountEl = document.getElementById("wishlist-count");
  if (wishlistCountEl) {
    const wishlist = getWishlist();
    wishlistCountEl.textContent = wishlist.length;
  }
};

const removeFromWishlist = (productId) => {
  const wishlist = getWishlist().filter(id => id !== productId);
  if (typeof writeWishlist === 'function') writeWishlist(wishlist); else localStorage.setItem("gazu_wishlist", JSON.stringify(wishlist));
  renderWishlist();
  updateWishlistCounter();
};

/*animate wishlist function*/
const animateWishlist = () => {
  if (typeof gsap === 'undefined') return;

 // عملنا المايسترو (التايم لاين)
const maintl = gsap.timeline({ defaults: { ease: "power2.out" } });

// 1. أول حاجة الـ Nav ينزل وينور الشاشة
  maintl.from(".main-nav",{
    opacity: 0,
    y: -20,
    stagger: 0.1,
    duration: 0.5
});
  maintl.from(".wsh-left", {
  opacity: 0,
  x: -20,
  stagger: 0.1,
  duration: 0.5
},"-=0.2");
  maintl.from(".wsh-right", {
  opacity: 0,
  x: 20,
  stagger: 0,
  duration: 0.5,
},"-=0.5");
  maintl.from(".wish-card",{
    opacity: 0,
    y: 20,
    stagger: 0.1,
    duration: 0.5
},"-=0.2");
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

const renderWishlist = () => {
  const wishlist = getWishlist();
  const container = document.getElementById("wishlist-grid");

  if (!container) return;

  if (!wishlist.length) {
    container.innerHTML = `
      <div class="col-span-full flex flex-col items-center justify-center py-16 text-center">
        <p class="text-sm uppercase tracking-[0.3em] text-neutral-500">your wishlist is empty</p>
        <a href="shop.html?category=all" class="mt-6 inline-block bg-[#0a0a0a] text-[#f1f1f1] px-6 py-2.5 rounded-[2px] uppercase tracking-[0.2em] text-[10px] transition-transform hover:scale-[1.02]">
          browse products
        </a>
      </div>
    `;
    return;
  }

  const wishlistProducts = productsDB.filter(product => wishlist.includes(product.id));

  container.innerHTML = wishlistProducts.map(product => `
    <div class="wish-card group flex flex-col gap-3">
      <div class="w-full aspect-[3/4] overflow-hidden rounded-[2px] bg-neutral-900">
        <img src="${product.image}" alt="${product.name}" class="w-full h-full object-cover grayscale contrast-[1.1] transition-all duration-500 group-hover:grayscale-0 group-hover:scale-105">
      </div>

      <div class="flex justify-between items-start uppercase tracking-wider text-xs mt-1 gap-3">
        <div>
          <h3 class="font-medium text-[#1a1a1a]">${product.name}</h3>
          <p class="text-neutral-500 font-sans mt-0.5">$${product.price}</p>
        </div>
      </div>

      <div class="flex gap-3 justify-end">
        <button
          type="button"
          data-id="${product.id}"
          class="remove-from-wishlist border border-[#1a1a1a]/20 bg-white/80 px-3 py-2 text-[10px] uppercase tracking-[0.2em] hover:bg-[#1a1a1a] hover:text-[#f7f7f7] transition-colors rounded-[2px]"
        >
          remove
        </button>
      </div>
    </div>
  `).join("");

  animateWishlist(); /*animate wishlist function*/

  document.querySelectorAll(".remove-from-wishlist").forEach(button => {
    button.addEventListener("click", (e) => {
      const productId = e.currentTarget.getAttribute("data-id");
      removeFromWishlist(productId);
    });
  });
};

const initGlobalSearchControls = () => {
  const searchToggle = document.getElementById("search-toggle");
  const searchInput = document.getElementById("global-search-input");

  if (!searchToggle || !searchInput) return;

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
      const value = searchInput.value.trim();
      if (value) {
        window.location.href = `shop.html?search=${encodeURIComponent(value)}`;
      } else {
        hideSearchInput();
      }
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

updateWishlistCounter();
updateCartCounter();
updateActiveNavLinks();
renderWishlist();
initGlobalSearchControls();
