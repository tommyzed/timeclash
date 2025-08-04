import { useState } from "react";

interface UseDragAndDropProps {
  onDrop: (eventId: string, position: number) => void;
}

export function useDragAndDrop({ onDrop }: UseDragAndDropProps) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null);
  const [dropZones, setDropZones] = useState<Record<number, boolean>>({});

  const handleDragStart = (eventId: string) => {
    setDraggedItem(eventId);
  };

  const handleDragEnd = () => {
    setDraggedItem(null);
    setDropZones({});
  };

  const handleDragOver = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDropZones(prev => ({ ...prev, [position]: true }));
  };

  const handleDragLeave = () => {
    setDropZones({});
  };

  const handleDrop = (e: React.DragEvent, position: number) => {
    e.preventDefault();
    
    if (draggedItem) {
      onDrop(draggedItem, position);
    }
    
    handleDragEnd();
  };

  return {
    draggedItem,
    dropZones,
    handleDragStart,
    handleDragEnd,
    handleDragOver,
    handleDragLeave,
    handleDrop
  };
}
