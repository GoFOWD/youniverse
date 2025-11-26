{\rtf1\ansi\ansicpg1252\cocoartf2867
\cocoatextscaling0\cocoaplatform0{\fonttbl\f0\fnil\fcharset0 .SFNS-Semibold;\f1\fnil\fcharset129 AppleSDGothicNeo-SemiBold;}
{\colortbl;\red255\green255\blue255;\red14\green14\blue14;}
{\*\expandedcolortbl;;\cssrgb\c6700\c6700\c6700;}
\paperw11900\paperh16840\margl1440\margr1440\vieww16440\viewh16440\viewkind0
\pard\tx560\tx1120\tx1680\tx2240\tx2800\tx3360\tx3920\tx4480\tx5040\tx5600\tx6160\tx6720\sl324\slmult1\pardirnatural\partightenfactor0

\f0\b\fs30 \cf2 import \{ NextRequest, NextResponse \} from "next/server";\
import \{ createClient \} from "@supabase/supabase-js";\
import \{ calculateFinalScore \} from "@/lib/score";\
\
export const runtime = "nodejs";\
\
// Supabase 
\f1 \'bf\'ac\'b0\'e1
\f0 \
const supabase = createClient(\
  process.env.NEXT_PUBLIC_SUPABASE_URL!,\
  process.env.SUPABASE_SERVICE_KEY! // service role \uc0\u8594  
\f1 \'c0\'d0\'b1\'e2
\f0  OK\
);\
\
export async function POST(req: NextRequest) \{\
  try \{\
    const body = await req.json();\
    const \{ answers \} = body;\
\
    if (!answers || !Array.isArray(answers)) \{\
      return NextResponse.json(\
        \{ error: "answers 
\f1 \'b9\'e8\'bf\'ad\'c0\'cc
\f0  
\f1 \'c7\'ca\'bf\'e4\'c7\'d5\'b4\'cf\'b4\'d9
\f0 ." \},\
        \{ status: 400 \}\
      );\
    \}\
\
    // 1) choices 
\f1 \'c5\'d7\'c0\'cc\'ba\'ed
\f0  
\f1 \'b8\'f0\'b5\'ce
\f0  
\f1 \'b0\'a1\'c1\'ae\'bf\'c0\'b1\'e2
\f0 \
    const \{ data: choiceDB, error \} = await supabase\
      .from("choices")\
      .select("*");\
\
    if (error) \{\
      console.error(error);\
      return NextResponse.json(\
        \{ error: "choices 
\f1 \'b5\'a5\'c0\'cc\'c5\'cd\'b8\'a6
\f0  
\f1 \'ba\'d2\'b7\'af\'bf\'c0\'c1\'f6
\f0  
\f1 \'b8\'f8\'c7\'df\'bd\'c0\'b4\'cf\'b4\'d9
\f0 ." \},\
        \{ status: 500 \}\
      );\
    \}\
\
    // 2) 
\f1 \'c1\'a1\'bc\'f6
\f0  
\f1 \'b0\'e8\'bb\'ea
\f0 \
    const result = calculateFinalScore(answers, choiceDB);\
\
    return NextResponse.json(\{ result \});\
  \} catch (err) \{\
    console.error(err);\
    return NextResponse.json(\
      \{ error: "
\f1 \'bf\'b9\'bb\'f3\'c4\'a1
\f0  
\f1 \'b8\'f8\'c7\'d1
\f0  
\f1 \'bf\'c0\'b7\'f9\'b0\'a1
\f0  
\f1 \'b9\'df\'bb\'fd\'c7\'df\'bd\'c0\'b4\'cf\'b4\'d9
\f0 ." \},\
      \{ status: 500 \}\
    );\
  \}\
\}}