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
        radius: '5km',
        keyword: prompt,
        key: apiKey,
    }).toString();

    console.log(queryParams);
    
    const googleResponse = await fetch(`https://maps.googleapis.com/maps/api/place/nearbysearch/json?${queryParams}`);

    const responseJson = await googleResponse.json();
    
    const places: Place[] = responseJson.results
    
    console.log(places);

    const placeDescriptions = places.map(place => {
        return `${place.name}, 評価: ${place.rating}, 住所: ${place.vicinity}`;
    }).join('\n');

    console.log(placeDescriptions);

    const aiPrompt = `
    ユーザーの質問: ${prompt}
    ユーザーの現在値: ${location}
    これらの情報を踏まえて
    以下の場所の中から、ユーザーのニーズに最適な場所を提案してください:
    あとその場所を提案した理由も教えて,加えて現在値からの距離も教えてください
    できれば選択肢は3つだして
    ${placeDescriptions}
`;
    
    if (req.method !== 'POST') {
            return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    try {
        const completion = await openai.chat.completions.create({
                messages: 
                [{ role: "system", content: aiPrompt },
                 { role: "user", content: req.body.prompt }
                ],
                
                model: "gpt-3.5-turbo",
            });

        console.log(completion.choices[0]);

        res.status(200).json({
            prompt: req.body.prompt,
            response: completion.choices[0].message.content
        })
    
    } catch (error:any) {
        console.error(error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
}
