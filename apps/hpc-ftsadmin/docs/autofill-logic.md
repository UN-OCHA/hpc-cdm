# Auto-fill Rules

These rules govern how the value in one field changes based on the value chosen in another field. 
NOTE that cascading auto-fills (where the auto-filled value in one field triggers another auto-fill 
in a different field) are NOT permitted, and have to be specified individually. E.g. an auto-fill rule 
**(Project->Plan)** and a rule **(Plan->Emergency)** will not trigger **(Project->Plan->Emergency)** 
autofill, and instead an explicit rule (Project->Emergency) needs to be defined.

Normally, auto-fill rules on the manual side will always run against a single value being added to the 
field being manually changed.

However, auto-fill rules applied during a bridge operation (known as 'inferred' rules) need to work on 
multiple values simultaneously, and know how to handle this. For example, if inferring a plan from a 
country+year, what if we have 2 countries and 3 years, which together match 6 plans? 
Do we infer all 6, or infer blank, or fail to infer anything and leave whatever is already there?

| Side | Prerequisite | Field being manually changed | Field being auto-filled | Action (Add/Replace) | How to Lookup Autofill |
|--------------------|--------------------|--------------------|--------------------|--------------------|--------------------|
| Source AND Dest  | None | Plan  | Usage Year  | Add  | FTSyears of the Plan object (single or multiple) |
| Source AND Dest  | None | Plan  | Country (Admin 0 AND Location) | Add  | Countries of Plan object (single or multiple) |
| Source AND Dest  | None | Plan  | Emergency  | Add  | Emergency of Plan object (single) |
| Source AND Dest  | None | Plan  | Plan of Project  | Add  | Plan of Project (single) |
| Source AND Dest  | None | Project  | Usage Year  | Add  | All years Y such that (Y >=ProjectStartYear AND Y <=ProjectEndYear) AND Y IN PlanFTSyears (single or multiple) |
| Source AND Dest  | None | Project  | Country (Admin 0 AND Location) | Add  | All countries C such that C IN ProjectCountries AND C IN PlanCountries (single or multiple) |
| Source AND Dest  | None  | Project  | Field Cluster  | Add  | Field clusters of project (single or multiple) |
| Source AND Dest  | None  | Project  | Global Sector  | Add  | Global sectors of project (single or multiple) |
| Source AND Dest  | None  | Project  | Emergency  | Add  | Emergency of Plan of Project (single) |
| Dest only        | None  | Project  | Earmarked  | Replace  | Set to "Earmarked" |
| Source AND Dest  | None  | Field Cluster  | Global Sector   | Add  | All global sectors linked to the field cluster of the plan (single or multiple) |
| Source AND Dest  | Plan is blank  | Global Sector  | Field Cluster  | Add  | All field clusters of the chosen plan linked to the global sector (single or multiple) |
| Flow Properties  | None  | Source Org  | New Money Flag  | Replace  | If OrgType[SourceOrg]=Pooled Funds, then Clear Flag, else Set flag | Cleared flag is enforced, set flag is not |
| Source ONLY      | None  | Source Org  | Source Country (Admin 0 AND Location) | Add  | Country of Source Org object |
