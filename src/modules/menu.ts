import { config } from "../../package.json";
import { getString } from "../utils/locale";

export function registerMenu() {
  const doc = Zotero.getMainWindow()?.document;
  if (!doc) return;

  const menuPopup = doc.querySelector(
    "#zotero-itemmenu",
  ) as XUL.MenuPopup | null;
  if (!menuPopup) return;

  ztoolkit.UI.createElement(doc, "menuitem", {
    id: `${config.addonRef}-convert-menu`,
    attributes: {
      label: getString("menu-convert"),
    },
    listeners: [
      {
        type: "command",
        listener: () => {
          addon.hooks.onConvertPdf();
        },
      },
    ],
  });

  menuPopup.appendChild(
    doc.getElementById(`${config.addonRef}-convert-menu`)!,
  );
}
