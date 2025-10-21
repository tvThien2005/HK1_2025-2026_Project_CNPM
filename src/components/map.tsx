'use client'

import L, { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { useEffect } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'

export default function MyMapComponent() {
  useEffect(() => {
    delete (L.Icon.Default.prototype as any)._getIconUrl
  }, [])

  const customIcon = new Icon({
    iconUrl: '/placeholder.png',
    iconSize: [38, 38],
  })

  // [51.505, -0.09]
  return (
    <MapContainer
      key="leaflet-map"
      center={[10.760127893367377, 106.68222610822296]}
      zoom={20}
      scrollWheelZoom={false}
      style={{ height: '100%', width: '100%', borderRadius: '8px', display: 'flex', placeItems: 'center' }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      />
      <Marker position={[10.760127893367377, 106.68222610822296]} icon={customIcon}>
        <Popup>
          A pretty CSS3 popup. <br /> Easily customizable.
        </Popup>
      </Marker>
    </MapContainer>
  )
}
