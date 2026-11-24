# Architektúra

A jelenlegi változat build nélküli statikus HTML/CSS/JavaScript. Nincs szerver, adatbázis, csomagkezelő, külső font vagy futásidejű AI. A `games.js` tartalmazza a szerkesztett játékadatokat, az `app.js` a navigációt és az általános játékmenetet, a `style.css` a megjelenést. Az állapot `localStorage`-ban él, játékazonosító és tartalomverzió szerint elkülönítve; JSON-exporttal átvihető. Az URL-ek hash útvonalak, így statikus tárhelyen frissítéskor is működnek. Hátrány: a statikus forrásból a megfejtések kiolvashatók; hiteles versenyhez szerver kell.

A kód szándékosan könnyű: új játék a konfiguráció bővítésével hozzáadható. A jelenlegi motor lineáris, dokumentum- és szövegválasz-alapú; a teljes elágazó, több helyszínes motor következő fejlesztési fázis. Külső felületet imitáló akták mind fiktívek.
