# Roadmap ELSTER Reports

### BananaApp ELSTER Umsatzsteuervoranmeldung 2016/2018 and current accounting files templates for Germany

Banana has already implemented a Banana app for UStVA (ELSTER Umsatzsteuervoranmeldung 2016/2018). There is a message on Github, saying that ELSTER recently changed the interface so that the app apparantly doesn't work anymore for 2019.

I have tested the App with 2 different accounting files. All examples can be found in the folder "BananaApp UStVA current status"
1-Standard template file for EÜR, opened from Banana. I added TVA bookings, but the App doesnt't provide the correct Kennzahlen document (see: einf_mwst_selbständige_ORIGINAL_TEMPLATE.ac2)

2-SKR03_mit_allen_USt_Kennzahlen from the Github repository VatReportGermany2016. I added TVA bookings and in this case the app seems to provide a correct Kennzahlen document (see UStVA Printout from Github file.pdf). The print-out format from this file delivers a listing with all not zero Kennzahlen and the corresponding amounts. This kind of document is very well suited to help a user to easily transfer the data manually to ELSTER. A Steuerberater would produce for the records a print-out that containes the same information

As already mentioned in "Roadmap Accounting Files", it would be helpful for me to better understand how the Kennzahlen information has to be organised in an accounting file so that an App can produce the ELSTER report. Therefore I'd be happy if we could discuss the the current status and implementation options of ELSTER reports more in detail, as well as how this relates to template design.  



Meanwhile, I would like to present an alternative idea for how ELSTER reports could be generated. Please consider this idea as purely conceptual, from a user perspective. I cannot judge if this idea is realistic to be implemented:

**EÜR_Reference_with UStVA.ac2**

is the reference accounting file.

To illustrate the idea, I added a seperate table in this version. Instead of using a Banana App, a user would add such new tables for the ELSTER report desired (Werkzeuge-->Neue Funktion hinzufügen). Each table would represent an ELSTER form (eg. EÜR, UStVA, USt Erklärung etc). The table would link Kennzahlen to the corresponding accounts in Kategorien and calculate the sums/ amounts for each Kennzahl (is this possible to be programmed?). The print-out would be done from this table.



### Next steps

* see Roadmap Accounting Files
* Resources for implementation?



