export const sendNotificationOfStockPriceChange = async (
  subscription: PushSubscription,
  name: string,
  targetPrice: number,
) => {
  try {
    await fetch("/api/notification", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({
        subscription,
        text: `${name} has reached target value of ${targetPrice}`,
      }),
      signal: AbortSignal.timeout(10000),
    });
  } catch (err) {
    if (err instanceof Error) {
      console.error("Error sending notification:", err);
      alert("An error happened.");
    }
  }
};
