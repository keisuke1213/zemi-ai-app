"use client"
import { useState } from "react";
import { UserInfo } from "./userInfo";
import { FC } from "react";
import "./userInfo.css";

interface StartPageProps {
    handleButtonClick: () => void;
}

export default function InfoPage(){
    const [showUserInfo, setShowUserInfo] = useState(false);

    const handleButtonClick = () => {
        setShowUserInfo(true);
    };
    return (
        <div>
            {showUserInfo ? <UserInfo /> : <StartPage handleButtonClick={handleButtonClick} />}
        </div>
    )
}

const StartPage: FC<StartPageProps> = ({handleButtonClick}) => {
    return (
        <div className="container">
          <div className="title">性格診断</div>
          <p className="description">
            次は、<br />
            ●●ちゃんの好みに合わせた情報提供のために、いくつか質問に答えてね！
          </p>
          <p className="instructions">
            質問は、一日の終わり（仕事帰り、学校帰り）時を想定してください
          </p>
          <button className="start-button" onClick={handleButtonClick}>START</button>
        </div>
      );
}