{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .SFNS-Semibold;\f1\fnil\fcharset129 AppleSDGothicNeo-SemiBold;}
{\colortbl;\red255\green255\blue255;\red14\green14\blue14;}
{\*\expandedcolortbl;;\cssrgb\c6700\c6700\c6700;}
\paperw11900\paperh16840\margl1440\margr1440\vieww30040\viewh16440\viewkind0
\pard\tx560\tx1120\tx1680\tx2240\tx2800\tx3360\tx3920\tx4480\tx5040\tx5600\tx6160\tx6720\sl324\slmult1\pardirnatural\partightenfactor0

\f0\b\fs30 \cf2 // -----------------------------\
// TYPE\
// -----------------------------\
export interface ChoiceScore \{\
  questionId: number;\
  choice: string; // A, B, C\
  energy: number;\
  positivity: number;\
  curiosity: number;\
\}\
\
export interface UserAnswer \{\
  questionId: number;\
  choice: string;\
\}\
\
export interface FinalResult \{\
  ocean: string;\
  season: string;\
  code: string; // e.g. "TAE-PH-SPRING"\
  score: \{\
    energy: number;\
    positivity: number;\
    curiosity: number;\
  \};\
\}\
\
// -----------------------------\
// NORMALIZE -18~+18 \uc0\u8594  -2~2\
// -----------------------------\
const normalize = (value: number): number => \{\
  if (value >= 8) return 2;\
  if (value >= 3) return 1;\
  if (value > -3) return 0;\
  if (value > -8) return -1;\
  return -2;\
\};\
\
// -----------------------------\
// 5
\f1 \'b4\'eb\'be\'e7
\f0  & 4
\f1 \'b0\'e8\'c0\'fd
\f0  
\f1 \'b8\'c5\'c7\'ce
\f0 \
// -----------------------------\
const OceanMap: Record<number, string> = \{\
  "-2": "
\f1 \'b3\'b2\'b1\'d8\'c7\'d8
\f0 ",     // 
\f1 \'c2\'f7\'b0\'a9\'b0\'ed
\f0 /
\f1 \'b9\'cc\'c1\'f6
\f0 \
  "-1": "
\f1 \'ba\'cf\'b1\'d8\'c7\'d8
\f0 ",     // 
\f1 \'bf\'b9\'b9\'ce
\f0 /
\f1 \'b1\'d8\'ba\'b9
\f0 \
  "0": "
\f1 \'b4\'eb\'bc\'ad\'be\'e7
\f0 ",      // 
\f1 \'b5\'b5\'c0\'fc
\f0 /
\f1 \'b3\'b8\'bc\'b4
\f0 \
  "1": "
\f1 \'c0\'ce\'b5\'b5\'be\'e7
\f0 ",      // 
\f1 \'c5\'bd\'c7\'e8
\f0 /
\f1 \'bc\'d2\'c5\'eb
\f0 \
  "2": "
\f1 \'c5\'c2\'c6\'f2\'be\'e7
\f0 "       // 
\f1 \'b1\'a4\'c8\'b0
\f0 /
\f1 \'bd\'c3\'bf\'f8
\f0 \
\};\
\
const SeasonMap: Record<number, string> = \{\
  "-2": "
\f1 \'b0\'dc\'bf\'ef
\f0 ",\
  "-1": "
\f1 \'b0\'a1\'c0\'bb
\f0 ",\
  "0": "
\f1 \'ba\'bd
\f0 ",\
  "1": "
\f1 \'c3\'ca\'bf\'a9\'b8\'a7
\f0 ",\
  "2": "
\f1 \'c7\'d1\'bf\'a9\'b8\'a7
\f0 "\
\};\
\
// -----------------------------\
// MAIN: score calculation\
// -----------------------------\
export function calculateFinalScore(\
  answers: UserAnswer[],\
  choiceDB: ChoiceScore[]\
): FinalResult \{\
  let E = 0, P = 0, C = 0;\
\
  // 1) 
\f1 \'bb\'e7\'bf\'eb\'c0\'da\'b0\'a1
\f0  
\f1 \'bc\'b1\'c5\'c3\'c7\'d1
\f0  
\f1 \'b0\'a2
\f0  
\f1 \'b9\'ae\'c7\'d7\'c0\'c7
\f0  
\f1 \'c1\'a1\'bc\'f6\'b8\'a6
\f0  
\f1 \'ba\'d2\'b7\'af\'bf\'cd\'bc\'ad
\f0  
\f1 \'c7\'d5\'bb\'ea
\f0 \
  for (const ans of answers) \{\
    const score = choiceDB.find(\
      (c) => c.questionId === ans.questionId && c.choice === ans.choice\
    );\
    if (!score) continue;\
    E += score.energy;\
    P += score.positivity;\
    C += score.curiosity;\
  \}\
\
  // 2) 
\f1 \'be\'d0\'c3\'e0
\f0  (Normalize)\
  const nE = normalize(E);\
  const nP = normalize(P);\
  const nC = normalize(C);\
\
  // 3) 
\f1 \'c3\'d6\'c1\'be
\f0  
\f1 \'b0\'e1\'b0\'fa
\f0  
\f1 \'bb\'fd\'bc\'ba
\f0 \
  const ocean = OceanMap[nE];\
  const season = SeasonMap[nP]; // POSITIVITY \uc0\u8594  
\f1 \'b0\'e8\'c0\'fd
\f0 \
  const code = `$\{ocean\}-$\{season\}`;\
\
  return \{\
    ocean,\
    season,\
    code,\
    score: \{\
      energy: nE,\
      positivity: nP,\
      curiosity: nC\
    \}\
  \};\
\}}