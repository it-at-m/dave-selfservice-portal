import { computed } from "vue";
import { useDisplay } from "vuetify";

export function useDaveUtils() {
  const display = useDisplay();

  /**
   * Liefert die Höhe der AppBar (50px) in "vh" (Höhe Viewport in Hundert)
   */
  const appBarHeight = computed(() => {
    return pxToVh(50);
  });
  /**
   * Liefert die Höhe der Tabs (60px) in "vh" (Höhe Viewport in Hundert)
   */
  const tabHeight = computed(() => {
    return pxToVh(60);
  });

  /**
   * Berechnet die Höhe des CardTitles (47px) in "vh" (Höhe Viewport in Hundert)
   */
  const cardtitleHeight = computed(() => {
    return pxToVh(49);
  });
  /**
   * Berechnet die Höhe der CardActions (52px) in "vh" (Höhe Viewport in Hundert)
   */
  const cardactionHeight = computed(() => {
    return pxToVh(52);
  });
  /**
   * Berechnet die Höhe des Filters einer Datentabelle (64px) in "vh" (Höhe Viewport in Hundert)
   */
  const datatableFilterHeight = computed(() => {
    return pxToVh(64);
  });

  function pxToVh(pixel: number): number {
    return (pixel / display.height.value) * 100;
  }

  return {
    pxToVh,
    appBarHeight,
    tabHeight,
    cardtitleHeight,
    cardactionHeight,
    datatableFilterHeight,
  };
}
