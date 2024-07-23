'use client';
import { useEffect, useState } from 'react';
import { Box, Container } from '@mui/material';
import { loadGoogleMapsAPI } from './loadGoogleMapsAPI';
import {Spot} from '../chat/chat';

interface ShowMapProps {
  spots: Spot[];
  directions : google.maps.DirectionsResult | null;
  onRequestDirections: (destination: google.maps.LatLngLiteral) => void;
}

export const ShowMap = ({ spots, directions, onRequestDirections }: ShowMapProps) => {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [directionsRenderer, setDirectionsRenderer] = useState<google.maps.DirectionsRenderer | null>(null);

  useEffect(() => {
    loadGoogleMapsAPI(setMap);
  }, []);

  useEffect(() => {
    if(map) {
      const renderer = new google.maps.DirectionsRenderer();
      renderer.setMap(map);
      setDirectionsRenderer(renderer);
    }
  }, [map]);

  useEffect(() => {
    if(directionsRenderer && directions) {
      directionsRenderer.setDirections(directions);
    }
  }, [directionsRenderer, directions]);

  useEffect(() => {
      spots.forEach((spot) => {
        const marker = new google.maps.Marker({
          position: { lat: spot.geometry.location.lat, lng: spot.geometry.location.lng },
          map: map,
          title: spot.name,
        });
        

        const infowindow = new google.maps.InfoWindow({
          content: `<h3>${spot.name}</h3><button id="routeButton-${spot.id}">経路を表示</button>`,
        });

        marker.addListener('click', () => {
          infowindow.open(map, marker);
        });
        infowindow.addListener('domready', () => {
          const button = document.getElementById(`routeButton-${spot.id}`);
          if (button) {
            button.addEventListener('click', () => {
              onRequestDirections(spot.geometry.location);
              console.log('clicked');
            });
          }
        });
        
      });

  }, [map, spots, onRequestDirections]);

  return (
    <Container maxWidth="xl">
      <Box id="map" style={{ height: '60vh', width: '100%' }}></Box>
    </Container>
  );
};
