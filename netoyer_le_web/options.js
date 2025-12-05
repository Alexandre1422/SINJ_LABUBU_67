const STORAGE_KEY = "platonRules";

document.addEventListener("DOMContentLoaded", () => {
  const tbody = document.getElementById("rulesTbody");
  const table = document.getElementById("rulesTable");
  const emptyState = document.getElementById("emptyState");
  const resetAllBtn = document.getElementById("resetAll");

  function loadRules() {
    chrome.storage.local.get([STORAGE_KEY], (data) => {
      const rules = data[STORAGE_KEY] || {};
      const entries = Object.entries(rules);

      // On vide le tbody
      tbody.innerHTML = "";

      if (entries.length === 0) {
        table.style.display = "none";
        emptyState.style.display = "block";
        return;
      }

      table.style.display = "table";
      emptyState.style.display = "none";

      entries.forEach(([domain, selectors]) => {
        const tr = document.createElement("tr");

        const tdDomain = document.createElement("td");
        tdDomain.textContent = domain;

        const tdCount = document.createElement("td");
        tdCount.textContent = selectors.length + " élément(s)";

        const tdActions = document.createElement("td");
        const btnReset = document.createElement("button");
        btnReset.textContent = "Réinitialiser ce site";
        btnReset.addEventListener("click", () => {
          if (!confirm(`Supprimer toutes les règles pour ${domain} ?`)) return;

          chrome.storage.local.get([STORAGE_KEY], (data2) => {
            const rules2 = data2[STORAGE_KEY] || {};
            if (rules2[domain]) {
              delete rules2[domain];
              const obj = {};
              obj[STORAGE_KEY] = rules2;
              chrome.storage.local.set(obj, () => {
                loadRules();
              });
            }
          });
        });

        tdActions.appendChild(btnReset);
        tr.appendChild(tdDomain);
        tr.appendChild(tdCount);
        tr.appendChild(tdActions);
        tbody.appendChild(tr);
      });
    });
  }

  resetAllBtn.addEventListener("click", () => {
    if (!confirm("Tout réinitialiser pour tous les sites ?")) return;
    const obj = {};
    obj[STORAGE_KEY] = {};
    chrome.storage.local.set(obj, () => {
      loadRules();
    });
  });

  loadRules();
});
