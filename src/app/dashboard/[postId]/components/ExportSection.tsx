"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function ExportSection({
  postId,
  status,
  hasPhotos,
}: {
  postId: string;
  status: string;
  hasPhotos: boolean;
}) {
  const canExport = status === "generated" || status === "exported";

  if (!canExport) return null;

  const handleMarkdownExport = () => {
    window.open(`/api/posts/${postId}/export/markdown`, "_blank");
  };

  const handlePhotosExport = () => {
    window.open(`/api/posts/${postId}/export/photos-zip`, "_blank");
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm">내보내기</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-3">
          <Button size="sm" variant="outline" onClick={handleMarkdownExport}>
            Markdown 다운로드
          </Button>
          {hasPhotos && (
            <Button size="sm" variant="outline" onClick={handlePhotosExport}>
              사진 ZIP 다운로드
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
