export const theme = {
  colors: {
    primary: {
      light: '#ff4d4d',
      main: '#ff0000',
      dark: '#cc0000',
    },
    background: {
      dark: '#000000',
      main: '#111111',
      light: '#222222',
    },
    text: {
      primary: '#ffffff',
      secondary: '#cccccc',
      muted: '#999999',
    },
    gradient: {
      primary: 'linear-gradient(45deg, #ff0000, #ff4d4d)',
      hover: 'linear-gradient(45deg, #cc0000, #ff0000)',
      background: 'linear-gradient(to bottom, rgba(255, 0, 0, 0.1), rgba(0, 0, 0, 0))',
    },
  },
  animation: {
    timing: {
      fast: '0.2s',
      normal: '0.3s',
      slow: '0.5s',
    },
    easing: {
      smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },
  effects: {
    glow: '0 0 20px rgba(255, 0, 0, 0.5)',
    hover: '0 0 30px rgba(255, 0, 0, 0.7)',
  },
};
