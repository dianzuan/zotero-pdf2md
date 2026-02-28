import { getString, initLocale } from "./utils/locale";
import { createZToolkit } from "./utils/ztoolkit";
import { registerMenu } from "./modules/menu";
import { BackendRegistry } from "./backends/base";
import { glmOcrBackend } from "./backends/glmOcr";

const registry = new BackendRegistry();
registry.register(glmOcrBackend);

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

  // Get backend and API key from preferences
  const backendName =
    (Zotero.Prefs.get(
      `${addon.data.config.prefsPrefix}.backend`,
    ) as string) || "glm-ocr";
  const apiKey =
    (Zotero.Prefs.get(
      `${addon.data.config.prefsPrefix}.apiKey`,
    ) as string) || "";

  const backend = registry.get(backendName);
  if (!backend) {
    new ztoolkit.ProgressWindow(addon.data.config.addonName, {
      closeOnClick: true,
      closeTime: 3000,
    })
      .createLine({ text: getString("convert-no-backend"), type: "default" })
      .show();
    return;
  }

  // Show progress
  const pw = new ztoolkit.ProgressWindow(addon.data.config.addonName, {
    closeOnClick: true,
    closeTime: -1,
  });
  pw.createLine({
    text: getString("convert-progress"),
    type: "default",
    progress: 0,
  });
  pw.show();

  try {
    for (let i = 0; i < pdfPaths.length; i++) {
      const result = await backend.convert(pdfPaths[i], { apiKey });

      // For now, write MD to a file next to the PDF (Step 6 will use Zotero attachments)
      const mdPath = pdfPaths[i].replace(/\.pdf$/i, ".md");
      const encoder = new TextEncoder();
      await IOUtils.write(mdPath, encoder.encode(result.markdown));

      pw.changeLine({
        text: `${i + 1}/${pdfPaths.length} ${getString("convert-done")}`,
        type: "default",
        progress: Math.round(((i + 1) / pdfPaths.length) * 100),
      });
    }
  } catch (err) {
    pw.changeLine({
      text: `${getString("convert-error")}: ${err instanceof Error ? err.message : String(err)}`,
      type: "default",
      progress: 0,
    });
    pw.startCloseTimer(8000);
    return;
  }

  pw.startCloseTimer(5000);
}

export default {
  onStartup,
  onShutdown,
  onMainWindowLoad,
  onMainWindowUnload,
  onConvertPdf,
};
