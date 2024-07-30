import OpenAI from "openai";
import { NextApiRequest,NextApiResponse } from "next";
import { PrismaClient } from "@prisma/client";
import { count } from "console";

const prisma = new PrismaClient();

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

interface Place {
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

interface Prompts {
    key: number;
    value: string;
}

interface countChat {
    countChat: number;
}

interface Place {
    name: string;
    rating: number;
    vicinity: string;
}


export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const {prompt,conversationId,curLocation,countChat,answers,type} = req.body;

    let places: Place[] = []


    console.log(curLocation);

    if(type) {
        const apiKey = process.env.GOOGLE_MAPS_API_KEY;
        if (typeof apiKey !== 'string') {
            res.status(500).json({ error: 'Google Maps API key is not defined.' });
            console.log('Google Maps API key is not defined.')
            return;
        }
        const queryParams = new URLSearchParams({
            location: curLocation,
            radius: '5000',
            type: type,
            key: apiKey,
        }).toString();



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

        
        } catch (error) {
            console.error('Error fetching from Google Places API:', error);
            return res.status(500).json({ error: 'Internal server error while fetching from Google Places API' });
        }
  }


    const placeDescriptions = places.map(place  => {
        return `名前: ${place.name}, 評価: ${place.rating}, 住所: ${place.vicinity}, 種類: ${place.types.join(', ')}, 価格帯: ${place.price_level},口コミ:${place.reference},営業時間:${place.opening_hours}`;
    }).join('\n');

    console.log(placeDescriptions);


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

    const prompts :Prompts[] = [
    { key: 0, value:  "ユーザーに今の気分を聞いてください"},
    { key: 1, value: "ユーザーの入力、 現在位置、事前情報をもとにおすすめの場所を提示してください。場所の名前は必ず「」で囲ってください。場所を提案する時は理由も述べて。" },
]

    const selectedPrompt = prompts.find((prompt) => prompt.key === countChat)
    
    let aiPrompt: string;


    if (selectedPrompt) {
        // countChatが3以下の場合、指定された指示を含むプロンプトを作成
        aiPrompt = `
        ユーザーの入力: ${prompt}
        ユーザーの現在位置: ${curLocation}
        ユーザーの事前情報: ${answers}
        場所情報:
        ${placeDescriptions}
        あなたへの指示: ${selectedPrompt.value}
    
        以下は過去の会話です。これを踏まえて回答してください。
        ${pastMessages?.map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n')}
        `;
    } else {
        // countChatが3を超えた場合、自由に会話をさせる
        aiPrompt = `
        ユーザーの入力: ${prompt}
        ユーザーの現在位置: ${curLocation}
        ユーザーの事前情報: ${answers}
        場所情報:
        ${placeDescriptions}
        これらの情報を踏まえて、ユーザーに対して自由に会話をしてください。
        以下は過去の会話です。これを踏まえて回答してください。
        ${pastMessages?.map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n')}
        `;
    }
    

    


    // const aiPrompt = `
    // ユーザーの質問: ${prompt}
    // ユーザーの現在位置: ${curLocation}

    // 以下の場所の中から、ユーザーにヒアリングをしたうえで最適な場所を提案してください。ユーザーから質問が抽象的であれば、場所の提案はせずに、具体的な回答が得られるように質問してください。その際、提示する理由も教えてください。
    // 場所の住所は、伝えなくていいです。また、場所の種類や価格帯、評価、口コミ、営業時間などの情報を提供してください。
    // 提案する場所の名前は必ず「」で囲ってください。

    // 場所情報:
    // ${placeDescriptions}

    // 以下は過去の会話です。これを踏まえて回答してください。
    // ${pastMessages?.map((msg) => `${msg.role === 'user' ? 'ユーザー' : 'AI'}: ${msg.content}`).join('\n')}
    // `;


   

    try {
        const completion = await openai.chat.completions.create({
            messages: [{ role: "system", content: aiPrompt }],
            model: "gpt-3.5-turbo",
        });

        const responseContent = completion.choices[0].message.content;
        
        const placeNames = responseContent?.match(/「.*?」/g)?.map((name) => name.slice(1, -1)) || [];
        const detailedPlaces = [];
        for(const name of placeNames) {
            const placeDetails = await fetch(`https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${name}&inputtype=textquery&fields=name,rating,types,price_level,reference,opening_hours,geometry&key=${process.env.GOOGLE_MAPS_API_KEY}`)
            const placeData = await placeDetails.json();
            console.log(placeData);
            if(placeData.candidates && placeData.candidates.length > 0) {
                detailedPlaces.push(placeData.candidates[0]);
            }
        }

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
