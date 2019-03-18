# Roadmap Accounting files
### Changes since December

* Revised the proposed selection of accounts and updated it to the 2019 DATEV account plan
*	Headers and groupings correspond to the DATEV/ Steuerberater headers/ groupings for generating the EÜR report
*	Extended the VAT table to include all possible cases for cross-border transactions that require to address particular VAT accounts
*	Added the view “Nutzer” to do the customizations in the files. In Anlagenbuchhaltung I additionally renamed some of the rows to adapt them to Steuerberater/ DATEV terminology
*	Automatic accounts correspond now to DATEV standard list of automatic accounts (marked in row “DATEV Autom.”
*	Added/ updated Elster Kennzeichen for USt-VA 2019 and EÜR 2018 (more on this in Folder “Elster EÜR Reports”)
*	Generated a template for Anlagenbuchhaltung that corresponds to the data structure proposed in the DATEV/ ELSTER EÜR Anlagenspiegel
*	I added a template “Formatierter Bericht nach Gruppen” for a DATEV/ Steuerberater compatible EÜR report printout

### Accounting files
#### EÜR_REFERENCE.ac2
*	Contains a vast collection of accounts for all types of business and the most common cross-border transaction in and outside EU (see “Wichtige Buchungssätze CrossBorder.doc”). The collection is merely based on the 2014 Heiko selection of accounts. I added some accounts for plausibility reasons, and deleted revenue accounts that refer to rare cross-border transactions
*	This account plan should be fine for the vast majority of relevant users
*	Number of Kategorien/Konten: 187/54

#### EÜR_MINIMAL.ac2
*	is a heavily compressed version of a DATEV compatible account plan. It represents all accounts that a typical 1-Person Professional Service Business with private car for business usage and homeoffice would need. It’s to show how simple it can be in the end
*	This account plan should be fine for the vast majority of 1-Person business
*	Number of Kategorien/Konten: 48/26

#### EÜR Print-outs from Banana
As the account plan is organized corresponding to the DATEV EÜR structure, the standard Banana print-out “Formatierter Bericht” delivers a report that resembles the DATEV EÜR print-out scheme from a Steuerberater (Template “Kontennachweis für Einnahmeüberschußrechnung §4 Abs. 3 EStG“).  With this print-out, a user can easily compare the Banana to the Steuerberater results.

#### ANL_REFERENCE.ac2
*	is a template for Anlagenbuchhaltung with headers and groupings corresponding to EÜR/ DATEV systematics

### Considerations concerning DATEV tax codes (BU-Schlüssel) for automatic accounts: 1- or more digits

In the proposed accounting files, DATEV tax codes are included in the **1-digit version only**. In my personal case of data exchange with Steuerberater, the 1-digt codes were sufficient and worked well. These type of tax codes perform in DATEV a functionality equal to the corresponding Banana tax code functionality.  

**Example for BU-Schlüssel 9**  
Transaction case: 19% Vorsteuer, eg. for domestic Lieferungen (Buyer deduces input tax)  
Functionality in DATEV: Enter gross amount. 19% VAT is booked to account 1576 (VSt)
Functionality in Banana: Code in table "MwSt/USt Codes" works equally when entered appropiately  
. 
However, for certain EU cross-border transactions, DATEV also uses 2-digit and since 2018 3- and 4-digit tax codes (see Excel-file List of DATEV Buchungs-Schlüssel).  
It is not trivial to allocate them to the corresponding automatic/ VAT accounts, as some of the 2/3/4-digit DATEV codes perform more complex functionalities in the DATEV software than the 1-digit tax codes. 

**Example for BU-Schlüssel 19** 
Transaction case:	innergemeinschaftlicher Erwerb zum vollen Steuersatz 19%USt/19%VSt, eg. Lieferungen from EU firm (Buyer deduces input tax AND is liable to pay sales tax)  
Functionality in DATEV: Enter net amount, 19% VAT is booked account 1574 (VSt EU Erwerb) AND to VAT account 1774 (USt EU-Erwerb)
Functionality in Banana: No automatic functionality available, 2 bookings necessary
**BU-Schlüssel 94** for reverse charge transactions works similarly with two VAT bookings.

## To Dos
In my view the Reference accounting files are ready to use and to be tested by users

How important are the more-digit booking codes for DATEV export/import? Are they necessary to be implemented or can bookings be handed over without using automatic tax codes but in seperate manual bookings? It could be useful to test various DATEV export/ import files with different types of EU-transactions (Steuerberater?)  
    
## Time budget
?
