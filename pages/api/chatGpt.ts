import OpenAI from "openai";
import { NextApiRequest,NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

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

interface Message {
    role: string;
    content: string;
}



export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const {prompt,places,conversationId,curLocation} = req.body;

    let locations: Location[] = []
    locations = places;

    const placeDescriptions = locations.map(location  => {
        return `名前: ${location.name}, 評価: ${location.rating}, 住所: ${location.vicinity}, 種類: ${location.types.join(', ')}, 価格帯: ${location.price_level},口コミ:${location.reference},営業時間:${location.opening_hours}`;
    }).join('\n');

    let conversation;

    if (conversationId) {
        // 既存の会話を取得
        conversation = await prisma.conversation.findUnique({
            where: { id: conversationId },
            include: { messages: true }
        });
    } 
   


    const pastMessages = conversation?.messages.map((msg) =>({
        role: msg.role,
        content: msg.content
    })) 

    const aiPrompt = `
    ユーザーの質問: ${prompt}
    ユーザーの現在位置: ${curLocation}

    以下の場所の中から、ユーザーにヒアリングをしたうえで最適な場所を提案してください。ユーザーから質問が抽象的であれば、場所の提案はせずに、具体的な回答が得られるように質問してください。その際、提示する理由も教えてください。
    場所の住所は、伝えなくていいです。また、場所の種類や価格帯、評価、口コミ、営業時間などの情報を提供してください。
    場所の名前は「」で囲ってください。

    場所情報:
    ${placeDescriptions}

    以下は過去の会話です。これを踏まえて回答してください。
    ${pastMessages?.map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n')}
    `;


   

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: aiPrompt }],
            model: "gpt-3.5-turbo",
        });

        const responseContent = completion.choices[0].message.content;
        
        const placeNames = responseContent?.match(/「.*?」/g)?.map((name) => name.slice(1, -1)) || [];
        console.log(placeNames);
        const detailedPlaces = [];
        for(const name of placeNames) {
            const placeDetails = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&fields=name,rating,types,price_level,reference,opening_hours,geometry&key=${process.env.GOOGLE_MAPS_APIKEY}`)
            const placeData = await placeDetails.json();
            console.log(placeData);
            if(placeData.candidates && placeData.candidates.length > 0) {
                detailedPlaces.push(placeData.candidates[0]);
            }
        }
        console.log(detailedPlaces);

    if(typeof conversationId !== 'undefined' && conversation) {
        await prisma.message.createMany({
            data: [
                {role: 'user', content: prompt, conversationId: conversation?.id},
                {role: 'ai', content: responseContent, conversationId: conversation?.id}
            ]
        })
    } else {
        conversation = await prisma.conversation.create({
            data: {
                messages: {
                    create: [
                        {role: 'user', content: prompt},
                        {role: 'ai', content: responseContent}
                    ]
                }
    }
    });
    }

        res.status(200).json({
            prompt: req.body.prompt,
            response: completion.choices[0].message.content,
            conversationId: conversation.id,
            detailedPlaces
        });
    } catch (error: any) {
        console.error('Error fetching from OpenAI API:', error.message);
        res.status(500).json({ message: 'Internal server error while fetching from OpenAI API' });
    }
}
