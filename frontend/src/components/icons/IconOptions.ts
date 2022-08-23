export default class IconOptions {
  iconPath: string;
  tooltip: string;
  color: string | undefined;

  constructor(iconPath: string, tooltip: string, color?: string) {
    this.iconPath = iconPath;
    this.tooltip = tooltip;
    this.color = color;
  }
}