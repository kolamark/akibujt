# Aki Bújt Aki Nem

**Nyilvános weboldal:** https://kolamark.github.io/akibujt/

A GitHub Pages a `main` ág gyökeréből publikál; a későbbi forrásmódosítások ugyanebből az ágból kerülnek ki.

Ingyenes, böngészőből játszható magyar rejtélyjáték-platform. A főoldal és a játék mobilon és számítógépen is használható. Nincs regisztráció, fizetőfal, reklám vagy futásidejű AI API.

## Jelenlegi állapot

Az *Az elveszett örökség* 16 feladványos **játszható tesztverzió**. Az állás helyben mentődik, és JSON-fájlként exportálható vagy visszatölthető. A 217-es szoba és Budapest elveszett kincse egyelőre csak előzetes adatlap. A történet és a vizuális anyagok további szerkesztést, a teljes játék független emberi tesztelést igényelnek.

## Indítás

`python3 -m http.server 8000`, majd `http://localhost:8000`. Build lépés nincs. A repó gyökere közvetlenül telepíthető statikus tárhelyre, például GitHub Pages vagy Cloudflare Pages szolgáltatásba. A hash útvonalak frissítés után is működnek.

## Fájlok

- `index.html`, `style.css`: a weboldal.
- `app.js`: útvonalak, játékfelület, mentés és válaszellenőrzés.
- `games.js`: játékadatok és a támogatási URL konfigurációja.
- `assets/`: optimalizált képek és ikon.
- `docs/`: fejlesztői dokumentáció spoileres megoldókulcs nélkül.
- `tests/validate.cjs`: tartalmi és erőforrás-ellenőrzés (`node tests/validate.cjs`).

A `games.js` elején a `supportUrl` jelenleg üres. Csak valódi Buy Me a Coffee URL-lel töltsd ki. A kliensoldali játék megfejtései a forráskódból kiolvashatók.

## Éles indulás előtt

A valódi támogatási és kapcsolati adatok, üzemeltetői és adatkezelési tájékoztatók, végleges jogtisztán használt képek, teljes játékos tesztelés és hozzáférhetőségi ellenőrzés szükséges. A jelenlegi játékidő szerkesztői becslés.
