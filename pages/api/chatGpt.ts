import OpenAI from "openai";
import { NextApiRequest,NextApiResponse } from "next";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Location {
    name: string;
    types: string[];
    rating: number;
    vicinity: string;
    price_level: number;
    reference: string;
    opening_hours: {}
}

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const {prompt,places} = req.body;

    let locations: Location[] = []
    locations = places;
    console.log(locations);

    const placeDescriptions = locations.map(location  => {
        return `名前: ${location.name}, 評価: ${location.rating}, 住所: ${location.vicinity}, 種類: ${location.types.join(', ')}, 価格帯: ${location.price_level},口コミ:${location.reference},営業時間:${location.opening_hours}`;
    }).join('\n');

    const aiPrompt = `。
        ユーザーの質問: ${prompt}
        以下の場所の中から、ユーザーにヒアリングをしたうえで最適な場所を提案してください。
        ユーザーから質問が抽象的であれば、場所の提案はせずに、具体的な回答が得られるように質問してください。
        その際、提示する理由も教えてください。
        場所：${placeDescriptions}

    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: aiPrompt }],
            model: "gpt-3.5-turbo",
        });

        res.status(200).json({
            prompt: req.body.prompt,
            response: completion.choices[0].message.content,

        });
    } catch (error: any) {
        console.error('Error fetching from OpenAI API:', error.message);
        res.status(500).json({ message: 'Internal server error while fetching from OpenAI API' });
    }
}
