# Roadmap ELSTER Reports

In this folder you will find some considerations and alternate proposals for ELSTER report implementation in Banana accounting files (as compared to current approach).

## How it's done so far: BananaApp ELSTER Umsatzsteuervoranmeldung 2016/2018 and current accounting file templates

I have desined the VAT-table in **EÜR_REFERENCE_VAT_DATEV_ELSTER (in folder 1_Accounting Files)** according to following proven logic:

All the current standard templates (Schweiz, Österreich and Germany), are structured in a way that the TVA table contains the Kennziffern for the UStVA and relates them to MwSt/USt codes. It's more or less a representaion of the corresponding tax form. As far as I understand, the idea is, that a user enters bookings always with the appropiate MwSt/USt code from the VAT table. The apps' algorithm then sums up bookings that use a certain MwSt/USt code and then sums these up to a Kennziffer, as some Kennziffern refer to more than one MsSt/USt code. The USt Apps (for Switzerland this works perfectly!, for Autria it doesn't seem to work) then produce the VAT tax report form with Kennzifftern and the corresponding amounts.

For Germany, Banana has already implemented a Banana app for UStVA (ELSTER Umsatzsteuervoranmeldung 2016/2018) that works accordingly. Banana published a note, stating that ELSTER recently changed the interface so that the app apparantly doesn't work anymore for 2019. However, this app seems still to be able to produce the right printout report.

I have tested the App with 2 different accounting files. They can be found in the folder **BananaApp UStVA current status**    

1. Standard template file for EÜR, opened from Banana. I added TVA bookings, but the App doesnt't provide the correct Kennzahlen document (see: einf_mwst_selbständige_ORIGINAL_TEMPLATE.ac2)

2. SKR03_mit_allen_USt_Kennzahlen from the Github repository VatReportGermany2016. I added TVA bookings and in this case the app seems to provide a correct Kennzahlen document (see [UStVA Printout from Github file.pdf](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/2_ELSTER%20Reports/BananaApp%20UStVA%20current%20status/UStVA_ELSTER%20printout%20from%20Github%20file.pdf "Printout"). The print-out format from this file delivers a listing with all not-zero Kennzahlen and the corresponding amounts. If it works correctly, this kind of document is very well suited to help a user to easily transfer the data manually to ELSTER. By the way: A Steuerberater would produce for the records a print-out that containes the same information, namely amounts for all not-zero Kz.

**--> what actually is the current status of the VAT app for Germany? If it doesn't work as upload file, does it work to print out an ELSTER report?**

The file
## EÜR_with alternate tax form implementation.ac2
proposes to deliver tax forms in a seperate table. It's just ideas, purely conceptual. The file illustrates how this could look like.  

Instead of using a Banana App, a user would add for each ELSTER report desired a new table through Werkzeuge-->Neue Funktion hinzufügen. Each of these extra, addable tables would represent an ELSTER form (eg. EÜR, UStVA, USt Erklärung etc).

The table would contain a column in which all accounts would be listed that correspond to the Kennzahl from the report. A user could easily add accounts to be included in the Kennzahlen amount, when his Steuerberater tells him to do so. The standard VAT table would just list those VAT accounts necessary for automatic VAT bookings in Banana, not more.

The idea is, that that table would calculate the sums/ amounts for each Kennzahl. I don't know if, from a programmer's perspective, it is possibles that the table performs this operation (In Excel this would be done with a function or a script). The print-out would be done from this table.

The main advantage: This way, all types of reports could be implemented, not just UStVA. I find this very elegant. As I said, just an idea.

### Further considerations for integrating Elster Kennziffern and report

* Complextiy increases with less common cross-border transactions
* Most users use few Kennzahlen only (lot of business just use 5! Kennziffern for UStVA)
* With simple types of business, Elster transfer easily can be done manually via personal online-access

### All relevant current ELSTER forms
can be found in the corresponding folder

## Issues
* What is the satus of UStVA BananaApp? Who is developping it? When I spoke with Bernhard in December, he seemed to me quite busy with other occupations, stating that currently he wouldn't work on Banana issues
* How realistic, from an available resources perspective, is it to get the German App done quickly?
* Does one have to be a real programmer to produce a BananaApp? Could eg. I learn to do it, with a reasonable effort?
* What do you think about my alternate proposal? Is it possible that fields in a new table refer to other tables in the file and calculates sums?

## Estimated workload
depends on how much involvement from my side is needed for the App programming. As the file I created is designed according to the swiss version, it's quite self explanatory for developpers from your team. A new developper probably would have to be briefed, what I could do from the concepttual/ requirements perspective: 0-1 working day

Another thing is testing the output. Once the app is able to produce reports or upload files, the outputs should be checked, also with involvement of a Steuerberater. To be discussed further once the app is ready.

## Longterm perspective
* Elster information in the file (and in the app?) has to be crosschecked and updated from year to year, as forms often change (this is particuraly true for UStVA)
* BananaApp for EÜR, UST-Erklärung and Anlage UR




