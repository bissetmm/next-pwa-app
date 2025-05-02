"use client";

import { useEffect, useState } from "react";
import { subscribeUser, unsubscribeUser, sendNotification } from "./actions";

const isIos = () => {
  return (
    typeof window !== "undefined" &&
    /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase())
  );
};

interface NavigatorWithStandalone extends Navigator {
  standalone?: boolean;
}

const isInStandaloneMode = () => {
  return (
    typeof window !== "undefined" &&
    "standalone" in window.navigator &&
    (window.navigator as NavigatorWithStandalone).standalone
  );
};

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function InstallPrompt() {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isSupported, setIsSupported] = useState(false);
  const [subscription, setSubscription] = useState<PushSubscription | null>(
    null
  );
  const [message, setMessage] = useState("");
  const [showNotificationPrompt, setShowNotificationPrompt] = useState(false);

  useEffect(() => {
    if (isIos() && !isInStandaloneMode()) {
      setShowInstallPrompt(true);
    }
    setIsSupported("serviceWorker" in navigator && "PushManager" in window);
  }, []);

  const handleSubscribe = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!
        ),
      });
      await subscribeUser(subscription);
      setSubscription(subscription);
      setShowNotificationPrompt(false);
    } catch (error) {
      console.error("Failed to subscribe:", error);
    }
  };

  const handleUnsubscribe = async () => {
    if (subscription) {
      await subscription.unsubscribe();
      await unsubscribeUser(subscription);
      setSubscription(null);
    }
  };

  const handleSendNotification = async () => {
    if (subscription) {
      await sendNotification(subscription, message);
      setMessage("");
    }
  };

  return (
    <>
      {showInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-blue-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
          <span>
            このアプリをホーム画面に追加するには、 Safariの{" "}
            <strong className="underline">共有メニュー</strong> から
            「ホーム画面に追加」を選んでください。
          </span>
          <button
            className="ml-4 bg-white text-blue-600 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
            onClick={() => setShowInstallPrompt(false)}
          >
            閉じる
          </button>
        </div>
      )}

      {isSupported && !subscription && !showNotificationPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg flex items-center justify-between">
          <span>プッシュ通知を有効にして、最新情報を受け取りましょう</span>
          <button
            className="ml-4 bg-white text-green-600 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
            onClick={() => setShowNotificationPrompt(true)}
          >
            通知を有効にする
          </button>
        </div>
      )}

      {showNotificationPrompt && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-3">
            <span>プッシュ通知の設定</span>
            <div className="flex space-x-2">
              <button
                className="bg-white text-green-600 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
                onClick={handleSubscribe}
              >
                通知を購読
              </button>
              <button
                className="bg-gray-200 text-gray-600 rounded px-3 py-1 hover:bg-gray-300 transition-colors"
                onClick={() => setShowNotificationPrompt(false)}
              >
                後で
              </button>
            </div>
          </div>
        </div>
      )}

      {subscription && (
        <div className="fixed bottom-4 left-4 right-4 z-50 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg">
          <div className="flex flex-col space-y-3">
            <div className="flex items-center justify-between">
              <span>プッシュ通知が有効です</span>
              <button
                className="bg-white text-green-600 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
                onClick={handleUnsubscribe}
              >
                通知を無効にする
              </button>
            </div>
            <div className="flex space-x-2">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="通知メッセージ"
                className="flex-1 px-3 py-1 rounded text-gray-900"
              />
              <button
                className="bg-white text-green-600 rounded px-3 py-1 hover:bg-gray-100 transition-colors"
                onClick={handleSendNotification}
                disabled={!message.trim()}
              >
                送信
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
