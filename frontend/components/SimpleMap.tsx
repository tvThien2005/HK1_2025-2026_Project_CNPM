"use client";
import { GoogleMap, Marker, InfoWindow } from "@react-google-maps/api";
import { useState, useCallback } from "react";
import { useLoadGoogleMap } from "../hooks/useLoadGoogleMap";

interface Bus {
  id: string;
  name: string;
  licensePlate: string;
  position: {
    lat: number;
    lng: number;
  };
}

interface MapProps {
  buses?: Bus[];
}

const SimpleMap: React.FC<MapProps> = ({ buses = [] }) => {
  const { isLoaded, loadError } = useLoadGoogleMap();
  const [selectedBus, setSelectedBus] = useState<Bus | null>(null);

  const mapContainerStyle = {
    width: "100%",
    height: "500px",
  };

  const defaultCenter = { lat: 10.762622, lng: 106.660172 }; // TP.HCM

  const onLoad = useCallback((map: google.maps.Map) => {
    console.log("Map loaded successfully");
  }, []);

  const onUnmount = useCallback(() => {
    console.log("Map unmounted");
  }, []);

  // Log để debug
  console.log("Map props - buses:", buses);
  console.log("Map loaded:", isLoaded);
  console.log("Load error:", loadError);

  if (loadError) {
    return (
      <div
        style={{
          height: "500px",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
        }}
        className="d-flex justify-content-center align-items-center"
      >
        <div className="text-center">
          <p className="text-danger">Lỗi khi tải bản đồ: {loadError.message}</p>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => window.location.reload()}
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div
        style={{
          height: "500px",
          backgroundColor: "#e9ecef",
          borderRadius: "8px",
        }}
        className="d-flex justify-content-center align-items-center"
      >
        <div className="text-center">
          <p className="text-muted">Đang tải bản đồ...</p>
          <p className="text-muted small">
            API Key:{" "}
            {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
              ? "✓ Đã cấu hình"
              : "✗ Chưa cấu hình"}
          </p>
        </div>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      center={buses.length > 0 ? buses[0].position : defaultCenter}
      zoom={13}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {/* Hiển thị các xe bus */}
      {buses.map((bus) => (
        <Marker
          key={bus.id}
          position={bus.position}
          title={bus.name}
          onClick={() => setSelectedBus(bus)}
        />
      ))}

      {/* InfoWindow khi click vào xe */}
      {selectedBus && (
        <InfoWindow
          position={selectedBus.position}
          onCloseClick={() => setSelectedBus(null)}
        >
          <div style={{ padding: "8px" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>{selectedBus.name}</h4>
            <p style={{ margin: "4px 0" }}>
              <strong>Biển số:</strong> {selectedBus.licensePlate}
            </p>
            <p style={{ margin: "4px 0" }}>
              <strong>Vị trí:</strong> {selectedBus.position.lat.toFixed(6)},{" "}
              {selectedBus.position.lng.toFixed(6)}
            </p>
          </div>
        </InfoWindow>
      )}

      {/* Marker mặc định để test */}
      <Marker position={defaultCenter} title="Vị trí mặc định" />
    </GoogleMap>
  );
};

export default SimpleMap;
