'use client';
import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { loadGoogleMapsAPI } from './loadGoogleMapsAPI';
import {Spot} from '../chat/chat';

interface ShowMapProps {
  spots: Spot[];
}

export const ShowMap = ({ spots }: ShowMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);

  useEffect(() => {
    loadGoogleMapsAPI(setMap);
  }, []);

  useEffect(() => {
      spots.forEach((spot) => {
        const marker = new google.maps.Marker({
          position: { lat: spot.geometry.location.lat, lng: spot.geometry.location.lng },
          map: map,
          title: spot.name,
        });

        const infowindow = new google.maps.InfoWindow({
          content: `<h3>${spot.name}</h3>`,
        });

        marker.addListener('click', () => {
          infowindow.open(map, marker);
        });
      });
  }, [map, spots]);

  return (
    <Container maxWidth="xl">
      <Box id="map" style={{ height: '60vh', width: '100%' }}></Box>
    </Container>
  );
};
