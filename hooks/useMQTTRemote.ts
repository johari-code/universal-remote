import { useEffect, useRef, useState, useCallback } from "react";
import mqtt, { MqttClient } from "mqtt";
import { toast } from "sonner";

const MQTT_BROKER = process.env.NEXT_PUBLIC_MQTT_BROKER!;
const MQTT_USER = process.env.NEXT_PUBLIC_MQTT_USER!;
const MQTT_PASS = process.env.NEXT_PUBLIC_MQTT_PASS!;

const DEVICE_TIMEOUT_MS = 15000;
const LEARN_TIMEOUT_MS = 35000;

type DeviceStatus = "online" | "offline" | "unknown";

interface MQTTState {
  isConnected: boolean;
  isLearning: boolean;
  deviceStatus: DeviceStatus;
  lastHeartbeat: Date | null;
}

export function useMQTTRemote(deviceId: string = "ESP32_IR_001") {
  const clientRef = useRef<MqttClient | null>(null);
  const [state, setState] = useState<MQTTState>({
    isConnected: false,
    isLearning: false,
    deviceStatus: "unknown",
    lastHeartbeat: null,
  });

  const learningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const deviceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const topics = {
    status: `ir/device/${deviceId}/status`,
    send: `ir/device/${deviceId}/send`,
    learn: `ir/device/${deviceId}/learn`,
    learned: `ir/device/${deviceId}/learned`,
    sent: `ir/device/${deviceId}/sent`,
    error: `ir/device/${deviceId}/error`,
  };

  const handleMessage = useCallback(
    (
      topic: string,
      message: { status?: string; learning?: boolean; hexCode?: string; error?: string },
    ) => {
      if (topic === topics.status) {
        if (deviceTimeoutRef.current) clearTimeout(deviceTimeoutRef.current);

        setState((prev) => ({
          ...prev,
          deviceStatus: message.status === "online" ? "online" : "offline",
          isLearning: message.learning || false,
          lastHeartbeat: new Date(),
        }));

        // Heartbeat is published every 5s; allow ~3 missed beats before flagging offline.
        deviceTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, deviceStatus: "offline" }));
          toast.error("ESP32 connection lost");
        }, DEVICE_TIMEOUT_MS);
      } else if (topic === topics.learned) {
        setState((prev) => ({ ...prev, isLearning: false }));
        if (learningTimeoutRef.current) {
          clearTimeout(learningTimeoutRef.current);
          learningTimeoutRef.current = null;
        }
        toast.success("IR code captured", { description: `Code: ${message.hexCode}` });
      } else if (topic === topics.error) {
        toast.error(message.error || "Device error");
        if (message.error === "Learning timeout") {
          setState((prev) => ({ ...prev, isLearning: false }));
          if (learningTimeoutRef.current) {
            clearTimeout(learningTimeoutRef.current);
            learningTimeoutRef.current = null;
          }
        }
      }
    },
    [topics.status, topics.learned, topics.error],
  );

  const connect = useCallback(() => {
    if (clientRef.current?.connected) return;

    const client = mqtt.connect(MQTT_BROKER, {
      username: MQTT_USER,
      password: MQTT_PASS,
      reconnectPeriod: 1000,
      connectTimeout: 30 * 1000,
      clientId: `web_${Math.random().toString(36).substring(7)}`,
      keepalive: 10,
    });

    client.on("connect", () => {
      setState((prev) => ({ ...prev, isConnected: true }));
      client.subscribe([topics.status, topics.learned, topics.sent, topics.error]);
    });

    client.on("message", (topic, payload) => {
      try {
        handleMessage(topic, JSON.parse(payload.toString()));
      } catch {
        // non-JSON payload: ignore
      }
    });

    client.on("error", () => {
      toast.error("Connection error");
    });

    client.on("close", () => {
      setState((prev) => ({ ...prev, isConnected: false, deviceStatus: "unknown" }));
    });

    clientRef.current = client;
  }, [handleMessage, topics.status, topics.learned, topics.sent, topics.error]);

  const sendCommand = useCallback(
    (hexCode: string, protocol: string = "NEC") => {
      if (!clientRef.current?.connected) {
        toast.error("Not connected to MQTT");
        return false;
      }
      if (state.deviceStatus !== "online") {
        toast.error("ESP32 device is offline", {
          description: "Check that the device is powered and connected to Wi-Fi",
        });
        return false;
      }

      const message = JSON.stringify({ hexCode, protocol, timestamp: Date.now() });

      clientRef.current.publish(topics.send, message, { qos: 1 }, (err) => {
        if (err) toast.error("Failed to send command");
      });
      return true;
    },
    [state.deviceStatus, topics.send],
  );

  const startLearning = useCallback(
    (buttonId: string, remoteId: string) => {
      if (!clientRef.current?.connected) {
        toast.error("Not connected to MQTT");
        return false;
      }
      if (state.deviceStatus !== "online") {
        toast.error("ESP32 device is offline", { description: "Power on the device" });
        return false;
      }

      if (learningTimeoutRef.current) clearTimeout(learningTimeoutRef.current);

      const message = JSON.stringify({ buttonId, remoteId, timestamp: Date.now() });

      clientRef.current.publish(topics.learn, message, { qos: 1 }, (err) => {
        if (err) {
          toast.error("Failed to start learning");
          return;
        }
        setState((prev) => ({ ...prev, isLearning: true }));
        toast.info("Press the button on your physical remote now…", { duration: 10000 });

        learningTimeoutRef.current = setTimeout(() => {
          setState((prev) => ({ ...prev, isLearning: false }));
          toast.error("Learning timeout — no IR signal received");
        }, LEARN_TIMEOUT_MS);
      });
      return true;
    },
    [state.deviceStatus, topics.learn],
  );

  const stopLearning = useCallback(() => {
    if (!clientRef.current?.connected) return;

    if (learningTimeoutRef.current) {
      clearTimeout(learningTimeoutRef.current);
      learningTimeoutRef.current = null;
    }

    clientRef.current.publish(`${topics.learn}/stop`, "{}", { qos: 1 });
    setState((prev) => ({ ...prev, isLearning: false }));
  }, [topics.learn]);

  const disconnect = useCallback(() => {
    if (learningTimeoutRef.current) {
      clearTimeout(learningTimeoutRef.current);
      learningTimeoutRef.current = null;
    }
    if (deviceTimeoutRef.current) {
      clearTimeout(deviceTimeoutRef.current);
      deviceTimeoutRef.current = null;
    }
    if (clientRef.current) {
      clientRef.current.end();
      clientRef.current = null;
      setState({
        isConnected: false,
        isLearning: false,
        deviceStatus: "unknown",
        lastHeartbeat: null,
      });
    }
  }, []);

  useEffect(() => {
    connect();
    return () => disconnect();
  }, [connect, disconnect]);

  return {
    isConnected: state.isConnected,
    deviceStatus: state.deviceStatus,
    isLearning: state.isLearning,
    sendCommand,
    startLearning,
    stopLearning,
    reconnect: connect,
  };
}
