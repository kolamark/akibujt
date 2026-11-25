# Új kaland hozzáadása
A games.js `games` tömbjéhez adj egy egyedi id-val, title, category, difficulty, duration, image, description, status és version mezőkkel rendelkező objektumot. Játszható játékhoz szükséges intro, ending, players és puzzles tömb. Egy feladvány chapter, title, story, label, doc, question, answers és hints mezőket tartalmaz. Az opcionális `type: 'terminal'` sötét terminálstílust alkalmaz. A motor a feladványokat sorrendben oldja fel, elfogadja az ékezet nélküli válaszokat és kis-/nagybetűs változatokat; kötőjelek és egyéb írásjelek csak a felsorolt válaszvariánsok alapján kezeltek. A mentés játékazonosító és verzió alapján különül el. A jelenlegi motor lineáris; elágazás, multimédiás bizonyíték, inventárium és vizuális puzzle modulok következő fázisban készülnek.

## Helyszíni játék és új válaszformák
A privát szerkesztőben a játék adatlapján kapcsold be a **Helyszíni játék** opciót. Minden feladványhoz add meg a helyszín nevét, szélességét és hosszúságát (WGS84 tizedes fok). A játék a célpont köré 200 méteres kört rajzol a térképen. A válaszmező csak friss helyadat alapján oldható fel, és beküldéskor ismét ellenőriz; a mért távolságnak a helyadat bizonytalanságával együtt legfeljebb 200 méternek kell lennie. A helymeghatározás HTTPS-en és felhasználói engedéllyel működik. A böngészős GPS-adat meghamisítható, így ez játékmechanika, nem bizonyíték vagy beléptető rendszer.

Feladattípusok: szöveges (alapértelmezett), feleletválasztós (2–8 opció, a helyes válasz szerepeljen köztük), számos (egyenlőség a megadott elfogadott számok valamelyikével), képfeladat. A képfeladat legfeljebb 10 MB-os helyi képfájlt kér és előnézetet mutat. A kép nem jut el szerverre, nem része a mentésnek, és nem kerül automatikus vagy emberi ellenőrzésre. Valódi fotóbizonyítékhoz később külön feltöltő és moderációs szolgáltatás kell.

Borítók: három korábbi kép és négy új tematikus illusztrált/fotografikus lehetőség (Budapest, erdő, hotel, archívum). Az új képek egy atlaszból jelennek meg. A játékverziót emeld, ha már játszott feladványok sorrendjét vagy megoldását módosítod.

### Sorrend és párok
A **Sorrendbe rendezés** típusnál a szerkesztőbe soronként írd be az elemeket a helyes sorrendben (2–12 különböző sor). A játékos kevert listát kap, amelyet húzással vagy Fel/Le gombokkal rendezhet; a beküldéskor minden pozíciót ellenőriz a játék.

A **Párosítás** típusnál adj meg 2–12 különböző bal és jobb oldali elemből álló párt. A játékos a bal oldali elemek mellett legördülő listából választja ki a jobb oldali párjukat. Minden párnak pontosan egyeznie kell, ugyanaz a jobb oldali elem nem használható kétszer. Mindkét típus helyszíni feladattal is kombinálható; ekkor a 200 méteres kapu a beküldéskor újra ellenőriz.

## Játéktípusok és felfedezős feladatok

A szerkesztőben minden játék kap egy `kind` mezőt: `adventure` (Kalandok), `investigation` (Nyomozások), `challenge` (Kihívások). A régi játékoknál a típust a játékosoldal a korábbi adatokból állapítja meg: „Az elveszett örökség” nyomozás, a többi régi játék kaland. A kategória szabad témacímke, nem a gyűjtőoldalt dönti el.

- **Kaland:** helyszínbejárás és változatos feladatok. A `count` egy helyes számot vár; a `find` a megtalált részletet ellenőrzi a megadott elfogadott válaszokkal; a `self_report` egy kötelező önbevallásos jelöléssel teljesíthető, és nincs automatikusan ellenőrzött helyes válasza.
- **Nyomozás:** történet, dokumentumok és pontosan három segítség feladványonként. A nyitójelenet és a lezárás kötelező.
- **Kihívás:** rövid, önálló feladatsor. A gyűjtőoldal már működik, de csak akkor jelenik meg rajta játék, ha az adminban publikáltál egyet.

Kalandnál és kihívásnál a fejezet, jelenet, címke, dokumentum, segítségek, nyitó- és lezáró szöveg elhagyható; a feladat címe és szövege kötelező. A helyszín feladatonként adható meg, vagy a teljes játékra előírható a 200 méteres körzet. Az önbevallásos teljesítés nem bizonyítja, hogy a játékos tényleg végrehajtotta a feladatot. A fotós feladat továbbra is helyi kiválasztás, szerveres feltöltés nélkül.
