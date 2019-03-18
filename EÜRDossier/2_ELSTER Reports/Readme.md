# Roadmap ELSTER Reports

In this document and folder I present my ideas how to implement ELSTER Kennziffern in an Banana accounting file. The objective is to ultimately devolop BananaApps that deliver ELSTER compatible reports or even data transfer, eg. for UStVA, EÜR or UST Erklärung.

My proposal is conceptual, from a user perspective. How it actually can be implemented as regards to the programming, is an issue that needs to be discussed furtheron with the programmers.

### Preface: My understanding of where we stand
Concerning the needed ELSTER reports and ultimately future BananaApps, we discussed that the monthly/ quaterly UStVA would be a priority. As regards to the target group, an avarage user most likely would want to do the UStVA via ELSTER transfer himself, while cooperating with a Steuerberater for the annual income statement. Integrating yearly EÜR and USt-Erklärung in ELSTER reports could be a next step.

Bernhard Fürst has already implemented a Banana app for UStVA. The UStVA App apparently requires that the VAT table has a certain structure - representing the ELSTER UStVA form with all Kennzahlen. At the moment, all current German template account plans contain this kind of VAT table.

ELSTER recently changed the interface so that the app apparantly doesn't work anymore or is no longer in use. (See file einf_mwst_selbständige_ORIGINAL_TEMPLATE.ac2: It's the current standard template from Banana with 2 TVA relevant bookings. The App Elster Umsatzsteuervoranmeldung 2016/2018 does not produce the Kennzahlen document).

However, the file SKR03_mit_allen_USt_Kennzahlen from the Github repository VatReportGermany2016 seems to work with the UStVA App. The print-out format from this file delivers a document listing the not zero Kennzahlen with the corresponding amounts (. This kind of document is very well suited to help a user to easily transfer the data manually to ELSTER. Moreover, for the UStVA, a Steuerberater would produce for the records a print-out that containes the same information. An automatic transfer to ELSTER is desirable but not necessary. 

### Issues with the standard template
In my view and from a user's perspective, the current implementation of ELSTER-UStVA has the following disadvantages:   

* The table should contain all TVA accounts that in combination with a specific expense/ revenue account automate TVA booking. The current version of the TVA table in the German templates only implements TVA account 1770 for all types of TVA
* The general idea of the TVA table has changed. Normally, it's there to enter/ programme Banana automatic accounts, which is a clearly defined functionality. In the current version, it's main function now is to represent the ELSTER UStVA form AND to enter the automatic accounts. What makes it even more inconsistent is the fact, that certain Kennzahlen refer to much more than one (TVA) account. You can see that eg. Kennzahl 66 appears twice on the list)
* Most Kennzahlen in the form UStVA actually do not refer to TVA accounts - they refer to expense or revenue accounts from the table Kategorien. Therefore, it doesn't make much sense to attribute them a MwSt/USt Code for the Banana automatic TVA accounts, as they would never be used to calculate TVA in bookings. Useless codes also pollute the drop down list when selecting TVA automatic during bookings


It's function now is 



This is not the case in the current version.



The template I propose 


It seems to me, that Banana already provides a viable solution for UStVA
### General considerations for implenting ELSTER Kennzahlen in Banana
**Monthly/ quaterly reports -->USt Voranmeldung UStVA)  

* Kennzahlen are not steady but can vary from year to year. This is particularly true for monthly/ quaterly UStVA. This implies, that the attribution of Kennzahlen to certain accounts have to be revised from year to year and new Kennzahlen have to be integrated into the account plan
* The majority of businesses only require a minimum of Kennzahlen. For businesses operating only in Germany, only 5 Kennzahlen are needed. This implies that for an avarage user the manual data transfer via ELSTER online is easy to do
* The majority of Kennzahlen refer to particular cross-border transactions relevant to particular business only. Complexity concerning the attributions of Kennzahlen is driven by particuar types of cross-border transactions, which might not be relevant to the avarage user  
* Any print-out for UStVA should consider the ELSTER Kennzahlen calculation scheme. A user can easily transfer the relevant data to ELSTER via online-access, when Banana delivers the amounts for the Kennzahlen. 

**Annual income statement**  
* The transfer of a complete income statement via ELSTER not only requires the EÜR and Umsatzsteuererklärung, but at least 3 more forms (Mantelbogen, Vorsorgeaufwendungen, Anlage UR and in many cases Anlage G and Gewerbesteuererklärung)
* The standard print-out "Formatierter Bericht" (as contained in the Folder "1_Accounting files...") delivers a perfect DATEV compatible EÜR statement
