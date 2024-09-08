import "./App.css";
import { useEffect, useMemo, useState } from "react";
import Start from "./components/Start";
import Timer from "./components/Timer";
import Trivia from "./components/Trivia";
import axios from "axios";

function App() {
  const [username, setUsername] = useState(null);
  const [timeOut, setTimeOut] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(1);
  const [earned, setEarned] = useState("$ 0");
  const [questions, setQuestions] = useState([]);
  const [currentDifficulty, setCurrentDifficulty] = useState("easy");
  const [lifelines, setLifelines] = useState(3); // Number of available lifelines
  const [usedLifelines, setUsedLifelines] = useState(0); // Number of lifelines used
  const [currentAudienceChoice, setCurrentAudienceChoice] = useState(null); 
  const [friendAnswer, setFriendAnswer] = useState(null);

  const moneyPyramid = useMemo(
    () => [
      { id: 1, amount: "$ 100", difficulty: "easy" },
      { id: 2, amount: "$ 200", difficulty: "easy" },
      { id: 3, amount: "$ 300", difficulty: "medium" },
      { id: 4, amount: "$ 500", difficulty: "medium" },
      { id: 5, amount: "$ 1.000", difficulty: "medium" },
      { id: 6, amount: "$ 2.000", difficulty: "hard" },
      { id: 7, amount: "$ 4.000", difficulty: "hard" },
      { id: 8, amount: "$ 8.000", difficulty: "hard" },
      { id: 9, amount: "$ 16.000", difficulty: "expert" },
      { id: 10, amount: "$ 32.000", difficulty: "expert" },
      { id: 11, amount: "$ 64.000", difficulty: "expert" },
      { id: 12, amount: "$ 125.000", difficulty: "master" },
      { id: 13, amount: "$ 250.000", difficulty: "master" },
      { id: 14, amount: "$ 500.000", difficulty: "master" },
      { id: 15, amount: "$ 1.000.000", difficulty: "master" },
    ].reverse(),
    []
  );

  function decodeHTMLEntities(text) {
    const entities = {
      "&quot;": '"',
      // Add more HTML entities if needed
    };

    return text.replace(/&([^;]+);/g, (match, entity) => {
      return entities[entity] || match;
    });
  }

  useEffect(() => {
    if (questionNumber > 1) {
      const currentPrize = moneyPyramid.find((m) => m.id === questionNumber - 1);
      setEarned(currentPrize.amount);
      setCurrentDifficulty(currentPrize.difficulty);
    }
  }, [questionNumber, moneyPyramid]);

  useEffect(() => {
    axios
      .get(
        `https://opentdb.com/api.php?amount=15&type=multiple&difficulty=${currentDifficulty}`
      )
      .then((response) => {
        if (response.data.results) {
          const formattedQuestions = response.data.results.map((question, index) => ({
            id: index + 1,
            question: decodeHTMLEntities(question.question),
            answers: [
              ...question.incorrect_answers.map((answer) => ({
                text: decodeHTMLEntities(answer),
                correct: false,
              })),
              {
                text: decodeHTMLEntities(question.correct_answer),
                correct: true,
              },
            ],
          }));

          setQuestions(formattedQuestions);
        }
      })
      .catch((error) => {
        console.error("Error fetching questions:", error);
      });
  }, [currentDifficulty]);

  const useFiftyFifty = () => {
    if (usedLifelines < lifelines) {
      const currentQuestion = questions[questionNumber - 1];
      const incorrectAnswers = currentQuestion.answers.filter((answer) => !answer.correct);
      
      // Shuffle the incorrect answers
      const shuffledIncorrectAnswers = shuffleArray(incorrectAnswers);
      
      // Keep one incorrect answer and the correct answer
      const remainingAnswers = [shuffledIncorrectAnswers[0], currentQuestion.answers.find((answer) => answer.correct)];
      
      // Update the current question with the remaining answers
      const updatedQuestions = [...questions];
      updatedQuestions[questionNumber - 1] = {
        ...currentQuestion,
        answers: remainingAnswers,
      };
      setUsedLifelines(usedLifelines + 1);
      setQuestions(updatedQuestions);
    }
  };
  function shuffleArray(array) {
    const shuffledArray = [...array]; // Create a copy of the original array
  
    for (let i = shuffledArray.length - 1; i > 0; i--) {
      // Generate a random index from 0 to i (inclusive)
      const randomIndex = Math.floor(Math.random() * (i + 1));
  
      // Swap elements between randomIndex and i
      const temp = shuffledArray[i];
      shuffledArray[i] = shuffledArray[randomIndex];
      shuffledArray[randomIndex] = temp;
    }
  
    return shuffledArray;
  }
  

  const askTheAudience = () => {
    if (usedLifelines < lifelines) {
      const currentQuestion = questions[questionNumber - 1];
      
      // Simulate audience response probabilities (adjust as needed)
      const audienceResponses = {
        correct: 60,
        incorrect1: 20,
        incorrect2: 10,
        incorrect3: 10,
      };
      
      // Generate a random number to determine the audience's choice
      const randomNumber = Math.random() * 100;
      let chosenAnswer;
      
      if (randomNumber <= audienceResponses.correct) {
        chosenAnswer = currentQuestion.answers.find((answer) => answer.correct);
      } else if (randomNumber <= audienceResponses.correct + audienceResponses.incorrect1) {
        chosenAnswer = currentQuestion.answers[0];
      } else if (randomNumber <= audienceResponses.correct + audienceResponses.incorrect1 + audienceResponses.incorrect2) {
        chosenAnswer = currentQuestion.answers[1];
      } else {
        chosenAnswer = currentQuestion.answers[2];
      }
      
      // Update the state to reflect lifeline usage and the audience's choice
      setUsedLifelines(usedLifelines + 1);
      setCurrentAudienceChoice(chosenAnswer);
    }
  };

  const phoneAFriend = () => {
    if (usedLifelines < lifelines) {
      const currentQuestion = questions[questionNumber - 1];
      
      // Generate a random index to choose a friend's answer
      const randomIndex = Math.floor(Math.random() * 4); // Assuming 4 answer options
      
      // Get the friend's answer
      const friendAnswer = currentQuestion.answers[randomIndex];
      
      // Log the friend's answer
      console.log("Friend's answer:", friendAnswer.text);
      
      // Update the state to reflect lifeline usage and the friend's answer
      setUsedLifelines(usedLifelines + 1);
      setFriendAnswer(friendAnswer);
    }
  };
  
  return (
    <div className="app">
      {!username ? (
        <Start setUsername={setUsername} />
      ) : (
        <>
          <div className="main">
            {timeOut ? (
              <h1 className="endText">You earned: {earned}</h1>
            ) : (
              <>
                <div className="top">
                  <div className="timer">
                    <Timer
                      setTimeOut={setTimeOut}
                      questionNumber={questionNumber}
                    />
                  </div>
                </div>
                <div className="bottom">
                  <Trivia
                    data={questions}
                    questionNumber={questionNumber}
                    setQuestionNumber={setQuestionNumber}
                    setTimeOut={setTimeOut}
                  />
                </div>
              </>
            )}
          </div>
          <div className="pyramid">
            <ul className="moneyList">
              {moneyPyramid.map((m) => (
                <li
                  key={m.id}
                  className={
                    questionNumber === m.id
                      ? "moneyListItem active"
                      : "moneyListItem"
                  }
                >
                  <span className="moneyListItemNumber">{m.id}</span>
                  <span className="moneyListItemAmount">{m.amount}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="lifelines">
            <button onClick={useFiftyFifty} disabled={usedLifelines >= lifelines}>
              50-50
            </button>
            <button onClick={askTheAudience} disabled={usedLifelines >= lifelines}>
              Ask the Audience
            </button>
            <button onClick={phoneAFriend} disabled={usedLifelines >= lifelines}>
              Phone a Friend
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default App;
