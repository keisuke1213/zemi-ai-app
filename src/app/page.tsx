"use client"
import "./home.css"
import { useEffect,useState } from "react";
import { useRouter } from 'next/navigation';

export default function Home() {
    const [showSelectAiType, setShowSelectAiType] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSelectAiType(true);
        }, 3000); // 3秒後にコンポーネントを表示

        return () => clearTimeout(timer); // クリーンアップ
    }, []);

    return (
        <div>
            {showSelectAiType ? <SelectAiType /> : <Top />}
        </div>
        
    )
}

const Top = () => {
    const [showSelectAiType, setShowSelectAiType] = useState(false);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShowSelectAiType(true);
        }, 3000); // 3秒後にコンポーネントを表示

        return () => clearTimeout(timer); // クリーンアップ
    }, []);

    return (
    <div className="background-color">
        <h1 className="vertical-text">ボッチのよりみち</h1>
    </div>
    );
}

const SelectAiType = () => {
    const [selectedOption, setSelectedOption] = useState<string | null>(null);
    const router = useRouter();

    const handleOptionClick = (option: string) => {
        setSelectedOption(option);
    };

    const handleConfirmClick = () => {
        router.push(`/userInfo`);
    };

    return (
      <div className="container">
        <h1 className="title">AI選択</h1>
        <p className="subtitle">どんな相手とパートナーになる？</p>
        <div className="options">

        <div className="reset-button" role="button" >
          <div className="option green">
            <div className="icon">👨‍🦳</div>
            <div className="label">物静かな お父さん</div>
          </div>
        </div>

        <div className="reset-button" role="button" >
          <div className="option yellow">
            <div className="icon">👵</div>
            <div className="label">なんでも知ってる 優しいおばあちゃん</div>
          </div>
        </div>  

        <div className="reset-button" role="button" >  
          <div className="option pink">
            <div className="icon">👩</div>
            <div className="label">おしゃべり好きな 流行女子</div>
          </div>
        </div>

        </div>
        <button className="confirm-button confirm-button:active confirm-button:hover">決定</button>
      </div>
    );
  }
  
  