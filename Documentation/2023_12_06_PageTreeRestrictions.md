## Ziel

- Seitenbaum - Einschränkung...


## Mögliche Solutions

- irgendwie über Policy.yaml gehen um Seitenbaum einzuschränken
- irgendwie neue Config Mount Point für Seitenbaum
  - ACHTUNG: User/Gruppenspezifisch.
- ggf. Tabs für versch. Seitenbäume...?


### UX

Was die Redakteurinnen verwirrt: Sehen links den ganzen Seitenbaum; und nicht ersichtlich "ab wo darf ich was editieren"?
  - [ ] !!! Idee 1: Visuelle Unterscheidung der Seiten nach Rechten, die ich habe
    - SCHÄTZUNG: 1 PT
  - Idee 2: Disablen des Auswählens der Seiten ohne Rechte?
  - Idee 3: Was ausblenden vom Seitenbaum?
  - [ ] !!! Idee 4: Wenn ich mich einlogge, springe ich direkt zur 1. obersten Seite, wo ich Zugriff habe.
    - SCHÄTZUNG: 0.5 PT
    - Depth First Search
    - Cache (pro User; oder ggf. pro Rollenkombo); wenn cached node nicht mehr da -> neu aufbauen
      - leichte Inkonsistenz (wir zeigen nicht in *allen* Fällen die 1. Seite auf die man Rechte hat)
  - Idee 5: Bookmarks?
    - klares Konzept; NACHTEIL: Neues UI Element.
  - [x] !!! Idee 6: Parents bis zur Seite mit Access bleiben eingeblendet.
    - SCHÄTZUNG: 2 PT
    - mit isAncestorNodeOf() mgl.
    - [x] Prototyp
    - [ ] noch Crash in Neos UI, wenn ich versuche Seite zu laden auf die ich keine Seitenbaum-Rechte habe.
    - [ ] wenn ich im Content auf eine Seite ohne Rechte navigiere, dann disabled page tree nicht // inspector nicht.
  - !!!!!! Non breaking ness.
    - SCHÄTZUNG: 2 PT
    - ggf. neue Basisrolle...

=> 5 PT.

- Ausblenden:
  - Was mache ich mit der Verbindung zur Wurzel?
  - Mount Points -> Rafft auch keiner (Seiten potentiell mehrfach dargestellt, .... -> Rabbit Hole)
  - 


### TODO

!!!! NodeTreePrivilege

- 
- TODO: Prioblem with OPageTree Privilege
