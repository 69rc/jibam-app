export const isMobileDevice = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
};

export const isAndroid = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  return /Android/i.test(ua);
};

export const isIOS = () => {
  const ua = navigator.userAgent || navigator.vendor || window.opera;
  // Also catches iPadOS 13+ which reports as MacIntel with touch support
  return /iPhone|iPad|iPod/i.test(ua) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
};

export const isStandaloneMode = () =>
  window.matchMedia('(display-mode: standalone)').matches ||
  window.navigator.standalone === true;
