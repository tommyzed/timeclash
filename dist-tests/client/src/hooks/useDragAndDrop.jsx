var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
import { useState } from "react";
export function useDragAndDrop(_a) {
    var onDrop = _a.onDrop;
    var _b = useState(null), draggedItem = _b[0], setDraggedItem = _b[1];
    var _c = useState({}), dropZones = _c[0], setDropZones = _c[1];
    var handleDragStart = function (eventId) {
        console.log('useDragAndDrop handleDragStart called with:', eventId);
        setDraggedItem(eventId);
    };
    var handleDragEnd = function () {
        setDraggedItem(null);
        setDropZones({});
    };
    var handleDragOver = function (e, position) {
        e.preventDefault();
        console.log('Drag over position:', position);
        setDropZones(function (prev) {
            var _a;
            return (__assign(__assign({}, prev), (_a = {}, _a[position] = true, _a)));
        });
    };
    var handleDragLeave = function (e) {
        // Only clear drop zones if we're leaving the entire drop area
        var rect = e.currentTarget.getBoundingClientRect();
        var x = e.clientX;
        var y = e.clientY;
        if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
            setDropZones({});
        }
    };
    var handleDrop = function (e, position) {
        e.preventDefault();
        console.log('Drop event triggered:', { draggedItem: draggedItem, position: position });
        if (draggedItem) {
            console.log('Calling onDrop with:', { eventId: draggedItem, position: position });
            onDrop(draggedItem, position);
        }
        else {
            console.log('No dragged item found');
        }
        handleDragEnd();
    };
    return {
        draggedItem: draggedItem,
        dropZones: dropZones,
        handleDragStart: handleDragStart,
        handleDragEnd: handleDragEnd,
        handleDragOver: handleDragOver,
        handleDragLeave: handleDragLeave,
        handleDrop: handleDrop
    };
}
