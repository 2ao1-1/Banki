import { accounts } from './data.js';

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
// Helper functions
const closeModal = () => {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

const openModal = e => {
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const createUsername = fullName => {
  return fullName
    .toLowerCase()
    .split(' ')
    .map(name => name[0])
    .join('');
};

// Mobile menu functionality
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('nav-open');
  navToggle.classList.toggle('nav-open');
});

// Close mobile menu when clicking a link
document.querySelectorAll('.nav__link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('nav-open');
    navToggle.classList.remove('nav-open');
  });
});

// Show login form
const showLoginForm = () => {
  modal.innerHTML = `
    <button class="btn--close-modal">&times;</button>
    <h2 class="modal__header">Login to your account</h2>
    <form class="modal__form" id="loginForm">
      <label>Username</label>
      <input type="text" id="username" required />
      <label>PIN</label>
      <input type="password" id="pin" required />
      <button type="submit" class="btn">Sign In &rarr;</button>
    </form>
    <button class="btn--login">Create new account</button>
  `;

  // Add event listeners for login form
  document.getElementById('loginForm').addEventListener('submit', handleLogin);
  modal
    .querySelector('.btn--login')
    .addEventListener('click', showRegisterForm);
  modal
    .querySelector('.btn--close-modal')
    .addEventListener('click', closeModal);
};

// Show registration form
const showRegisterForm = () => {
  modal.innerHTML = `
    <button class="btn--close-modal">&times;</button>
    <h2 class="modal__header">Create your account</h2>
    <form class="modal__form" id="registerForm">
      <label>Full Name</label>
      <input type="text" id="fullName" required />
      <label>PIN</label>
      <input type="password" id="newPin" required minlength="4" maxlength="4" />
      <label>Initial Balance</label>
      <input type="number" id="initialBalance" required min="0" />
      <button type="submit" class="btn">Register &rarr;</button>
    </form>
    <button class="btn--create">I already have an account</button>
  `;

  // Add event listeners for register form
  document
    .getElementById('registerForm')
    .addEventListener('submit', handleRegister);
  modal.querySelector('.btn--create').addEventListener('click', showLoginForm);
  modal
    .querySelector('.btn--close-modal')
    .addEventListener('click', closeModal);
};

// Handle login submission
const handleLogin = e => {
  e.preventDefault();

  const username = document.getElementById('username').value;
  const pin = document.getElementById('pin').value;

  // Get accounts from localStorage or use the imported accounts
  const allAccounts = JSON.parse(localStorage.getItem('accounts')) || accounts;
  const account = allAccounts.find(
    acc => acc.username === username && acc.pin === pin
  );

  if (account) {
    localStorage.setItem('loggedInUser', JSON.stringify(account));
    window.location.href = './../pages/transactions.html';
  } else {
    alert('Invalid username or PIN');
  }
};

// Handle registration submission
const handleRegister = e => {
  e.preventDefault();

  const fullName = document.getElementById('fullName').value;
  const pin = document.getElementById('newPin').value;
  const initialBalance = Number(
    document.getElementById('initialBalance').value
  );

  // Get existing accounts or initialize empty array
  const allAccounts = JSON.parse(localStorage.getItem('accounts')) || accounts;

  // Create new account object
  const newAccount = {
    owner: fullName,
    username: createUsername(fullName),
    pin: pin,
    movements: [initialBalance],
    movementsDates: [new Date().toISOString()],
    currency: 'USD',
    locale: 'en-US',
  };

  // Add new account to accounts array
  allAccounts.push(newAccount);

  // Save updated accounts to localStorage
  localStorage.setItem('accounts', JSON.stringify(allAccounts));

  // Automatically log in the new user
  localStorage.setItem('loggedInUser', JSON.stringify(newAccount));

  // Redirect to dashboard
  window.location.href = './../pages/transactions.html';
};

// Initialize modal events
const initModal = () => {
  btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));
  overlay.addEventListener('click', closeModal);

  // Show login form by default
  showLoginForm();

  // Handle escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
      closeModal();
    }
  });
};

// navigation
const initNavigation = () => {
  const nav = document.querySelector('.nav');
  const btnScrollTo = document.querySelector('.btn--scroll-to');
  const section1 = document.querySelector('#section--1');

  const handleHover = function (e) {
    if (e.target.classList.contains('nav__link')) {
      const link = e.target;
      const siblings = link.closest('.nav').querySelectorAll('.nav__link');
      const logo = link.closest('.nav').querySelector('img');

      siblings.forEach(el => {
        if (el !== link) el.style.opacity = this;
      });
      logo.style.opacity = this;
    }
  };

  nav.addEventListener('mouseover', handleHover.bind(0.5));
  nav.addEventListener('mouseout', handleHover.bind(1));

  btnScrollTo.addEventListener('click', () => {
    section1.scrollIntoView({ behavior: 'smooth' });
  });

  document.querySelector('.nav__link').addEventListener('click', e => {
    e.preventDefault();
    if (e.target.classList.contains('nav__link')) {
      const id = e.target.getAttribute('href');
      document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
    }
  });
};

// tabs
const initTabs = () => {
  const tabs = document.querySelectorAll('.operations__tab');
  const tabsContainer = document.querySelector('.operations__tab-container');
  const tabsContent = document.querySelectorAll('.operations__content');

  tabsContainer.addEventListener('click', e => {
    const clicked = e.target.closest('.operations__tab');
    if (!clicked) return;

    tabs.forEach(t => t.classList.remove('operations__tab--active'));
    tabsContent.forEach(c => c.classList.remove('operations__content--active'));

    clicked.classList.add('operations__tab--active');
    document
      .querySelector(`.operations__content--${clicked.dataset.tab}`)
      .classList.add('operations__content--active');
  });
};

// slider
const initSlider = () => {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0;
  const maxSlide = slides.length;

  const createDots = () => {
    slides.forEach((_, i) => {
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = slide => {
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));
    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = slide => {
    slides.forEach(
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  const nextSlide = () => {
    curSlide = curSlide === maxSlide - 1 ? 0 : curSlide + 1;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = () => {
    curSlide = curSlide === 0 ? maxSlide - 1 : curSlide - 1;
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const init = () => {
    goToSlide(0);
    createDots();
    activateDot(0);
  };

  init();
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);
  document.addEventListener('keydown', e => {
    if (e.key === 'ArrowLeft') prevSlide();
    if (e.key === 'ArrowRight') nextSlide();
  });
  dotContainer.addEventListener('click', e => {
    if (e.target.classList.contains('dots__dot')) {
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(slide);
    }
  });
};

// observers
const initObservers = () => {
  const header = document.querySelector('.header');
  const nav = document.querySelector('.nav');
  const allSections = document.querySelectorAll('.section');
  const imgTargets = document.querySelectorAll('img[data-src]');

  const navHeight = nav.getBoundingClientRect().height;

  const stickyNav = entries => {
    const [entry] = entries;
    nav.classList.toggle('sticky', !entry.isIntersecting);
  };

  const headerObserver = new IntersectionObserver(stickyNav, {
    root: null,
    threshold: 0,
    rootMargin: `-${navHeight}px`,
  });
  headerObserver.observe(header);

  const revealSection = (entries, observer) => {
    const [entry] = entries;
    if (!entry.isIntersecting) return;
    entry.target.classList.remove('section--hidden');
    observer.unobserve(entry.target);
  };

  const sectionObserver = new IntersectionObserver(revealSection, {
    root: null,
    threshold: 0.15,
  });

  allSections.forEach(section => {
    sectionObserver.observe(section);
    section.classList.add('section--hidden');
  });

  const loadImg = (entries, observer) => {
    const [entry] = entries;
    if (!entry.isIntersecting) return;
    entry.target.src = entry.target.dataset.src;
    entry.target.addEventListener('load', () => {
      entry.target.classList.remove('lazy-img');
    });
    observer.unobserve(entry.target);
  };

  const imgObserver = new IntersectionObserver(loadImg, {
    root: null,
    threshold: 0,
    rootMargin: '200px',
  });

  imgTargets.forEach(img => imgObserver.observe(img));
};

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  initModal();
  initNavigation();
  initTabs();
  initSlider();
  initObservers();
});
