'use client';
import { useState } from "react";
import { TextField, Container, Button } from '@mui/material';

type Conversation = {
    prompt: string;
    response: string;
};

export const Chat = () => {

    const [prompt, setPrompt] = useState("");
    const [chatHistory, setChatHistory] = useState<Conversation[]>([]);
    const [places, setPlaces] = useState([]);

    const handleClick = async(type:string) => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const location = `${position.coords.latitude},${position.coords.longitude}`;
                console.log(location);
                const res = await fetch('/api/googleMaps', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ type, location }),
                });

                const data = await res.json();
                setPlaces(data);
        
            }, (error) => {
                console.error('Geolocation error:', error);
            });
        } else {
            console.error('Geolocation is not available');
        }
    }
    

    const handleSubmit = async (e: any) => {
        e.preventDefault();
                const res = await fetch('/api/chatGpt', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ places, prompt }),
                });
                console.log(places);

                const data = await res.json();
                console.log(data);
                setChatHistory((prevHistory) => [data, ...prevHistory]);
            }

    return (
        <Container maxWidth="xl">
            <Button onClick={()=> {handleClick('restaurant')}}>レストラン</Button>
            <Button onClick={() => {handleClick('cafe')}}>カフェ</Button>
            <Button onClick={()=> {handleClick('park')}}>公園</Button>
            <form onSubmit={handleSubmit}>
                <TextField
                    value={prompt}
                    label="質問してみよう"
                    variant="outlined"
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <Button variant="contained" type="submit">送信</Button>
            </form>
            <div>
                {chatHistory.map((chat, index) => (
                    <div key={index}>
                        <p>{chat.prompt}</p>
                        <p>{chat.response}</p>
                    </div>
                ))}
            </div>
        </Container>
    );
};