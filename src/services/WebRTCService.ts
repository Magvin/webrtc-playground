import * as MockRTC from 'mockrtc';
import { Dispatch } from 'react';
import { ActionTypes, CallAction, MockScenario } from '@/types/call';

export class WebRTCService {
  private mockRTC: MockRTC.MockRTC | null = null;
  private mockPeer: MockRTC.MockRTCPeer | null = null;
  private peerConnection: RTCPeerConnection | null = null;
  private currentScenario: MockScenario['type'] = 'basic';
  private retryTimeoutId: NodeJS.Timeout | null = null;
  private currentRetryAttempt: number = 0;
  private readonly maxRetryAttempts: number = 3;

  constructor(private dispatch: Dispatch<CallAction>) {}

  async initializeMockSession(): Promise<void> {
    try {
      this.mockRTC = MockRTC.getRemote({ recordMessages: true });
      await this.mockRTC.start();
      this.dispatch({ type: ActionTypes.UPDATE_CALL_STATUS, status: 'idle' });
    } catch (error) {
      this.dispatch({
        type: ActionTypes.ADD_ERROR,
        error: {
          message: 'Failed to initialize MockRTC',
          type: 'connection',
        },
      });
      throw error;
    }
  }

  async createCallSession(
    scenario: MockScenario['type'] = 'basic'
  ): Promise<void> {
    if (!this.mockRTC) {
      throw new Error('MockRTC not initialized');
    }

    this.currentScenario = scenario;

    this.dispatch({
      type: ActionTypes.UPDATE_CALL_STATUS,
      status: 'connecting',
    });

    try {
      this.mockPeer = await this.createMockPeer(scenario);
      await this.establishConnection();

      if (scenario === 'connection-drop') {
        setTimeout(() => {
          if (this.peerConnection) {
            this.peerConnection.getSenders().forEach(sender => {
              if (sender.track) {
                sender.track.stop();
              }
            });

            this.peerConnection.close();

            setTimeout(() => {
              this.cleanupStreams();
              this.handleConnectionDrop();
            }, 500);
          }
        }, 3000);
      }
    } catch (error) {
      this.dispatch({
        type: ActionTypes.ADD_ERROR,
        error: {
          message: 'Failed to create call session',
          type: 'connection',
        },
      });
      throw error;
    }
  }

  private async createMockPeer(
    scenario: MockScenario['type']
  ): Promise<MockRTC.MockRTCPeer> {
    if (!this.mockRTC) {
      throw new Error('MockRTC not initialized');
    }

    switch (scenario) {
      case 'basic':
        return this.mockRTC.buildPeer().waitForNextMessage().thenEcho();

      case 'poor-connection':
        return this.mockRTC
          .buildPeer()
          .sleep(2000)
          .waitForNextMessage()
          .thenEcho();

      case 'connection-drop':
        return this.mockRTC.buildPeer().waitForNextMessage().thenEcho();

      case 'screen-share':
        return this.mockRTC
          .buildPeer()
          .waitForChannel('screen-share')
          .thenPassThrough();

      default:
        return this.mockRTC.buildPeer().thenEcho();
    }
  }

  private async establishConnection(): Promise<void> {
    this.peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
      ],
    });

    this.dispatch({
      type: ActionTypes.SET_PEER_CONNECTION,
      peerConnection: this.peerConnection,
    });

    this.setupPeerConnectionEventHandlers();

    const localStream = await this.getUserMedia();
    this.dispatch({ type: ActionTypes.SET_LOCAL_STREAM, stream: localStream });

    localStream.getTracks().forEach(track => {
      this.peerConnection!.addTrack(track, localStream);
    });

    const offer = await this.peerConnection.createOffer();
    await this.peerConnection.setLocalDescription(offer);

    if (this.mockPeer) {
      const { answer } = await this.mockPeer.answerOffer(offer);
      await this.peerConnection.setRemoteDescription(answer);
    }
  }

  private setupPeerConnectionEventHandlers(): void {
    if (!this.peerConnection) return;

    this.peerConnection.ontrack = event => {
      const [remoteStream] = event.streams;
      this.dispatch({
        type: ActionTypes.SET_REMOTE_STREAM,
        stream: remoteStream,
      });
    };

    this.peerConnection.onconnectionstatechange = () => {
      const state = this.peerConnection!.connectionState;

      if (state === 'connected') {
        this.currentRetryAttempt = 0;
        this.dispatch({
          type: ActionTypes.RESET_RETRY_STATE,
        });
        this.dispatch({
          type: ActionTypes.UPDATE_CALL_STATUS,
          status: 'connected',
        });
      } else if (state === 'disconnected' || state === 'failed') {
        this.cleanupStreams();
        this.handleConnectionDrop();
      }
    };

    this.peerConnection.onicecandidate = event => {
      if (event.candidate) {
        /**
         * Handling ice candidate here
         */
      }
    };
  }

  private cleanupStreams(): void {
    if (!this.peerConnection) return;

    this.peerConnection.getSenders().forEach(sender => {
      if (sender.track) {
        sender.track.stop();
      }
    });
  }

  private handleConnectionDrop(): void {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    if (this.currentRetryAttempt >= this.maxRetryAttempts) {
      this.currentRetryAttempt = 0;
      this.dispatch({
        type: ActionTypes.UPDATE_CALL_STATUS,
        status: 'disconnected',
      });
      return;
    }

    this.currentRetryAttempt++;

    this.dispatch({
      type: ActionTypes.UPDATE_RETRY_STATE,
      retryState: {
        currentAttempt: this.currentRetryAttempt,
        isRetrying: true,
        countdown: 3,
      },
    });

    this.dispatch({
      type: ActionTypes.UPDATE_CALL_STATUS,
      status: 'retrying',
    });

    this.startRetryCountdown();
  }

  private startRetryCountdown(): void {
    const countdown = (remaining: number) => {
      this.dispatch({
        type: ActionTypes.UPDATE_RETRY_STATE,
        retryState: { countdown: remaining },
      });

      if (remaining > 0) {
        this.retryTimeoutId = setTimeout(() => countdown(remaining - 1), 1000);
      } else {
        this.attemptReconnection();
      }
    };

    countdown(3);
  }

  private async attemptReconnection(): Promise<void> {
    try {
      if (this.peerConnection) {
        this.peerConnection.close();
        this.peerConnection = null;
      }

      this.dispatch({
        type: ActionTypes.UPDATE_CALL_STATUS,
        status: 'connecting',
      });

      this.mockPeer = await this.createMockPeer(this.currentScenario);
      await this.establishConnection();
    } catch (error) {
      this.handleConnectionDrop();
    }
  }

  private async getUserMedia(): Promise<MediaStream> {
    this.dispatch({
      type: ActionTypes.UPDATE_CALL_STATUS,
      status: 'requesting-permissions',
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: true,
      });

      return stream;
    } catch (error) {
      let errorType: 'permissions' | 'device' | 'unknown' = 'unknown';
      let errorMessage = 'Failed to access camera/microphone';

      if (error instanceof Error) {
        if (error.name === 'NotAllowedError') {
          errorType = 'permissions';
          errorMessage = 'Camera/microphone access denied';
        } else if (error.name === 'NotFoundError') {
          errorType = 'device';
          errorMessage = 'No camera/microphone found';
        } else if (error.name === 'NotReadableError') {
          errorType = 'device';
          errorMessage = 'Camera/microphone already in use';
        }
      }

      this.dispatch({
        type: ActionTypes.ADD_ERROR,
        error: {
          message: errorMessage,
          type: errorType,
        },
      });
      throw error;
    }
  }

  toggleAudio(): void {
    if (!this.peerConnection) return;

    const audioTracks = this.peerConnection
      .getSenders()
      .map(sender => sender.track)
      .filter(
        (track): track is MediaStreamTrack =>
          track !== null && track.kind === 'audio'
      );

    audioTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    this.dispatch({ type: ActionTypes.TOGGLE_AUDIO });
  }

  toggleVideo(): void {
    if (!this.peerConnection) return;

    const videoTracks = this.peerConnection
      .getSenders()
      .map(sender => sender.track)
      .filter(
        (track): track is MediaStreamTrack =>
          track !== null && track.kind === 'video'
      );

    videoTracks.forEach(track => {
      track.enabled = !track.enabled;
    });

    this.dispatch({ type: ActionTypes.TOGGLE_VIDEO });
  }

  async switchCamera(): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        device => device.kind === 'videoinput'
      );

      if (videoDevices.length <= 1) return;

      const videoSender = this.peerConnection
        .getSenders()
        .find(sender => sender.track?.kind === 'video');

      if (!videoSender || !videoSender.track) return;

      const currentDeviceId = (
        videoSender.track as MediaStreamTrack
      ).getSettings?.().deviceId;
      const currentIndex = videoDevices.findIndex(
        device => device.deviceId === currentDeviceId
      );
      const nextIndex = (currentIndex + 1) % videoDevices.length;
      const nextDevice = videoDevices[nextIndex];

      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: nextDevice.deviceId },
        audio: false,
      });

      const [newVideoTrack] = newStream.getVideoTracks();
      await videoSender.replaceTrack(newVideoTrack);
    } catch (error) {
      /**
       * Camera switching error can be handled here if needed
       */
    }
  }

  async endCall(): Promise<void> {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
      this.retryTimeoutId = null;
    }

    this.currentRetryAttempt = 0;
    this.cleanupStreams();

    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }

    if (this.mockPeer) {
      this.mockPeer = null;
    }

    if (this.mockRTC) {
      await this.mockRTC.stop();
      this.mockRTC = null;
    }

    this.dispatch({ type: ActionTypes.RESET_RETRY_STATE });
    this.dispatch({ type: ActionTypes.END_CALL });
  }

  async updateMediaConstraints(
    constraints: MediaStreamConstraints
  ): Promise<void> {
    if (!this.peerConnection) return;

    try {
      const newStream = await navigator.mediaDevices.getUserMedia(constraints);

      const senders = this.peerConnection.getSenders();

      newStream.getTracks().forEach(newTrack => {
        const sender = senders.find(s => s.track?.kind === newTrack.kind);
        if (sender) {
          sender.replaceTrack(newTrack);
        }
      });

      this.dispatch({ type: ActionTypes.SET_LOCAL_STREAM, stream: newStream });
    } catch (error) {
      /**
       * Media constraints update error can be handled here if needed
       */
    }
  }
}
