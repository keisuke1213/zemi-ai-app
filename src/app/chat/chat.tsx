'use client';
import { useState, useEffect } from 'react';
import { TextField, Container, Button } from '@mui/material';
import { loadGoogleMapsAPI } from '../map/loadGoogleMapsAPI';
import { ShowMap } from '../map/ShowMap';
import { UserAnswersProvider } from '../context/UserAnswersContext';
import { useUserAnswers } from '../context/UserAnswersContext';
import React, { FC } from 'react';
import "./chat.css"


type Conversation = {
  prompt: string;
  response: string;
};

export interface Spot {
  id: string;
  name: string;
  geometry: {
    location: {
      lat: number;
      lng: number;
    };
  };
}

interface ChatFormProps {
  handleSubmit: (e: any) => Promise<void>;
  prompt: string;
  setPrompt: React.Dispatch<React.SetStateAction<string>>;
  chatHistory: Conversation[];
  setChatHistory?: React.Dispatch<React.SetStateAction<Conversation[]>>;
}

interface SelectButtonProps {
  setType: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: any) => Promise<void>;
}

interface ChatProps {
  chatHistory: Conversation[];
  countChat: number;
  setType: React.Dispatch<React.SetStateAction<string>>;
  handleSubmit: (e: any) => Promise<void>;
}

export const Chat = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [prompt, setPrompt] = useState('');
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
  const [places, setPlaces] = useState<any[]>([]);
  const [curLocation, setCurLocation] = useState<string>('');
  const [spots, setSpots] = useState<Spot[]>([]);
  const [directions, setDirections] = useState<google.maps.DirectionsResult | null>(null);
  const [countChat, setCountChat] = useState<number>(0);
  const [type, setType] = useState<string>('');
  const { answers } = useUserAnswers();
  console.log(answers);

  useEffect(() => {
    loadGoogleMapsAPI(setMap);
  }, []);

  useEffect(() => {
    if (type) {
      handleSubmit({ preventDefault: () => {} });
    }
  }, [type]);

  // const handleClick = async (type: string) => {
  //   if (navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(async (position) => {
  //       const curLocation = `${position.coords.latitude},${position.coords.longitude}`;
  //       setCurLocation(curLocation);
  //       const res = await fetch('/api/googleMaps', {
  //         method: 'POST',
  //         headers: {
  //           'Content-Type': 'application/json',
  //         },
  //         body: JSON.stringify({ type, curLocation }),
  //       });

  //       const data = await res.json();
  //       setPlaces(data);
  //     }, (error) => {
  //       console.error('Geolocation error:', error);
  //     });
  //   } else {
  //     console.error('Geolocation is not available');
  //   }
  // };



  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if(navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const curLocation = `${position.coords.latitude},${position.coords.longitude}`;
        setCurLocation(curLocation);
      }, (error) => {
        console.error('Geolocation error:', error);
      });
    }

    const res = await fetch('/api/chatGpt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ places, prompt, conversationId, curLocation,countChat,answers,type }),
    });
    setPrompt('');
    setType(type)

    const data = await res.json();
    setCountChat(countChat + 1);
    setConversationId(data.conversationId);
    setChatHistory((prevHistory) => [...prevHistory,data]);
    console.log(data);
    const spotsWithId = data.detailedPlaces.map((spot: Spot, index: number) => ({
      ...spot,
      id: `spot-${index}`,
    }));

    setSpots(spotsWithId);
  };

  

  const handleDirections = async(destination: google.maps.LatLngLiteral) => {
    if(curLocation) {
      const directionsService = new google.maps.DirectionsService();
      directionsService.route({
        origin: curLocation,
        destination: destination,
        travelMode: google.maps.TravelMode.WALKING,
      }, (result, status) => {
        if(status === google.maps.DirectionsStatus.OK) {
          setDirections(result);
        } else {
          console.error(`Direction request failed due to ${status}`);
        }
      });
    }
    }


  return (
    <Container maxWidth="xl" className='container'>
      <div className="map-container">
      <ShowMap spots={spots}  directions={directions} onRequestDirections={handleDirections} />
      </div>
      <DisplayChat chatHistory={chatHistory} countChat={countChat} setType={setType} handleSubmit={handleSubmit} />
      {countChat === 0 ? (
        <StartButton  handleSubmit={handleSubmit}  /> 
      ) : (
        (
          countChat === 1 ? (<SelectButton setType={setType} handleSubmit={handleSubmit} /> 
          ) : <ChatForm handleSubmit={handleSubmit} prompt={prompt} setPrompt={setPrompt} chatHistory={chatHistory} />
        )
      )}
      {/* </div> */}
      </Container>
  );
};


const StartButton: FC<{ handleSubmit: (e: any) => Promise<void>}> = ({handleSubmit}) => {
  return (
    <Button onClick={handleSubmit} sx={{text: 'center'}}>チャットを開始</Button>
  )
}


const DisplayChat: FC<ChatProps> = ({chatHistory, countChat, setType, handleSubmit}) => {
  return (
    <div>
      {chatHistory.map((chat, index) => (
        <div className="chat-display" key={index}>
        <div className="chat-bubble ai">
          <p className="avatar">AI</p>
          <p className="message">{chat.response}</p>
        </div>
        <div className="chat-bubble user">
          <p className="avatar">ユーザー</p>
          <p className="message">{chat.prompt}</p>
        </div>
        </div>
      ))}
    </div>
  )
}

const ChatForm: FC<ChatFormProps> = ({handleSubmit, prompt, setPrompt, chatHistory}) => {
  return (
    <div>
  <form onSubmit={handleSubmit} className="right-aligned-form">
      <TextField
        value={prompt}
        label="質問してみよう"
        variant="outlined"
        onChange={(e) => setPrompt(e.target.value)}
      />
      <Button sx={{mx: 2}} variant="contained" type="submit">送信</Button>
    </form>
  </div>
  )
}

const SelectButton: FC<SelectButtonProps> = ({handleSubmit,setType}) => {
  
  return (
    <Container sx={{ display: 'flex', justifyContent: 'flex-end', mb: 3 }}>
    <Button sx={{ml: 1}} variant='outlined' onClick={() => setType("restaurant")}>レストラン</Button>
    <Button sx={{ml: 1}} variant='outlined' onClick={() => setType("cafe")}>カフェ</Button>
    <Button sx={{ml: 1}} variant='outlined' onClick={() => setType("bar")}>バー</Button>
    <Button sx={{ml: 1}} variant='outlined' onClick={() => setType("park")}>公園</Button>
    <Button sx={{ml: 1}} variant='outlined' onClick={() => setType("museum")}>美術館</Button>
    <Button sx={{ml: 1}} variant='outlined' onClick={() => setType("amusement_park")}>遊園地</Button>
    </Container>
  )
}