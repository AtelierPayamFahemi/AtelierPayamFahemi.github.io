# Portfolio BIM — Payam

Portfolio personale su GitHub Pages per progetti di automazione BIM, Revit, Dynamo e Python.

## Struttura file

```
portfolio/
├── index.html              ← Homepage
├── progetti.html           ← Elenco progetti
├── blog.html               ← Elenco articoli blog
├── css/
│   └── style.css           ← Stile globale
├── js/
│   └── main.js             ← Interazioni
├── images/                 ← Le tue immagini e screenshot
├── progetti/
│   ├── room-data-sheet.html  ← Template caso studio (già compilato)
│   ├── ifc-export.html       ← Da compilare
│   └── ceiling-rooms.html    ← Da compilare
└── blog/
    ├── uni-11337.html        ← Da compilare
    ├── dynamo-python.html    ← Da compilare
    └── weasyprint.html       ← Da compilare
```

---

## Come pubblicare su GitHub Pages

### 1. Crea il repository

```bash
# Il nome DEVE essere esattamente questo formato:
# tuousername.github.io
# (sostituisci tuousername con il tuo username GitHub)
```

Su GitHub.com → New repository → nome: `tuousername.github.io`

### 2. Carica i file

```bash
git clone https://github.com/tuousername/tuousername.github.io
cp -r portfolio/* tuousername.github.io/
cd tuousername.github.io
git add .
git commit -m "primo deploy portfolio BIM"
git push origin main
```

### 3. Attiva GitHub Pages

Repository → Settings → Pages → Source: `Deploy from a branch` → Branch: `main` → Save

Dopo 2-3 minuti il sito è online su: **https://tuousername.github.io**

---

## Come aggiungere un nuovo progetto

1. Copia `progetti/room-data-sheet.html` e rinominalo
2. Modifica titolo, descrizione, codice e immagini
3. Aggiungi la card in `progetti.html` (c'è un template commentato)
4. Carica le immagini nella cartella `images/`
5. Fai push su GitHub → il sito si aggiorna automaticamente

## Come aggiungere un timelapse

In ogni pagina progetto c'è già il posto per embed YouTube:

```html
<div class="video-embed">
  <iframe src="https://www.youtube.com/embed/IL_TUO_ID" allowfullscreen></iframe>
</div>
```

Carica il timelapse su YouTube (anche "non in elenco" per privacy), copia l'ID del video e incollalo nell'URL sopra.

## Come aggiungere immagini

```html
<!-- Sostituisci il div .media-full con: -->
<img src="../../images/nome-immagine.jpg" alt="Descrizione" style="width:100%;margin:2rem 0;">
```

---

## Personalizzazione rapida

Nel file `css/style.css`, le variabili principali:

```css
--accent: #b85c2a;      /* colore arancio terracotta — cambia qui il colore principale */
--ink: #1a1916;         /* colore testo */
--paper: #f5f2ed;       /* colore sfondo */
```

## Dominio personalizzato (opzionale)

Se vuoi usare un dominio tipo `payam.it`:
1. Acquistalo da Namecheap, Aruba, ecc.
2. Repository → Settings → Pages → Custom domain → inserisci il dominio
3. Nel pannello DNS del dominio, aggiungi un CNAME che punta a `tuousername.github.io`
