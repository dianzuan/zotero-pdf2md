import { getString, initLocale } from "./utils/locale";
import { createZToolkit } from "./utils/ztoolkit";
import { registerMenu } from "./modules/menu";

async function onStartup() {
  await Promise.all([
    Zotero.initializationPromise,
    Zotero.unlockPromise,
    Zotero.uiReadyPromise,
  ]);

  initLocale();

  await Promise.all(
    Zotero.getMainWindows().map((win) => onMainWindowLoad(win)),
  );

  addon.data.initialized = true;
}

async function onMainWindowLoad(win: _ZoteroTypes.MainWindow): Promise<void> {
  addon.data.ztoolkit = createZToolkit();

  win.MozXULElement.insertFTLIfNeeded(
    `${addon.data.config.addonRef}-mainWindow.ftl`,
  );

  registerMenu();

  // Show a brief startup notification
  new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: 3000,
  })
    .createLine({
      text: getString("startup-finish"),
      type: "default",
      progress: 100,
    })
    .show();
}

async function onMainWindowUnload(_win: Window): Promise<void> {
  ztoolkit.unregisterAll();
}

function onShutdown(): void {
  ztoolkit.unregisterAll();
  addon.data.alive = false;
  // @ts-expect-error - Plugin instance is not typed
  delete Zotero[addon.data.config.addonInstance];
}

async function onConvertPdf(): Promise<void> {
  const zoteroPane = Zotero.getActiveZoteroPane();
  const selectedItems = zoteroPane.getSelectedItems();

  if (selectedItems.length === 0) {
    new ztoolkit.ProgressWindow(addon.data.config.addonName, {
      closeOnClick: true,
      closeTime: 3000,
    })
      .createLine({ text: getString("convert-no-selection"), type: "default" })
      .show();
    return;
  }

  // Only process regular items (not attachments/notes), find their child PDFs
  const pdfPaths: string[] = [];
  for (const item of selectedItems) {
    if (item.isAttachment() || item.isNote()) continue;
    const attachmentIds = item.getAttachments();
    for (const id of attachmentIds) {
      const att = Zotero.Items.get(id);
      if (att.isPDFAttachment()) {
        const path = await att.getFilePathAsync();
        if (path) pdfPaths.push(path);
      }
    }
  }

  if (pdfPaths.length === 0) {
    new ztoolkit.ProgressWindow(addon.data.config.addonName, {
      closeOnClick: true,
      closeTime: 3000,
    })
      .createLine({ text: getString("convert-no-pdf"), type: "default" })
      .show();
    return;
  }

  // Show found PDF paths (temporary, for Step 3 verification)
  const pw = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: 8000,
  });
  for (const p of pdfPaths) {
    pw.createLine({ text: p, type: "default" });
  }
  pw.show();
}

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onConvertPdf,
};
