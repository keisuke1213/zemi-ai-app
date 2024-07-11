'use client'
import { Box, Container } from '@mui/material'
import { useEffect, useState } from 'react'
import { loadGoogleMapsAPI } from './loadGoogleMapsAPI'

export const MapPage = () => {
  const [map, setMap] = useState<google.maps.Map | null>(null)

  useEffect(() => {
    loadGoogleMapsAPI(setMap)
  }, [])

  return (
    <>
      <Container maxWidth="xl">
        <Box id="map" style={{ height: '60vh', width: '100%' }}></Box>
      </Container>
    </>
  )
}

