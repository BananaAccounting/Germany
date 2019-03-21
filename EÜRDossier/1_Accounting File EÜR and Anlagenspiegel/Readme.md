# Roadmap Accounting files

### EÜR_REFERENCE_VAT_DATEV_ELSTER.ac2
...is s the complete implentation of an EÜR structured accounting file. The account plan contains a vast collection of accounts for all types of SME businesses, integrating all kinds of cross-border transaction in and outside EU and should. Therefore, it should satisfy the greatest majority of relevant users. The collection is based on the 2014 Heiko selection of accounts. Number of Kategorien/Konten: 216/54

Please use the **view “Nutzer”** in each file

#### Konten/ Kategorien tables
* Revised account plan, added accounts for reasons of completeness and plausibilty, updated descriptions
* Updated groupings and headers so that they correspond to the 2019 DATEV/ Steuerberater nomenclature
* DATEV Automatic accounts are marked in row **“DATEV Autom.”**. They correspond to standard DATEV settings without Steuerberater customizations
* Related a standard Banana **VAT code** to corresponding automatic accounts (see VAT table)

    As the account plan is organized corresponding to the DATEV EÜR structure, the standard Banana print-out “**Formatierter Bericht nach Gruppen**” delivers a report that resembles the DATEV EÜR print-out scheme from a Steuerberater (see template “Kontennachweis für Einnahmeüberschußrechnung §4 Abs. 3 EStG“)

Table Kategorien also contains information on ELSTER Kennzahlen/ SKR03 Zuordnung. You find these in the new rows "ELSTER UStVA 2019" and "ELSTER EÜR 2019".


#### TVA table
is completely implemented. It works ***analog to the swiss version of the TVA table*** and is ***based on the current German Banana standard template***. I have updated it to 2019 contents and completed all information necessary for app programming and usage:

**MwSt/USt Code** The structure represents the ELSTER form for UStVA 2019. I have added/ completed transaction cases in accordance with DATEV standard funktionality codes.

**Gr** 0=Statistical accounts/ Assesment base (Bemessungsgrundlage), 1=Sales tax amout (USt-Betrag), 2=Input tax amount (VSt Betrag)

**Gr1** Complete attribution of 1- and 2-digit DATEV tax codes.   
    In DATEV, the 2-digit DATEV codes 17, 18, 19, 91, 92, 94, 95 initiate TWO (USt AND VSt) consecutive TVA bookings instead of ONE (USt or VSt). Please refer further down to the section "Considerations on 3/4 digit DATEV code". See also **2. MwSt/USt Kto (Kz)**.

**Gr2** Elster Kennzahlen UStVA 2019  
    + Kennzahlen in USt refer to Assesment base. 2 numbers seperated by semicoloon: 1) Assesment base, 2) Tax amount   
    + Kennzahlen in VSt refer to Tax amounts

**MwSt/USt-Konto** relates the corresponding MsST/USt-codes (transaction cases) to the different TVA accounts which are used in DATEV. This represents DATEV standard accounting rules.

**2. MwSt/USt Kto (Kz)** In this additional row I store/ provide information about how DATEV operates in case of in the file, I have added a seperate row .


In oder to mark 


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
    

