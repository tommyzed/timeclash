import { type HistoricalEvent } from "@shared/schema";

interface TimelineCardProps {
  event: HistoricalEvent;
  isPlaced: boolean;
  isStarting?: boolean;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  placedByPlayerName?: string;
}

export default function TimelineCard({ 
  event, 
  isPlaced, 
  isStarting = false, 
  isDragging = false,
  onDragStart,
  onDragEnd,
  placedByPlayerName
}: TimelineCardProps) {
  const getCardColor = () => {
    if (isStarting) return "from-green-500 to-green-600";
    if (isPlaced) return "from-blue-500 to-blue-600";
    return "from-purple-500 to-purple-600";
  };

  const getCardLabel = () => {
    if (isPlaced) return "CORRECTLY PLACED";
    return "When Did This Happen?";
  };



  return (
    <div 
      className={`flex-shrink-0 w-48 ${isDragging ? 'opacity-70 transform rotate-1' : ''} ${
        !isPlaced ? 'cursor-move card-hover' : ''
      }`}
      draggable={false}
      style={{ userSelect: 'none' }}
      data-testid={`timeline-card-${event.id}`}
    >
      <div className={`bg-gradient-to-br ${getCardColor()} text-white p-4 rounded-lg shadow-md`}>
        {/* Player name section with divider */}
        {isPlaced && placedByPlayerName ? (
          <>
            <div className="text-xs font-semibold mb-2 px-2 py-1 rounded-sm text-[#ffffff] text-left bg-[#80fff433]">
              {placedByPlayerName.toUpperCase()}
            </div>
            <hr className="border-white border-opacity-30 mb-3" />
          </>
        ) : !isPlaced ? (
          <div className="text-xs font-semibold mb-2 bg-transparent px-2 py-1 rounded-sm text-center text-[#1a1c25]">{getCardLabel()}</div>
        ) : null}
        
        <div className="text-sm font-medium mb-4">{event.title}</div>
        <div className="text-right">
          <span className="bg-white bg-opacity-20 px-2 py-1 rounded text-xs font-bold">
            {isPlaced ? (event.year < 0 ? `${Math.abs(event.year)} B.C.` : event.year) : '????'}
          </span>
        </div>
      </div>
    </div>
  );
}
