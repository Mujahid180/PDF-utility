"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X } from 'lucide-react';

interface SortablePageProps {
    id: string;
    index: number;
    imageUrl: string;
    pageNumber: number;
    onRemove: (id: string) => void;
}

export function SortablePage({ id, index, imageUrl, pageNumber, onRemove }: SortablePageProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging
    } = useSortable({ id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="relative group">
            <Card className="overflow-hidden cursor-grab active:cursor-grabbing border-2 hover:border-primary transition-colors">
                <div {...attributes} {...listeners} className="relative aspect-[1/1.4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={imageUrl}
                        alt={`Page ${pageNumber}`}
                        className="w-full h-full object-contain bg-slate-100 dark:bg-slate-900"
                    />
                    <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
                        Page {pageNumber}
                    </div>
                </div>
            </Card>

            <Button
                variant="destructive"
                size="icon"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => {
                    e.stopPropagation(); // Prevent drag start
                    onRemove(id);
                }}
                aria-label="Remove page"
            >
                <X className="h-3 w-3" />
            </Button>
        </div>
    );
}
