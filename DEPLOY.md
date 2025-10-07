# 🚀 خطوات النشر السريع على Vercel

## ✅ الخطوة 1: رفع المشروع على GitHub

```bash
# إنشاء مستودع جديد
git init
git add .
git commit -m "Initial commit: AI Chat Application"

# ربط المستودع مع GitHub (استبدل YOUR_USERNAME و YOUR_REPO)
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
git branch -M main
git push -u origin main
```

## ✅ الخطوة 2: النشر على Vercel

### الطريقة السهلة (من خلال الموقع):

1. اذهب إلى: https://vercel.com/new
2. سجل دخول باستخدام حساب GitHub
3. اختر المستودع الذي رفعته
4. اضغط على **"Import"**
5. في قسم **"Environment Variables"** أضف:
   ```
   OPENAI_API_KEY = YOUR_GOOGLE_AI_API_KEY
   OPENAI_BASE_URL = https://generativelanguage.googleapis.com/v1beta/openai/
   ```
6. اضغط على **"Deploy"**
7. انتظر حتى ينتهي البناء (2-3 دقائق)
8. 🎉 تم! افتح الرابط الذي سيظهر لك

## 🔑 الحصول على Google AI API Key

1. اذهب إلى: https://aistudio.google.com/apikey
2. سجل دخول بحساب Google
3. اضغط على **"Create API Key"**
4. انسخ المفتاح واستخدمه في `OPENAI_API_KEY`

## 📝 ملاحظات مهمة:

- ✅ كل مرة تدفع تحديثات على GitHub، سيتم النشر تلقائياً
- ✅ المحادثات تُحفظ في متصفح المستخدم (localStorage)
- ✅ لا توجد قاعدة بيانات خارجية مطلوبة
- 🚧 ميزة رفع الصور معطلة حالياً (قيد التطوير)

## 🔄 تحديث المشروع بعد النشر:

```bash
git add .
git commit -m "Update: وصف التحديث"
git push
```

سيتم النشر تلقائياً على Vercel! 🚀

## ❓ مشاكل شائعة:

### المشكلة: الموديلات لا تظهر
**الحل:** تأكد من إضافة `OPENAI_API_KEY` في إعدادات Vercel

### المشكلة: الشات لا يرد
**الحل:** تأكد من صحة API Key وأن له صلاحيات

### المشكلة: صفحة بيضاء
**الحل:** افتح Build Logs في Vercel وتحقق من الأخطاء

---

**للدعم:** افتح Issue على GitHub أو راجع [Vercel Docs](https://vercel.com/docs)