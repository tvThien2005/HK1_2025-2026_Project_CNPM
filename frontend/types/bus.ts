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
  address?: string; // Thêm property optional
}

export interface BusRoute {
  id: string;
  name: string;
  busNumber: string;
  driver: string;
  school: School;
  students: Student[];
  currentStatus: "waiting" | "picking_up" | "going_to_school" | "completed";
  currentStudentIndex: number;
}

export interface Bus {
  id: string;
  name: string;
  licensePlate: string;
  route: BusRoute;
  position: { lat: number; lng: number };
  speed: number;
  lastUpdate: string;
  nextStop?: {
    student: Student;
    estimatedArrival: string;
  };
  pickedUpStudents?: string[]; // Thêm trường này
}
