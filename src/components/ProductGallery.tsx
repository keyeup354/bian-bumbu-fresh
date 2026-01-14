import { useState } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, Volume2, VolumeX } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ProductGalleryProps {
  images: string[];
  productName: string;
  mediaUrls?: string[];
}

const ProductGallery = ({ images, productName, mediaUrls = [] }: ProductGalleryProps) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(true);

  // Combine images and media URLs, filtering out duplicates
  const allMedia = [...images];
  if (mediaUrls && mediaUrls.length > 0) {
    mediaUrls.forEach(url => {
      if (!allMedia.includes(url)) {
        allMedia.push(url);
      }
    });
  }

  const handlePrevious = () => {
    setSelectedIndex((prev) => (prev === 0 ? allMedia.length - 1 : prev - 1));
    setIsVideoPlaying(false);
  };

  const handleNext = () => {
    setSelectedIndex((prev) => (prev === allMedia.length - 1 ? 0 : prev + 1));
    setIsVideoPlaying(false);
  };

  const isVideoUrl = (url: string) => {
    const videoExtensions = ['.mp4', '.webm', '.mov', '.avi', '.mkv'];
    return videoExtensions.some(ext => url.toLowerCase().includes(ext));
  };

  const toggleVideoPlay = () => {
    const video = document.getElementById('gallery-video') as HTMLVideoElement;
    if (video) {
      if (isVideoPlaying) {
        video.pause();
      } else {
        video.play();
      }
      setIsVideoPlaying(!isVideoPlaying);
    }
  };

  const toggleVideoMute = () => {
    const video = document.getElementById('gallery-video') as HTMLVideoElement;
    if (video) {
      video.muted = !isVideoMuted;
      setIsVideoMuted(!isVideoMuted);
    }
  };

  if (!allMedia || allMedia.length === 0) {
    return null;
  }

  const currentMedia = allMedia[selectedIndex];
  const isCurrentVideo = isVideoUrl(currentMedia);

  return (
    <div className="space-y-4">
      {/* Main Image/Video */}
      <div className="relative aspect-square rounded-2xl overflow-hidden bg-card border border-border group">
        {isCurrentVideo ? (
          <>
            <video
              id="gallery-video"
              src={currentMedia}
              className="w-full h-full object-cover"
              loop
              muted={isVideoMuted}
              playsInline
              onClick={toggleVideoPlay}
            />
            {/* Video Controls */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm"
                onClick={toggleVideoPlay}
              >
                {isVideoPlaying ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
              </Button>
              <Button
                variant="secondary"
                size="icon"
                className="rounded-full bg-background/80 backdrop-blur-sm"
                onClick={toggleVideoMute}
              >
                {isVideoMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </Button>
            </div>
          </>
        ) : (
          <img
            src={currentMedia}
            alt={`${productName} - Foto ${selectedIndex + 1}`}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        )}
        
        {/* Navigation Arrows */}
        {allMedia.length > 1 && (
          <>
            <Button
              variant="secondary"
              size="icon"
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handlePrevious}
            >
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={handleNext}
            >
              <ChevronRight className="w-5 h-5" />
            </Button>
          </>
        )}

        {/* Media Counter */}
        <div className="absolute bottom-3 right-3 bg-foreground/70 text-background text-xs font-medium px-2 py-1 rounded-full backdrop-blur-sm">
          {selectedIndex + 1} / {allMedia.length}
        </div>
      </div>

      {/* Thumbnail Gallery */}
      {allMedia.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          {allMedia.map((media, index) => {
            const isVideo = isVideoUrl(media);
            return (
              <button
                key={index}
                onClick={() => {
                  setSelectedIndex(index);
                  setIsVideoPlaying(false);
                }}
                className={`relative flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all ${
                  selectedIndex === index
                    ? 'border-primary ring-2 ring-primary/30'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                {isVideo ? (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Play className="w-6 h-6 text-muted-foreground" />
                  </div>
                ) : (
                  <img
                    src={media}
                    alt={`${productName} - Thumbnail ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                )}
                {selectedIndex === index && (
                  <div className="absolute inset-0 bg-primary/10" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProductGallery;
