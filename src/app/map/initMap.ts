export const initMap = async (
    setMap: React.Dispatch<React.SetStateAction<google.maps.Map | null>>,
  ) => {
    const mapElement = document.getElementById('map')
  
    if (mapElement) {
      const map = new google.maps.Map(mapElement, {
        zoom: 13,
        mapId: 'DEMO_MAP_ID',
        maxZoom: 12,
        center: { lat: 35.021242, lng: 135.755613 },//東京駅を中心
      })
  
      setMap(map)
    } else {
      console.error('Google Maps API is not available')
    }
  }
  