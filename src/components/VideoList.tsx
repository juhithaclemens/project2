import VideoCard from "./VideoCard";

interface Props {
  videos: any[];
}

export default function VideoList({ videos }: Props) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
      {videos.map((video) => (
        <VideoCard key={video.videoId} video={video} />
      ))}
    </div>
  );
}
