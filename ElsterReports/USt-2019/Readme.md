## Accounting files (updated 6.05.2019)

### EÜR_REFERENCE_3_digit.ac2

* has implemented all xxx and 6xxx tax codes into the MwSt/USt table
* not implemented are 2 tax codes only used in combination with SKR14 (350, 352)
* not implemented are 9xxx codes (aufzuteilende Vorsteuer)

* contains a sample booking for every tax code. A+B where required

* all tax codes work consistent with DATEV/ ELSTER functionalities in terms of:
    * corresponding VAT account (according to "Funktionsnummernbeschreibung")
    * VAT calculation parting from gross or net amounts
    * ELSTER Kennzahl for UStVA relating to each tax code (according to "Steuerschlüsseltabelle")
    * as bespoken, DATEV automated double VAT bookings are split into A and B tax code versions 

Please use the **view “Nutzer”** in each file to see all entered information    

### VAT table   

The order of lines correponds to the order proposed in the ELSTER form for UStVA 2019

**MwSt/USt Code** contains the 3-/4-digit tax codes
5 Kennziffern (62, 63, 64, 65, partly 69) do not relate to DATEV tax codes. They are addressed via manual bookings. Tax codes starting "KZ" (KZ62, KZ63 etc.) work with ArtBetrag "2" 

**Gr** group the data to totals appearing in Elster-Online:
    * 0=Statistical accounts/ Assesment base (Bemessungsgrundlage). No tax amount/ no totals calculated
    * 1, 2, 3 =Subtotals for three categories of sales tax amounts (USt-Beträge)
    * 4 =Total input tax amount (VSt Betrag)
    * 5 =other tax amounts (andere Steuerbeträge)
    * ZXX =Subtotals USt-Zahlung/Guthaben in Zeile XX in Elster-Online

**Gr1** still displays the complete attribution of 1- and 2-digit DATEV tax codes. (Can be deleted)

**Gr2** displays Elster Kennzahlen for UStVA 2019   
    * Kennzahlen in lines with Gr=0 refer to Assesment bases. No tax is calculated     
    * Kennzahlen in lines With Gr=1, 2, 3 show 2 numbers seperated by semicoloon: 1) Assesment base, 2) Tax amount. In some cases, the 2 numbers are identical. This means, the ELSTER form provides 2 fields for the same Kennzeichen, and the tax amount is calculated automatically by ELSTER     
    * Kennzahlen in lines with Gr=4, 5 refer to tax amounts. No assesment base is displayed
    * 3 Kennzahlen come with ;ZM. This means, that these amounts (additionally to UStVA) need to be transmitted to the ELSTER form "Zusammenfassende Meldung"
    
**MwSt/USt-Konto** relates the corresponding tax code to the different VAT accounts, representing DATEV standard

**Art Betrag** is set corresponding to DATEV functionality

In column **Nicht warnen** the attribute is set to "ja" for 6xxx tax codes (cross-border buyings taxable and not recoverable)


### Konten/ Kategorien tables

Table Kategorien has been extended to contain all standard automatic DATEV accounts (according to "Kontenrahmenbeschreibung"). Moreover, very automatic SKR03 account shows its associated DATEV tax code corresponding to DATEV standard functionalities    

Table Kategorien also contains information on **ELSTER EÜR** Zuordnung. You find these in the colums "ELSTER EÜR 2019"

**Formatierter Bericht nach Gruppen**, I added the template “Kontennachweis für EÜR §4 Abs. 3 EStG“. As the account plan is organized corresponding to DATEV EÜR structure, the [standard Banana print-out](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/E%C3%9CR%20Printout%20from%20Banana.pdf "Example") delivers a report that corresponds the [DATEV EÜR print-out scheme from a Steuerberater](https://github.com/RobertUlb/Germany/blob/patch-1/E%C3%9CRDossier/1_Accounting%20File%20E%C3%9CR%20and%20Anlagenspiegel/DATEV%20E%C3%9CR%20Examples/E%C3%9CR%20DATEV%20Beispiel%20StB%20Heiko%20Primas.pdf "Example Heiko Primas")


### ANL_REFERENCE.ac2
is a template for Anlagenbuchhaltung. Structure, headers and groupings as well as sorting and names of the columns coorespond to the data structure proposed in the EÜR/DATEV/ELSTER systematics (eg. Sammelposten). Entries in Konto is aligned with EÜR_REFERENCE


