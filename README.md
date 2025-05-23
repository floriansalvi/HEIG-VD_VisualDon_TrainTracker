# 🚂 TrainTracker

## Sommaire
- [🏁 Introduction](#-introduction)
- [🧾 Maquette](#maquette)
- [📊 Jeux de données](#jeux-de-données)
  - [Contexte](#contexte)
  - [Description](#description)
  - [But](#but)
  - [Références](#références)
- [🛠️ Technologies utilisées](#technologies-utilisées)
- [💻 Installation](#-installation)
  - [GIT](#git)
  - [Front-end](#front-end)
  - [Setup](#setup)
- [🌐 Accès](#-accès)
- [💁🏻‍♂️ Réalisation](#-réalisation)

---

## 🏁 Introduction

**TrainTracker** est un site ayant pour but la mise en avant de certaines statistiques liées aux Chemin de fer fédéraux suisses. Il est constitué de différentes visualiation de données et a été réalisé durant les cours de VisualDon au cours du 4e semestre d'Ingénierie des Médias à la Haute École d'Ingénierie et de Gestion du canton de Vaud.

---

## Maquette
[Maquette Figma](https://www.figma.com/design/N6wiZn5oJkOCLBWRyYposF/VisualDon?node-id=0-1&t=MAPyvtgjGijL998Q-1)

---

## Jeux de données
[Nombre d’usagers de la gare CFF](https://opendata.swiss/fr/dataset/anzahl-sbb-bahnhofbenutzer)\
[Collaboratrices et collaborateurs des CFF par canton de travail](https://opendata.swiss/fr/dataset/sbb-mitarbeitende-nach-arbeitskanton)\
[Halte: services accessoires](https://opendata.swiss/fr/dataset/haltestelle-nebenbetriebe)\
[Demographic balance by canton](https://www.pxweb.bfs.admin.ch/pxweb/en/px-x-0102020000_101/px-x-0102020000_101/px-x-0102020000_101.px/table/tableViewLayout2/)

### Contexte
Les données proviennent majoritairement de opendata.swiss. Les 3 premiers jeux de données ont été publiés par les Chemins de Fer Fédéraux Suisses CFF. Le dernier jeu de données est, quant à lui, édité par l'Office Fédéral de la Statistique.

### Description
Les 3 premières sources de données peuvent être téléchargées en divers format tel que XLS, CSV ou json. Nous favoriserons l'utilisation des fichiers json car, nous avons déjà pu travailler avec ce format de données.

**Nombre d'usagers de la gare CFF**
Chaque gare est structurée en plusieurs objets (Un par année. Les années et la fréquence des données différent selon les gares).
Ces objets possèdent 3 attributs : Le nom de la gare ; l'année ; le nombre de passager.e.s.

**Collaboratrices et collaborateurs des CFF par canton de travail**
Un objet par canton. Chaque année de 2013 à 2024 est représentée par un attribut qui indique le nombre de collaborateur.ice.s. Un attribut spécifie le canton, un l'unité de mesure (FTE -> Equivalent temps plein) et un attribut pour les remarques.

**Demographic balance by canton**
Ce jeu de donnée mis à disposition par l'OFS ne peut pas être téléchargé. Il est accessible grâce à une API.
L'URL de l'API est généré après avoir rempli un form sur le site. Les données peuvent être filtrées en fonction de plusieurs attributs tels que le.s canton.s choisi.s ; le genre ; la nationalité (suisse ou étrangère) ; l'année ; …

### But
Durant ce projet, nous souhaitons découvrir et analyser une éventuelle corrélation entre la population des cantons et le nombre de voyageur.ses et employé.e.s qui fréquentent les chemins de fer des CFF. De plus, nous aimerions voir si les services proposés dans les gares affectent l'attractivité de ses dernières.

### Références
Nous n'avons pas pu trouver de références quant à l'utilisation de ces données.
Nous pensons que les données provenant des Chemin de Fer Fédéraux Suisses sont utilisées par les CFF et les commerçants des gares pour effectuer des statistiques de fréquentations et dans un but de développement de leurs infrastrcutures.

Les données démographiques de l'OFS peuvent être utilisées dans un large pannel de domaines : l'étude démogrpahique ; le domaine social ; les transports ; la recherche scientifique ; etc …

---

### Technologies utilisées

- **Framework**
    - Vue.js
- **Composants**
    - D3
    - D3 Brush
    - D3 Geo
    - D3 Scale
    - D3 Transition
- **Routes**
    - La navigation se fait avec `Vue-router`
    - S'agissant du site d'une page, seule une route est disponible (et Erreur 404).
- **Design**
    - `CSS`
    - Non responsive

---

## 💻 Installation


### GIT

1. Cloner le répértoire GIT

```bash
git clone https://github.com/floriansalvi/HEIG-VD_VisualDon_TrainTracker.git
```

### Front-end

1. Installer les dépendances

```bash
npm install
```

2. Démarrer le serveur front-end

```bash
npm run dev
```

### Setup

Si tu ne veux pas devoir exécuter ces commandes manuellement, `setup.sh` te permettre d'effectuer toutes ces étapes en 2 commandes.

```bash
chmod +x setup.sh
./setup.sh
```

---

## 🌐 Accès

URL : [http://localhost:5173](http://localhost:5173)

---

## 💁🏻‍♂️ Réalisation

**Cristian Pottier** 
**Florian Salvi**  
Haute École de Gestion et d'Ingénierie du Canton de Vaud  
Ingénierie des Médias  
Semestre S4 - 2025  
Classe M52-2