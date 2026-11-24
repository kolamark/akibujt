# Játékmotor – v0.2

A `window.AKIBUJT.games` tömb egy játéka `id`, `title`, `category`, `difficulty`, `duration`, `players`, `image`, `status`, `version`, `description`, `intro`, `ending`, `puzzles` mezőket tartalmaz. A `playable` állapot nyitja meg a játékot; a `planned` csak adatlapot. Egy feladvány mezői: `chapter`, `title`, `story`, `label`, `doc`, `question`, `answers`, pontosan három `hints`; opcionális `type: 'terminal'`.

A sorrend jelenleg a tömb sorrendje. A válaszok Unicode ékezetnormalizálás, kisbetűsítés és szóközök összevonása után egyeznek. A pontos karakterláncot igénylő feladatban ezt az instrukció mondja meg. Az állapot: `step`, `notes`, `hints`, `started`, `elapsed`. A mentés azonosítója `akibujt:<id>:v<version>`. Verzióemelésnél a régi állás megmarad a böngészőben, de nem íródik át új verzióra.

A jelenlegi implementáció hiányai: párhuzamos nyomozási szálak, inventárium, feltételes feloldás, médiazoom, több befejezés, automatizált migráció, nyelvi adaptáció. Ezeket ne jelöljük késznek.
