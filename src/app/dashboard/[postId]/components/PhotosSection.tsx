"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type Photo = {
  id: string;
  originalFileName: string;
  storedFilePath: string;
  memo: string;
  sortOrder: number;
};

export function PhotosSection({
  postId,
  photos,
  onPhotosChange,
}: {
  postId: string;
  photos: Photo[];
  onPhotosChange: (photos: Photo[]) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;
    setUploading(true);

    const newPhotos = [...photos];
    for (const file of Array.from(e.target.files)) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("memo", "");
      const res = await fetch(`/api/posts/${postId}/photos`, {
        method: "POST",
        body: formData,
      });
      if (res.ok) {
        const { photo } = await res.json();
        newPhotos.push(photo);
      }
    }

    onPhotosChange(newPhotos);
    setUploading(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (index: number) => {
    if (dragIndex === null || dragIndex === index) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const reordered = [...photos];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);

    onPhotosChange(reordered);
    setDragIndex(null);
    setDragOverIndex(null);

    // Persist order to server
    await fetch(`/api/posts/${postId}/photos/order`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderedPhotoIds: reordered.map((p) => p.id) }),
    });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">사진 ({photos.length})</CardTitle>
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? "업로드 중..." : "+ 추가"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {photos.length === 0 ? (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[var(--border)] rounded-xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors"
          >
            <p className="text-sm text-[var(--text-muted)]">사진을 추가해보세요</p>
          </div>
        ) : (
          <>
            <p className="text-xs text-[var(--text-muted)] mb-2">드래그하여 순서를 변경할 수 있습니다.</p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {photos.map((photo, index) => (
                <div
                  key={photo.id}
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDrop={() => handleDrop(index)}
                  onDragEnd={() => { setDragIndex(null); setDragOverIndex(null); }}
                  className={`rounded-lg overflow-hidden border aspect-square cursor-grab active:cursor-grabbing transition-all ${
                    dragOverIndex === index
                      ? "border-[var(--accent)] scale-105"
                      : dragIndex === index
                        ? "opacity-50 border-[var(--border)]"
                        : "border-[var(--border)]"
                  }`}
                >
                  <img
                    src={photo.storedFilePath}
                    alt={photo.originalFileName}
                    className="w-full h-full object-cover pointer-events-none"
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
