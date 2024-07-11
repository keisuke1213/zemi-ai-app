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

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const location = `${position.coords.latitude},${position.coords.longitude}`;
                const res = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt, location }),
                });

                const data = await res.json();
                setChatHistory((prevHistory) => [...prevHistory, data]);
            }, (error) => {
                console.error('Geolocation error:', error);
            });
        } else {
            console.error('Geolocation is not available');
        }
    };

    return (
        <Container maxWidth="xl">
            <div>
                {chatHistory.map((chat, index) => (
                    <div key={index}>
                        <p>{chat.prompt}</p>
                        <p>{chat.response}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit}>
                <TextField
                    value={prompt}
                    label="質問してみよう"
                    variant="outlined"
                    onChange={(e) => setPrompt(e.target.value)}
                />
                <Button variant="contained" type="submit">送信</Button>
            </form>
        </Container>
    );
};
