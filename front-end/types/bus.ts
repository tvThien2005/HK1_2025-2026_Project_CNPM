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
export interface ExtendedStation extends Station {
  studentIds?: string[];
  loaiPhanBo?: 'Sang' | 'Chieu';
  maDiemDung?: number;
  thuTuDon?: number;
  thoiGianDuKien?: string;
  grade?: string;
  address?: string;
  pickupTime?: string;
  estimatedArrival?: string;
}

export interface ExtendedBusRoute extends BusRoute {
  schedule?: {
    startTime: string;
    endTime: string;
  };
  stations: ExtendedStation[];
  isDonXe?: boolean;
  loaiPhanBo?: 'Sang' | 'Chieu';
}

export interface ExtendedBus extends Bus {
  route: ExtendedBusRoute;
  nextStop?: {
    station: ExtendedStation;
    estimatedArrival: string;
  };
  pickedUpStations?: string[];
  shouldStartRealtime?: boolean;
  isHidden?: boolean;
  actualStartTime?: string;
  totalDistance?: number;
  currentSegmentProgress?: number;
  isDonXe?: boolean;
}

export interface StudentData {
  maHocSinh: number;
  tenHocSinh: string;
  lop: string;
  maDiaChi?: number;
}

export interface StudentAllocation {
  maHocSinh: number;
  maDiemDung: number;
  loaiPhanBo: 'Sang' | 'Chieu';
  tenDiemDung: string;
  viDo: number;
  kinhDo: number;
  trangThai: string;
}