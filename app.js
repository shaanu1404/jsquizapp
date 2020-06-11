const BASE_URL = 'https://opentdb.com/api.php?amount=10&type=multiple';
let player = null;
const quiz = document.querySelector('#quiz');
const nameBox = document.querySelector('#name-box');
const quizBox = document.querySelector('#quiz');
const detailBox = document.querySelector('#details');
const nextButton = document.querySelector('#next-question-button');
const resultBox = document.querySelector('#result-box');
const scoreBoard = document.querySelector('#score-board');

class Player {
    constructor(name) {
        this.name = name;
        this.score = 0;
        this.questionIndex = 0;
        this.quizData = [];
    }

    increment() {
        this.score = this.score + 1;
    }

    nextQuestion() {
        this.questionIndex++;
    }
}

const showSpinner = (show) => {
    document.querySelector('#spinner').style.display = show ? 'block' : 'none';
}

const shuffle = (array) => {
    array.sort(() => Math.random() - 0.5);
}

const updateScore = (player) => {
    detailBox.querySelector('#score').innerText = player.score;
}

const getScores = () => {
    let store = localStorage.getItem('scores');
    return JSON.parse(store) || [];
};

const setScores = (player) => {
    const scores = {
        name: player.name,
        score: player.score
    }

    let store = getScores();
    store = [...store, scores];

    localStorage.setItem('scores', JSON.stringify(store));
};

const clearStore = () => {
    localStorage.clear();
    scoreBoardDisplay();
};

const scoreBoardDisplay = () => {
    let scoresList = getScores();

    if (scoresList.length > 0) {
        let list = scoreBoard.querySelector('.list');
        let html = '';

        for (const s of scoresList) {
            let cls = s.score > 5 ? 'bg-green-600' : 'bg-red-500';

            html = html + `<div class="bg-white mb-1 py-2 p-0 rounded-lg mx-auto flex justify-between items-center">
                        <h1 class="text-gray-900 capitalize">${s.name}</h1>
                        <span id="score" class="w-10 h-10 rounded-full ${cls} text-white flex justify-center items-center">
                            ${s.score}
                        </span>
                    </div>`;
        }
        list.innerHTML = html;
        scoreBoard.style.display = 'block';
    }
    else {
        scoreBoard.style.display = 'none';
    }
};

startQuiz = (player) => {

    quizBox.style.display = 'block';
    detailBox.style.display = 'flex';
    detailBox.querySelector('h1').innerText = player.name;
    updateScore(player);

    setQuestion(player);
};

setQuestion = (player) => {
    let quiz = player.quizData[player.questionIndex];

    let incorrectAnswers = quiz.incorrect_answers;
    let correctAnswer = quiz.correct_answer;

    let options = [...incorrectAnswers, correctAnswer];
    shuffle(options);

    const difficulty = quizBox.querySelector('#difficulty');
    const category = quizBox.querySelector('#category');
    const question = quizBox.querySelector('#question');
    const optionGrid = quizBox.querySelector('#option-grid');
    const questionNo = quizBox.querySelector('#q-no');

    const difficultyLevels = {
        easy: 'bg-green-500',
        medium: 'bg-orange-500',
        hard: 'bg-red-500',
    };

    for (let level in difficultyLevels) {
        difficulty.classList.remove(difficultyLevels[level]);
    }
    difficulty.classList.add(difficultyLevels[quiz.difficulty]);

    // if (quiz.difficulty === "easy") {
    //     difficulty.classList.add('bg-green-500');
    // }
    // else if (quiz.difficulty === "medium") { difficulty.classList.add('bg-orange-500'); }
    // else if (quiz.difficulty === "hard") { difficulty.classList.add('bg-red-500'); }

    difficulty.innerHTML = quiz.difficulty;
    category.innerHTML = quiz.category;
    question.innerHTML = quiz.question;
    questionNo.innerText = `Q${player.questionIndex + 1}.`;
    optionGrid.innerHTML = '';
    if (player.questionIndex === 9) {
        nextButton.innerHTML = 'End Quiz<i class="fas fa-sign-out-alt ml-5"></i>';
        nextButton.classList.remove('bg-blue-700', 'hover:bg-blue-800');
        nextButton.classList.add('bg-red-700', 'hover:bg-red-800');
    }

    // let buttonTemplate = `<button class="bg-gray-700 text-white text-center w-full py-2 rounded-lg">${option}</button>`;
    options.forEach(option => {
        let button = document.createElement('button');
        button.className = "bg-gray-700 text-white text-center w-full py-2 rounded-lg hover:bg-gray-800";
        button.innerHTML = option;
        button.setAttribute('data-value', option.trim());
        optionGrid.appendChild(button);
    });

    optionGrid.querySelectorAll('button')
        .forEach(button =>
            button.addEventListener('click', (e) => checkAnswer(e, optionGrid, correctAnswer))
        );
}

checkAnswer = (e, optionGrid, correctOption) => {
    let ans1 = e.target.dataset.value;
    let ans2 = e.target.innerHTML;
    if (ans1.trim() === correctOption.trim() || ans2.trim() === correctOption.trim()) {
        player.increment();
        updateScore(player);
    }

    optionGrid.querySelectorAll('button')
        .forEach(button => {

            button.classList.remove('bg-gray-700', 'hover:bg-gray-800');

            if (button.dataset.value.trim() === correctOption.trim() || button.innerHTML.trim() === correctOption.trim()) {
                button.classList.add('bg-green-600');
            } else {
                button.classList.add('bg-red-600');
            }

            button.classList.add('cursor-not-allowed', 'opacity-75');
            button.disabled = true;

        });
}

/**
 * 
 * Main Script here.
 * 
 */

showSpinner(false);
quiz.style.display = 'none';
detailBox.style.display = 'none';
resultBox.style.display = 'none';
scoreBoard.style.display = 'none';

scoreBoardDisplay();

const nameInput = nameBox.querySelector('input');

// chiildren property will give the direct children of the selected element.
const nameBoxButton = nameBox.children[1];

nameBoxButton.addEventListener('click', (e) => {
    if (nameInput.value) {
        player = new Player(nameInput.value);

        nameInput.value = '';
        nameBox.style.display = 'none';
        scoreBoard.style.display = 'none';


        showSpinner(true);

        fetch(BASE_URL)
            .then(response => response.json())
            .then(data => {
                player.quizData = data.results;
                showSpinner(false);
                startQuiz(player);
            })
            .catch((error) => {
                console.error(error);
                resultBox.querySelector('#result h1').innerHTML = 'error occurred';
                resultBox.querySelector('#result > div')
                    .innerHTML = `<h1 class="text-center text-xl">${error.message}</h1><p id="countdown">Reloading app in 3 seconds...</p>`;
                resultBox.style.display = 'block';

                let count = 2;
                const countdown = setInterval(() => {
                    resultBox.querySelector('#countdown').innerHTML = `Reloading app in ${count} seconds...`;
                    count--;
                }, 1000);

                setTimeout(() => {
                    clearInterval(countdown);
                    window.location.reload();
                }, 3000);
            });
    }
});

nextButton.addEventListener('click', () => {
    player.nextQuestion();

    if (player.questionIndex < 10) {
        setQuestion(player);
    }
    else {
        resultBox.querySelector('.score').innerText = player.score;
        const p = document.createElement('p');
        p.className = 'text-sm text-center text-gray-700 mt-2';
        p.innerText = `Reloading app in 3 seconds...`;
        resultBox.querySelector('#result').appendChild(p);
        resultBox.style.display = 'block';

        setScores(player);

        let count = 2;
        const countdown = setInterval(() => {
            p.innerText = `Reloading app in ${count} seconds...`;
            count--;
        }, 1000);

        setTimeout(() => {
            player = null;
            clearInterval(countdown);
            window.location.reload();
        }, 3000);
    }

});

scoreBoard.querySelector('#clear').addEventListener('click', clearStore);