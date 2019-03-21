# Roadmap Accounting files

## EÜR_REFERENCE_VAT_DATEV_ELSTER.ac2
is s the complete implentation of an EÜR structured accounting file.

The account plan contains a vast collection of accounts for all types of SME businesses, integrating all kinds of cross-border transaction in and outside EU and should. Therefore, it should satisfy the greatest majority of relevant users. Number of Kategorien/Konten: 216/54  

The collection is based on the 2014 Heiko selection of accounts. I revised the account plan, added accounts for reasons of completeness and plausibilty and updated descriptions. I also updated groupings and headers so that they correspond to the 2019 DATEV/ Steuerberater nomenclature
 
Please use the **view “Nutzer”** in each file to see all entered information

### Konten/ Kategorien tables
**DATEV Autom.** accounts are marked in this. They correspond to standard DATEV settings in any DATEV system before a Steuerberater makes his owns customizations to the system

**VAT code** relates a Banana VAT code (see VAT table) to corresponding automatic accounts  

In **Formatierter Bericht nach Gruppen**, I added the template “Kontennachweis für EÜR §4 Abs. 3 EStG“. As the account plan is organized corresponding to DATEV EÜR structure, the [standard Banana print-out](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/E%C3%9CR%20Printout%20from%20Banana.pdf "Example") delivers a report that corresponds the [DATEV EÜR print-out scheme from a Steuerberater](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20E%C3%9CR%20Examples/E%C3%9CR%20DATEV%20Beispiel%20StB%20Heiko%20Primas.pdf "Example Heiko Primas")

Table Kategorien also contains information on **ELSTER Kennzahlen/ SKR03** Zuordnung. You find these in the new colums "ELSTER UStVA 2019" and "ELSTER EÜR 2019".

### VAT table
is completely implemented. It works ***analog to the swiss version of the TVA table*** and is ***based on the current German Banana standard template***. I have updated it to 2019 UStVA Kennzahlen/ descriptions and completed all information necessary for app programming and usage:

**MwSt/USt Code** The structure represents the ELSTER form for UStVA 2019. I have added/ completed transaction cases in accordance with DATEV standard funktionality codes

**Gr** 0=Statistical accounts/ Assesment base (Bemessungsgrundlage), 1=Sales tax amout (USt-Betrag), 2=Input tax amount (VSt Betrag)

**Gr1** Complete attribution of 1- and 2-digit DATEV tax codes

 **Gr2** Elster Kennzahlen UStVA 2019  
    - Kennzahlen in lines with Gr=0 refer to Assesment base   
    - With Gr=1, there are 2 numbers seperated by semicoloon: 1) Assesment base, 2) Tax amount. In some cases, the 2 numbers are identical. This means, the ELSTER form provides 2 fields for the same Kennzeichen, and the tax amount is calculated automatically by ELSTER    
    - Kennzahlen in VSt (Gr=2) refer to tax amounts   
    
**MwSt/USt-Konto** relates the corresponding MwSt/USt-codes (transaction cases) to the different VAT accounts, representing DATEV standard accounting procedures

**2. MwSt/USt Kto (Kz)** For some cases, I provide in this additional column information about a second VAT booking (VAT account and corresponding Elster Kennzahl), which is implied in some of the DATEV tax codes. Banana user might also find this information helpful, as a reminder how to correctly book these kind of transactions.   
Typical invoices for these would only display net amounts excl. taxes. Therefore, in the VAT table, the attribute "1" is set in column **Art Betrag** for the relevant transaction types.   
In column **Nicht warnen"** the attribute is set to "ja" for some rows, so it would allow certain (necessary) bookings without error message. (-->More information on all this in section "Considerations on multi-digit DATEV code").

### ANL_REFERENCE.ac2
is a template for Anlagenbuchhaltung. Structure, headers and groupings as well as sorting and names of the columns coorespond to the data structure proposed in the EÜR/DATEV/ELSTER systematics (eg. Sammelposten). Entries in Konto is aligned with EÜR_REFERENCE


## Account plan variations
I have added two more files, with reduced account plans. Of course, more specific accounts plans can be derived.

#### EÜR_MOST COMMON.ac2
* Reduced list of revenue accounts, limited to most common EU cross-border transactions
* Account plan should be fine for all entrepreneuers with office premises, company car and employees
* Number of Kategorien/Konten: 187/54

#### EÜR_MINIMAL.ac2
* is a heavily compressed version of a DATEV compatible account plan. It represents all accounts that a typical 1-Person Professional Service Business, no cross-border transactions, with a private car for business usage, homeoffice and no employees would need. It’s to show how simple it can be
* This account plan should be fine for the vast majority of 1-Person business
* Number of Kategorien/Konten: 48/26

Unless a BananaApp for ELSTER report with Kennzahlen isn't finished, I have used in these versions a simplified VAT table (as compared to the standard template) that does not list the ELSTER Kennzahlen, and is not structured like the UStVA form. Yet, the ELSTER Kennzahlen for UStVA and EÜR are displayed in table Kategorien so that a user could easily derive the amounts for each Kennzahl via Excel or alike.

These accounting plans are ready to be published. It would be interesting to get feedback from German users how useful they find the adaptations for EÜR structure.


## Considerations on multi-digit DATEV tax codes

In the proposed accounting files, DATEV tax codes are included in the **1- and 2-digit version**. In a DATEV system, the 2-digit codes 17, 18, 19, 91, 92, 94, 95 initiate TWO TVA bookings (USt AND VSt, eg. for reverse charge transactions) instead of just ONE (USt or VSt). In Banana, a user would have to book 3 steps/ bookings instead of just one (see eg. https://www.banana.ch/area/de/node/11145). All this is illustrated here:

![here](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20SKR03%20Kontenpl%C3%A4ne/1_2_digit%20tax%20code%20comparison.png "table")                       

Now, certain EU cross-border transaction types have even more variations. Therefore, in 2019, DATEV introduced 3- and 4-digit tax codes  [see list of DATEV tax codes](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20SKR03%20Kontenpl%C3%A4ne/Steuerschl%C3%BCsseltabelle%20f%C3%BCr%20die%20Regelbesteuerung%202019.pdf "DATEV Steuerschlüssel"). Until then, eg. for tax code 91, the DATEV system would open a dialog window where the transaction type would be selected so the system would choose the appropriate expense and VAT accounts. More digits now allow more specialised codes.

However, any transaction can be recorded without using any tax code, simply by seperate bookings. In my personal case of data exchange with Steuerberater, the 1-digt codes were sufficient and worked well. Moreover, 3-/4-digit tax codes refer often to very particular accounting records. Also, it is unclear, if all Steuerberater work with these kind of tax codes. 

We should check/ discuss their relevance before implementing them in the VAT table.


