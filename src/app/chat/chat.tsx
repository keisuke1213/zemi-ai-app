'use client';
import { useState } from "react";

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
    <div>
        <form onSubmit={handleSubmit}>
            <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
            <button type="submit">Submit</button>
        </form>
        <div>
            <h3>Response:</h3>
            <p>{response}</p>
        </div>
    </div>
 );
}