"use client";

import InstallPrompt from "./InstallPrompt";

export default function Home() {
  return (
    <main className="min-h-screen p-4">
      <h1 className="text-2xl font-bold mb-4">PWA Tutorial App</h1>
      <p className="mb-4">
        このアプリはPWAの機能をデモンストレーションするためのサンプルアプリケーションです。
      </p>
      <InstallPrompt />
    </main>
  );
}
