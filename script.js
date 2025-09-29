const startBtn = document.getElementById("startBtn");
const retryBtn = document.getElementById("retryBtn");
const newBtn = document.getElementById("newBtn");
const quitBtn = document.getElementById("quitBtn");
const nextBtn = document.getElementById("nextBtn");
const useApiCb = document.getElementById("useApi");

const setupEl = document.getElementById("setup");
const quizEl = document.getElementById("quiz");
const resultEl = document.getElementById("result");

const qIndexEl = document.getElementById("progress");
const questionText = document.getElementById("questionText");
const choicesEl = document.getElementById("choices");
const feedbackEl = document.getElementById("feedback");
const timerEl = document.getElementById("timer");

let questions = [];
let current = 0;
let score = 0;
let timer = null;
let timeLeft = 15;
let answered = false;

const SAMPLE = [
  {
    question: "Which language is used to structure web pages?",
    choices: ["Python", "HTML", "C++", "SQL"],
    correct: 1,
  },
  {
    question: "What does CSS stand for?",
    choices: [
      "Computer Style Sheets",
      "Cascading Style Sheets",
      "Creative Style System",
      "Colorful Style Sheets",
    ],
    correct: 1,
  },
  {
    question: "Which tag is used to insert an image?",
    choices: ["<img>", "<picture>", "<src>", "<image>"],
    correct: 0,
  },
];

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function startQuiz() {
  const n = parseInt(document.getElementById("numQuestions").value) || 5;
  timeLeft = parseInt(document.getElementById("timePerQ").value) || 15;
  score = 0;
  current = 0;

  if (useApiCb.checked) {
    fetch(`https://opentdb.com/api.php?amount=${n}&type=multiple`)
      .then((res) => res.json())
      .then((data) => {
        questions = data.results.map((q) => {
          const allChoices = [...q.incorrect_answers, q.correct_answer];
          shuffle(allChoices);
          return {
            question: decode(q.question),
            choices: allChoices.map(decode),
            correct: allChoices.indexOf(q.correct_answer),
          };
        });
        openQuiz();
      })
      .catch(() => {
        alert("API failed. Using sample questions.");
        questions = SAMPLE.slice(0, n);
        openQuiz();
      });
  } else {
    questions = SAMPLE.slice(0, n);
    openQuiz();
  }
}

function decode(str) {
  const txt = document.createElement("textarea");
  txt.innerHTML = str;
  return txt.value;
}

function openQuiz() {
  setupEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  quizEl.classList.remove("hidden");
  renderQuestion();
}

function renderQuestion() {
  const q = questions[current];
  qIndexEl.textContent = `Question ${current + 1}/${questions.length}`;
  questionText.textContent = q.question;
  choicesEl.innerHTML = "";
  feedbackEl.textContent = "";
  nextBtn.disabled = true;
  answered = false;

  q.choices.forEach((choice, i) => {
    const li = document.createElement("li");
    li.textContent = choice;
    li.onclick = () => checkAnswer(i, li);
    choicesEl.appendChild(li);
  });

  startTimer(timeLeft);
}

function checkAnswer(index, li) {
  if (answered) return;
  answered = true;
  clearInterval(timer);

  const q = questions[current];
  if (index === q.correct) {
    li.classList.add("correct");
    score++;
    feedbackEl.textContent = "✅ Correct!";
  } else {
    li.classList.add("wrong");
    choicesEl.children[q.correct].classList.add("correct");
    feedbackEl.textContent = `❌ Wrong! Correct: ${q.choices[q.correct]}`;
  }
  nextBtn.disabled = false;
}

function startTimer(seconds) {
  let t = seconds;
  timerEl.textContent = `${t}s`;
  clearInterval(timer);
  timer = setInterval(() => {
    t--;
    timerEl.textContent = `${t}s`;
    if (t <= 0) {
      clearInterval(timer);
      if (!answered) {
        feedbackEl.textContent = `⏰ Time's up! Correct: ${questions[current].choices[questions[current].correct]}`;
        choicesEl.children[questions[current].correct].classList.add("correct");
        nextBtn.disabled = false;
        answered = true;
      }
    }
  }, 1000);
}

nextBtn.onclick = () => {
  current++;
  if (current >= questions.length) showResult();
  else renderQuestion();
};

quitBtn.onclick = () => location.reload();
retryBtn.onclick = () => openQuiz();
newBtn.onclick = () => {
  quizEl.classList.add("hidden");
  resultEl.classList.add("hidden");
  setupEl.classList.remove("hidden");
};

function showResult() {
  quizEl.classList.add("hidden");
  resultEl.classList.remove("hidden");
  document.getElementById("scoreText").textContent = `You scored ${score} / ${questions.length}`;
}

startBtn.onclick = startQuiz;
