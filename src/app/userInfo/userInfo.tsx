// UserInfo.tsx
"use client"
import { useState } from 'react';
import { useUserAnswers } from '../context/UserAnswersContext';
import { useRouter } from 'next/navigation';
import './userInfo.css';

export const UserInfo = () => {
  const { answers, setAnswers } = useUserAnswers();
  const [currentQuestion, setCurrentQuestion] = useState<number>(0);
  const router = useRouter();

  const questions = [
    { question: "歩くのは好きですか？", options: ["はい", "いいえ"] },
    { question: "お財布事情はどうですか？", options: ["1500円以内", "1500円~5000円以内", "5000円~10000円以内", "10000円以上"] },
    { question: "運動が好きですか？", options: ["はい", "いいえ"] },
    { question: "寄り道の時間は？", options: ["1時間以内", "1時間から2時間", "2時間以上"] },
    { question: "新しいことにチャレンジするのは好きですか？", options: ["はい", "いいえ"] },
    { question: "好きな食べ物のジャンルは？", options: ["中華", "イタリアン", "和食", "洋食"] },
  ];

  const handleAnswer = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className="container">
      <div className="question-number">質問{currentQuestion + 1}</div>
      <div className="question">{questions[currentQuestion].question}</div>
      <div className="options">
        {questions[currentQuestion].options.map(option => (
          <button key={option} className="option-button" onClick={() => handleAnswer(option)}>
            {option}
          </button>
        ))}
      </div>
      <div className="pagination">
        {questions.map((_, index) => (
          <div key={index} className={`dot ${index === currentQuestion ? 'active' : ''}`}>{index + 1}</div>
        ))}
      </div>
    </div>
  );
};