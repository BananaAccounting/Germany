# Roadmap Accounting files

### EÜR_REFERENCE_VAT_DATEV_ELSTER.ac2
...is s the complete implentation of an EÜR structured accounting file. The account plan contains a vast collection of accounts for all types of SME businesses, integrating all kinds of cross-border transaction in and outside EU and should. Therefore, it should satisfy the greatest majority of relevant users. The collection is based on the 2014 Heiko selection of accounts. Number of Kategorien/Konten: 216/54

Please refer to the **view “Nutzer”** in each file to see entries

#### Konten/ Kategorien tables
* Revised account plan, added accounts for reasons of completeness and plausibilty, updated descriptions
* Updated groupings and headers so that they correspond to the 2019 DATEV/ Steuerberater nomenclature

**DATEV Autom.** DATEV Automatic accounts are marked in this. They correspond to standard DATEV settings in any DATEV system before Steuerberater customizations

**VAT code** relates a Banana VAT code to corresponding automatic accounts (see VAT table)

In **Formatierter Bericht nach Gruppen**, I added the template “Kontennachweis für Einnahmeüberschußrechnung §4 Abs. 3 EStG“. As the account plan is organized corresponding to DATEV EÜR structure, the standard Banana print-out isable to delivers a report that corresponds the DATEV EÜR print-out scheme from a Steuerberater

Table Kategorien also contains information on **ELSTER Kennzahlen/ SKR03** Zuordnung. You find these in the new colums "ELSTER UStVA 2019" and "ELSTER EÜR 2019". However, all ELSTER Kennzahlen are provided in the VAT table.

#### TVA table
is completely implemented. It works ***analog to the swiss version of the TVA table*** and is ***based on the current German Banana standard template***. I have updated it to 2019 contents and completed all information necessary for app programming and usage:

**MwSt/USt Code** The structure represents the ELSTER form for UStVA 2019. I have added/ completed transaction cases in accordance with DATEV standard funktionality codes

**Gr** 0=Statistical accounts/ Assesment base (Bemessungsgrundlage), 1=Sales tax amout (USt-Betrag), 2=Input tax amount (VSt Betrag)

**Gr1** Complete attribution of 1- and 2-digit DATEV tax codes

 **Gr2** Elster Kennzahlen UStVA 2019  
    - Kennzahlen in lines with Gr=0 refer to Assesment base
    - With Gr=1, there are 2 numbers seperated by semicoloon: 1) Assesment base, 2) Tax amount. In some cases, the 2 numbers are identical. This means, the ELSTER form provides the 2 fields under the same Kennzeichen, and the tax amount is calculated automatically by ELSTER 
    - Kennzahlen in VSt (Gr=2) refer to tax amounts
    
**MwSt/USt-Konto** relates the corresponding MsST/USt-codes (transaction cases) to the different TVA accounts which are used in DATEV. This represents DATEV standard accounting rules

**2. MwSt/USt Kto (Kz)** In this additional column, I provide information about the second TVA booking (TVA account and corresponding Elster Kennzahl), so you can see how DATEV operates in these cases. This information can also be used for a Banana user, as a reminder how to correctly perform the accounting records for these kind of transactions. (-->More information further down in section "Considerations on multi-digit DATEV code").
     
### ANL_REFERENCE.ac2
is a template for Anlagenbuchhaltung. Structure, headers and groupings as well as sorting and names of the columns coorespond to the data structure proposed in the EÜR/DATEV/ELSTER systematics (eg. Sammelposten). Entries in Konto is aligned with EÜR_REFERENCE


### Account plan variations
I have added two more files, with reduced account plans. Of course,


#### EÜR_MOST COMMON.ac2
*	Reduced list of revenue accounts, limited to most common EU cross-border transactions
* Account plan should be fine for all entrepreneuers with office premises, company car and employees
*	Number of Kategorien/Konten: 187/54

#### EÜR_MINIMAL.ac2
*	is a heavily compressed version of a DATEV compatible account plan. It represents all accounts that a typical 1-Person Professional Service Business with private car for business usage and homeoffice would need. It’s to show how simple it can be in the end
*	This account plan should be fine for the vast majority of 1-Person business
*	Number of Kategorien/Konten: 48/26

Unless a BananaApp for producing ELSTER report isn't shippably finished, I have used a simplified VAT table (as compared to the current standard templates) that does not list the ELSTER Kennzahlen. Yetnts

In the proposed accounting files, DATEV tax codes are included in the **1- and 2-digit version**. In a DATEV system, the 2-digit codes 17, 18, 19, 91, 92, 94, 95 initiate TWO TVA bookings (USt AND VSt, eg. for reverse charge transactions) instead of just ONE (USt or VSt).  

Typical invoices for these (and some other) transactions will display net amounts excl. taxes. Therefore, in the VAT table, in column **Art Betrag** the attribute "1" is set for the relevant transaction types.  

In Banana, a user would have to book 3 steps/ bookings instead of just one (see eg. https://www.banana.ch/area/de/node/11145). Attribute "ja" in **Nicht warnen"** allows to do it in 2 steps/ bookings without error message.

All this is illustrated [here](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20SKR03%20Kontenpl%C3%A4ne/1_2_digit%20tax%20code%20comparison.png "table")                       

Now, certain EU cross-border transaction types have even more variations. Therefore DATEV introduced in 2018 3- and 4-digit tax codes  [see list of DATEV tax codes](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20SKR03%20Kontenpl%C3%A4ne/Steuerschl%C3%BCsseltabelle%20f%C3%BCr%20die%20Regelbesteuerung%202019.pdf "DATEV Steuerschlüssel"). Until then, eg. for tax code 91 the DATEV system would open a dialog window where the transaction type would be selected so the system would choose the appropriate expense and VAT accounts. More digits now allow more specialised codes.

In my personal case of data exchange with Steuerberater, the 1-digt codes were sufficient and worked well. Moreover, 3-/4-digit tax codes refer often to very particular accounting records so that we should check their relevance before implementing them.

  


Next steps
* Decide how ELSTER Kennzahlen information and UStVA report would be implemented
* Produce downloadable template file
* Without ELSTER information, the reference accounting files are ready to use and to be tested by users. For most users the 1-digit DATEV tax code should be sufficient
* Further considerations: How important are the more-digit booking codes for DATEV export/import? Are they necessary to be implemented or can bookings be handed over without using automatic tax codes but in seperate manual bookings?
* It could be useful to test various DATEV export/ import files with different types of EU-transactions (Steuerberater?)  
