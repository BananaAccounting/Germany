# Roadmap ELSTER Reports
Concerning the needed ELSTER reports and ultimately future BananaApps, we discussed that the monthly/ quaterly UStVA would be a priority. As regards to the target group, an avarage user most likely would want to do the UStVA via ELSTER transfer himself, while cooperating with a Steuerberater for the annual income statement. Integrating yearly EÜR and USt-Erklärung in ELSTER reports could be a next step.

### BananaApp ELSTER Umsatzsteuervoranmeldung 2016/2018 and the current standard accountplans for Germany

Banana has already implemented a Banana app for UStVA.  

ELSTER recently changed the interface so that the app apparantly doesn't work anymore or is no longer in use. (See file einf_mwst_selbständige_ORIGINAL_TEMPLATE.ac2: It's the current standard template from Banana with 2 TVA relevant bookings. The App Elster Umsatzsteuervoranmeldung 2016/2018 does not produce the Kennzahlen document).

However, the file SKR03_mit_allen_USt_Kennzahlen from the Github repository VatReportGermany2016 seems to work with the UStVA App. The print-out format from this file delivers a document listing the not zero Kennzahlen with the corresponding amounts. This kind of document is very well suited to help a user to easily transfer the data manually to ELSTER. A Steuerberater would produce for the records a print-out that containes the same information. An automatic transfer to ELSTER is desirable but not necessary. It seems to me, that Banana already provides a viable solution for UStVA.

I added the file 

**EÜR_Reference_with UStVA.ac2** to this folder

As in folder 1_Accounting files..., the file contains the complete updated Kennzahlen for UStVA2019 and EÜR2018 related to accounts in Kategorien. 

Additionally, I have added a seperate table to illustrate an alternative way to implement ELSTER reports in Banana. This idea should be regarded as conceptual, from a user perspective. How it actually could be implemented as regards to the programming, is an issue that would need to be discussed furtheron with the programmers.

The idea is that instead of a Banana App a user would add new tables for the ELSTER report desired (Werkzeuge-->Neue Funktion hinzufügen). Each tables would represent an ELSTER form (eg. EÜR, UStVA, USt Erklärung etc). The table would link Kennzahlen to the corresponding accounts in Kategorien and calculate the sums/ amounts for each Kennzahl. The print-out would be done from this table.

## Next steps

* Resources for Banana App implementation?



