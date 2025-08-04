import { ArrowRightFromLine } from "lucide-react";
import { type GameState } from "@shared/schema";
import TimelineCard from "./TimelineCard";
import { useDragAndDrop } from "@/hooks/useDragAndDrop";

interface TimelineProps {
  gameState: GameState;
  onPlaceEvent: (eventId: string, position: number) => void;
  isPlacing: boolean;
}

export default function Timeline({ gameState, onPlaceEvent, isPlacing }: TimelineProps) {
  const { placedEvents, currentEvent } = gameState;
  const { draggedItem, dropZones, handleDragStart, handleDragEnd, handleDragOver, handleDrop } = useDragAndDrop({
    onDrop: (eventId: string, position: number) => {
      onPlaceEvent(eventId, position);
    }
  });

  return (
    <div className="bg-white rounded-xl shadow-sm p-6" data-testid="timeline-container">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Your Timeline</h2>
        <div className="text-sm text-gray-500">
          <ArrowRightFromLine className="inline-block mr-1 h-4 w-4" />
          Scroll horizontally to see more
        </div>
      </div>
      
      <div className="relative overflow-x-auto pb-4">
        <div className="flex space-x-4 min-w-max">
          {placedEvents.map((placedEvent, index) => (
            <div key={`${placedEvent.event.id}-${index}`} className="flex items-center">
              <TimelineCard
                event={placedEvent.event}
                isPlaced={true}
                isStarting={index === 0}
              />
              
              {/* Drop zone after each card */}
              <div className="flex-shrink-0 w-4 flex items-center justify-center">
                <div
                  className={`timeline-slot w-2 h-20 rounded-full border-2 border-dashed transition-all duration-300 ${
                    dropZones[index + 1] 
                      ? 'border-blue-600 bg-blue-50' 
                      : 'border-gray-300'
                  }`}
                  data-position={index + 1}
                  data-testid={`drop-zone-${index + 1}`}
                  onDragOver={(e) => handleDragOver(e, index + 1)}
                  onDragLeave={() => handleDragEnd()}
                  onDrop={(e) => handleDrop(e, index + 1)}
                />
              </div>
            </div>
          ))}
          
          {/* Future slots indicator */}
          <div className="flex-shrink-0 w-48">
            <div className="border-2 border-dashed border-gray-300 h-20 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">Future cards</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
