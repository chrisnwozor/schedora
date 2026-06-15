export function formatMoneyFromCents(cents: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(cents / 100);
}

export function formatTime(time: string) {
  const [hour, minute] = time.split(":").map(Number);

  const date = new Date();
  date.setHours(hour, minute, 0, 0);

  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

export function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}
