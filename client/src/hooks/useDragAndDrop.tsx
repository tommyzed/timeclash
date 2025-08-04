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

  const handleDragLeave = (e: React.DragEvent) => {
    // Only clear drop zones if we're leaving the entire drop area
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setDropZones({});
    }
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
