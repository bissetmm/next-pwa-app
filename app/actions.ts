"use server";

import webpush from "web-push";
import type { PushSubscription as WebPushSubscription } from "web-push";

// Validate VAPID keys
const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const vapidPrivateKey = process.env.VAPID_PRIVATE_KEY;

if (!vapidPublicKey || !vapidPrivateKey) {
  throw new Error(
    "VAPID keys are not properly configured. Please set VAPID_PUBLIC_KEY and VAPID_PRIVATE_KEY environment variables."
  );
}

webpush.setVapidDetails(
  "mailto:info@metier.co.jp",
  vapidPublicKey,
  vapidPrivateKey
);

function convertSubscription(
  subscription: PushSubscription
): WebPushSubscription {
  const p256dh = subscription.getKey("p256dh");
  const auth = subscription.getKey("auth");

  return {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: p256dh
        ? btoa(String.fromCharCode(...new Uint8Array(p256dh)))
        : "",
      auth: auth ? btoa(String.fromCharCode(...new Uint8Array(auth))) : "",
    },
  };
}

export async function subscribeUser(subscription: PushSubscription) {
  const webPushSubscription = convertSubscription(subscription);
  console.log("User subscribed:", webPushSubscription);
}

export async function unsubscribeUser(subscription: PushSubscription) {
  const webPushSubscription = convertSubscription(subscription);
  console.log("User unsubscribed:", webPushSubscription);
}

export async function sendNotification(
  subscription: PushSubscription,
  payload: string
) {
  try {
    const webPushSubscription = convertSubscription(subscription);
    await webpush.sendNotification(webPushSubscription, payload);
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}
