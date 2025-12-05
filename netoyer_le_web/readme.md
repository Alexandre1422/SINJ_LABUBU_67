#  Platon Cleaner — Nettoyez le Web comme VOUS l’entendez !

Platon Cleaner est une extension Chrome permettant à l’utilisateur de nettoyer et personnaliser ses sites préférés :

- masquer les éléments gênants (bannières, pubs, sidebars…)
- agrandir les zones importantes (contenu, vidéos, articles)
- enregistrer ses choix de façon permanente par site
- activer/désactiver le nettoyage en un clic
- comparer la page en mode **Avant / Après**
- gérer toutes les règles via une page dédiée

Développé pour le défi **Platon Formation – Nuit de l’Info 2025**.

---

##  Fonctionnalités

###  Mode nettoyage
Depuis la popup :

- Survol → contour rouge  
- **Clic gauche** → masque l’élément  
- **Shift + clic** → agrandit l’élément  

Les actions sont persistantes et sauvegardées par domaine.

---

###  Nettoyage automatique (persistant)
À chaque visite du site, les règles sont ré-appliquées :

- masquage des éléments sélectionnés  
- agrandissement des blocs importants

Compatible avec les sites dynamiques grâce à :

- `MutationObserver`
- détection de changement d’URL (SPA)
- application continue des règles

Fonctionne avec : YouTube, Gmail, Facebook, TikTok, X/Twitter, etc.

---

###  Mode Avant / Après
Un badge flottant apparaît en bas :

- **Avant** → ré-affiche tout  
- **Après** → remasque les éléments  
- **Fermer** → cacher le badge  

---

###  Désactivation temporaire
Depuis la popup :

- **Désactiver ce site**  
- **Désactiver globalement**  

Les règles ne sont pas supprimées mais simplement mises en pause.

---

###  Panneau de gestion
Accessible dans la popup :

- liste des sites nettoyés  
- nombre d’éléments masqués  
- bouton pour réinitialiser un site  
- bouton pour tout réinitialiser  

---

##  Bonus réalisés
- Interface utilisateur soignée  
- Mode Avant / Après complet  
- Indicateurs visuels (badge + surbrillance)  
- Agrandir les blocs (Shift+clic)  
- Désactivation globale / par site  
- Support des sites SPA (YouTube, Gmail...)  
- Règles persistantes et performantes  

---

##  Installation (Chrome / Edge)

1. Télécharger ou cloner le projet :

```bash
git clone https://github.com/ton-repo/platon-cleaner.git

2. Aller dans :

chrome://extensions

3. Activer Mode développeur

4. Cliquer sur Charger l’extension non empaquetée

5. Sélectionner le dossier du projet

## Utilisation

1. Activer le mode nettoyage

2. Depuis la popup → Activer le mode nettoyage

3. Interactions

4. Clic gauche → masque l’élément

5. Shift + clic → agrandit l’élément

6. Panneau de gestion

7. Popup → Panneau de gestion

8. Avant / Après

9. Depuis le badge flottant.
