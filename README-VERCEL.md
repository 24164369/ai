# نشر المشروع على Vercel

## الخطوات:

### 1. تثبيت Vercel CLI (اختياري)
```bash
npm install -g vercel
```

### 2. رفع المشروع على GitHub
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

### 3. ربط المشروع مع Vercel

#### الطريقة الأولى: من خلال موقع Vercel (الأسهل)
1. اذهب إلى [vercel.com](https://vercel.com)
2. سجل دخول أو أنشئ حساب جديد
3. اضغط على "Add New Project"
4. اختر المستودع من GitHub
5. أضف المتغيرات البيئية (Environment Variables):
   - `OPENAI_API_KEY`: مفتاح API الخاص بك
   - `OPENAI_BASE_URL`: `https://generativelanguage.googleapis.com/v1beta/openai/`
6. اضغط على "Deploy"

#### الطريقة الثانية: من خلال CLI
```bash
vercel
```
ثم اتبع التعليمات وأضف المتغيرات البيئية:
```bash
vercel env add OPENAI_API_KEY
vercel env add OPENAI_BASE_URL
```

### 4. إعدادات المتغيرات البيئية المطلوبة

في لوحة تحكم Vercel، أضف المتغيرات التالية:

| المتغير | القيمة |
|---------|--------|
| `OPENAI_API_KEY` | مفتاح Google AI API الخاص بك |
| `OPENAI_BASE_URL` | `https://generativelanguage.googleapis.com/v1beta/openai/` |

### 5. إعادة النشر بعد التحديثات

كل مرة تدفع تحديثات إلى GitHub، سيتم إعادة النشر تلقائياً:
```bash
git add .
git commit -m "Update"
git push
```

أو يدوياً من خلال CLI:
```bash
vercel --prod
```

## ملاحظات مهمة:

1. **الموديلات المتاحة:**
   - Gemini 2.0 Flash Experimental
   - Gemini 1.5 Pro
   - Gemini 1.5 Flash
   - Gemini 1.5 Flash-8B

2. **الميزات:**
   - ✅ الدردشة النصية
   - ✅ حفظ المحادثات محلياً
   - ✅ تحميل المحادثات بصيغة Markdown
   - ✅ واجهة عربية/إنجليزية
   - 🚧 رفع الصور (قيد التطوير)

3. **الأداء:**
   - يستخدم Vercel Edge Functions للأداء السريع
   - التخزين المحلي في المتصفح (localStorage)

## استكشاف الأخطاء:

### إذا لم تظهر الموديلات:
- تأكد من إضافة `OPENAI_API_KEY` في إعدادات Vercel
- تأكد من صحة `OPENAI_BASE_URL`

### إذا لم يعمل الشات:
- افتح Developer Console (F12) وتحقق من الأخطاء
- تأكد من أن API Key صالح وله صلاحيات

### إذا كانت الصفحة بيضاء:
- تحقق من Build Logs في Vercel
- تأكد من أن البناء تم بنجاح

## الدعم:

للمزيد من المساعدة، راجع:
- [Vercel Documentation](https://vercel.com/docs)
- [Hono Documentation](https://hono.dev)