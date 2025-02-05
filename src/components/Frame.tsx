"use client";

import { useEffect, useCallback, useState } from "react";
import sdk, {
  AddFrame,
  SignIn as SignInCore,
  type Context,
} from "@farcaster/frame-sdk";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { config } from "~/components/providers/WagmiProvider";
import { truncateAddress } from "~/lib/truncateAddress";
import { base, optimism } from "wagmi/chains";
import { useSession } from "next-auth/react";
import { createStore } from "mipd";
import { Label } from "~/components/ui/label";
import { PROJECT_TITLE } from "~/lib/constants";

function FlarbCard({ count, target, onIncrement, hasWon, onShare }: {
  count: number;
  target: number;
  onIncrement: () => void;
  hasWon: boolean;
  onShare: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-center">Flarb Counter</CardTitle>
        <CardDescription className="text-center">
          Tap to Flarb! Goal: {target}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col items-center gap-4">
        <Badge variant="outline" className="text-2xl">
          Count: {count}
        </Badge>

        {!hasWon ? (
          <Button onClick={onIncrement} className="w-full">
            Flarb!
          </Button>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="text-green-500 text-xl">🎉 You did it! 🎉</div>
            <Button onClick={onShare} className="w-full">
              Share Results
            </Button>
            <Button variant="outline" onClick={onIncrement}>
              Play Again
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function Frame() {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);
  const [context, setContext] = useState<Context.FrameContext>();
  const [count, setCount] = useState(0);
  const [target, setTarget] = useState(0);
  const [hasWon, setHasWon] = useState(false);

  // Initialize game
  useEffect(() => {
    const newTarget = Math.floor(Math.random() * 15) + 5; // Random target between 5-20
    setTarget(newTarget);
    setCount(0);
    setHasWon(false);
  }, []);

  // Check win condition
  useEffect(() => {
    if (count >= target) {
      setHasWon(true);
    }
  }, [count, target]);

  const handleIncrement = useCallback(() => {
    if (hasWon) {
      // Reset game
      const newTarget = Math.floor(Math.random() * 15) + 5;
      setTarget(newTarget);
      setCount(0);
      setHasWon(false);
    } else {
      setCount(prev => prev + 1);
    }
  }, [hasWon]);

  const handleShare = useCallback(async () => {
    try {
      // Corrected SDK action name from shareResults to share
      await sdk.actions.share({
        text: `I Flarbed ${count} times and hit the target of ${target}! Can you Flarb better?`,
      });
    } catch (error) {
      console.error('Share failed:', error);
    }
  }, [count, target]);

  useEffect(() => {
    const load = async () => {
      const context = await sdk.context;
      if (!context) return;

      setContext(context);
      sdk.actions.ready({});
    };

    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
      return () => sdk.removeAllListeners();
    }
  }, [isSDKLoaded]);

  if (!isSDKLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div style={{
      paddingTop: context?.client.safeAreaInsets?.top ?? 0,
      paddingBottom: context?.client.safeAreaInsets?.bottom ?? 0,
      paddingLeft: context?.client.safeAreaInsets?.left ?? 0,
      paddingRight: context?.client.safeAreaInsets?.right ?? 0,
    }}>
      <div className="w-[300px] mx-auto py-2 px-2">
        <h1 className="text-2xl font-bold text-center mb-4 text-neutral-900">
          {PROJECT_TITLE}
        </h1>
        <FlarbCard
          count={count}
          target={target}
          onIncrement={handleIncrement}
          hasWon={hasWon}
          onShare={handleShare}
        />
      </div>
    </div>
  );
}
