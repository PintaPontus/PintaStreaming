export interface PlayerEvent {
  type: "PLAYER_EVENT",
  event: PlayerEventData
}

export interface PlayerEventData {
  event: "play" | "pause" | "seeked" | "ended" | "timeupdate",
  currentTime: number,
  duration: number,
  video_id: number
}
