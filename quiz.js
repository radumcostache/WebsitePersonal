window.onload = function() {
    let quizData = [];
    let currentQuestion = 0;
    let score = 0;
    let quizName = '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1000;
    canvas.height = 400;
    canvas.style.display = 'none';
    document.body.appendChild(canvas);

    const submitButton = document.createElement('button');
    submitButton.textContent = 'Submit';
    submitButton.disabled = true;
    submitButton.classList.add('quiz-button');
    submitButton.style.display = 'none';
    document.body.appendChild(submitButton);

    const scoreDisplay = document.createElement('div');
    const totalScoreDisplay = document.createElement('div');
    document.body.appendChild(scoreDisplay);
    document.body.appendChild(totalScoreDisplay);

    const loadQuiz = function(quizName) {
        fetch(`${quizName}.json`)
            .then((response) => response.json())
            .then((data) => {
                quizData = data;
                shuffleQuestions(quizData.questions); // Shuffle the questions
                renderQuestion();
                submitButton.disabled = true;
                startTimer();

                canvas.style.display = 'block';
                submitButton.style.display = 'block';
            })
            .catch((error) => console.log(error));
    };



    const shuffleQuestions = function(questions) {
        for (let i = questions.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [questions[i], questions[j]] = [questions[j], questions[i]];
        }
    };

    const renderQuestion = function() {
        const currentQuizData = quizData.questions[currentQuestion];

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const cornerRadius = 10;

        ctx.beginPath();
        ctx.moveTo(cornerRadius, 0);
        ctx.lineTo(canvas.width - cornerRadius, 0);
        ctx.arcTo(canvas.width, 0, canvas.width, cornerRadius, cornerRadius);
        ctx.lineTo(canvas.width, canvas.height - cornerRadius);
        ctx.arcTo(canvas.width, canvas.height, canvas.width - cornerRadius, canvas.height, cornerRadius);
        ctx.lineTo(cornerRadius, canvas.height);
        ctx.arcTo(0, canvas.height, 0, canvas.height - cornerRadius, cornerRadius);
        ctx.lineTo(0, cornerRadius);
        ctx.arcTo(0, 0, cornerRadius, 0, cornerRadius);
        ctx.closePath();

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--canvas-background-color');
        ctx.fill();

        ctx.font = '16px Arial';

        ctx.fillStyle = getComputedStyle(document.body).getPropertyValue('--question-text-color');

        ctx.fillText(currentQuizData.question, 10, 40);

        const startY = 70;

        currentQuizData.choices.forEach((choice, index) => {
            const y = startY + index * 40;
            const isSelected = currentQuizData.selectedChoice === index;

            const choiceBackgroundColor = isSelected ? getComputedStyle(document.body).getPropertyValue('--choice-selected-background-color') : getComputedStyle(document.body).getPropertyValue('--choice-background-color');
            ctx.fillStyle = choiceBackgroundColor;
            ctx.fillRect(10, y - 20, canvas.width - 20, 30);

            const choiceTextColor = isSelected ? getComputedStyle(document.body).getPropertyValue('--choice-selected-text-color') : getComputedStyle(document.body).getPropertyValue('--choice-text-color');
            ctx.fillStyle = choiceTextColor;
            ctx.fillText(`${String.fromCharCode(65 + index)}. ${choice}`, 20, y);
        });
    };

    const selectAnswer = function(index) {
        const currentQuizData = quizData.questions[currentQuestion];
        currentQuizData.selectedChoice = index;
        submitButton.disabled = false;
        renderQuestion();
    };

    const handleCanvasClick = function(event) {
        const rect = canvas.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;

        const currentQuizData = quizData.questions[currentQuestion];
        const startY = 70;

        currentQuizData.choices.forEach((choice, index) => {
            const choiceY = startY + index * 40;

            if (x > 10 && x < canvas.width - 10 && y > choiceY - 20 && y < choiceY + 10) {
                selectAnswer(index);
            }
        });

        event.stopPropagation();
    };

    const handleDocumentClick = function(event) {
        if (!canvas.contains(event.target)) {
            endQuiz();
        }
    };

    const handleKeyDown = function(event) {
        const key = event.key.toLowerCase();
        const currentQuizData = quizData.questions[currentQuestion];

        if (key === 'arrowup') {
            currentQuizData.selectedChoice = (currentQuizData.selectedChoice - 1 + currentQuizData.choices.length) % currentQuizData.choices.length;
            event.preventDefault();
            renderQuestion();
        } else if (key === 'arrowdown') {
            currentQuizData.selectedChoice = (currentQuizData.selectedChoice + 1) % currentQuizData.choices.length;
            event.preventDefault();
            renderQuestion();
        } else {
            const selectedChoiceIndex = key.charCodeAt(0) - 'a'.charCodeAt(0);

            if (
                selectedChoiceIndex >= 0 &&
                selectedChoiceIndex < currentQuizData.choices.length
            ) {
                selectAnswer(selectedChoiceIndex);
            }
        }
    };

    const submitButtonHandler = function(event) {
        event.stopPropagation();

        const currentQuizData = quizData.questions[currentQuestion];

        if (
            currentQuizData.selectedChoice !== undefined &&
            currentQuizData.choices[currentQuizData.selectedChoice] === currentQuizData.correctAnswer
        ) {
            score++;
        }

        currentQuestion++;
        if (currentQuestion < quizData.questions.length) {
            submitButton.disabled = true;
            renderQuestion();
        } else {
            endQuiz();
        }
    };

    submitButton.addEventListener('click', submitButtonHandler);

    const endQuiz = function() {
        scoreDisplay.textContent = `Your score: ${score}/${quizData.questions.length}`;
        scoreDisplay.style.color = "White";
        const totalScore = localStorage.getItem('totalScore');
        const updatedTotalScore = totalScore ? parseInt(totalScore) + score : score;

        totalScoreDisplay.textContent = `Total Score: ${updatedTotalScore}`;
        totalScoreDisplay.style.color = "White";

        localStorage.setItem('totalScore', updatedTotalScore);

        score = 0;

        canvas.style.display = 'none'; // Hide the canvas element
        submitButton.style.display = 'none'; // Hide the submit button
        clearInterval(timerInterval); // Stop the timer
    };

    canvas.addEventListener('click', handleCanvasClick);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleDocumentClick);

    // Start the quiz by selecting a quiz
    const quizSelection = document.getElementById('quizSelection');
    quizSelection.addEventListener('click', function(event) {
        if (event.target.tagName === 'BUTTON') {
            quizName = event.target.id;
            loadQuiz(quizName);
            quizSelection.style.display = 'none';
        }
    });

    // Timer
    const timerElement = document.createElement('div');
    timerElement.style.color = '#710A0AFF';
    timerElement.style.fontSize = '24px';
    timerElement.style.fontWeight = 'bold';
    document.body.appendChild(timerElement);

    let timeRemaining = 5 * 60; // 5 minutes in seconds

    const startTimer = function() {
        timerInterval = setInterval(updateTimer, 1000);
    };

    const updateTimer = function() {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        timerElement.textContent = `Time Remaining: ${formatTime(minutes)}:${formatTime(seconds)}`;

        if (timeRemaining <= 0) {
            endQuiz();
        } else {
            timeRemaining--;
        }
    };

    const formatTime = function(value) {
        return value < 10 ? `0${value}` : value;
    };
};
