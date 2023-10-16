import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";

import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Hilfsplugin, für den Fall, dass die Marker-Icons fehlen
// https://vue2-leaflet.netlify.app/quickstart/#marker-icons-are-missing

Icon.Default.mergeOptions({
    iconRetinaUrl: iconRetinaUrl,
    iconUrl: iconUrl,
    shadowUrl: shadowUrl,
});

// Default-Icon
type D = Icon.Default & {
    _getIconUrl?: string;
};
delete (Icon.Default.prototype as D)._getIconUrl;
