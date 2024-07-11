import OpenAI from "openai";
import { NextApiRequest,NextApiResponse } from "next";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const completion = await openai.chat.completions.create({
                messages: 
                [{ role: "system", content: "You are a helpful assistant." },
                 { role: "user", content: req.body.prompt }
                ],
                
                model: "gpt-3.5-turbo",
            });

        console.log(completion.choices[0]);

        res.status(200).json({response: completion.choices[0].message.content})
    
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal server error' });
      }
}
