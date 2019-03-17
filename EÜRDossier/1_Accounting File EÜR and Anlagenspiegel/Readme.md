Roadmap Accounting files

First issue on the initial roadmap are the account plans. A lot of work has been done to do this already in 2014. The result from that effort basically is the account plan that we put on Github while I was in Lugano in December 2018 (EÜR_reference_income_VAT-ac2)

In the last weeks, I have worked over and updated the account plan:

•	Revised the proposed selection of accounts and updated it to the 2019 DATEV account plan
•	Headers and groupings correspond to the DATEV/ Steuerberater headers/ groupings for generating the EÜR report
•	Extended the VAT table to include all possible cases for cross-border transactions that require to address particular VAT accounts
•	Added the view “Nutzer” to do the customizations in the files. In Anlagenbuchhaltung I additionally renamed some of the rows to adapt them to Steuerberater/ DATEV terminology
•	Automatic accounts correspond now to DATEV standard list of automatic accounts (marked in row “DATEV Autom.”
•	Added/ updated Elster Kennzeichen for USt-VA 2019 and EÜR 2018 (more on this in Folder “Elster EÜR Reports”)
•	Generated a template for Anlagenbuchhaltung that corresponds to the data structure proposed in the DATEV/ ELSTER EÜR Anlagenspiegel

Another issue was to generate a printed EÜR Report, so 
•	I added a template “Formatierter Bericht nach Gruppen” for a DATEV/ Steuerberater compatible EÜR report printout



Accounting files

I have produced two accounting files

EÜR_REFERENCE.ac2
•	Contains a vast collection of accounts for all types of business and the most common cross-border transaction in and outside EU (see “Wichtige Buchungssätze CrossBorder.doc”). The collection is merely based on the 2014 Heiko selection of accounts. I added some accounts for plausibility reasons, and deleted revenue accounts that refer to rare cross-border transactions
•	This account plan should be fine for the vast majority of relevant users
•	Number of Kategorien/Konten: 187/54

EÜR_MINIMAL.ac2
•	is a heavily compressed version of a DATEV compatible account plan. It represents all accounts that a typical 1-Person Professional Service Business with private car for business usage and homeoffice would need. It’s to show how simple it can be in the end
•	This account plan should be fine for the vast majority of 1-Person business
•	Number of Kategorien/Konten: 48/26

As the account plan is organized corresponding to the DATEV EÜR structure, the standard Banana print-out “Formatierter Bericht” delivers a report that resembles the DATEV EÜR print-out scheme from a Steuerberater (Template “Kontennachweis für Einnahmeüberschußrechnung §4 Abs. 3 EStG“).  This is a good thing, as a user can easily compare the Banana to the Steuerberater results.

ANL_REFERENCE.ac2
•	is a template for Anlagenbuchhaltung with headers and groupings corresponding to EÜR/ DATEV systematics

Furthermore, there is EÜR_Catalog.ac2, a working file which contains even more revenue and VAT accounts for particular rare cross-border transactions (212/54 Kategorien/Konten).


DATEV tax codes (BU-Schlüssel) for automatic accounts: 1- or more digits

!(https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/Datev%20code%20for%20automatic%20accounts%20comparison%201%20and%20more%20digits.html)

You asked for VAT codes for all possible cases plus DATEV codes for the export in DATEV format.
In the above accounting files, DATEV tax codes are included in the 1-digit version only. These type of tax codes perform a functionality equal to the corresponding Banana tax code functionality.
However, DATEV also uses 2-digit and since 2018 3- and 4-digit tax codes (see Excel-file List of DATEV Buchungs-Schlüssel).
It is not trivial to allocate them to the corresponding automatic/ VAT accounts, as some of the 2/3/4-digit DATEV codes perform more complicated functionalities in the DATEV software than the 1-digit tax codes.
Here is an example comparing 1-digit and more-digit DATEV tax codes.

Datev Tax code for automatic account	9	19	94
Transaction type	Domestic “Lieferungen” (Buyer deduces input tax)	“Lieferungen” from EU firm (Buyer deduces input tax AND is liable to pay sales tax = innergemeinschaftlicher Erwerb zum vollen Steuersatz 19%USt/19%VSt)	“Sonstige Leistungen” from EU-firm (Buyer deduces input tax AND is liable to pay sales tax = reverse charge)
Functionality	Calculates from the entered gross amount (Bruttobetrag) 19% and books the net amount to the expense account and VAT amount to VAT account 1576 (VSt)	Calculates from the entered net amount (Nettobetrag) 19% and books it to VAT account 1574 (VSt) AND to VAT account 1774 (USt)	Calculates from the entered net amount (Nettobetrag) 19% and books it to VAT account 1577 (VSt) AND to VAT account 1787 (USt)

In my case of data exchange with my Steuerberater for my own purposes, the 1-digt codes were sufficient.

I do not know, from a programmers’ perspective, how important it is to implement 2- or more digit DATEV codes in the export function. Nor do I know, if these issues are clarified in any DATEV documentations for interface programmers.


