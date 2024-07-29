// UserInfo.tsx
"use client"
import {useState } from 'react';
import { useUserAnswers } from '../context/UserAnswersContext';

export const UserInfo = () => {
  const { answers, setAnswers } = useUserAnswers();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);

  const questions = [
    { question: "歩くのは好きですか？", options: ["はい", "いいえ"] },
    { question: "お財布事情はどうですか？", options: ["1500円以内", "1500円~5000円以内", "5000円~10000円以内", "10000円以上"] },
    { question: "運動が好きですか？", options: ["はい", "いいえ"] },
    { question: "寄り道の時間は？", options: ["1時間以内", "1時間から2時間", "2時間以上"] },
    { question: "新しいことにチャレンジするのは好きですか？", options: ["はい", "いいえ"] },
  ];

  const handleClick = (answer: string) => {
    const questionKey = questions[currentQuestion].question;
    setAnswers(prevAnswers => ({
      ...prevAnswers,
      [questionKey]: answer
    }));
    setCurrentQuestion(prev => prev + 1);
  }

  console.log(answers);

  return (
    <div>
      <h1>ユーザー情報</h1>
      {currentQuestion < questions.length ? (
        <div>
          <h3>{questions[currentQuestion].question}</h3>
          {questions[currentQuestion].options.map(option => (
            <button key={option} onClick={() => handleClick(option)}>{option}</button>
          ))}
        </div>
      ) : (
        <div>
          <h2>回答結果</h2>
          {Object.keys(answers).map((question, index) => (
            <p key={index}>{question}: {answers[question]}</p>
          ))}
        </div>
      )}
    </div>
  );
};
