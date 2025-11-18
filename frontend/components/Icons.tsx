import L from "leaflet";

const createIcon = (html: string, size: [number, number]) =>
  L.divIcon({
    html,
    className: "",
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1]],
  });

export const SchoolIcon = createIcon(
  `<div class="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center border-2 border-blue-500">
     <span class="text-2xl">🏫</span>
   </div>`,
  [40, 40]
);

export const StudentIcon = (number: number) =>
  createIcon(
    `<div class="relative">
     <div class="w-8 h-8 bg-green-500 rounded-full shadow-md flex items-center justify-center border-2 border-white">
       <span class="text-white font-bold text-sm">${number}</span>
     </div>
   </div>`,
    [32, 32]
  );

export const StudentPickedUpIcon = createIcon(
  `<div class="relative">
     <div class="w-5 h-5 bg-gray-400 rounded-full shadow flex items-center justify-center border-2 border-white">
       <svg xmlns="http://www.w3.org/2000/svg" class="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
         <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
       </svg>
     </div>
   </div>`,
  [20, 20]
);
