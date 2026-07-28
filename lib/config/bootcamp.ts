function getTomorrowDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    weekday: "long",
  });
}

export const BOOTCAMP_CONFIG = {
  get date() {
    return getTomorrowDate();
  },
  time: "11:00 AM – 11:20 AM",
  venue: "CNM System Labs",
  format: "Small Group Workshop",
  duration: "20 Minutes"
};
