let isEditing = false;
let siteDisabled = false;
let globalDisabled = false;

document.addEventListener("DOMContentLoaded", () => {
  const editBtn = document.getElementById("editModeBtn");
  const resetSiteBtn = document.getElementById("resetSiteBtn");
  const resetAllBtn = document.getElementById("resetAllBtn");
  const showRulesBtn = document.getElementById("showRulesBtn");
  const toggleSiteBtn = document.getElementById("toggleSiteBtn");
  const toggleGlobalBtn = document.getElementById("toggleGlobalBtn");

  if (!editBtn) {
    console.error("[Platon Cleaner] Bouton #editModeBtn introuvable dans la popup.");
    return;
  }

  function updateEditButton() {
    editBtn.textContent = isEditing
      ? "Désactiver le mode nettoyage"
      : "Activer le mode nettoyage";
  }

  function updateToggleButtons() {
    if (toggleSiteBtn) {
      toggleSiteBtn.textContent = siteDisabled
        ? "Réactiver sur ce site"
        : "Désactiver sur ce site";
    }

    if (toggleGlobalBtn) {
      toggleGlobalBtn.textContent = globalDisabled
        ? "Désactiver le mode avant / après global"
        : "Activer le mode avant / après global";
    }
  }

  function withActiveHttpTab(callback) {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (!tab || !tab.url) {
        console.warn("[Platon Cleaner] Aucun onglet actif trouvé.");
        return;
      }
      if (!tab.url.startsWith("http")) {
        console.warn("[Platon Cleaner] Onglet non compatible (URL =", tab.url, ")");
        return;
      }
      callback(tab);
    });
  }

  // Récupérer l'état initial (site/global) pour le texte des boutons
  withActiveHttpTab((tab) => {
    chrome.tabs.sendMessage(
      tab.id,
      { type: "GET_STATUS" },
      (response) => {
        if (chrome.runtime.lastError) {
          console.warn("[Platon Cleaner] Erreur GET_STATUS :", chrome.runtime.lastError.message);
          return;
        }
        if (!response || !response.ok) return;
        siteDisabled = !!response.siteDisabled;
        globalDisabled = !!response.globalDisabled;
        updateToggleButtons();
      }
    );
  });

  // 🔧 Mode édition
  editBtn.addEventListener("click", () => {
    isEditing = !isEditing;
    updateEditButton();

    withActiveHttpTab((tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "TOGGLE_EDIT_MODE", enabled: isEditing },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[Platon Cleaner] Erreur d’envoi (TOGGLE_EDIT_MODE) :",
              chrome.runtime.lastError.message
            );
            return;
          }
          console.log("[Platon Cleaner] Réponse TOGGLE_EDIT_MODE :", response);
        }
      );
    });
  });

  // 🔧 Désactiver / réactiver ce site (temporaire)
  toggleSiteBtn.addEventListener("click", () => {
    withActiveHttpTab((tab) => {
      const newValue = !siteDisabled;
      chrome.tabs.sendMessage(
        tab.id,
        { type: "TOGGLE_SITE_DISABLED", disabled: newValue },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[Platon Cleaner] Erreur TOGGLE_SITE_DISABLED :",
              chrome.runtime.lastError.message
            );
            return;
          }
          console.log("[Platon Cleaner] Réponse TOGGLE_SITE_DISABLED :", response);
          siteDisabled = newValue;
          updateToggleButtons();
        }
      );
    });
  });

  // 🔧 Mode avant / après global
  toggleGlobalBtn.addEventListener("click", () => {
    withActiveHttpTab((tab) => {
      const newValue = !globalDisabled;
      chrome.tabs.sendMessage(
        tab.id,
        { type: "TOGGLE_GLOBAL_DISABLED", disabled: newValue },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[Platon Cleaner] Erreur TOGGLE_GLOBAL_DISABLED :",
              chrome.runtime.lastError.message
            );
            return;
          }
          console.log("[Platon Cleaner] Réponse TOGGLE_GLOBAL_DISABLED :", response);
          globalDisabled = newValue;
          updateToggleButtons();
        }
      );
    });
  });

  // 🔧 Réinitialiser ce site
  resetSiteBtn.addEventListener("click", () => {
    withActiveHttpTab((tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "RESET_CURRENT_SITE" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[Platon Cleaner] Erreur d’envoi (RESET_CURRENT_SITE) :",
              chrome.runtime.lastError.message
            );
            return;
          }
          console.log("[Platon Cleaner] Réponse RESET_CURRENT_SITE :", response);
          alert("Le nettoyage a été réinitialisé pour ce site.");
        }
      );
    });
  });

  // 🔧 Tout réinitialiser
  resetAllBtn.addEventListener("click", () => {
    withActiveHttpTab((tab) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "RESET_ALL" },
        (response) => {
          if (chrome.runtime.lastError) {
            console.warn(
              "[Platon Cleaner] Erreur d’envoi (RESET_ALL) :",
              chrome.runtime.lastError.message
            );
            return;
          }
          console.log("[Platon Cleaner] Réponse RESET_ALL :", response);
          alert("Tous les nettoyages ont été réinitialisés.");
        }
      );
    });
  });

  // 🔧 Panneau de gestion → options.html
  if (showRulesBtn) {
    showRulesBtn.addEventListener("click", () => {
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        window.open(chrome.runtime.getURL("options.html"));
      }
    });
  }

  updateEditButton();
  updateToggleButtons();
});
