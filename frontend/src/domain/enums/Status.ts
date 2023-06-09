import IconOptions from "@/components/icons/IconOptions";

enum Status {
    /**
     * Angelegt
     */
    CREATED = "CREATED",

    /**
     * Beauftragt
     */
    INSTRUCTED = "INSTRUCTED",

    /**
     * Wird Gezählt
     */
    COUNTING = "COUNTING",

    /**
     * Abgeschlossen
     */
    ACCOMPLISHED = "ACCOMPLISHED",

    /**
     * Korrektur
     */
    CORRECTION = "CORRECTION",

    /**
     * Aktiv/Freigegeben
     */
    ACTIVE = "ACTIVE",

    /**
     * Nicht Freigegeben
     */
    INACTIVE = "INACTIVE",
}

export default Status;

export const statusIcon = new Map<string, IconOptions>([
    [
        Status.CREATED,
        {
            iconPath: "mdi-calendar-edit",
            color: "blue lighten-4",
            tooltip: "Geplant",
        },
    ],
    [
        Status.INSTRUCTED,
        {
            iconPath: "mdi-calendar-account",
            color: "purple lighten-4",
            tooltip: "Beauftragt",
        },
    ],
    [
        Status.COUNTING,
        {
            iconPath: "mdi-calendar-search",
            color: "amber lighten-4",
            tooltip: "Wird durchgeführt",
        },
    ],
    [
        Status.CORRECTION,
        {
            iconPath: "mdi-calendar-alert",
            color: "red lighten-4",
            tooltip: "Korrektur",
        },
    ],
    [
        Status.ACTIVE,
        {
            iconPath: "mdi-calendar-check",
            color: "green lighten-4",
            tooltip: "Freigegeben",
        },
    ],
    [
        Status.ACCOMPLISHED,
        {
            iconPath: "mdi-calendar-remove",
            color: "grey lighten-4",
            tooltip: "Abgeschlossen",
        },
    ],
]);
