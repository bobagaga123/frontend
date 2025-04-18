import { useEffect, useRef, useCallback } from 'react';

const useWebSocket = (url, onMessage) => {
  const ws = useRef(null);

  const connect = useCallback(() => {
    ws.current = new WebSocket(url);

    ws.current.onopen = () => {
      console.log('WebSocket соединение установлено');
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      onMessage(data);
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket ошибка:', error);
    };

    ws.current.onclose = () => {
      console.log('WebSocket соединение закрыто');
    };

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [url, onMessage]);

  const sendMessage = useCallback((message) => {
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    }
  }, []);

  const closeConnection = useCallback(() => {
    if (ws.current) {
      ws.current.close();
    }
  }, []);

  return {
    connect,
    sendMessage,
    closeConnection
  };
};

export default useWebSocket; 