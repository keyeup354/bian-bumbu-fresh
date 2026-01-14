import { useState, useRef } from 'react';
import { Upload, X, Image as ImageIcon, Video, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface MediaUploaderProps {
  productId: string;
  mediaUrls: string[];
  onMediaChange: (urls: string[]) => void;
}

const MediaUploader = ({ productId, mediaUrls, onMediaChange }: MediaUploaderProps) => {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    const newUrls: string[] = [];

    try {
      for (const file of Array.from(files)) {
        // Validate file type
        const isImage = file.type.startsWith('image/');
        const isVideo = file.type.startsWith('video/');
        
        if (!isImage && !isVideo) {
          toast.error(`File ${file.name} tidak didukung. Gunakan gambar atau video.`);
          continue;
        }

        // Validate file size (max 50MB for videos, 10MB for images)
        const maxSize = isVideo ? 50 * 1024 * 1024 : 10 * 1024 * 1024;
        if (file.size > maxSize) {
          toast.error(`File ${file.name} terlalu besar. Maksimal ${isVideo ? '50MB' : '10MB'}.`);
          continue;
        }

        // Generate unique filename
        const ext = file.name.split('.').pop();
        const fileName = `${productId}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${ext}`;

        // Upload to storage
        const { data, error } = await supabase.storage
          .from('product-media')
          .upload(fileName, file, {
            cacheControl: '3600',
            upsert: false
          });

        if (error) {
          console.error('Upload error:', error);
          toast.error(`Gagal mengupload ${file.name}`);
          continue;
        }

        // Get public URL
        const { data: urlData } = supabase.storage
          .from('product-media')
          .getPublicUrl(data.path);

        newUrls.push(urlData.publicUrl);
      }

      if (newUrls.length > 0) {
        const updatedUrls = [...mediaUrls, ...newUrls];
        onMediaChange(updatedUrls);
        toast.success(`${newUrls.length} file berhasil diupload`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Terjadi kesalahan saat upload');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveMedia = async (urlToRemove: string) => {
    try {
      // Extract path from URL
      const urlObj = new URL(urlToRemove);
      const pathParts = urlObj.pathname.split('/product-media/');
      if (pathParts.length > 1) {
        const filePath = pathParts[1];
        await supabase.storage
          .from('product-media')
          .remove([filePath]);
      }

      const updatedUrls = mediaUrls.filter(url => url !== urlToRemove);
      onMediaChange(updatedUrls);
      toast.success('Media berhasil dihapus');
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Gagal menghapus media');
    }
  };

  const isVideoUrl = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id={`media-upload-${productId}`}
        />
        <Button
          type="button"
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Mengupload...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              Upload Foto/Video
            </>
          )}
        </Button>
        <span className="text-sm text-muted-foreground">
          Gambar: max 10MB, Video: max 50MB
        </span>
      </div>

      {mediaUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaUrls.map((url, index) => (
            <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
              {isVideoUrl(url) ? (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                  <Video className="w-8 h-8 text-muted-foreground" />
                  <video src={url} className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              ) : (
                <img
                  src={url}
                  alt={`Media ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              )}
              <button
                type="button"
                onClick={() => handleRemoveMedia(url)}
                className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="absolute bottom-2 left-2 p-1 rounded-full bg-background/80">
                {isVideoUrl(url) ? (
                  <Video className="w-3 h-3" />
                ) : (
                  <ImageIcon className="w-3 h-3" />
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MediaUploader;
