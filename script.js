'use strict';

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// BANKIST APP

/////////////////////////////////////////////////
// Data

// DIFFERENT DATA! Contains movement dates, currency and locale

const account1 = {
  owner: 'Sunday Asher',
  movements: [200, 455.23, -306.5, 25000, -642.21, -133.9, 79.97, 1300],
  interestRate: 1.2, // %
  pin: 1111,

  movementsDates: [
    '2022-06-18T21:31:17.178Z',
    '2022-06-23T07:42:02.383Z',
    '2022-07-28T09:15:04.904Z',
    '2022-08-01T10:17:24.185Z',
    '2022-10-28T14:11:59.604Z',
    '2022-11-10T17:01:17.194Z',
    '2022-11-11T23:36:17.929Z',
    '2022-11-16T10:51:36.790Z',
  ],
  currency: 'USD',
  locale: 'en-US', // de-DE
};

const account2 = {
  owner: 'Jessica Davis',
  movements: [5000, 3400, -150, -790, -3210, -1000, 8500, -30],
  interestRate: 1.5,
  pin: 2222,

  movementsDates: [
    '2021-11-01T13:15:33.035Z',
    '2021-11-30T09:48:16.867Z',
    '2021-12-25T06:04:23.907Z',
    '2022-01-25T14:18:46.235Z',
    '2022-02-05T16:33:06.386Z',
    '2022-04-10T14:43:26.374Z',
    '2022-06-25T18:49:59.371Z',
    '2022-11-10T12:01:20.894Z',
  ],
  currency: 'GBP',
  locale: 'en-GB',
};

const accounts = [account1, account2];

/////////////////////////////////////////////////
// Elements
const labelWelcome = document.querySelector('.welcome');
const labelDate = document.querySelector('.date');
const labelBalance = document.querySelector('.balance__value');
const labelSumIn = document.querySelector('.summary__value--in');
const labelSumOut = document.querySelector('.summary__value--out');
const labelSumInterest = document.querySelector('.summary__value--interest');
const labelTimer = document.querySelector('.timer');

const containerApp = document.querySelector('.app');
const containerMovements = document.querySelector('.movements');

const btnLogin = document.querySelector('.login__btn');
const btnTransfer = document.querySelector('.form__btn--transfer');
const btnLoan = document.querySelector('.form__btn--loan');
const btnClose = document.querySelector('.form__btn--close');
const btnSort = document.querySelector('.btn--sort');

const inputLoginUsername = document.querySelector('.login__input--user');
const inputLoginPin = document.querySelector('.login__input--pin');
const inputTransferTo = document.querySelector('.form__input--to');
const inputTransferAmount = document.querySelector('.form__input--amount');
const inputLoanAmount = document.querySelector('.form__input--loan-amount');
const inputCloseUsername = document.querySelector('.form__input--user');
const inputClosePin = document.querySelector('.form__input--pin');

/////////////////////////////////////////////////
// Functions
// date init

const formatMovementDate = function (date, locale) {
  const calcDaysPassed = (date1, date2) =>
    Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));

  const daysPassed = calcDaysPassed(new Date(), date);
  //   console.log(daysPassed);

  if (daysPassed === 0) return 'Today';
  if (daysPassed === 1) return 'Yesterday';
  if (daysPassed <= 7) return `${daysPassed} days ago`;
  //   else {
  //     const day = `${date.getDate()}`.padStart(2, 0);
  //     const month = `${date.getMonth() + 1}`.padStart(2, 0);
  //     const year = date.getFullYear();
  //     return `${day}/${month}/${year}`;
  //   }
  return new Intl.DateTimeFormat(locale).format(date);
};

// reusable currency formatter
const formatCur = function (value, locale, currency) {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
  }).format(value);
};

const displayMovements = function (acc, sort = false) {
  containerMovements.innerHTML = '';

  const movs = sort
    ? acc.movements.slice().sort((a, b) => a - b)
    : acc.movements;

  movs.forEach(function (mov, i) {
    const type = mov > 0 ? 'deposit' : 'withdrawal';

    // date init
    const date = new Date(acc.movementsDates[i]);
    const displayDate = formatMovementDate(date, acc.locale);

    // currency format
    const formattedMov = formatCur(mov, acc.locale, acc.currency);

    const html = `
      <div class="movements__row">
        <div class="movements__type movements__type--${type}">${
      i + 1
    } ${type}</div>
     <div class="movements__date">${displayDate}</div>
        <div class="movements__value">${formattedMov}</div>
      </div>
    `;

    containerMovements.insertAdjacentHTML('afterbegin', html);
  });
};

const calcDisplayBalance = function (acc) {
  acc.balance = acc.movements.reduce((acc, mov) => acc + mov, 0);

  labelBalance.textContent = formatCur(acc.balance, acc.locale, acc.currency);
};

const calcDisplaySummary = function (acc) {
  const incomes = acc.movements
    .filter(mov => mov > 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumIn.textContent = formatCur(incomes, acc.locale, acc.currency);

  const out = acc.movements
    .filter(mov => mov < 0)
    .reduce((acc, mov) => acc + mov, 0);
  labelSumOut.textContent = formatCur(Math.abs(out), acc.locale, acc.currency);

  const interest = acc.movements
    .filter(mov => mov > 0)
    .map(deposit => (deposit * acc.interestRate) / 100)
    .filter((int, i, arr) => {
      // console.log(arr);
      return int >= 1;
    })
    .reduce((acc, int) => acc + int, 0);
  labelSumInterest.textContent = formatCur(interest, acc.locale, acc.currency);
};

const createUsernames = function (accs) {
  accs.forEach(function (acc) {
    acc.username = acc.owner
      .toLowerCase()
      .split(' ')
      .map(name => name[0])
      .join('');
  });
};
createUsernames(accounts);

const updateUI = function (acc) {
  // Display movements
  displayMovements(acc);

  // Display balance
  calcDisplayBalance(acc);

  // Display summary
  calcDisplaySummary(acc);
};

// Logout timer
const startLogOutTimmer = function () {
  const tick = function () {
    const min = String(Math.trunc(time / 60)).padStart(2, 0);
    const sec = String(Math.trunc(time % 60)).padStart(2, 0);
    // In each call, print the remaining time to the UI
    labelTimer.textContent = `${min}:${sec}`;

    // When 0 seconds, stop timer and log out
    if (time === 0) {
      clearInterval(timer);
      labelWelcome.textContent = 'Log in to get started';
      containerApp.style.opacity = 0;
      inputLoanAmount.textContent = '';
      inputTransferAmount.textContent = '';
      inputTransferTo.textContent = '';
    }

    // Decrease 1s
    time--;
  };

  // Set time to 5 mins
  let time = 120;
  // Call the timer every second
  tick();
  const timer = setInterval(tick, 1000);
  return timer;
};

///////////////////////////////////////
// Event handlers
let currentAccount, timer;

// FAKE ALWAYS LOGGED IN
// currentAccount = account1;
// updateUI(currentAccount);
// containerApp.style.opacity = 100;

btnLogin.addEventListener('click', function (e) {
  // Prevent form from submitting
  e.preventDefault();

  currentAccount = accounts.find(
    acc => acc.username === inputLoginUsername.value
  );
  console.log(currentAccount);

  if (currentAccount?.pin === +inputLoginPin.value) {
    // Display UI and message
    labelWelcome.textContent = `Welcome back, ${
      currentAccount.owner.split(' ')[0]
    }!`;
    containerApp.style.opacity = 100;

    // Create current date and time
    // API date
    const now = new Date();
    const options = {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'numeric', // long, 2-digit
      year: 'numeric',
      //   weekday: 'long',
    };
    // getting the locale from user browser
    // const locale = navigator.language;
    // console.log(locale);

    labelDate.innerHTML = new Intl.DateTimeFormat(
      currentAccount.locale,
      options
    ).format(now);

    // Manual date
    // const now = new Date();
    // const day = `${now.getDate()}`.padStart(2, 0);
    // const month = `${now.getMonth() + 1}`.padStart(2, 0);
    // const year = now.getFullYear();
    // const hour = `${now.getHours()}`.padStart(2, 0);
    // const min = `${now.getMinutes()}`.padStart(2, 0);
    // labelDate.innerHTML = `${day}/${month}/${year}, ${hour}:${min}`;

    // Clear input fields
    inputLoginUsername.value = inputLoginPin.value = '';
    inputLoginPin.blur();

    //Timer
    if (timer) clearInterval(timer);
    timer = startLogOutTimmer();
    // Update UI
    updateUI(currentAccount);
  }
});

// console.log(movDate);

btnTransfer.addEventListener('click', function (e) {
  e.preventDefault();
  const amount = +inputTransferAmount.value;
  const receiverAcc = accounts.find(
    acc => acc.username === inputTransferTo.value
  );
  inputTransferAmount.value = inputTransferTo.value = '';
  inputTransferAmount.blur();

  if (
    amount > 0 &&
    receiverAcc &&
    currentAccount.balance >= amount &&
    receiverAcc?.username !== currentAccount.username
  ) {
    // Doing the transfer
    currentAccount.movements.push(-amount);
    receiverAcc.movements.push(amount);

    // Add transfer date
    currentAccount.movementsDates.push(new Date().toISOString());
    receiverAcc.movementsDates.push(new Date().toISOString());

    // Timer reset on transfer
    clearInterval(timer);
    timer = startLogOutTimmer();
    // Update UI
    updateUI(currentAccount);
  }
});

btnLoan.addEventListener('click', function (e) {
  e.preventDefault();

  const amount = Math.floor(+inputLoanAmount.value);

  if (amount > 0 && currentAccount.movements.some(mov => mov >= amount * 0.1)) {
    setTimeout(function () {
      // Add movement
      currentAccount.movements.push(amount);

      // Add loan date
      currentAccount.movementsDates.push(new Date().toISOString());

      // Update UI
      updateUI(currentAccount);

      // Timer reset on transfer
      clearInterval(timer);
      timer = startLogOutTimmer();
    }, 2500);

    inputLoanAmount.value = '';
    inputLoanAmount.blur();
  }
});

btnClose.addEventListener('click', function (e) {
  e.preventDefault();

  if (
    inputCloseUsername.value === currentAccount.username &&
    +inputClosePin.value === currentAccount.pin
  ) {
    const index = accounts.findIndex(
      acc => acc.username === currentAccount.username
    );
    console.log(index);
    // .indexOf(23)

    // Delete account
    accounts.splice(index, 1);

    // Hide UI
    containerApp.style.opacity = 0;
  }

  inputCloseUsername.value = inputClosePin.value = '';
  labelWelcome.textContent = 'Log in to get started';
});

let sorted = false;
btnSort.addEventListener('click', function (e) {
  e.preventDefault();
  displayMovements(currentAccount, !sorted);
  sorted = !sorted;
});

/////////////////////////////////////////////////
/////////////////////////////////////////////////
// LECTURES
/*
/////// CONVERTING AND CHECKING NUMBERS  ////////

// In JavaScript , all numbers are represented as foating point numbers: always as decimals
// Numbers are represented internally in a 64 bit base 2 format: are stored in binary format, composed of zeros and ones
console.log(23 === 23.0);

// Base 10: 0 to 9, 1/10=0.1, 3/10 =3.33333333
// Binary base 2: 0 and 1
console.log(0.1 + 0.2);
console.log(0.1 + 0.2 === 0.3);

// converting string to number
console.log(Number('23'));
console.log(+'23');

// Parsing: reading a number out of a string
console.log(Number.parseInt('30px'));
console.log(Number.parseInt('e623')); // error

console.log(Number.parseInt('3.5rem'));
console.log(Number.parseFloat('3.5rem'));

// console.log(Number.parseInt('  3.5rem  '));

// Check if value is NaN
console.log(Number.isNaN(20));
console.log(Number.isNaN('20'));
console.log(Number.isNaN(+'20X'));
console.log(Number.isNaN(23 / 0)); // infinity

// better to check if a value is a real number or not
console.log(Number.isFinite(20));
console.log(Number.isFinite('20'));
console.log(Number.isFinite(+'20X'));
console.log(Number.isFinite(20 / 0));

// Check integers
console.log(Number.isInteger(23));
console.log(Number.isInteger(23.0));
console.log(Number.isInteger(23 / 0));
*/
/*
//////////// MATH AND ROUNDING NUMBERS //////////

// square root
console.log(Math.sqrt(25));
console.log(25 ** (1 / 2));
console.log(25 ** (1 / 3)); // cubic root

// max values
console.log(Math.max(5, 18, 23, 11, 2));
console.log(Math.max(5, 18, '23', 11, 2));
console.log(Math.max(5, 18, '23px', 11, 2));

// min
console.log(Math.min(5, 18, 23, 11, 2));

// constants
// calculating area of a circle
console.log(Math.PI * Number.parseFloat('10px') ** 2);
console.log(Math.PI);

// random numbers
console.log(Math.trunc(Math.random() * 6) + 1);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min) + 1) + min;
// 0...1 -> (max-min)-> min...max
// console.log(randomInt(10, 20));

// Rounding integers
console.log(Math.trunc(23.3)); // remove all decimal

console.log(Math.round(23.3));
console.log(Math.round(23.9));

console.log(Math.ceil(23.3)); // round up
console.log(Math.ceil(23.9));

console.log(Math.floor(23.3)); //round down
console.log(Math.floor(23.9));

// incase of a -ve value:  floor works better in all situation than the truc method
console.log(Math.trunc(-23.3));
console.log(Math.floor(-23.3));

// Rounding decimals
console.log((2.7).toFixed(0)); // toFixed() returns string
console.log((2.7).toFixed(3));
console.log((2.345).toFixed(2));
console.log(+(2.345).toFixed(2));
*/
/*
//// REMAINDER OPERATOR /////////////////////////
// Returns the remainder of a division
console.log(5 % 2);
console.log(5 / 2); // 5= 2 * 2 +1
console.log(8 % 3);
console.log(8 / 3); // 8 = 2 * 3 + 2

// check if even or odd
console.log(6 % 2);
console.log(6 / 2);

console.log(7 % 2);
console.log(7 / 2);

const isEven = n => n % 2 === 0;
console.log(isEven(8));
console.log(isEven(23));
console.log(isEven(514));

labelBalance.addEventListener('click', function () {
  [...document.querySelectorAll('.movements__row')].forEach(function (row, i) {
    // 0,2,4,6
    if (i % 2 === 0) row.style.backgroundColor = 'orangered';

    // 0,3,6,9
    if (i % 3 === 0) row.style.backgroundColor = 'blue';
  });
});
*/
/*
/////////////////// WORKING WITH BIGINT /////////
// max capacity of javaScript storing integers
console.log(2 ** 53 - 1);
console.log(Number.MAX_SAFE_INTEGER);
console.log(2 ** 53 + 1);
console.log(2 ** 53 + 2);
console.log(2 ** 53 + 3);
console.log(2 ** 53 + 4);

// Bigint: BIg Integer: can be used to store numbers as large as we want.
console.log(122986465034823894809477407);
console.log(122986465034823894809477407n);
console.log(BigInt(34823894809477407n));

// Operations
console.log(10000n + 10000n);
console.log(327897398656486808247n * 1000000n);
// console.log(Math.sqrt(16n));

// we can't mix bigint and other type
const huge = 29873408793864869846984n;
const num = 23;
// console.log(huge * num); // error
console.log(huge * BigInt(num));

// Exceptions: comparison and + operator when working with strings
console.log(20n > 15);
console.log(20n === 20); // error: srict mode
console.log(typeof 20n);
console.log(20n == 20);

// String concatinations
console.log(huge + ' is REALLY big!!!');

// Divisions
console.log(10n / 3n);
console.log(10 / 3);
console.log(11n / 3n);
console.log(11 / 3);
console.log(12n / 3n);
console.log(12 / 3);
*/
/*
////////// CREATING DATES //////////////////////
// there are four ways of creating dates inJavaScript
// 1.
const now = new Date();
console.log(now);

// 2. parsing from a date string
console.log(new Date('Nov 17 2022 09:03:41'));

//3. writing by ourselves
console.log(new Date('November 17, 2022'));
console.log(new Date(account1.movementsDates[0]));

// we can pass day, hour , min, and secs
console.log(new Date(2037, 10, 19, 15, 23, 5));
console.log(new Date(2037, 10, 31));

// We can also pass in the amount of milliseconds passed since the beginning of the Unix time which is january 1st 1970.
console.log(new Date(0));

// converting days to milliseconds
console.log(new Date(3 * 24 * 60 * 60 * 1000));


// Working with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(future);
console.log(future.getFullYear());
console.log(future.getMonth());
console.log(future.getDay());
console.log(future.getHours());
console.log(future.getMinutes());
console.log(future.getSeconds());

// convert date object to a string that you can store somewhere
console.log(future.toISOString());

// Get time stamp for the date
console.log(future.getTime());
console.log(new Date(2142256980000));
console.log(new Date().getTime());
console.log(new Date(1668676798456));

// Special method to get time stamp for rn
console.log(Date.now());

// set version
future.setFullYear(2040);
console.log(future);
*/
/*
////////// OPERATIONS WITH DATES ////////////////
// Calculations with dates
const future = new Date(2037, 10, 19, 15, 23);
console.log(+future);

// create a func that takes in two dates and return the number of days that passed btw this two dates
const calcDaysPassed = (date1, date2) =>
  Math.round(Math.abs(date2 - date1) / (1000 * 60 * 60 * 24));
const days1 = calcDaysPassed(
  new Date(2037, 4, 4),
  new Date(2037, 4, 14, 10, 8)
);
console.log(days1);

// For precise calculations, i.e including time change, daylight savings and other time conditions: Use a date library (moment.js)
*/
/*
////// INTERNATIONALIZING DATES (intl) /////////
//  Date API 
const now = new Date();
const options = {
  hour: 'numeric',
  minute: 'numeric',
  day: 'numeric',
  month: 'long', // long, 2-digit,short
  year: 'numeric',
  weekday: 'long',
};
// getting the locale from user browser
const locale = navigator.language;
// console.log(locale);

const labelDates = new Intl.DateTimeFormat(locale, options).format(now);
console.log(labelDates);
*/
/*
///// INTERNATIONALIZING NUMBERS (intl) ///////
const num = 3887974.23;

// style: unit , percent, currency
const options = {
  style: 'currency',
  unit: 'celsius',
  currency: 'EUR',
  //   useGrouping: false,
};

console.log('US:', new Intl.NumberFormat('en-US', options).format(num));
console.log('Germany:', new Intl.NumberFormat('de-DE', options).format(num));
console.log('Syria:', new Intl.NumberFormat('ar-SY', options).format(num));
console.log(
  navigator.language,
  new Intl.NumberFormat(navigator.language).format(num)
);
*/
/*
//// TIMERS: SETTIMEOUT AND SETINTERVAL ////////

// SETTIMEOUT runs just once after a defined TimeRanges, while SETINTERVAL timer keeps running until we stop it

//We can set parameters for the Timeout function, and arguments can be passed into the timer function just after the counter

// setTimeout(
//   (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
//   3000,
//   'olives',
//   'spinach'
// );

const ingridients = ['olives', 'spinach'];
const pizzaTimer = setTimeout(
  (ing1, ing2) => console.log(`Here is your pizza with ${ing1} and ${ing2} 🍕`),
  3000,
  ...ingridients
);
console.log('Waiting...');

if (ingridients.includes('spinach')) clearTimeout(pizzaTimer);

// SETINTERVAL
setInterval(function () {
  const now = new Date();
  const hour = `${now.getHours()}`.padStart(2, 0);
  const min = `${now.getMinutes()}`.padStart(2, 0);
  const sec = `${now.getSeconds()}`.padStart(2, 0);
  console.log(`${hour}:${min}:${sec}`);
}, 1000);
*/

// console.log('Sunfliz'.slice(7).padStart(7, '*'));

c;
