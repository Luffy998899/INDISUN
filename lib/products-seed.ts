import type { Product } from "./types";

/** Seed catalogue — written to the database on first run, then managed from /admin. */
export const PRODUCT_SEED: Product[] = [
  {
    "id": "clav-m-625",
    "brand": "CLAV-M 625",
    "molecule": "Amoxicillin 500mg + Potassium Clavulanate 125mg",
    "category": "tablets",
    "segment": "Antibiotic",
    "pack": "10 × 1 × 6 Tablets (Alu-Alu)",
    "icon": "pill",
    "short": "Broad-spectrum antibiotic for bacterial infections.",
    "description": "A penicillin-class antibiotic combined with a beta-lactamase inhibitor, effective against a wide range of respiratory, urinary, skin and soft-tissue infections.",
    "indications": [
      "Respiratory tract infections",
      "Urinary tract infections",
      "Skin & soft-tissue infections",
      "Dental infections"
    ],
    "dosage": "One tablet every 12 hours, or as directed by the physician.",
    "mrp": 212
  },
  {
    "id": "azi-500",
    "brand": "AZISUN 500",
    "molecule": "Azithromycin 500mg",
    "category": "tablets",
    "segment": "Antibiotic",
    "pack": "10 × 3 Tablets (Blister)",
    "icon": "pill",
    "short": "Macrolide antibiotic for respiratory infections.",
    "description": "Long-acting macrolide antibiotic with once-daily dosing for three days, ideal for community-acquired respiratory and ENT infections.",
    "indications": [
      "Pharyngitis / tonsillitis",
      "Bronchitis",
      "Otitis media",
      "Typhoid"
    ],
    "dosage": "One tablet once daily for 3 days, or as directed.",
    "mrp": 119
  },
  {
    "id": "cefix-200",
    "brand": "CEFIXON 200",
    "molecule": "Cefixime 200mg",
    "category": "tablets",
    "segment": "Antibiotic",
    "pack": "10 × 10 Tablets (Alu-Alu)",
    "icon": "pill",
    "short": "Third-generation cephalosporin.",
    "description": "Oral third-generation cephalosporin with strong activity against gram-negative organisms.",
    "indications": [
      "UTI",
      "Typhoid fever",
      "Gonorrhoea",
      "Lower respiratory infections"
    ],
    "dosage": "One tablet twice daily for 7–14 days.",
    "mrp": 160
  },
  {
    "id": "acel-p",
    "brand": "ACEL-P",
    "molecule": "Aceclofenac 100mg + Paracetamol 325mg",
    "category": "tablets",
    "segment": "Analgesic",
    "pack": "10 × 10 Tablets (Blister)",
    "icon": "medication",
    "short": "Effective pain relief and anti-inflammatory.",
    "description": "Dual-action NSAID and antipyretic combination for musculoskeletal pain, fever and inflammation.",
    "indications": [
      "Osteoarthritis",
      "Rheumatoid arthritis",
      "Low back pain",
      "Post-operative pain"
    ],
    "dosage": "One tablet twice daily after food.",
    "mrp": 62
  },
  {
    "id": "acel-sp",
    "brand": "ACEL-SP",
    "molecule": "Aceclofenac 100mg + Paracetamol 325mg + Serratiopeptidase 15mg",
    "category": "tablets",
    "segment": "Analgesic",
    "pack": "10 × 10 Tablets (Alu-Alu)",
    "icon": "medication",
    "short": "Pain relief with anti-oedema enzyme.",
    "description": "Triple combination adding a proteolytic enzyme for faster resolution of swelling and inflammation.",
    "indications": [
      "Sprains & strains",
      "Dental pain",
      "Post-surgical oedema"
    ],
    "dosage": "One tablet twice daily after food.",
    "mrp": 98
  },
  {
    "id": "panto-d",
    "brand": "PANTO-D",
    "molecule": "Pantoprazole 40mg + Domperidone 30mg (SR)",
    "category": "capsules",
    "segment": "Antacid",
    "pack": "10 × 10 Capsules (Alu-Alu)",
    "icon": "pill",
    "short": "Sustained-release capsule for acidity and GERD.",
    "description": "Proton-pump inhibitor with a prokinetic for acid reflux, bloating and nausea.",
    "indications": [
      "GERD",
      "Peptic ulcer",
      "Dyspepsia",
      "Gastroparesis"
    ],
    "dosage": "One capsule before breakfast.",
    "mrp": 105
  },
  {
    "id": "rabe-dsr",
    "brand": "RABESUN-DSR",
    "molecule": "Rabeprazole 20mg + Domperidone 30mg (SR)",
    "category": "capsules",
    "segment": "Antacid",
    "pack": "10 × 10 Capsules (Alu-Alu)",
    "icon": "pill",
    "short": "Fast-acting acid control with prokinetic.",
    "description": "Rabeprazole delivers rapid acid suppression; sustained-release domperidone relieves reflux symptoms through the day.",
    "indications": [
      "GERD",
      "Erosive oesophagitis",
      "Functional dyspepsia"
    ],
    "dosage": "One capsule before breakfast.",
    "mrp": 118
  },
  {
    "id": "omeclix-20",
    "brand": "OMESUN 20",
    "molecule": "Omeprazole 20mg",
    "category": "capsules",
    "segment": "Antacid",
    "pack": "10 × 15 Capsules (Blister)",
    "icon": "pill",
    "short": "Economical proton-pump inhibitor.",
    "description": "Reliable daily PPI for hyperacidity and ulcer healing.",
    "indications": [
      "Hyperacidity",
      "Peptic ulcer",
      "H. pylori regimen"
    ],
    "dosage": "One capsule daily before meals.",
    "mrp": 45
  },
  {
    "id": "sun-vit",
    "brand": "SUNVIT",
    "molecule": "Multivitamin + Multimineral + Antioxidants",
    "category": "capsules",
    "segment": "Multivitamin",
    "pack": "10 × 10 Softgels",
    "icon": "medication",
    "short": "Daily supplement for immunity and wellness.",
    "description": "Comprehensive softgel with vitamins A–E, zinc, selenium, lycopene and grape-seed extract.",
    "indications": [
      "Nutritional deficiency",
      "Convalescence",
      "General debility"
    ],
    "dosage": "One softgel daily after food.",
    "mrp": 140
  },
  {
    "id": "sun-cal",
    "brand": "SUNCAL-D3",
    "molecule": "Calcium Citrate 1000mg + Vitamin D3 400 IU + Magnesium + Zinc",
    "category": "tablets",
    "segment": "Supplement",
    "pack": "10 × 15 Tablets",
    "icon": "medication",
    "short": "Bone-health calcium with D3.",
    "description": "Highly absorbable calcium citrate with vitamin D3 and co-factors for bone density support.",
    "indications": [
      "Osteoporosis",
      "Pregnancy & lactation",
      "Post-menopausal support"
    ],
    "dosage": "One tablet twice daily.",
    "mrp": 155
  },
  {
    "id": "dexa-c",
    "brand": "DEXA-C",
    "molecule": "Dextromethorphan 10mg + Chlorpheniramine 2mg + Phenylephrine 5mg / 5ml",
    "category": "syrups",
    "segment": "Cough Syrup",
    "pack": "100 ml Bottle",
    "icon": "medication_liquid",
    "short": "Dry cough suppressant and anti-allergic formula.",
    "description": "Non-drowsy daytime relief from dry, irritating cough with nasal decongestion.",
    "indications": [
      "Dry cough",
      "Allergic rhinitis",
      "Common cold"
    ],
    "dosage": "Adults: 10 ml three times daily. Children: as directed.",
    "mrp": 95
  },
  {
    "id": "ambro-lx",
    "brand": "AMBROSUN-LX",
    "molecule": "Ambroxol 30mg + Levosalbutamol 1mg + Guaiphenesin 50mg / 5ml",
    "category": "syrups",
    "segment": "Cough Syrup",
    "pack": "100 ml Bottle",
    "icon": "medication_liquid",
    "short": "Expectorant for productive cough.",
    "description": "Mucolytic-bronchodilator combination that thins mucus and eases breathing.",
    "indications": [
      "Productive cough",
      "Bronchitis",
      "Asthma with mucus"
    ],
    "dosage": "10 ml three times daily.",
    "mrp": 102
  },
  {
    "id": "para-kid",
    "brand": "PARA-KID",
    "molecule": "Paracetamol 250mg / 5ml",
    "category": "syrups",
    "segment": "Paediatric",
    "pack": "60 ml Bottle",
    "icon": "medication_liquid",
    "short": "Fever and pain relief suspension for children.",
    "description": "Pleasant-tasting paediatric suspension for rapid fever reduction.",
    "indications": [
      "Fever",
      "Teething pain",
      "Post-vaccination fever"
    ],
    "dosage": "10–15 mg/kg every 4–6 hours, max 4 doses/day.",
    "mrp": 48
  },
  {
    "id": "sun-iron",
    "brand": "SUNFER-XT",
    "molecule": "Ferrous Ascorbate 30mg + Folic Acid 550mcg + Zinc / 5ml",
    "category": "syrups",
    "segment": "Haematinic",
    "pack": "200 ml Bottle",
    "icon": "medication_liquid",
    "short": "Iron tonic for anaemia.",
    "description": "Well-tolerated iron formulation with folic acid for iron-deficiency anaemia in pregnancy and children.",
    "indications": [
      "Iron-deficiency anaemia",
      "Pregnancy",
      "Poor appetite"
    ],
    "dosage": "10 ml twice daily after food.",
    "mrp": 128
  },
  {
    "id": "panto-iv",
    "brand": "PANTO-IV",
    "molecule": "Pantoprazole 40mg Injection",
    "category": "injectables",
    "segment": "Injectable",
    "pack": "Vial + 10 ml WFI",
    "icon": "vaccines",
    "short": "Intravenous treatment for severe acid reflux.",
    "description": "Lyophilised pantoprazole for IV use when oral therapy is not possible.",
    "indications": [
      "Zollinger-Ellison syndrome",
      "Upper GI bleed prophylaxis",
      "Severe GERD"
    ],
    "dosage": "40 mg IV once daily.",
    "mrp": 72
  },
  {
    "id": "ceftri-1g",
    "brand": "CEFTRISUN 1g",
    "molecule": "Ceftriaxone 1000mg Injection",
    "category": "injectables",
    "segment": "Injectable",
    "pack": "Vial + 10 ml WFI",
    "icon": "vaccines",
    "short": "Third-generation cephalosporin injection.",
    "description": "Broad-spectrum parenteral cephalosporin for serious bacterial infections.",
    "indications": [
      "Septicaemia",
      "Meningitis",
      "Pneumonia",
      "Surgical prophylaxis"
    ],
    "dosage": "1–2 g IV/IM once daily.",
    "mrp": 64
  },
  {
    "id": "diclo-inj",
    "brand": "DICLOSUN INJ",
    "molecule": "Diclofenac Sodium 75mg / 3ml",
    "category": "injectables",
    "segment": "Injectable",
    "pack": "10 Ampoules",
    "icon": "vaccines",
    "short": "NSAID injection for acute pain.",
    "description": "Aqueous diclofenac for rapid control of acute pain and renal colic.",
    "indications": [
      "Renal colic",
      "Post-operative pain",
      "Acute musculoskeletal pain"
    ],
    "dosage": "75 mg IM once or twice daily.",
    "mrp": 110
  },
  {
    "id": "ondan-inj",
    "brand": "ONDASUN INJ",
    "molecule": "Ondansetron 2mg / ml",
    "category": "injectables",
    "segment": "Injectable",
    "pack": "10 × 2 ml Ampoules",
    "icon": "vaccines",
    "short": "Anti-emetic injection.",
    "description": "5-HT3 antagonist for prevention of nausea and vomiting.",
    "indications": [
      "Post-operative nausea",
      "Chemotherapy-induced vomiting"
    ],
    "dosage": "4 mg IV/IM slowly.",
    "mrp": 95
  },
  {
    "id": "clotri-b",
    "brand": "CLOTRI-B",
    "molecule": "Clotrimazole 1% + Beclomethasone 0.025%",
    "category": "ointments",
    "segment": "Topical",
    "pack": "15 g Tube",
    "icon": "healing",
    "short": "Antifungal cream for skin infections and itching.",
    "description": "Antifungal with a mild corticosteroid for inflamed fungal infections.",
    "indications": [
      "Tinea",
      "Candidiasis",
      "Inflamed dermatophytosis"
    ],
    "dosage": "Apply twice daily for 2–4 weeks.",
    "mrp": 68
  },
  {
    "id": "mupi-2",
    "brand": "MUPISUN",
    "molecule": "Mupirocin 2% w/w",
    "category": "ointments",
    "segment": "Topical",
    "pack": "5 g Tube",
    "icon": "healing",
    "short": "Topical antibiotic ointment.",
    "description": "First-line topical antibiotic for bacterial skin infections.",
    "indications": [
      "Impetigo",
      "Folliculitis",
      "Infected wounds"
    ],
    "dosage": "Apply thrice daily for up to 10 days.",
    "mrp": 96
  },
  {
    "id": "diclo-gel",
    "brand": "DICLOSUN GEL",
    "molecule": "Diclofenac Diethylamine 1.16% + Linseed Oil + Methyl Salicylate + Menthol",
    "category": "ointments",
    "segment": "Pain Gel",
    "pack": "30 g Tube",
    "icon": "healing",
    "short": "Fast-acting topical pain gel.",
    "description": "Cooling analgesic gel for localised muscular and joint pain.",
    "indications": [
      "Sprains",
      "Back pain",
      "Arthritic joints"
    ],
    "dosage": "Apply 3–4 times daily.",
    "mrp": 84
  },
  {
    "id": "luli-1",
    "brand": "LULISUN",
    "molecule": "Luliconazole 1% w/w",
    "category": "ointments",
    "segment": "Topical",
    "pack": "20 g Tube",
    "icon": "healing",
    "short": "Once-daily antifungal cream.",
    "description": "Potent azole antifungal with once-daily convenience and short treatment course.",
    "indications": [
      "Tinea cruris",
      "Tinea corporis",
      "Tinea pedis"
    ],
    "dosage": "Apply once daily for 2 weeks.",
    "mrp": 135
  },
  {
    "id": "levo-m",
    "brand": "LEVOSUN-M",
    "molecule": "Levocetirizine 5mg + Montelukast 10mg",
    "category": "tablets",
    "segment": "Anti-allergic",
    "pack": "10 × 10 Tablets (Alu-Alu)",
    "icon": "medication",
    "short": "Allergy and asthma control.",
    "description": "Antihistamine plus leukotriene antagonist for allergic rhinitis and asthma.",
    "indications": [
      "Allergic rhinitis",
      "Urticaria",
      "Bronchial asthma"
    ],
    "dosage": "One tablet at bedtime.",
    "mrp": 110
  },
  {
    "id": "metfo-500",
    "brand": "METSUN 500 SR",
    "molecule": "Metformin 500mg (SR)",
    "category": "tablets",
    "segment": "Anti-diabetic",
    "pack": "10 × 10 Tablets",
    "icon": "medication",
    "short": "Sustained-release glucose control.",
    "description": "First-line biguanide in sustained-release form for better tolerability.",
    "indications": [
      "Type 2 diabetes",
      "PCOS (adjunct)"
    ],
    "dosage": "One tablet with dinner; titrate as advised.",
    "mrp": 38
  }
];
