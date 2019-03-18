# Roadmap ELSTER Reports

### BananaApp ELSTER Umsatzsteuervoranmeldung 2016/2018

Banana has already implemented a Banana app for UStVA. ELSTER recently changed the interface so that the app apparantly doesn't work for 2019. The current status and implementation options should be discussed more in detail.

Meanwhile, I have added: 

**EÜR_Reference_with UStVA.ac2**

As the other reference files in folder 1_Accounting Files..., this file relates Kennzahlen for ELSTER forms (EÜR, UStVA) to accounts in Kategorien.

Additionally, I have added a seperate table to illustrate an alternative way to implement ELSTER reports in Banana. This idea should be regarded as conceptual, from a user perspective. How it actually could be implemented as regards to the programming, is an issue that would need to be discussed furtheron with the programmers. The idea is that instead of a Banana App a user would add new tables for the ELSTER report desired (Werkzeuge-->Neue Funktion hinzufügen). Each tables would represent an ELSTER form (eg. EÜR, UStVA, USt Erklärung etc). The table would link Kennzahlen to the corresponding accounts in Kategorien and calculate the sums/ amounts for each Kennzahl. The print-out would be done from this table.


### Next steps

* Elster implementation to be discussed more in detail
* Resources for implementation?



