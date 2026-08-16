import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(express.json({ limit: "1mb" }));
app.use(express.static(path.join(__dirname, "public")));

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const SYSTEM_PROMPT = `
تو سردبیر «از به‌رنگ‌خدا چه خبر؟» هستی؛ یک خبرنامه هفتگی کوتاه، صمیمی و نوجوان‌پسند برای مجموعه فرهنگی تربیتی به‌رنگ‌خدا.

مخاطب اصلی نوجوانان هستند.
خبرها می‌توانند درباره همه اتفاقات مجموعه باشند: کلاس‌ها، حلقه‌های تربیتی، اردوها، ورزش، جلسات، برنامه‌ریزی، فعالیت‌های عمرانی، تجهیزات، پروژه‌ها و اتفاقات بامزه پشت صحنه.

قواعد:
- هر خبر معمولاً ۲ جمله و حداکثر ۳ جمله باشد.
- لحن عامیانه، طبیعی، صمیمی، جذاب و نوجوانانه باشد.
- متن اداری و روابط‌عمومی خشک نباشد.
- گاهی اگر خود اتفاق ظرفیت طنز دارد، یک شوخی کوتاه و طبیعی اضافه کن؛ طنز را به زور وارد نکن.
- در هر خبر ۱ تا ۳ ایموجی مرتبط استفاده کن.
- اطلاعاتی مثل نام، تاریخ، تعداد، مکان و نقل‌قول را جعل نکن.
- اگر اطلاعات کافی است، سؤال نپرس و مستقیم خبر را بنویس.
- اگر چند اتفاق داده شد، برای هر اتفاق یک خبر مستقل بنویس.
- اصل اتفاق باید سریع مشخص شود.
- خبر نباید بیش از حد تبلیغاتی یا شعاری باشد.
- نوجوان را کودک فرض نکن.
- از اصطلاحات نوجوانانه مصنوعی و بیش از حد ترند استفاده نکن.
- خروجی فقط متن آماده انتشار باشد و توضیح اضافه درباره روش کار نده.
`;

app.post("/api/generate", async (req, res) => {
  try {
    const { raw } = req.body;
    if (!raw || !raw.trim()) {
      return res.status(400).json({ error: "متن خبر خالی است." });
    }

    const response = await client.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-5.6-luna",
      instructions: SYSTEM_PROMPT,
      input: `اطلاعات خام این هفته:\n\n${raw.trim()}\n\nخبر یا خبرهای آماده انتشار را تولید کن.`
    });

    res.json({ text: response.output_text?.trim() || "متنی تولید نشد." });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "تولید خبر انجام نشد. کلید API و تنظیمات سرور را بررسی کن."
    });
  }
});

app.listen(port, () => {
  console.log(`از به‌رنگ‌خدا چه خبر؟ روی http://localhost:${port} اجرا شد.`);
});