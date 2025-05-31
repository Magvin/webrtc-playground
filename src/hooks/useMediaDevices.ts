import { useState, useEffect, useMemo } from 'react';

export const useMediaDevices = () => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const deviceList = await navigator.mediaDevices.enumerateDevices();
        setDevices(deviceList);
      } catch (error) {
        console.error('Failed to enumerate devices:', error);
      }
    };

    getDevices();

    navigator.mediaDevices.addEventListener('devicechange', getDevices);
    return () =>
      navigator.mediaDevices.removeEventListener('devicechange', getDevices);
  }, []);

  const audioDevices = useMemo(
    () => devices.filter(device => device.kind === 'audioinput'),
    [devices]
  );

  const videoDevices = useMemo(
    () => devices.filter(device => device.kind === 'videoinput'),
    [devices]
  );

  const audioOutputDevices = useMemo(
    () => devices.filter(device => device.kind === 'audiooutput'),
    [devices]
  );

  return {
    devices,
    audioDevices,
    videoDevices,
    audioOutputDevices,
  };
};
