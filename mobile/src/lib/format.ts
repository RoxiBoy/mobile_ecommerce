export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount || 0);

export const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleString("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  });
