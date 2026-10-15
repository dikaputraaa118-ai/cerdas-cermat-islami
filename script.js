const CATEGORY_META = {
  'al-quran-surah': {
    label: 'Al-Qur\'an dan Surah',
    description: 'Kisah, surah, dan pemahaman dasar Al-Qur\'an.'
  },
  'nabi-rasul': {
    label: 'Nabi dan Rasul',
    description: 'Tokoh-tokoh kenabian dan mukjizat dalam Islam.'
  },
  'rukun-islam-iman': {
    label: 'Rukun Islam dan Rukun Iman',
    description: 'Pilar ajaran Islam dan keyakinan dalam iman.'
  },
  'ibadah-akhlak': {
    label: 'Ibadah dan Akhlak',
    description: 'Amalan ibadah serta nilai luhur akhlak Islam.'
  },
  'sejarah-islam': {
    label: 'Sejarah Islam',
    description: 'Peristiwa penting dan perkembangan Islam.'
  }
};

const DIFFICULTY_META = {
  mudah: { label: 'Mudah', accent: '🌱' },
  menengah: { label: 'Menengah', accent: '🌼' },
  sulit: { label: 'Sulit', accent: '🔥' }
};

const STORAGE_KEYS = {
  bestScore: 'cerdasCermatIslamiBestScore',
  sound: 'cerdasCermatIslamiSound'
};

const state = {
  screen: 'home',
  category: null,
  difficulty: null,
  questions: [],
  currentIndex: 0,
  score: 0,
  correct: 0,
  wrong: 0,
  unanswered: 0,
  timeLeft: 20,
  timerId: null,
  answered: false,
  selectedOptions: [],
  bestScore: 0,
  soundEnabled: true
};

const screenMap = {
  home: document.getElementById('homeScreen'),
  category: document.getElementById('categoryScreen'),
  difficulty: document.getElementById('difficultyScreen'),
  game: document.getElementById('gameScreen'),
  result: document.getElementById('resultScreen')
};

const els = {
  soundToggle: document.getElementById('soundToggle'),
  startGameBtn: document.getElementById('startGameBtn'),
  howToPlayBtn: document.getElementById('howToPlayBtn'),
  viewHighScoreBtn: document.getElementById('viewHighScoreBtn'),
  categoryGrid: document.getElementById('categoryGrid'),
  difficultyGrid: document.getElementById('difficultyGrid'),
  backToHomeFromCategory: document.getElementById('backToHomeFromCategory'),
  backToCategory: document.getElementById('backToCategory'),
  questionCounter: document.getElementById('questionCounter'),
  scoreDisplay: document.getElementById('scoreDisplay'),
  progressFill: document.getElementById('progressFill'),
  timerDisplay: document.getElementById('timerDisplay'),
  categoryBadge: document.getElementById('categoryBadge'),
  questionText: document.getElementById('questionText'),
  optionsContainer: document.getElementById('optionsContainer'),
  feedbackBox: document.getElementById('feedbackBox'),
  nextQuestionBtn: document.getElementById('nextQuestionBtn'),
  finalTitle: document.getElementById('finalTitle'),
  finalScore: document.getElementById('finalScore'),
  correctCount: document.getElementById('correctCount'),
  wrongCount: document.getElementById('wrongCount'),
  unansweredCount: document.getElementById('unansweredCount'),
  accuracyCount: document.getElementById('accuracyCount'),
  playAgainBtn: document.getElementById('playAgainBtn'),
  chooseCategoryBtn: document.getElementById('chooseCategoryBtn'),
  homeBtn: document.getElementById('homeBtn'),
  infoModal: document.getElementById('infoModal'),
  closeModalBtn: document.getElementById('closeModalBtn')
};

function safeStorageRead(key, fallbackValue) {
  try {
    const saved = localStorage.getItem(key);
    return saved === null ? fallbackValue : JSON.parse(saved);
  } catch (error) {
    return fallbackValue;
  }
}

function safeStorageWrite(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    return false;
  }
}

function showScreen(name) {
  Object.entries(screenMap).forEach(([screenName, element]) => {
    element.classList.toggle('active', screenName === name);
  });
  state.screen = name;
}

function playTone(type = 'success') {
  if (!state.soundEnabled || !window.AudioContext) {
    return;
  }

  const audioContext = new AudioContext();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();

  oscillator.type = 'sine';
  oscillator.frequency.value = type === 'success' ? 740 : type === 'error' ? 220 : 520;
  gain.gain.value = 0.04;

  oscillator.connect(gain);
  gain.connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);

  setTimeout(() => audioContext.close(), 150);
}

function getBestScore() {
  return Number(safeStorageRead(STORAGE_KEYS.bestScore, 0)) || 0;
}

function setBestScore(score) {
  state.bestScore = Math.max(getBestScore(), score);
  safeStorageWrite(STORAGE_KEYS.bestScore, state.bestScore);
}

function loadSoundPreference() {
  const saved = safeStorageRead(STORAGE_KEYS.sound, true);
  state.soundEnabled = Boolean(saved);
  updateSoundButton();
}

function updateSoundButton() {
  const status = state.soundEnabled ? 'Nyala' : 'Mati';
  els.soundToggle.textContent = `🔊 Suara: ${status}`;
  safeStorageWrite(STORAGE_KEYS.sound, state.soundEnabled);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function createPreparedQuestion(question) {
  const correctAnswer = question.options[question.answerIndex];
  const shuffledOptions = shuffleArray(question.options);
  const newAnswerIndex = shuffledOptions.indexOf(correctAnswer);

  return {
    ...question,
    options: shuffledOptions,
    answerIndex: newAnswerIndex
  };
}

function getQuestionSet(category, difficulty) {
  const filtered = (QUESTION_BANK[category] || []).filter((item) => item.difficulty === difficulty);
  const selected = shuffleArray(filtered).slice(0, 10);

  return selected.length > 0 ? selected.map(createPreparedQuestion) : [];
}

function renderCategoryCards() {
  const categoryEntries = Object.entries(CATEGORY_META);
  els.categoryGrid.innerHTML = categoryEntries
    .map(
      ([key, meta]) => `
        <button class="category-card" type="button" data-category="${key}" aria-label="Pilih kategori ${meta.label}">
          <div class="category-bullet">📘</div>
          <h3>${meta.label}</h3>
          <p>${meta.description}</p>
        </button>
      `
    )
    .join('');

  els.categoryGrid.querySelectorAll('.category-card').forEach((button) => {
    button.addEventListener('click', () => {
      state.category = button.dataset.category;
      showScreen('difficulty');
    });
  });
}

function renderDifficultyCards() {
  const entries = Object.entries(DIFFICULTY_META);
  els.difficultyGrid.innerHTML = entries
    .map(
      ([key, meta]) => `
        <button class="difficulty-card" type="button" data-difficulty="${key}" aria-label="Pilih tingkat ${meta.label}">
          <div class="difficulty-icon">${meta.accent}</div>
          <h3>${meta.label}</h3>
          <p>Uji kemampuanmu di level ${meta.label.toLowerCase()}.</p>
        </button>
      `
    )
    .join('');

  els.difficultyGrid.querySelectorAll('.difficulty-card').forEach((button) => {
    button.addEventListener('click', () => {
      state.difficulty = button.dataset.difficulty;
      startGame();
    });
  });
}

function startGame() {
  if (!state.category || !state.difficulty) {
    return;
  }

  state.questions = getQuestionSet(state.category, state.difficulty);

  if (state.questions.length === 0) {
    state.questions = shuffleArray((QUESTION_BANK[state.category] || []).slice(0, 10)).map(createPreparedQuestion);
  }

  state.currentIndex = 0;
  state.score = 0;
  state.correct = 0;
  state.wrong = 0;
  state.unanswered = 0;
  state.answered = false;
  state.selectedOptions = [];
  state.timeLeft = 20;
  clearTimer();
  showScreen('game');
  renderQuestion();
}

function clearTimer() {
  if (state.timerId) {
    clearInterval(state.timerId);
    state.timerId = null;
  }
}

function updateProgress() {
  const progress = ((state.currentIndex + 1) / state.questions.length) * 100;
  els.progressFill.style.width = `${Math.min(progress, 100)}%`;
  els.questionCounter.textContent = `Soal ${state.currentIndex + 1}/${state.questions.length}`;
  els.scoreDisplay.textContent = `Skor: ${state.score}`;
}

function startTimer() {
  clearTimer();
  state.timeLeft = 20;
  els.timerDisplay.textContent = `${state.timeLeft}s`;

  state.timerId = setInterval(() => {
    state.timeLeft -= 1;
    els.timerDisplay.textContent = `${state.timeLeft}s`;

    if (state.timeLeft <= 0) {
      clearTimer();
      handleAnswer(null, true);
    }
  }, 1000);
}

function renderQuestion() {
  const currentQuestion = state.questions[state.currentIndex];
  if (!currentQuestion) {
    showResults();
    return;
  }

  state.answered = false;
  state.selectedOptions = [];
  els.feedbackBox.classList.add('hidden');
  els.feedbackBox.classList.remove('correct', 'incorrect');
  els.nextQuestionBtn.classList.add('hidden');
  els.optionsContainer.innerHTML = '';
  els.categoryBadge.textContent = CATEGORY_META[state.category]?.label || 'Kategori';
  els.questionText.textContent = currentQuestion.question;

  currentQuestion.options.forEach((option, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'option-btn';
    button.setAttribute('role', 'listitem');
    button.setAttribute('aria-label', `Jawaban ${index + 1}: ${option}`);
    button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span>${option}</span>`;
    button.addEventListener('click', () => handleAnswer(index, false));
    els.optionsContainer.appendChild(button);
  });

  updateProgress();
  startTimer();
}

function handleAnswer(selectedIndex, timedOut) {
  if (state.answered) {
    return;
  }

  state.answered = true;
  clearTimer();

  const currentQuestion = state.questions[state.currentIndex];
  const buttons = [...els.optionsContainer.querySelectorAll('.option-btn')];
  const correctIndex = currentQuestion.answerIndex;

  buttons.forEach((button, index) => {
    button.disabled = true;
    if (index === correctIndex) {
      button.classList.add('correct');
    }
    if (index === selectedIndex && index !== correctIndex) {
      button.classList.add('incorrect');
    }
  });

  if (timedOut) {
    state.unanswered += 1;
    els.feedbackBox.textContent = `Waktu habis! Jawaban yang benar adalah ${String.fromCharCode(65 + correctIndex)}. ${currentQuestion.explanation}`;
    els.feedbackBox.classList.remove('hidden');
    els.feedbackBox.classList.add('incorrect');
    playTone('error');
  } else {
    const isCorrect = selectedIndex === correctIndex;

    if (isCorrect) {
      state.correct += 1;
      state.score += 10;
      els.feedbackBox.textContent = `Benar! ${currentQuestion.explanation}`;
      els.feedbackBox.classList.add('correct');
      playTone('success');
    } else {
      state.wrong += 1;
      els.feedbackBox.textContent = `Salah! Jawaban yang benar adalah ${String.fromCharCode(65 + correctIndex)}. ${currentQuestion.explanation}`;
      els.feedbackBox.classList.add('incorrect');
      playTone('error');
    }
  }

  els.feedbackBox.classList.remove('hidden');
  updateProgress();

  if (state.currentIndex === state.questions.length - 1) {
    els.nextQuestionBtn.textContent = 'Lihat Hasil';
  } else {
    els.nextQuestionBtn.textContent = 'Soal Berikutnya';
  }

  els.nextQuestionBtn.classList.remove('hidden');
  els.nextQuestionBtn.focus();
}

function nextQuestion() {
  if (!state.answered) {
    return;
  }

  if (state.currentIndex < state.questions.length - 1) {
    state.currentIndex += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function showResults() {
  clearTimer();
  const totalAnswered = state.correct + state.wrong;
  const accuracy = totalAnswered === 0 ? 0 : Math.round((state.correct / totalAnswered) * 100);

  els.finalTitle.textContent = state.score >= state.bestScore ? 'Luar Biasa!' : 'Selesai!';
  els.finalScore.textContent = String(state.score);
  els.correctCount.textContent = String(state.correct);
  els.wrongCount.textContent = String(state.wrong);
  els.unansweredCount.textContent = String(state.unanswered);
  els.accuracyCount.textContent = `${accuracy}%`;

  const ring = document.querySelector('.score-ring');
  if (ring) {
    const rotation = Math.min(360, (state.score / (state.questions.length * 10)) * 360);
    ring.style.background = `conic-gradient(var(--emerald-600) 0deg ${rotation}deg, rgba(19, 62, 50, 0.08) ${rotation}deg 360deg)`;
  }

  setBestScore(state.score);
  state.bestScore = getBestScore();
  els.finalTitle.textContent = state.score >= state.bestScore ? 'Rekor Baru!' : 'Selesai!';
  showScreen('result');
}

function resetToHome() {
  clearTimer();
  state.category = null;
  state.difficulty = null;
  state.questions = [];
  state.currentIndex = 0;
  state.score = 0;
  state.correct = 0;
  state.wrong = 0;
  state.unanswered = 0;
  state.answered = false;
  state.selectedOptions = [];
  state.timeLeft = 20;
  showScreen('home');
  els.feedbackBox.classList.add('hidden');
  els.nextQuestionBtn.classList.add('hidden');
}

function openModal() {
  els.infoModal.classList.remove('hidden');
}

function closeModal() {
  els.infoModal.classList.add('hidden');
}

function bindEvents() {
  els.startGameBtn.addEventListener('click', () => showScreen('category'));
  els.howToPlayBtn.addEventListener('click', openModal);
  els.closeModalBtn.addEventListener('click', closeModal);
  els.infoModal.addEventListener('click', (event) => {
    if (event.target === els.infoModal) {
      closeModal();
    }
  });

  els.viewHighScoreBtn.addEventListener('click', () => {
    const score = getBestScore();
    const message = `Rekor saya: ${score} poin`;
    alert(message);
  });

  els.backToHomeFromCategory.addEventListener('click', resetToHome);
  els.backToCategory.addEventListener('click', () => showScreen('category'));
  els.playAgainBtn.addEventListener('click', () => showScreen('category'));
  els.chooseCategoryBtn.addEventListener('click', () => showScreen('category'));
  els.homeBtn.addEventListener('click', resetToHome);

  els.nextQuestionBtn.addEventListener('click', nextQuestion);

  els.soundToggle.addEventListener('click', () => {
    state.soundEnabled = !state.soundEnabled;
    updateSoundButton();
  });

  document.addEventListener('keydown', (event) => {
    if (state.screen !== 'game') {
      return;
    }

    if (event.key >= '1' && event.key <= '4') {
      const index = Number(event.key) - 1;
      if (index >= 0 && index < state.questions[state.currentIndex]?.options.length) {
        handleAnswer(index, false);
      }
    }

    if (event.key === 'Enter' && state.answered) {
      nextQuestion();
    }
  });
}

function init() {
  state.bestScore = getBestScore();
  loadSoundPreference();
  renderCategoryCards();
  renderDifficultyCards();
  bindEvents();
  showScreen('home');
}

init();
