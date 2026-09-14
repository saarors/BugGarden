const challenges = [
{
id:1,
title:"The Missing Return",
category:"Basics",
difficulty:"Easy",
xp:50,
code:`function calculateTotal(items) {
  return items.reduce((total, item) => {
    total + item.price;
  }, 0);
}

console.log(calculateTotal([
  { price: 10 },
  { price: 20 },
  { price: 15 }
]));`,
hints:[
"Look at what the reduce callback gives back on every iteration.",
"An arrow function using braces does not automatically return a value.",
"The callback needs to return total + item.price."
],
test:code => {
try {
const fn = new Function(`${code}; return calculateTotal([{price:10},{price:20},{price:15}]);`);
return fn() === 45;
} catch(e) {
return false;
}
}
},
{
id:2,
title:"The Vanishing Variable",
category:"Basics",
difficulty:"Easy",
xp:60,
code:`function getMessage() {
  let message = "Hello";
}

console.log(message);`,
hints:[
"Where is message declared?",
"Variables declared inside a function are local to that function.",
"Return the value from getMessage and use the returned value."
],
test:code => {
try {
const fn = new Function(`${code}; return typeof message !== "undefined" && message === "Hello";`);
return fn();
} catch(e) {
return false;
}
}
},
{
id:3,
title:"Array Identity",
category:"Arrays",
difficulty:"Easy",
xp:70,
code:`const numbers = [1, 2, 3, 4, 5];

const doubled = numbers.map(number => {
  number * 2;
});

console.log(doubled);`,
hints:[
"map creates a new array from the callback return values.",
"Check the callback body.",
"The callback must return number * 2."
],
test:code => {
try {
const fn = new Function(`${code}; return JSON.stringify(doubled) === JSON.stringify([2,4,6,8,10]);`);
return fn();
} catch(e) {
return false;
}
}
},
{
id:4,
title:"Off By One",
category:"Arrays",
difficulty:"Medium",
xp:90,
code:`function getLastItem(items) {
  return items[items.length];
}

console.log(getLastItem(["apple", "banana", "orange"]));`,
hints:[
"Array indexes start at zero.",
"length tells you how many elements exist, not the last index.",
"Use items.length - 1."
],
test:code => {
try {
const fn = new Function(`${code}; return getLastItem(["apple","banana","orange"]) === "orange";`);
return fn();
} catch(e) {
return false;
}
}
},
{
id:5,
title:"The Async Surprise",
category:"Async",
difficulty:"Medium",
xp:120,
code:`function getUser() {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve("Ada");
    }, 10);
  });
}

async function greet() {
  const user = getUser();
  return "Hello " + user;
}

greet().then(console.log);`,
hints:[
"What does getUser return?",
"Promises do not immediately contain their final value.",
"Wait for the Promise with await."
],
test:code => {
return /await\\s+getUser\\s*\\(\\s*\\)/.test(code);
}
},
{
id:6,
title:"Loose Comparison",
category:"Logic",
difficulty:"Medium",
xp:100,
code:`function isAdmin(role) {
  return role = "admin";
}

console.log(isAdmin("user"));`,
hints:[
"Look closely at the operator inside the return statement.",
"One operator changes a value instead of comparing it.",
"Use === for strict equality."
],
test:code => {
try {
const fn = new Function(`${code}; return isAdmin("user") === false;`);
return fn();
} catch(e) {
return false;
}
}
},
{
id:7,
title:"DOM Ghost",
category:"DOM",
difficulty:"Medium",
xp:110,
code:`const button = document.querySelector("#save");

button.addEventListener("click", saveData);

function saveData() {
  document.querySelector("#status").textContent = "Saved!";
}`,
hints:[
"Check whether the elements your code searches for actually exist.",
"The challenge is about safely selecting a DOM element.",
"Make sure button and status are not null before using them."
],
test:code => {
return /if\\s*\\(\\s*button/.test(code) || /button\\s*&&/.test(code);
}
},
{
id:8,
title:"JSON Confusion",
category:"APIs",
difficulty:"Medium",
xp:130,
code:`const response = '{"name":"Ada","level":7}';

const user = response;

console.log(user.name);`,
hints:[
"response is a string.",
"Strings do not have the object property you are looking for.",
"Convert the JSON string into an object."
],
test:code => {
return /JSON\\.parse\\s*\\(\\s*response\\s*\\)/.test(code);
}
},
{
id:9,
title:"Closure Trap",
category:"Advanced JS",
difficulty:"Hard",
xp:180,
code:`function createCounter() {
  let count = 0;

  return {
    increment: function() {
      count++;
    },
    getCount: function() {
      return 0;
    }
  };
}

const counter = createCounter();
counter.increment();
counter.increment();

console.log(counter.getCount());`,
hints:[
"increment changes count correctly.",
"getCount does not return the current count.",
"The getter needs access to the closed-over count variable."
],
test:code => {
return /getCount\\s*:\\s*function\\s*\\(\\s*\\)\\s*\\{\\s*return\\s+count\\s*;?\\s*\\}/s.test(code);
}
},
{
id:10,
title:"Fetch Without Waiting",
category:"APIs",
difficulty:"Hard",
xp:170,
code:`async function loadData() {
  const response = fetch("https://jsonplaceholder.typicode.com/todos/1");
  const data = response.json();

  console.log(data.title);
}

loadData();`,
hints:[
"fetch returns a Promise.",
"response.json() also returns a Promise.",
"Both asynchronous operations need to be awaited."
],
test:code => {
const matches=code.match(/await/g)||[];
return matches.length >= 2;
}
}
];

const defaultState = {
xp:0,
streak:0,
bestStreak:0,
solved:0,
hintsUsed:0,
attempts:0,
solvedIds:[],
hintIndex:0
};

let state = JSON.parse(localStorage.getItem("bugGardenState")) || defaultState;
let currentIndex = 0;

const codeEl = document.getElementById("code");
const titleEl = document.getElementById("challengeTitle");
const categoryEl = document.getElementById("category");
const difficultyEl = document.getElementById("difficulty");
const challengeNumberEl = document.getElementById("challengeNumber");
const resultEl = document.getElementById("result");
const hintBox = document.getElementById("hintBox");
const hintCount = document.getElementById("hintCount");

function save() {
localStorage.setItem("bugGardenState",JSON.stringify(state));
}

function loadChallenge(index) {
currentIndex = index % challenges.length;
const challenge = challenges[currentIndex];

titleEl.textContent = challenge.title;
categoryEl.textContent = challenge.category;
difficultyEl.textContent = challenge.difficulty;
challengeNumberEl.textContent = `Challenge ${challenge.id} / ${challenges.length}`;
codeEl.value = challenge.code;
state.hintIndex = 0;

hintBox.classList.add("hidden");
resultEl.className="result hidden";
resultEl.textContent="";
hintCount.textContent="0/3";
}

function updateUI() {
document.getElementById("xp").textContent=state.xp;
document.getElementById("streak").textContent=state.streak;
document.getElementById("bestStreak").textContent=`${state.bestStreak} 🔥`;
document.getElementById("solved").textContent=state.solved;
document.getElementById("hintsUsed").textContent=state.hintsUsed;
document.getElementById("level").textContent=Math.max(1,Math.floor(state.xp/250)+1);

const rate=state.attempts ? Math.round(state.solved/state.attempts*100) : 0;
document.getElementById("successRate").textContent=`${rate}%`;

const categories=["Basics","DOM","Async","APIs","Advanced JS"];
const elements=["basicsScore","domScore","asyncScore","apisScore","advancedScore"];

categories.forEach((category,i)=>{
const total=challenges.filter(c=>c.category===category).length;
const done=challenges.filter(c=>c.category===category && state.solvedIds.includes(c.id)).length;
document.getElementById(elements[i]).textContent=`${total ? Math.round(done/total*100) : 0}%`;
});

if(state.solved>=1) document.getElementById("badge1").classList.add("unlocked");
if(state.bestStreak>=5) document.getElementById("badge2").classList.add("unlocked");
if(state.solved>=10) document.getElementById("badge3").classList.add("unlocked");
if(state.xp>=500) document.getElementById("badge4").classList.add("unlocked");
}

function toast(message) {
const el=document.getElementById("toast");
el.textContent=message;
el.classList.add("show");
setTimeout(()=>el.classList.remove("show"),2200);
}

document.getElementById("runBtn").addEventListener("click",()=>{
const challenge=challenges[currentIndex];
const code=codeEl.value;

state.attempts++;

let passed=false;

try {
passed=challenge.test(code);
} catch(e) {
passed=false;
}

if(passed) {
if(!state.solvedIds.includes(challenge.id)) {
state.solvedIds.push(challenge.id);
state.solved++;
state.xp+=challenge.xp;
state.streak++;
state.bestStreak=Math.max(state.bestStreak,state.streak);
resultEl.className="result success";
resultEl.textContent=`✓ Bug fixed! +${challenge.xp} XP. Your debugging garden is growing.`;
toast(`+${challenge.xp} XP 🌱`);
} else {
resultEl.className="result success";
resultEl.textContent="✓ Correct! You already solved this challenge.";
}
save();
updateUI();

setTimeout(()=>{
if(currentIndex<challenges.length-1) loadChallenge(currentIndex+1);
},1200);

} else {
state.streak=0;
resultEl.className="result error";
resultEl.textContent="✕ Not quite. Run the code, inspect the result and look for the bug.";
save();
updateUI();
}
});

document.getElementById("hintBtn").addEventListener("click",()=>{
const challenge=challenges[currentIndex];

if(state.hintIndex>=challenge.hints.length) {
hintBox.classList.remove("hidden");
hintBox.textContent="No more hints. Trust your debugger. 🐛";
return;
}

hintBox.classList.remove("hidden");
hintBox.textContent=`Hint ${state.hintIndex+1}: ${challenge.hints[state.hintIndex]}`;
state.hintIndex++;
state.hintsUsed++;
hintCount.textContent=`${state.hintIndex}/3`;
save();
updateUI();
});

document.getElementById("resetBtn").addEventListener("click",()=>{
loadChallenge(currentIndex);
});

document.getElementById("startBtn").addEventListener("click",()=>{
document.querySelector(".dashboard").scrollIntoView({behavior:"smooth"});
});

document.getElementById("themeBtn").addEventListener("click",()=>{
document.body.classList.toggle("light");
const light=document.body.classList.contains("light");
document.getElementById("themeBtn").textContent=light?"☀️":"🌙";
localStorage.setItem("bugGardenTheme",light?"light":"dark");
});

document.getElementById("shareBtn").addEventListener("click",async()=>{
const url=`${location.origin}${location.pathname}?challenge=${challenges[currentIndex].id}`;

try {
await navigator.clipboard.writeText(url);
toast("Challenge link copied 🔗");
} catch(e) {
prompt("Copy this challenge link:",url);
}
});

function loadFromURL() {
const params=new URLSearchParams(location.search);
const challengeId=Number(params.get("challenge"));

if(challengeId) {
const index=challenges.findIndex(c=>c.id===challengeId);
if(index>=0) {
loadChallenge(index);
return;
}
}

loadChallenge(0);
}

if(localStorage.getItem("bugGardenTheme")==="light") {
document.body.classList.add("light");
document.getElementById("themeBtn").textContent="☀️";
}

loadFromURL();
updateUI();
