import OpenAI from "openai";
import { NextApiRequest,NextApiResponse } from "next";


const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Place {
    name: string;
    rating: number;
    vicinity: string;
}

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const {prompt,location} = req.body;
    
    const apiKey = process.env.GOOGLE_MAPS_APIKEY;
    if (typeof apiKey !== 'string') {
        // エラーレスポンスを返すか、適切なエラーハンドリングを行う
        res.status(500).json({ error: 'Google Maps API key is not defined.' });
        console.log('Google Maps API key is not defined.')
        return;
    }
    
    const queryParams = new URLSearchParams({
        location: location,
        radius: '5000',
        keyword: prompt,
        key: apiKey,
    }).toString();

    let places: Place[] = []


    try {
        const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${queryParams}`);
        if (!googleResponse.ok) {
            console.error(`Google Maps API error: ${googleResponse.status}`);
            return res.status(googleResponse.status).json({ error: 'Failed to fetch from Google Places API' });
        }

        const responseJson = await googleResponse.json();

        if (responseJson.status !== 'OK') {
            console.error(`Google Maps API error: ${responseJson.status}`);
            return res.status(500).json({ error: `Google Maps API error: ${responseJson.status}` });
        }

        places = responseJson.results;
        console.log(places);

    
    } catch (error) {
        console.error('Error fetching from Google Places API:', error);
        return res.status(500).json({ error: 'Internal server error while fetching from Google Places API' });
    }

    const placeDescriptions = places.map(place => {
        return `名前: ${place.name}, 評価: ${place.rating}, 住所: ${place.vicinity}`;
    }).join('\n');


    const aiPrompt = `
        ユーザーの質問: ${prompt}
        ユーザーの現在位置: ${location}
        これらの情報を踏まえて
        以下の場所の中から、ユーザーのニーズに最適な場所を提案してください:
        現在の位置から5km以内にある${prompt}の場所を提案してください。
        あとその場所を提案した理由も教えてください。加えて現在位置からの距離も教えてください。
        場所の住所も教えてください。
        できれば選択肢は3つ出してください。
        ${placeDescriptions}
    `;

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: aiPrompt }],
            model: "gpt-3.5-turbo",
        });

        res.status(200).json({
            prompt: req.body.prompt,
            response: completion.choices[0].message.content,
            places
        });
    } catch (error: any) {
        console.error('Error fetching from OpenAI API:', error.message);
        res.status(500).json({ message: 'Internal server error while fetching from OpenAI API' });
    }
}
