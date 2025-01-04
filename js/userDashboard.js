// Import dependencies
import { accounts } from './data.js';

// DOM Elements
const UI = {
  labels: {
    welcome: document.querySelector('.welcome'),
    date: document.querySelector('.date'),
    balance: document.querySelector('.balance__value'),
    summaryIn: document.querySelector('.summary__value--in'),
    summaryOut: document.querySelector('.summary__value--out'),
    summaryInterest: document.querySelector('.summary__value--interest'),
    timer: document.querySelector('.timer'),
  },
  containers: {
    app: document.querySelector('.app'),
    movements: document.querySelector('.movements'),
  },
  buttons: {
    logout: document.querySelector('.login__out'),
    transfer: document.querySelector('.form__btn--transfer'),
    loan: document.querySelector('.form__btn--loan'),
    close: document.querySelector('.form__btn--close'),
    sort: document.querySelector('.btn--sort'),
  },
  inputs: {
    loginUsername: document.querySelector('.login__input--user'),
    loginPin: document.querySelector('.login__input--pin'),
    transferTo: document.querySelector('.form__input--to'),
    transferAmount: document.querySelector('.form__input--amount'),
    loanAmount: document.querySelector('.form__input--loan-amount'),
    closeUsername: document.querySelector('.form__input--user'),
    closePin: document.querySelector('.form__input--pin'),
  },
};

// State Management
let currentAccount, timer;
let sorted = false;

// Utility Functions
const formatMovementDate = (date, locale) => {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;

  return new Intl.DateTimeFormat(locale).format(date);
};

const formatCurrency = (value, locale, currency) => {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

// Timer Functions
const startLogOutTimer = () => {
  const tick = () => {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(time % 60).padStart(2, 0);

    UI.labels.timer.textContent = `${min}:${sec}`;

    if (time === 0) {
      clearInterval(timer);
      window.location.href = './../index.html';
    }
    time--;
  };

  let time = 300; // 5 minutes
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

// UI Update Functions
const displayMovements = (acc, sort = false) => {
  if (!acc || !Array.isArray(acc.movements)) {
    console.error('Invalid account data:', acc);
    return;
  }

  UI.containers.movements.innerHTML = '';

  // Create a copy of the movements array before sorting
  const movements = [...acc.movements];
  const dates = [...(acc.movementsDates || [])];

  // If sort is true, sort the movements and keep track of the original indices
  const indexes = movements.map((_, i) => i);
  if (sort) {
    indexes.sort((a, b) => movements[a] - movements[b]);
  }

  // Use the indexes to display movements in the correct order
  indexes.forEach(i => {
    const mov = movements[i];
    const type = mov > 0 ? 'deposit' : 'withdrawal';
    const date = dates[i] ? new Date(dates[i]) : new Date();
    const displayDate = formatMovementDate(date, acc.locale || 'en-US');
    const formattedMov = formatCurrency(
      mov,
      acc.locale || 'en-US',
      acc.currency || 'EUR'
    );

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
        <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    UI.containers.movements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = acc => {
  if (!acc || !Array.isArray(acc.movements)) return;

  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);
  UI.labels.balance.textContent = formatCurrency(
    acc.balance,
    acc.locale || 'en-US',
    acc.currency || 'EUR'
  );
};

const calcDisplaySummary = acc => {
  if (!acc || !Array.isArray(acc.movements)) return;

  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  UI.labels.summaryIn.textContent = formatCurrency(
    incomes,
    acc.locale || 'en-US',
    acc.currency || 'EUR'
  );

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  UI.labels.summaryOut.textContent = formatCurrency(
    Math.abs(out),
    acc.locale || 'en-US',
    acc.currency || 'EUR'
  );

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * (acc.interestRate || 1.2)) / 100)
    .filter(int => int >= 1)
    .reduce((acc, int) => acc + int, 0);
  UI.labels.summaryInterest.textContent = formatCurrency(
    interest,
    acc.locale || 'en-US',
    acc.currency || 'EUR'
  );
};

const updateUI = acc => {
  if (!acc) return;
  displayMovements(acc);
  calcDisplayBalance(acc);
  calcDisplaySummary(acc);
};

// save Data
const saveAccountData = account => {
  if (!account) return;

  // get all accounts from localstorage
  const allAccounts = JSON.parse(localStorage.getItem('accounts')) || accounts;
  // update
  const accountIndex = allAccounts.findIndex(
    acc => acc.username === account.username
  );
  if (accountIndex !== -1) {
    allAccounts[accountIndex] = account;
  }

  // save
  localStorage.setItem('accounts', JSON.stringify(allAccounts));

  // update logged user data
  localStorage.setItem('loggedInUser', JSON.stringify(account));
};

// transfer validation
const validateTransfer = receiverUsername => {
  const allAccounts = JSON.parse(localStorage.getItem('accounts')) || accounts;
  const receiverAcc = allAccounts.find(
    acc => acc.username === receiverUsername
  );

  if (!receiverAcc) {
    alert('Account not found! Please check the username and try again.');
    return null;
  }

  return receiverAcc;
};

// Event Handlers
const handleTransfer = e => {
  e.preventDefault();
  const amount = +UI.inputs.transferAmount.value;
  const receiverAcc = validateTransfer(UI.inputs.transferTo.value);

  if (!receiverAcc) {
    UI.inputs.transferTo.value = UI.inputs.transferAmount.value = '';
    return;
  }
  UI.inputs.transferTo.value = UI.inputs.transferAmount.value = '';

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    saveAccountData(currentAccount);
    saveAccountData(receiverAcc);

    updateUI(currentAccount);
    clearInterval(timer);
    timer = startLogOutTimer();
  }
};

const handleLoan = e => {
  e.preventDefault();
  const amount = Number(UI.inputs.loanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(() => {
      currentAccount.movements.push(amount);
      currentAccount.movementsDates.push(new Date().toISOString());

      saveAccountData(currentAccount);

      updateUI(currentAccount);

      clearInterval(timer);
      timer = startLogOutTimer();
    }, 2500);
  }

  UI.inputs.loanAmount.value = '';
};

const handleClose = e => {
  e.preventDefault();

  const inputUsername = UI.inputs.closeUsername.value;
  const inputPin = +UI.inputs.closePin.value;

  // console.log(currentAccount);

  if (
    inputUsername === currentAccount.username &&
    inputPin === currentAccount.pin
  ) {
    console.log('great');
    console.log(currentAccount);
  }

  // if (
  //   inputUsername === currentAccount.username &&
  //   inputPin === currentAccount.pin
  // ) {
  //   const confirmClose = confirm(
  //     'هل أنت متأكد من حذف حسابك؟ هذا الإجراء لا يمكن التراجع عنه!'
  //   );

  //   if (confirmClose) {
  //     const allAccounts =
  //       JSON.parse(localStorage.getItem('accounts')) || accounts;

  //     const index = allAccounts.findIndex(
  //       acc => acc.username === currentAccount.username
  //     );

  //     if (index !== -1) {
  //       allAccounts.splice(index, 1);

  //       localStorage.setItem('accounts', JSON.stringify(allAccounts));
  //       localStorage.removeItem('loggedInUser');

  //       alert('تم حذف حسابك بنجاح');
  //       window.location.href = './../index.html';
  //     }
  //   }
  // } else {
  //   alert('بيانات غير صحيحة! تأكد من اسم المستخدم وكلمة المرور.');
  // }

  // تفريغ الحقول
  UI.inputs.closeUsername.value = UI.inputs.closePin.value = '';
};

const handleLogout = () => {
  const confirmLogout = confirm('Are you sure you want to logout?');
  if (confirmLogout) {
    // Save current account data before logout
    saveAccountData(currentAccount);

    // Clear the timer
    if (timer) clearInterval(timer);

    // Remove logged-in user data
    localStorage.removeItem('loggedInUser');

    // Redirect to login page
    window.location.href = './../index.html';
  }
};

const handleSort = e => {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
};

// Initialize App
const initializeApp = () => {
  // Get logged in user from localStorage
  let loggedInUser;
  try {
    loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

    // Validate the user data structure
    if (!loggedInUser || !Array.isArray(loggedInUser.movements)) {
      throw new Error('Invalid user data structure');
    }

    // Get all accounts to ensure data consistency
    const allAccounts =
      JSON.parse(localStorage.getItem('accounts')) || accounts;
    const userAccount = allAccounts.find(
      acc => acc.username === loggedInUser.username
    );

    // If user exists in accounts, use that data instead
    if (userAccount) {
      loggedInUser = userAccount;
    }
  } catch (error) {
    console.error('Error loading user data:', error);
    alert('Error loading user data. Redirecting to login page...');
    window.location.href = './../index.html';
    return;
  }

  currentAccount = loggedInUser;

  const now = new Date();
  const options = {
    hour: 'numeric',
    minute: 'numeric',
    day: 'numeric',
    month: 'numeric',
    year: 'numeric',
  };

  UI.labels.date.textContent = new Intl.DateTimeFormat(
    currentAccount.locale || 'en-US',
    options
  ).format(now);

  UI.labels.welcome.textContent = `Welcome back, ${
    currentAccount.owner?.split(' ')[0] || 'User'
  }!`;

  // Save initial state
  saveAccountData(currentAccount);

  if (timer) clearInterval(timer);
  timer = startLogOutTimer();

  updateUI(currentAccount);

  // Auto-save on page unload
  window.addEventListener('beforeunload', () => {
    saveAccountData(currentAccount);
  });
};

// Event Listeners
UI.buttons.transfer.addEventListener('click', handleTransfer);
UI.buttons.loan.addEventListener('click', handleLoan);
UI.buttons.close.addEventListener('click', handleClose);
UI.buttons.logout.addEventListener('click', handleLogout);
UI.buttons.sort.addEventListener('click', handleSort);

// Initialize the app
initializeApp();
