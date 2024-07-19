import { NextApiRequest,NextApiResponse } from "next";

interface Place {
    name: string;
    rating: number;
    vicinity: string;
}

export default async function handler(req:NextApiRequest,res:NextApiResponse) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Only POST requests are allowed' });
    }

    const {type,location} = req.body;
    
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
        type: type,
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

    res.status(200).json(places);
}
