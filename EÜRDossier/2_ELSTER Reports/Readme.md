# Roadmap ELSTER Reports

Concerning needed ELSTER reports and ultimately possible BananaAppsWe, we discused that the monthly/ quaterly UStVA is a priority. An avarage user most likely would want to do the ELSTER transfer himself, while cooperating with a Steuerberater for the annual income statement.  
In a next step it would be desirable to integrate yearly EÜR and USt-Erklärung

Bernhard Fürst has already implemented a Banana app for UStVA (that apparantly no longer is in use as ELSTER has changed the interface). To this end, the EÜR template available in the Banana software has a modified VAT table that represents Kennzahlen for the UStVA. I have played around with file Bernhard published on Github and checked the printout the App delivers. In my view, the report format from this UStVA App is very well suited to help a user to easily transfer the data manually to ELSTER. Therefore Banana already seems to provide a viable solution for the issue of UStVA.

### General considerations for implenting ELSTER Kennzahlen in Banana
**Monthly/ quaterly reports -->USt Voranmeldung UStVA)  

* Kennzahlen are not steady but can vary from year to year. This is particularly true for monthly/ quaterly UStVA. This implies, that the attribution of Kennzahlen to certain accounts have to be revised from year to year and new Kennzahlen have to be integrated into the account plan
* The majority of businesses only require a minimum of Kennzahlen. For businesses operating only in Germany, only 5 Kennzahlen are needed. The majority of Kennzahlen refer to particular cross-border transactions relevant to particular business only. Complexity concerning the attributions is driven by particuar types of cross-border transactions, which might not be relevant to the avarage user  
* Any print-out for UStVA should consider the ELSTER Kennzahlen calculation scheme. A user can easily transfer the relevant data to ELSTER via online-access, when Banana delivers the amounts for the Kennzahlen. 

**Annual income statement**  
* The transfer of a complete income statement via ELSTER not only requires the EÜR and Umsatzsteuererklärung, but at least 3 more forms (Mantelbogen, Vorsorgeaufwendungen, Anlage UR and in many cases Anlage G and Gewerbesteuererklärung)
* The standard print-out "Formatierter Bericht" (as contained in the Folder "1_Accounting files...") delivers a perfect DATEV compatible EÜR statement
