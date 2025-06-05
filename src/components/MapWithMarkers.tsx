import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';

interface Props {
    data: Record<string, string>[];
    predictions: number[] | null;
    regressionResults: number[] | null;
}

// Marker icon fix
delete (L.Icon.Default as any).prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapWithMarkers: React.FC<Props> = ({ data, predictions, regressionResults }) => {
    const locations = data
        .map((row, idx) => {
            const lat = parseFloat(row['Latitude']);
            const lon = parseFloat(row['Longitude']);
            if (isNaN(lat) || isNaN(lon)) return null;
            return { idx, lat, lon };
        })
        .filter(Boolean) as { idx: number; lat: number; lon: number }[];

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
            <MapContainer center={[centerLat, centerLon]} zoom={3} scrollWheelZoom={true} className="h-full w-full">
                <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                />
                <MarkerClusterGroup key={locations.length}>
                    {locations.map(({ idx, lat, lon }) => (
                        <Marker key={`${lat}-${lon}`} position={[lat, lon]}>
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
                </MarkerClusterGroup>

            </MapContainer>
        </div>
    );
};

export default MapWithMarkers;
