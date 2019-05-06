# Branch Roadmap Accounting files (updated 26.4.2019)

## EÜR_REFERENCE_3_digit.ac2

* has implemented all DATEV 3-digit tax codes into the MwSt/USt table
* not implemented are 5 tax codes used by "Land- und Forstwirtschaftliche" Betriebe only (special LuF codes for "Pauschalbesteuerung"= 310, 311, 312, 350, 352, 381). In DATEV, these codes need to be used in combination with SKR14 (7-digit account numbers) only
* For reasons of consistency, I also added 4-digit tax codes starting with 6 (innergemeinschatfliche Lieferungen/ Leistungsempfänger als Steuerschuldner §13b, mit USt OHNE VSt)
* all tax codes work consistent with DATEV/ ELSTER functionalities in terms of:
    * corresponding VAT account (according to "Funktionsnummernbeschreibung")
    * VAT calculation parting from gross or net amounts
    * ELSTER Kennzahl for UStVA relating to each tax code (according to "Steuerschlüsseltabelle")
    * as bespoken, DATEV automated double VAT bookings are split into A and B tax code versions 

Pending your decision, it should also be possible to completely implement the 4-digit tax codes starting with 9 (aufzuteilende Vorsteuer). In these cases, DATEV performs an additional booking for each tax codes which seperates deductable from non-deductable input tax according to a defined percentage (so called "Faktor-2 Buchung"). With an additional booking a Banana user could simulate these tax code functionalities, too

Please use the **view “Nutzer”** in each file to see all entered information    

### VAT table   

The order of lines correponds to the order proposed in the ELSTER form for UStVA 2019

**MwSt/USt Code** now contains the DATEV 3-/4-digit tax codes (except 4-digit codes for "aufzuteilende Vorsteuer" starting with 9)
However, 5 Kennziffern (62, 63, 64, 65, partly 69) do not relate to DATEV tax codes. They are addressed via bookings. To simulate this functionality in Banana, I have named them tax codes starting with "KZ" (KZ62, KZ63 etc.). You can find an example for such a booking in table "Buchungen"

**Gr** displays the type of data to appear in the UStVA:
    * 0=Statistical accounts/ Assesment base (Bemessungsgrundlage). No tax amount calculated
    * 1=Sales tax amout (USt-Betrag)
    * 2=Input tax amount (VSt Betrag)
    * 3=other tax amounts (andere Steuerbeträge)

**Gr1** still displays the complete attribution of 1- and 2-digit DATEV tax codes. (Can be deleted)

**Gr2** displays Elster Kennzahlen for UStVA 2019   
    * USt Kennzahlen in lines with Gr=0 refer to Assesment bases       
    * USt Kennzahlen in lines With Gr=1 show 2 numbers seperated by semicoloon: 1) Assesment base, 2) Tax amount. In some cases, the 2 numbers are identical. This means, the ELSTER form provides 2 fields for the same Kennzeichen, and the tax amount is calculated automatically by ELSTER     
    * VSt Kennzahlen (in lines with Gr=2) refer to tax amounts
    * andere Steuerbeträge (in lines with Gr=3) refer to tax amounts
    * 3 Kennzahlen come with ;ZM. This means, that these amounts (additionally to UStVA) need to be transmitted to the ELSTER form "Zusammenfassende Meldung"
    
**MwSt/USt-Konto** relates the corresponding tax code to the different VAT accounts, representing DATEV standard accounting procedures

**Art Betrag** is set corresponding to DATEV functionality (analog "Funktionsnummernbeschreibung")

In column **Nicht warnen** the attribute is set to "ja" for 4-digit tax code starting with 6 as they define cross-border buyings with USt but without VSt


### Konten/ Kategorien tables

Table Kategorien has been extended to contain all standard automatic DATEV accounts (according to "Kontenrahmenbeschreibung"). Moreover, very automatic SKR03 account shows its associated DATEV tax code corresponding to DATEV standard functionalities    

Table Kategorien also contains information on **ELSTER EÜR** Zuordnung. You find these in the colums "ELSTER EÜR 2019"

**Formatierter Bericht nach Gruppen**, I added the template “Kontennachweis für EÜR §4 Abs. 3 EStG“. As the account plan is organized corresponding to DATEV EÜR structure, the [standard Banana print-out](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/E%C3%9CR%20Printout%20from%20Banana.pdf "Example") delivers a report that corresponds the [DATEV EÜR print-out scheme from a Steuerberater](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20E%C3%9CR%20Examples/E%C3%9CR%20DATEV%20Beispiel%20StB%20Heiko%20Primas.pdf "Example Heiko Primas")


### ANL_REFERENCE.ac2
is a template for Anlagenbuchhaltung. Structure, headers and groupings as well as sorting and names of the columns coorespond to the data structure proposed in the EÜR/DATEV/ELSTER systematics (eg. Sammelposten). Entries in Konto is aligned with EÜR_REFERENCE


## Account plan variations
As soon as you approve the new file, I will derive simplified variations from the account plan, eg.

#### EÜR_MOST COMMON.ac2
* Reduced list of revenue accounts, limited to most common EU cross-border transactions
* Account plan should be fine for all entrepreneuers with office premises, company car and employees
* Number of Kategorien/Konten: 187/54

#### EÜR_MINIMAL.ac2
* is a heavily compressed version of a DATEV compatible account plan. It represents all accounts that a typical 1-Person Professional Service Business, no cross-border transactions, with a private car for business usage, homeoffice and no employees would need. It’s to show how simple it can be
* This account plan should be fine for the vast majority of 1-Person business
* Number of Kategorien/Konten: 48/26


## Issues
* When apps are ready (export/ import/ UStVA), the file should be tested under real world conditions. My proposal is to create a set of bookings addressing each of the tax codes, export it to DATEV and compare the result to the BANANA result
* The working process between a Banana user and a Steuerberater now needs to be tested, approved and documented


## Estimated workload
Appointment/ talks with Steuerberater, discussions over best-practice working process Banana user/Steuerberater, exchange file testing, information gathering, communications involved

1-2 working days (8-16 hours)

## Longterm perspective
* DATEV/ ELSTER compatible file for Bilanzierer






