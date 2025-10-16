import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useRef } from 'react';



export default function map() {
    const mapContainer = useRef(null);
    const map = useRef(null);
    const lng = 139.753;
    const lat = 35.6844;
    const zoom = 14;
}