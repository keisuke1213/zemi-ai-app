'use client';
import { useState } from "react";
import { TextField, Container,Button } from '@mui/material'

export const Chat = () => {
    const [prompt, setPrompt] = useState("");
    const [response, setResponse] = useState("");

 const handleSubmit = async (e:any) => {
    e.preventDefault(); 
    
    const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        body: JSON.stringify({prompt})
    });

    const data = await res.json();
    setResponse(data.response);
 };

 return (
    <Container maxWidth="xl">
        <form onSubmit={handleSubmit}>
            <TextField value={prompt} label="質問してみよう" variant="outlined" onChange={(e) => setPrompt(e.target.value)}></TextField>
            <Button variant="contained" type="submit">送信</Button>
        </form>
        <div>
            <h3>Response:</h3>
            <p>{response}</p>
        </div>
    </Container>
 );
}