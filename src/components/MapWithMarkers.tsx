import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import type { MapContainerProps, TileLayerProps } from 'react-leaflet';

import 'leaflet/dist/leaflet.css';

import axios from 'axios';
import L from 'leaflet';

interface Props {
    data: Record<string, string>[];
    predictions: number[] | null;
    regressionResults: number[] | null;
}

delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWithMarkers: React.FC<Props> = ({ data, predictions, regressionResults }) => {
    // 篩選有經緯度的資料
    const locations = data
        .map((row, idx) => {
            const lat = parseFloat(row['Latitude']);
            const lon = parseFloat(row['Longitude']);
            if (isNaN(lat) || isNaN(lon)) return null;
            return { idx, lat, lon };
        })
        .filter(Boolean) as { idx: number; lat: number; lon: number }[];

    // 計算平均經緯度，若沒資料就用台灣中心點
    const centerLat =
        locations.length > 0
            ? locations.reduce((sum, loc) => sum + loc.lat, 0) / locations.length
            : 23.6978;
    const centerLon =
        locations.length > 0
            ? locations.reduce((sum, loc) => sum + loc.lon, 0) / locations.length
            : 120.9605;

    return (
        <div className="h-[500px] w-full">
            <MapContainer
                center={[centerLat, centerLon]} // 改成平均值
                zoom={3}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                {locations.map(({ idx, lat, lon }) => (
                    <Marker key={idx} position={[lat, lon]}>
                        <Popup>
                            <div className="space-y-1 text-sm">
                                <div><strong>Order Time:</strong> {data[idx]['order date (DateOrders)'] || '-'}</div>
                                <div><strong>Country:</strong> {data[idx]['Customer Country'] || '-'}</div>
                                <div><strong>City:</strong> {data[idx]['Customer City'] || '-'}</div>
                                <div><strong>Shipping Mode:</strong> {data[idx]['Shipping Mode'] || '-'}</div>

                                <hr className="my-2 border-gray-300" />
                                <div><strong>Prediction:</strong> {predictions?.[idx]?.toFixed(3) || '-'}</div>
                                <div><strong>Regression:</strong> {regressionResults?.[idx]?.toFixed(3) || '-'}</div>
                            </div>
                        </Popup>
                    </Marker>
                ))}
            </MapContainer>
        </div>
    );
};


export default MapWithMarkers;
