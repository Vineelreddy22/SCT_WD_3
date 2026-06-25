const quizData = [
  {
    question: "Which language is used for web styling?",
    options: ["HTML", "CSS", "Python", "Java"],
    answer: "CSS"
  },
  {
    question: "What does HTML stand for?",
    options: [
      "Hyper Text Markup Language",
      "High Text Machine Language",
      "Hyper Tool Multi Language",
      "Home Text Markup Language"
    ],
    answer: "Hyper Text Markup Language"
  },
  {
    question: "Which language is used for web page interactivity?",
    options: ["Python", "Java", "JavaScript", "C++"],
    answer: "JavaScript"
  },
  {
    question: "Which company developed JavaScript?",
    options: ["Google", "Microsoft", "Netscape", "Apple"],
    answer: "Netscape"
  },
  {
    question: "What does JSON stand for?",
    options: [
      "Java Style Object Notation",
      "JavaScript Object Notation",
      "Java Server Object Network",
      "Joint Standard Object Network"
    ],
    answer: "JavaScript Object Notation"
  }
];

let currentQuestion = 0;
let score = 0;
let timer;
let timeLeft = 15;
let multiplayer = false;
let currentPlayer = 1;
let player1Score = 0;
let player2Score = 0;
let roomId = "";
const players = [];

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const progressEl = document.getElementById("progress");
const timeEl = document.getElementById("time");
const questionNumberEl = document.getElementById("question-number");
const nextBtn = document.getElementById("next-btn");

nextBtn.addEventListener("click", () => {
  if (nextBtn.disabled) return;
  nextQuestion();
});

function showScreen(screenId) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });
  document.getElementById(screenId).classList.add("active");
}

function startSinglePlayer() {
  multiplayer = false;
  currentPlayer = 1;
  currentQuestion = 0;
  score = 0;
  document.getElementById("player-info").textContent = "Single Player";
  showScreen("quiz-screen");
  loadQuestion();
}

function showMultiplayerMenu() {
  multiplayer = true;
  showScreen("multiplayer-menu");
}

function showCreateRoom() {
  showScreen("create-room-screen");
}

function showJoinRoom() {
  showScreen("join-room-screen");
}

function backToMenu() {
  showScreen("menu-screen");
}

function backToMultiplayerMenu() {
  showScreen("multiplayer-menu");
}

function createRoom() {
  const name = document.getElementById("player-name-create").value.trim();
  if (!name) {
    alert("Enter your name to create a room.");
    return;
  }

  roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
  players.length = 0;
  players.push({ name, host: true });
  updateRoomInfo();
  showScreen("room-waiting-screen");
}

function joinRoom() {
  const roomInput = document.getElementById("room-id-input").value.trim().toUpperCase();
  const name = document.getElementById("player-name-join").value.trim();

  if (!roomInput || !name) {
    alert("Enter both room ID and your name.");
    return;
  }

  if (!roomId) {
    alert("No room has been created yet. Please create a room first.");
    return;
  }

  if (roomInput !== roomId) {
    alert("Room ID not found. Enter the correct room ID.");
    return;
  }

  if (players.some(player => player.name === name)) {
    alert("A player with that name is already in the room.");
    return;
  }

  players.push({ name, host: false });
  updateRoomInfo();
  showScreen("room-waiting-screen");
}

function updateRoomInfo() {
  document.getElementById("display-room-id").textContent = roomId;
  const waitingContainer = document.getElementById("players-waiting");
  waitingContainer.innerHTML = "";

  players.forEach(player => {
    const item = document.createElement("div");
    item.className = "player-item";
    item.textContent = player.name + (player.host ? " (Host)" : "");
    waitingContainer.appendChild(item);
  });
}

function copyRoomId() {
  if (!roomId) return;
  navigator.clipboard
    .writeText(roomId)
    .then(() => alert("Room ID copied to clipboard!"))
    .catch(() => alert("Unable to copy Room ID."));
}

function startQuizMultiplayer() {
  if (!roomId || players.length < 2) {
    alert("Need at least 2 players to start multiplayer quiz.");
    return;
  }

  currentQuestion = 0;
  score = 0;
  currentPlayer = 1;
  player1Score = 0;
  player2Score = 0;
  document.getElementById("player-info").textContent = "Player 1";
  showScreen("quiz-screen");
  loadQuestion();
}

function loadQuestion() {
  clearInterval(timer);
  timeLeft = 15;
  timeEl.textContent = timeLeft;
  nextBtn.disabled = true;
  nextBtn.classList.add("hidden");

  const q = quizData[currentQuestion];
  questionNumberEl.textContent = `Question ${currentQuestion + 1} of ${quizData.length}`;
  questionEl.textContent = q.question;
  answersEl.innerHTML = "";

  q.options.forEach(option => {
    const btn = document.createElement("button");
    btn.textContent = option;
    btn.addEventListener("click", () => checkAnswer(btn, option));
    answersEl.appendChild(btn);
  });

  progressEl.style.width = `${((currentQuestion + 1) / quizData.length) * 100}%`;

  timer = setInterval(() => {
    timeLeft--;
    timeEl.textContent = timeLeft;

    if (timeLeft <= 0) {
      clearInterval(timer);
      disableAnswers();
      showNextButton();
    }
  }, 1000);
}

function disableAnswers() {
  Array.from(answersEl.children).forEach(btn => {
    btn.disabled = true;
  });
}

function showNextButton() {
  nextBtn.disabled = false;
  nextBtn.classList.remove("hidden");
}

function checkAnswer(button, selected) {
  clearInterval(timer);
  const correct = quizData[currentQuestion].answer;

  Array.from(answersEl.children).forEach(btn => {
    btn.disabled = true;
    if (btn.textContent === correct) {
      btn.classList.add("correct");
    }
  });

  if (selected === correct) {
    score++;
    button.classList.add("correct");
  } else {
    button.classList.add("wrong");
  }

  showNextButton();
}

function nextQuestion() {
  currentQuestion++;
  if (currentQuestion >= quizData.length) {
    showResult();
    return;
  }
  loadQuestion();
}

function showResult() {
  clearInterval(timer);

  if (multiplayer) {
    if (currentPlayer === 1) {
      player1Score = score;
      currentPlayer = 2;
      currentQuestion = 0;
      score = 0;
      document.getElementById("player-info").textContent = "Player 2";
      alert("Player 1 finished. Player 2, it's your turn now!");
      loadQuestion();
      return;
    }

    player2Score = score;
    let winner = "";

    if (player1Score > player2Score) {
      winner = "🏆 Player 1 Wins!";
    } else if (player2Score > player1Score) {
      winner = "🏆 Player 2 Wins!";
    } else {
      winner = "🤝 Match Draw!";
    }

    document.getElementById("quiz-screen").innerHTML = `
      <div class="quiz-container">
        <h1>🏆 Multiplayer Result</h1>
        <h2>Player 1 Score: ${player1Score}/${quizData.length}</h2>
        <h2>Player 2 Score: ${player2Score}/${quizData.length}</h2>
        <div class="score-display">${winner}</div>
        <button class="restart-btn" onclick="location.reload()">🔄 Play Again</button>
      </div>
    `;
    return;
  }

  document.getElementById("quiz-screen").innerHTML = `
    <div class="quiz-container">
      <h1>🎉 Quiz Completed</h1>
      <h2>Your Score</h2>
      <div class="score-display">${score}/${quizData.length}</div>
      <div class="percentage">${Math.round((score / quizData.length) * 100)}%</div>
      <div class="result-message">${getMessage()}</div>
      <button class="restart-btn" onclick="location.reload()">🔄 Restart Quiz</button>
    </div>
  `;
}

function getMessage() {
  const percent = Math.round((score / quizData.length) * 100);

  if (percent === 100) {
    return "🏆 Perfect Score!";
  }
  if (percent >= 80) {
    return "⭐ Excellent Work!";
  }
  if (percent >= 60) {
    return "👍 Good Job!";
  }
  return "📚 Keep Practicing!";
}
