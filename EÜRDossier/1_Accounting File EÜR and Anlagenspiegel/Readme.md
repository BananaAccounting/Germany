# Roadmap Accounting files

## Accounting files created

#### EÜR_REFERENCE_VAT_DATEV_ELTER.ac2
...is s the complete implentation of an EÜR structured account plan. The account plan contains a vast collection of accounts for all types of SME businesses, integrating all kinds of cross-border transaction in and outside EU and should. Therefore, it should satisfiy the greatest majority of relevant users. The collection is based on the 2014 Heiko selection of accounts. Number of Kategorien/Konten: 216/54

* I revised the account plan, added accounts for reasons of completeness and plausibilty and updated headers and groups to 2019 DATEV nomenclature. 
* Revised groupings and headers so that they correspond to the DATEV Kontenplan and Steuerberater EÜR reports
* Standard DATEV Automatic accounts are marked in row “DATEV Autom.”
* Added the view “Nutzer” to do the customizations in the files. In Anlagenbuchhaltung I additionally renamed some of the rows to adapt them to Steuerberater/ DATEV terminology
* Added a template “Formatierter Bericht nach Gruppen” for a DATEV/ Steuerberater compatible EÜR report printout



The **TVA table** is completely implemented. It works analog to the swiss version of the table and is based on the German Banana standard template. I have updated it to 2019 contents and completed all necessary information for practical usage and app programming:

**MwSt/USt Code** The structure represents the ELSTER form for UStVA 2019. I have added/ completed relevant transaction cases to represent relevant transaction cases/ booking.

**Gr** 0=Statistical accounts/ Assesment base (Bemessungsgrundlage), 1=Sales tax amout (USt-Betrag), 2=Input tax amount (VSt Betrag)

**Gr1** Complete attribution of 1- and 2-digit DATEV tax codes

**Gr2** Elster Kennzahlen UStVA 2019  
2 numbers seperated by semicoloon: 1) Assesment base, 2) Tax amount

attributed all Kennzahlen
DATEV codes are attributed in the 1- and 2-digit version
* All ELSTER Kennzahlen for

* Generated a template for Anlagenbuchhaltung that corresponds to the data structure proposed in the DATEV/ ELSTER EÜR Anlagenspiegel

Therefore, I use a simplified VAT table (as compared to the current standard templates) that does not list ELSTER Kennzahlen. The VAT table lists all possible UST and VST accounts with account numbers for automatic VAT bookings in Banana. Where appropriate, they relate to 1-digit DATEV tax code.


#### EÜR_MOST COMMON.ac2
*	Reduced list of revenue accounts, limited to most common EU cross-border transactions
*	Number of Kategorien/Konten: 187/54

#### EÜR_MINIMAL.ac2
*	is a heavily compressed version of a DATEV compatible account plan. It represents all accounts that a typical 1-Person Professional Service Business with private car for business usage and homeoffice would need. It’s to show how simple it can be in the end
*	This account plan should be fine for the vast majority of 1-Person business
*	Number of Kategorien/Konten: 48/26

#### EÜR Print-outs from Banana
As the account plan is organized corresponding to the DATEV EÜR structure, the standard Banana print-out “Formatierter Bericht” delivers a report that resembles the DATEV EÜR print-out scheme from a Steuerberater (see template “Kontennachweis für Einnahmeüberschußrechnung §4 Abs. 3 EStG“)   

#### ANL_REFERENCE.ac2
*	is a template for Anlagenbuchhaltung with headers and groupings corresponding to EÜR/ DATEV systematics



### Considerations concerning DATEV tax codes (BU-Schlüssel) for automatic accounts: 1- or more digits

In the proposed accounting files, DATEV tax codes are included in the **1-digit version only**. In my personal case of data exchange with Steuerberater, the 1-digt codes were sufficient and worked well. These type of tax codes perform in DATEV a functionality equal to the corresponding Banana tax code functionality.  

**Example for BU-Schlüssel 9**  
*Transaction case:* 19% Vorsteuer, eg. for domestic Lieferungen (Buyer deduces input tax)  
*Functionality in DATEV:* Enter gross amount. 19% VAT is booked to account 1576 (VSt)
*Functionality in Banana:* Code in table "MwSt/USt Codes" works equally when entered appropiately  
 
However, for certain EU cross-border transactions, DATEV also uses 2-digit and since 2018 3- and 4-digit tax codes (see Excel-file List of DATEV Buchungs-Schlüssel).  
It is not trivial to allocate them to the corresponding automatic/ VAT accounts, as some of the 2/3/4-digit DATEV codes perform more complex functionalities in the DATEV software than the 1-digit tax codes. 

**Example for BU-Schlüssel 19**   
*Transaction case:*	innergemeinschaftlicher Erwerb zum vollen Steuersatz 19%USt/19%VSt, eg. Lieferungen from EU firm (Buyer deduces input tax AND is liable to pay sales tax)   
*Functionality in DATEV:* Enter net amount, 19% VAT is booked account 1574 (VSt EU Erwerb) AND to VAT account 1774 (USt EU-Erwerb)  
*Functionality in Banana:* No automatic functionality available, 2 bookings necessary  

another example is **BU-Schlüssel 94** for reverse charge transactions which also performs 2 VAT bookings

## Next steps
* Decide how ELSTER Kennzahlen information and UStVA report would be implemented
* Produce downloadable template file
* Without ELSTER information, the reference accounting files are ready to use and to be tested by users. For most users the 1-digit DATEV tax code should be sufficient
* Further considerations: How important are the more-digit booking codes for DATEV export/import? Are they necessary to be implemented or can bookings be handed over without using automatic tax codes but in seperate manual bookings?
* It could be useful to test various DATEV export/ import files with different types of EU-transactions (Steuerberater?)  
    

