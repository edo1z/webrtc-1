const startCallButton: HTMLButtonElement = document.getElementById(
  "startCall"
) as HTMLButtonElement;
const localAudio: HTMLAudioElement = document.getElementById(
  "localAudio"
) as HTMLAudioElement;
const remoteAudio: HTMLAudioElement = document.getElementById(
  "remoteAudio"
) as HTMLAudioElement;

startCallButton.addEventListener("click", async () => {
  startCallButton.disabled = true;

  const localConnection = new RTCPeerConnection();
  const remoteConnection = new RTCPeerConnection();

  localConnection.onicecandidate = async (event: RTCPeerConnectionIceEvent) => {
    if (event.candidate) {
      await remoteConnection.addIceCandidate(event.candidate);
    }
  };

  remoteConnection.onicecandidate = async (
    event: RTCPeerConnectionIceEvent
  ) => {
    if (event.candidate) {
      await localConnection.addIceCandidate(event.candidate);
    }
  };

  remoteConnection.ontrack = (event: RTCTrackEvent) => {
    remoteAudio.srcObject = event.streams[0];
  };

  try {
    const localStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    localAudio.srcObject = localStream;

    localStream.getTracks().forEach((track: MediaStreamTrack) => {
      localConnection.addTrack(track, localStream);
    });

    const offer = await localConnection.createOffer();
    await localConnection.setLocalDescription(offer);
    await remoteConnection.setRemoteDescription(offer);

    const answer = await remoteConnection.createAnswer();
    await remoteConnection.setLocalDescription(answer);
    await localConnection.setRemoteDescription(answer);
  } catch (error) {
    console.error("Error:", error);
  }
});
