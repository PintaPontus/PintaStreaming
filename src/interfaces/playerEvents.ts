export interface PlayerEvents {
  type: "PLAYER_EVENT",
  data: {
    event: "play" | "pause" | "seeked" | "ended" | "timeupdate",
    currentTime: number,
    duration: number,
    video_id: number
  }
}
