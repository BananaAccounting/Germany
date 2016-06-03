# Beschreibung

Diese Banana App exportiert die für die Umsatzsteuervoranmeldung (UStVA) in Deutschland notwendigen Daten in Form einer XML-Datei. Die Datei kann im Elster Online Portal unter hochgeladen werden. Hilfestellung finden Sie unter folgender Webadresse:

https://www.elsteronline.de/hilfe/eop/private/formulare/leitfaden/ustva_upload.html

# Vorbedingungen

Unter _Stammdaten > Adresse_ sind folgende Angaben notwendig:

- Firma
- Strasse
- Postleitzahl
- Ort
- Region (hier das Bundesland eintragen)
- Email
- Telefon
- Steuernummer

Die MwSt/USt-Tabelle muß mit den UStVA-Kennzahlen in Spalte _Gr2_ befüllt sein. Die Spalte _Gr2_ ggf. einblenden.
Einen kompletten Satz von Kennzahlen, der für das UStVA-Formular 2016 gültig ist, finden Sie in der Beispieldatei _SKR03 mit allen USt Kennzahlen.ac2_.

# Paarweise Kennzahlen

Spezielle Kennzahlen in der UStVA, bei denen Nettobetrag sowie Steuerbetrag in getrennten Buchungssätzen (Split-Buchung) eingegeben werden müssen, da die Steuerbeträge nicht festen Steuersätzen unterliegen und demzufolge nicht automatisch errechnet werden können:

- Kz35 (Buchungsbetrag) und Kz36 (Steuer zu Kennzahl 35)
- Kz76 und Kz80
- Kz95 und Kz98
- Kz94 und Kz96
- Kz46 und Kz47
- Kz52 und Kz53
- Kz73 und Kz74
- Kz78 und Kz79
- Kz84 und Kz85

Wichtig ist hierfür, daß in der Buchungstabell die Spalte _Art Betrag_ angezeigt wird. Dazu im Menü _Werkzeuge > Neue Funktion hinzufügen..._ die Funktion _Spalte MwSt/USt Art Betrag in den Buchungen ändern_ aktivieren. Anschließend wird ein Buchungssatz in 2 Einträgen angelegt:

1. Normaler Buchungssatz mit Buchungsbetrag in Spalte _Betrag EUR_.
2. Kopie des Buchungssatzes, aber Steuerbetrag in Spalte _Betrag EUR_ sowie Spalte _Art Betrag_ auf _2 (MwSt/USt Betrag)_ setzen.

# TODO

* Kontrollausgabe, in der die ermittelten UStVA-Kennzahlen vor dem Speichern kontrolliert werden können.
* Detailierte Fehlerausgabe bei Validierungsfehlern der Kennzahlen.
* Setzen/Bearbeiten von einzelnen Kennzahlen, die nicht aus der Buchhaltung ermittelt werden können.