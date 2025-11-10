interface Props {
  video: {
    videoId: string;
    title: string;
    channel: string;
    thumbnail: string;
  };
}

export default function VideoCard({ video }: Props) {
  return (
    <div style={{ marginBottom: "1rem" }}>
      <a href={`https://www.youtube.com/watch?v=${video.videoId}`} target="_blank">
        <img src={video.thumbnail} alt={video.title} style={{ width: "300px" }} />
      </a>
      <h3>{video.title}</h3>
      <p>{video.channel}</p>
    </div>
  );
}
