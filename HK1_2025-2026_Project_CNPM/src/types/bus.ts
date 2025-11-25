export interface Student {
  id: string;
  name: string;
  address: string;
  position: { lat: number; lng: number };
  school: string;
  grade: string;
  pickupTime: string;
}

export interface School {
  name: string;
  position: { lat: number; lng: number };
  startTime: string;
  address?: string;
}

// Trong types/bus.ts
export interface Station {
  id: string;
  name: string;
  position: {
    lat: number;
    lng: number;
  };
  type: "pickup" | "dropoff" | "both";
  studentCount: number;
  estimatedArrival?: string;
  description?: string;
}

export interface Bus {
  id: string;
  name: string;
  licensePlate: string;
  route: BusRoute;
  position: {
    lat: number;
    lng: number;
  };
  speed: number;
  lastUpdate: string;
  currentStationIndex: number;
  pickedUpStations?: string[];
  nextStop?: {
    station: Station;
    estimatedArrival: string;
  };
}

export interface BusRoute {
  id: string;
  name: string;
  busNumber: string;
  driver: string;
  school: {
    name: string;
    position: {
      lat: number;
      lng: number;
    };
    startTime: string;
  };
  stations: Station[]; // ĐỔI TỪ students THÀNH stations
  currentStatus: "waiting" | "picking_up" | "going_to_school" | "completed";
  currentStationIndex: number; // ĐỔI TỪ currentStudentIndex
}