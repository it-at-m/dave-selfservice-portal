import { Status } from "@/api/client";
import IconOptions from "@/components/icons/IconOptions";

export const statusIcon = new Map<string, IconOptions>([
  [
    Status.Created,
    {
      iconPath: "mdi-calendar-edit",
      color: "blue-lighten-4",
      tooltip: "Geplant",
    },
  ],
  [
    Status.Instructed,
    {
      iconPath: "mdi-calendar-account",
      color: "purple-lighten-4",
      tooltip: "Beauftragt",
    },
  ],
  [
    Status.Counting,
    {
      iconPath: "mdi-calendar-search",
      color: "amber-lighten-4",
      tooltip: "Wird durchgeführt",
    },
  ],
  [
    Status.Correction,
    {
      iconPath: "mdi-calendar-alert",
      color: "red-lighten-4",
      tooltip: "Korrektur",
    },
  ],
  [
    Status.Active,
    {
      iconPath: "mdi-calendar-check",
      color: "green-lighten-4",
      tooltip: "Freigegeben",
    },
  ],
  [
    Status.Accomplished,
    {
      iconPath: "mdi-calendar-remove",
      color: "grey-lighten-4",
      tooltip: "Abgeschlossen",
    },
  ],
]);
