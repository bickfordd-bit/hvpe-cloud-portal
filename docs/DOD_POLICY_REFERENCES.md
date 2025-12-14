# DOD Policy Quick Reference Guide

**Purpose**: Fast lookup for HVPE team during DOD demos, proposals, and compliance discussions  
**Classification**: UNCLASSIFIED  
**Last Updated**: 2025-12-14

---

## 1. Core DOD Acquisition Policies

### 1.1 Digital Engineering Strategy (2018)

**Authority**: USD(A&S)  
**Purpose**: Mandate model-based approaches across DOD acquisition

**Key Requirements**:
- Use authoritative source of truth (ASOT)
- Implement model-based systems engineering (MBSE)
- Enable digital thread from requirements → sustainment
- Prioritize Agile/DevSecOps methodologies

**OPTR Alignment**: OPTR is execution-grade ASOT for RFP analysis

**Reference**: [https://ac.cto.mil/des/](https://ac.cto.mil/des/)

---

### 1.2 DFARS 252.204-7012 (Safeguarding CUI)

**Authority**: Defense Federal Acquisition Regulation Supplement  
**Purpose**: Protect Controlled Unclassified Information (CUI)

**Requirements**:
- Implement NIST SP 800-171 controls (110 security requirements)
- Report cyber incidents within 72 hours
- Maintain CMMC certification (Level 2 for CUI)
- Conduct annual self-assessments

**OPTR Compliance**:
- CMMC Level 2 architecture (implemented)
- Audit logging for all CUI access
- US-only data residency (AWS GovCloud)
- Encryption at rest + in transit

**Reference**: [https://www.acquisition.gov/dfars/252.204-7012](https://www.acquisition.gov/dfars/252.204-7012)

---

### 1.3 NIST SP 800-171 (Protecting CUI)

**Authority**: National Institute of Standards and Technology  
**Purpose**: Security requirements for nonfederal systems handling CUI

**110 Security Requirements** (14 families):
1. Access Control (AC)
2. Awareness and Training (AT)
3. Audit and Accountability (AU)
4. Configuration Management (CM)
5. Identification and Authentication (IA)
6. Incident Response (IR)
7. Maintenance (MA)
8. Media Protection (MP)
9. Personnel Security (PS)
10. Physical Protection (PE)
11. Risk Assessment (RA)
12. Security Assessment (CA)
13. System and Communications Protection (SC)
14. System and Information Integrity (SI)

**OPTR Compliance**: See Section 4 (Security) in GAP_ANALYSIS.md

**Reference**: [https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final](https://csrc.nist.gov/publications/detail/sp/800-171/rev-2/final)

---

### 1.4 CMMC Model v2.0

**Authority**: DOD Cyber Accreditation Body (DCAB)  
**Purpose**: Standardize cybersecurity across defense industrial base

**Levels**:
- **Level 1 (Foundational)**: 17 practices (FAR 52.204-21)
- **Level 2 (Advanced)**: 110 practices (NIST 800-171)
- **Level 3 (Expert)**: 110+ practices (NIST 800-172)

**OPTR Target**: CMMC Level 2 (required for CUI)

**Certification Process**:
1. Self-assessment (annual)
2. C3PAO assessment (Certified Third-Party Assessor Organization)
3. 3-year certification
4. Annual affirmation

**Cost**: $15k-40k (Level 2)

**Reference**: [https://dodcio.defense.gov/CMMC/](https://dodcio.defense.gov/CMMC/)

---

## 2. Federal Acquisition Regulations (FAR)

### 2.1 FAR Part 52 (Solicitation Provisions)

**Most Common Clauses**:

| Clause Number  | Title                                                | Category        | Applies When           |
| -------------- | ---------------------------------------------------- | --------------- | ---------------------- |
| 52.204-21      | Basic Safeguarding of Covered Contractor Info        | Security        | All contracts          |
| 52.219-8       | Utilization of Small Business Concerns               | Small Business  | Contracts >$750k       |
| 52.219-9       | Small Business Subcontracting Plan                   | Small Business  | Contracts >$750k       |
| 52.222-26      | Equal Opportunity                                    | Labor           | Contracts >$10k        |
| 52.223-18      | Encouraging Contractor Policies to Ban Texting       | Compliance      | All contracts          |
| 52.232-40      | Providing Accelerated Payments to Small Business     | Small Business  | Prime contractors      |
| 252.204-7012   | Safeguarding Covered Defense Info (DFARS)            | Security        | DOD contracts with CUI |
| 252.225-7048   | Export-Controlled Items (DFARS)                      | ITAR            | Defense articles       |

**OPTR Integration**: FAR clause parser (`src/lib/optr/dod/farClauses.ts`) identifies and explains these clauses

---

## 3. ITAR (Export Control)

### 3.1 22 CFR 120-130

**Authority**: Department of State, Directorate of Defense Trade Controls (DDTC)  
**Purpose**: Control export of defense articles and services

**Key Definitions**:
- **Defense Article**: Items on US Munitions List (USML)
- **Technical Data**: Information required for design, production, operation
- **Defense Service**: Assistance in design, engineering, production

**Registration Requirement**:
- Register with DDTC ($2,250 annual fee)
- Designate Empowered Official (EO)
- Implement Technology Control Plan (TCP)
- Restrict access to US persons only

**OPTR Compliance**:
- ITAR detection in RFP text (`requiresITAR()` function)
- No foreign national access to CUI
- US-only data residency (AWS GovCloud)

**Reference**: [https://www.pmddtc.state.gov/ddtc_public](https://www.pmddtc.state.gov/ddtc_public)

---

## 4. FedRAMP (Cloud Security)

### 4.1 FedRAMP Moderate

**Authority**: FedRAMP PMO (General Services Administration)  
**Purpose**: Standardize cloud security assessments for federal agencies

**Impact Levels**:
- **Low**: Loss of confidentiality, integrity, availability has **limited** adverse effect
- **Moderate**: Loss has **serious** adverse effect (OPTR target)
- **High**: Loss has **severe or catastrophic** adverse effect

**Requirements** (Moderate):
- 325 security controls (NIST 800-53 Moderate baseline)
- 3PAO assessment (Third-Party Assessment Organization)
- Continuous monitoring (ConMon)
- Annual assessment

**Timeline**: 6-12 months  
**Cost**: $50k-150k (initial ATO)

**OPTR Status**: Architecture ready, authorization in progress

**Reference**: [https://www.fedramp.gov/](https://www.fedramp.gov/)

---

## 5. SAM.gov (Vendor Registration)

### 5.1 System for Award Management

**Authority**: General Services Administration (GSA)  
**Purpose**: Centralized vendor registration for federal contracts

**Required Information**:
- **DUNS Number**: Unique business identifier (9 digits)
- **UEI**: Unique Entity Identifier (12 characters, replaces DUNS)
- **CAGE Code**: Commercial and Government Entity code (5 characters)
- **NAICS Codes**: North American Industry Classification System
- **Business Types**: 8(a), WOSB, HUBZone, SDVOSB, etc.

**Registration Process**:
1. Create SAM.gov account
2. Provide business information
3. Submit banking details (for payments)
4. Annual renewal required

**OPTR Integration**: SAM.gov API client (`src/lib/integrations/samGov.ts`)
- Validate vendor registration status
- Check debarment/suspension
- Verify NAICS codes match RFP requirements

**Reference**: [https://sam.gov/](https://sam.gov/)

---

## 6. CPARS (Past Performance)

### 6.1 Contractor Performance Assessment Reporting System

**Authority**: DOD, NASA, civilian agencies  
**Purpose**: Document contractor past performance for source selection

**Ratings** (1-5 scale):
- **Exceptional**: Performance exceeds contractual requirements
- **Very Good**: Performance meets contractual requirements, some areas exceed
- **Satisfactory**: Performance meets contractual requirements
- **Marginal**: Performance does not meet some contractual requirements
- **Unsatisfactory**: Performance does not meet most contractual requirements

**Evaluation Factors**:
- Quality of Product/Service
- Cost Control
- Timeliness of Performance
- Business Relations
- Management of Key Personnel
- Utilization of Small Business

**OPTR Integration**: Planned Phase 2 (predict win probability based on past performance)

**Reference**: [https://www.cpars.gov/](https://www.cpars.gov/)

---

## 7. Quick Decision Matrix

### When to Cite Which Policy

| Scenario                              | Cite This Policy           | Why                                      |
| ------------------------------------- | -------------------------- | ---------------------------------------- |
| Explaining OPTR's security posture    | CMMC Level 2, NIST 800-171 | Industry standard for CUI                |
| Justifying execution-first approach   | DOD Digital Engineering    | Mandates ASOT, MBSE, Agile               |
| Demonstrating compliance awareness    | DFARS 252.204-7012         | Shows understanding of CUI requirements  |
| Addressing foreign national concerns  | ITAR (22 CFR 120-130)      | Export control for defense articles      |
| Cloud deployment questions            | FedRAMP Moderate           | Standard for federal cloud systems       |
| Vendor validation discussion          | SAM.gov registration       | Mandatory for federal contracting        |
| Past performance integration          | CPARS                      | Objective source of contractor ratings   |
| FAR clause parsing demo               | FAR Part 52                | Core acquisition regulation              |

---

## 8. Common Acronyms (DOD Acquisition)

| Acronym      | Full Form                                      |
| ------------ | ---------------------------------------------- |
| **ATO**      | Authority to Operate                           |
| **CAGE**     | Commercial and Government Entity               |
| **CMMC**     | Cybersecurity Maturity Model Certification     |
| **ConMon**   | Continuous Monitoring                          |
| **CPARS**    | Contractor Performance Assessment Reporting    |
| **CUI**      | Controlled Unclassified Information            |
| **DDTC**     | Directorate of Defense Trade Controls          |
| **DFARS**    | Defense Federal Acquisition Regulation Suppl.  |
| **EO**       | Empowered Official (ITAR)                      |
| **FAR**      | Federal Acquisition Regulation                 |
| **FedRAMP**  | Federal Risk and Authorization Management Prog.|
| **GSA**      | General Services Administration                |
| **ITAR**     | International Traffic in Arms Regulations      |
| **NAICS**    | North American Industry Classification System  |
| **NIST**     | National Institute of Standards and Technology |
| **SAM**      | System for Award Management                    |
| **SDVOSB**   | Service-Disabled Veteran-Owned Small Business  |
| **TCP**      | Technology Control Plan (ITAR)                 |
| **UEI**      | Unique Entity Identifier                       |
| **USD(A&S)** | Under Secretary of Defense for Acq. & Sustain. |
| **USML**     | US Munitions List                              |
| **WOSB**     | Woman-Owned Small Business                     |

---

## 9. Contact Information (DOD Resources)

| Organization   | Website                                     | Purpose                          |
| -------------- | ------------------------------------------- | -------------------------------- |
| **SAM.gov**    | https://sam.gov/                            | Vendor registration              |
| **FedRAMP**    | https://www.fedramp.gov/                    | Cloud security authorization     |
| **CMMC**       | https://dodcio.defense.gov/CMMC/            | Cybersecurity certification      |
| **CPARS**      | https://www.cpars.gov/                      | Past performance                 |
| **DDTC**       | https://www.pmddtc.state.gov/               | ITAR registration                |
| **NIST**       | https://csrc.nist.gov/                      | Security standards               |
| **DOD Digital**| https://ac.cto.mil/des/                     | Digital Engineering Strategy     |
| **AFMC**       | https://www.afmc.af.mil/                    | Air Force Materiel Command       |
| **SOCOM**      | https://www.socom.mil/                      | Special Operations Command       |

---

**Document Control**:
- **Version**: 1.0
- **Owner**: HVPE OPTR Team
- **Review Cycle**: Quarterly
- **Classification**: UNCLASSIFIED

---

**End of Document**
