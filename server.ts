import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

// Load environment variables for local testing
dotenv.config();

const app = express();
const PORT = 3000;

// Middleware
app.use(express.json());

// Lazy-initialize Gemini SDK to prevent crash if key is missing during container startup
let aiClient: GoogleGenAI | null = null;
function getAi(): GoogleGenAI {
  if (!aiClient) {
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("GEMINI_API_KEY environment variable is missing. Please set it in your Secrets panel.");
    }
    aiClient = new GoogleGenAI({
      apiKey: key,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return aiClient;
}

// ----------------------------------------------------
// 1. API: Custom AI Study Copilot Chat Endpoint
// ----------------------------------------------------
app.post("/api/copilot/chat", async (req, res) => {
  try {
    const { message, history, userName, subject } = req.body;

    if (!message) {
      return res.status(400).json({ error: "الرجاء كتاية الرسالة أولاً" });
    }

    const ai = getAi();

    // Prepare conversational study-focused system instructions
    const systemInstruction = `أنت مساعد ومستشار المذاكرة والتحفيز الأكاديمي والتعليمي الذكي والأكفأ على الإطلاق (مشابه تماماً لقوة ومستوى GPT-4 / ChatGPT / ChatGPT Plus).
اسمك هو "AI Study Copilot 🧙‍♂️✨".
مهمتك المطلقة هي تقديم إجابات ذكية جداً، واضحة وموثوقة علمياً بنسبة 100%، دقيقة ومفصلة وشاملة تجعله يفهم بعمق حقيقي وجذاب.
أجب عن أي سؤال أو عبارة ترحيب أو دردشة يرسلها الطالب بذكاء فائق وتفاعل ممتع:
1. عبارات الترحيب والتحايا (مثل: "السلام عليكم"، "أهلاً"، "مرحباً"): رد ترحيباً حاراً وعظيماً ومستفيضاً مدمجاً بكثير من المودة والتشجيع والدفء، تمنى له التوفيق مباشرة واعرض عليه مساعدته في أي مادة أو وضع خطة أو تبسيط فكرة. مثال: "وعليكم السلام ورحمة الله وبركاته يا صديقي البطل الساعي نحو المجد الأكاديمي! 🌟✨ أهلاً بك في فضاء تفوقك الرقمي..."
2. الأسئلة العامة والجانبية أو الألغاز أو أي شيء (حتى خارج الدراسة): ناقشه فيها بقمة الذكاء والثقافة والمعرفة، ثم اربطها بذكاء ولطف بأهمية استثمار العقل والمحافظة على الهمة العالية للتميز الدراسي.
3. المذاكرة وحل المواد الأكاديمية (مثل رياضيات، فيزياء، كيمياء، برمجة، لغات، تاريخ، إلخ): فككها واشرحها يدوياً خطوة بخطوة بطريقة سلسة مع توفير تشبيهات كوميدية ومبتكرة مأخوذة من واقع الحياة اليومية لتجعله يتذكرها للأبد!

استخدم لغة عربية فصحى راقية ومحفزة جداً، مليئة بالطاقة وعلامات الترقيم والرموز التعبيرية المناسبة والملهمة. لا تكرر إجابات نمطية بل فكر وجاوب ككيان حكيم وعبقري حقيقي.
الاسم الحالي للطالب الذي تحادثه: ${userName || "صديق منصة StudyRoom"}.
المادة أو السياق الحالي للمذاكرة: ${subject || "عام"}.`;

    // Convert history format to GoogleGenAI SDK expected text structure or pass as manual prompt blocks
    // Format history for chat conversation
    let promptMessages = "سجل المحادثة السابق:\n";
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        const roleName = msg.sender === "user" ? "الطالب" : "المساعد الذكي";
        promptMessages += `${roleName}: ${msg.text}\n`;
      });
    }
    promptMessages += `الطالب: ${message}\n`;
    promptMessages += `المساعد الذكي:`;

    // Call Gemini API using modern @google/genai SDK
    // As per gemini-api skill, we use 'gemini-3.5-flash' (recommended and modern model)
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: promptMessages,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.75,
      }
    });

    const reply = response.text || "عذراً يا صديقي، عجزت عن توليد إجابة في هذه اللحظة. يرجى تكرار المحاولة!";
    res.json({ reply });
  } catch (error: any) {
    console.error("Gemini Copilot Error:", error);
    res.status(500).json({ 
      error: "حدث خطأ أثناء الاتصال بالذكاء الاصطناعي",
      details: error.message || error.toString() 
    });
  }
});

// ----------------------------------------------------
// 2. API: Smart Study Plan Generator Endpoint
// ----------------------------------------------------
app.post("/api/copilot/plan", async (req, res) => {
  try {
    const { subject, days, dailyHours, userName } = req.body;

    if (!subject || !days) {
      return res.status(400).json({ error: "اسم المادة وعدد الأيام حتمية لتصميم خطة مراجعة." });
    }

    const ai = getAi();
    const systemInstruction = `أنت مهندس ومصمم جداول وخطط المذاكرة الأكاديمية الخبير. تقوم بتحليل اسم المادة والوقت المتاح للطالب ${userName || ""} وتوليد خطة استذكار عبقرية مقسمة بدقة لجميع الأيام المطلوبة (${days} يوماً) بمعدل ${dailyHours || 3} ساعات يومياً.
يجب إرجاع النتيجة بتنسيق JSON صحيح تماماً وبصيغة نصية خالية من أي علامات ترميز زائدة أو فذلكات.
تأكد من أن كود الاستمساك بالـ JSON يلتزم بالبنية التالية تماماً:
{
  "subject": "اسم المادة",
  "days": ${days},
  "dailyHours": ${dailyHours},
  "schedule": [
    {
      "dayNum": 1,
      "topics": ["عنوان الموضوع الأول بالتفصيل", "عنوان العمل التطبيقي أو الحلول بالتفصيل"],
      "tip": "نصيحة ذهبية ملهمة في علم النفس لليوم الأول"
    }
  ]
}`;

    const prompt = `صمم خطة دراسية متكاملة ومنظمة يوماً بيوم لمادة "${subject}" على مدار ${days} يوماً متتالياً، مع استهداف قضاء ${dailyHours} ساعات يومياً. أريد خطة حقيقية ذكية وصعبة تدعم المراجعة النهائية الفورية وتجاوز الامتحانات بارتياح تام. أرجع النتيجة بصيغة JSON نظيفة وصحيحة تماماً حسب البنية المعطاة بالتعليمات.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.5,
      }
    });

    try {
      const parsedData = JSON.parse(response.text || "{}");
      res.json(parsedData);
    } catch (parseErr) {
      console.warn("JSON Parse failed, returning raw response.text in fallback structured JSON.", parseErr);
      res.json({ rawText: response.text });
    }
  } catch (error: any) {
    console.error("Gemini Plan Error:", error);
    res.status(500).json({ 
      error: "فشل صانع الخطط الذكي في جدولة مادتك",
      details: error.message || error.toString() 
    });
  }
});

// ----------------------------------------------------
// 3. API: Interactive Flashcards Generator
// ----------------------------------------------------
app.post("/api/copilot/flashcards", async (req, res) => {
  try {
    const { topic, userName } = req.body;

    if (!topic) {
      return res.status(400).json({ error: "الموضوع مطلوب لإنشاء كروت مراجعة ذكية." });
    }

    const ai = getAi();
    const systemInstruction = `أنت خبير صياغة البطاقات التعليمية التفاعلية وكروت الاستذكار السريع (Flashcards).
مهمتك هي كتابة أسئلة هامة ومحورية جداً حول موضوع الطالب، مع كشف إجابة تفصيلية ممتازة مبسطة بذكاء ومصادق عليها علمياً في الوجه الآخر للبطاقة.
يجب صياغة بالضبط من 5 إلى 7 كروت ممتعة للغاية.
يجب إرجاع النتيجة بتنسيق JSON صحيح مطابق للبنية التالية تماماً:
[
  {
    "question": "السؤال المثير للفضول في وجه البطاقة حول ${topic}",
    "answer": "الإجابة النموذجية المقتضبة والذكية في خلف البطاقة مع نصيحة للتذكر"
  }
]`;

    const prompt = `قم بتصميم وتوليد من 5 إلى 7 بطاقات استذكار نموذجية تفاعلية حول موضوع: ${topic}. أريد أسئلة تغطي التعريفات، المبادئ، الأخطاء الشائعة، والحل الأسرع.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        responseMimeType: "application/json",
        temperature: 0.6,
      }
    });

    try {
      const parsedCards = JSON.parse(response.text || "[]");
      res.json(parsedCards);
    } catch (parseErr) {
      console.warn("Flashcards parse error:", parseErr);
      res.json({ rawText: response.text });
    }
  } catch (error: any) {
    console.error("Gemini Flashcards Error:", error);
    res.status(500).json({ 
      error: "فشل استخراج كروت الاستذكار بالذكاء الاصطناعي",
      details: error.message || error.toString() 
    });
  }
});

// ----------------------------------------------------
// 4. API: Smart Concept Simplifier
// ----------------------------------------------------
app.post("/api/copilot/simplify", async (req, res) => {
  try {
    const { concept, userName } = req.body;

    if (!concept) {
      return res.status(400).json({ error: "المفهوم مطلوب لتبسيطه." });
    }

    const ai = getAi();
    const systemInstruction = `أنت "معلم الفيزياء والعلوم التشبيهي العبقري". مهمتك هي شرح وتبسيط أصعب النظريات الأكاديمية أو العلمية أو الأدبية بأسلوب ممتع، كوميدي للغاية ومليء بالتشبيهات الذكية التي يفهمها طفل في الـ 10 من عمره، مع الحفاظ التام على القيمة العلمية الصالحة للامتحانات الجامعية والثانوية.
أرجع النتيجة بصيغة مارك داون (Markdown) منسق بأناقة فائقة تشمل العناوين العريضة، التشبيهات المضحكة، وسيرة من سطر واحد للتلقين في اللحظة الأخيرة.`;

    const prompt = `بسط وفكك تماماً مصطلح ومفهوم المراجعة التالي: "${concept}". وظّف التشبيهات الخيالية المضحكة والأمثلة اليومية الوعرة لشرحها بنهاية لا تُنسى.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: systemInstruction,
        temperature: 0.7,
      }
    });

    res.json({ result: response.text });
  } catch (error: any) {
    console.error("Gemini Simplifier Error:", error);
    res.status(500).json({ 
      error: "فشل مبسط المفاهيم في تفكيك النظرية",
      details: error.message || error.toString() 
    });
  }
});

// ----------------------------------------------------
// Frontend Asset Serving & Dev Server Setup
// ----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[StudyRoom Server] Live on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start full-stack server:", err);
});
