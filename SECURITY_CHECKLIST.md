# 🔐 Security Fix Checklist

## מצב נוכחי
❌ הקובץ .env נחשף בהיסטוריית Git
❌ מפתחות API חשופים ב-GitHub
✅ .env נמצא ב-.gitignore (אבל זה לא מספיק!)

---

## ✅ רשימת משימות - עשה אחד אחרי השני

### שלב 1: החלף מפתחות (30 דקות)

#### MongoDB Atlas
- [ ] התחבר ל-[MongoDB Atlas](https://cloud.mongodb.com)
- [ ] מחק משתמש: `8483431_db_user`
- [ ] צור משתמש חדש
- [ ] סיסמה מוצעת: `vSkPvfJzOck2muzm6tfBQP0LMn8YBOv`
- [ ] עדכן `MONGODB_URI` ב-.env שלך

#### OpenAI (דחוף!)
- [ ] לך ל-[OpenAI API Keys](https://platform.openai.com/api-keys)
- [ ] מחק מפתח: `sk-proj-rUQVk5gg4A5WvKgxQydL52gI...`
- [ ] צור מפתח חדש + **הגדר Usage Limits ($50/חודש)**
- [ ] עדכן `OPENAI_API_KEY` ב-.env

#### Cloudinary
- [ ] לך ל-[Cloudinary Console](https://console.cloudinary.com)
- [ ] Settings → Security → Generate new API Secret
- [ ] עדכן `CLOUDINARY_API_SECRET` ב-.env

#### JWT & Admin Secrets
- [ ] הרצתי: `node backend/scripts/generateSecrets.js`
- [ ] העתקתי את הערכים החדשים:
  ```
  JWT_SECRET=c8b1fe4be6fc13abd3a139f268d0a8392fd8d0caf7f163c6da3939b5c945cd09e0fbb951506d9b8b3f04fc984468b53b947631ffcd9482aaa7c91ef19d19b214

  ADMIN_BOOTSTRAP_SECRET=48cc52322dc98b4b16f8aaea945867a3e4dd8d79fec9eae5e285c127bf70c2cd
  ```

---

### שלב 2: נקה Git History (10 דקות)

#### אם אתה היחיד בפרויקט:
```bash
# התקן BFG
brew install bfg

# נקה את ההיסטוריה
cd /Users/bestflow/Documents/projects/active/bizflow-website
bfg --delete-files .env --delete-files '*.env'

# Cleanup
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# Force push (שים לב!)
git push --force --all
```

- [ ] הרצתי את הפקודות למעלה
- [ ] בדקתי ש-.env לא בהיסטוריה: `git log --all -- "*.env"`

#### ⚠️ אם יש לך שותפים בפרויקט:
- [ ] תיאמתי עם כולם שהם יעשו `git clone` מחדש
- [ ] הודעתי להם על השינוי

---

### שלב 3: Vercel Environment Variables (10 דקות)

- [ ] לך ל-[Vercel Dashboard](https://vercel.com/dashboard)
- [ ] בחר פרויקט → Settings → Environment Variables
- [ ] הוסף את כל המשתנים:
  - [ ] `MONGODB_URI` (החדש!)
  - [ ] `OPENAI_API_KEY` (החדש!)
  - [ ] `CLOUDINARY_API_SECRET` (החדש!)
  - [ ] `JWT_SECRET` (החדש!)
  - [ ] `ADMIN_BOOTSTRAP_SECRET` (החדש!)
  - [ ] `EMAIL_USER` (אם יש)
  - [ ] `EMAIL_PASSWORD` (אם יש)
- [ ] בחר Environments: Production + Preview + Development
- [ ] שמור
- [ ] Redeploy (Deployments → ... → Redeploy)

---

### שלב 4: בדיקות (5 דקות)

#### בדוק מקומי:
```bash
cd backend
npm start
```

צריך לראות:
- [ ] `✅ MongoDB connected`
- [ ] `✅ Email Service initialized`
- [ ] `✅ Server running on port 5000`

#### בדוק בפרודקשן:
- [ ] האתר עובד
- [ ] יכול להתחבר
- [ ] יכול ליצור לקוח חדש
- [ ] אין שגיאות בקונסול

---

## 🛡️ למניעה בעתיד

### הוסף Git Hook
```bash
# צור pre-commit hook
cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
if git diff --cached --name-only | grep -E '\.env$|\.env\.'; then
    echo "❌ Error: Attempting to commit .env file!"
    exit 1
fi
EOF

chmod +x .git/hooks/pre-commit
```

- [ ] הוספתי git hook למניעת commit של .env

---

## 📊 סטטוס

תאריך התחלה: ___________
תאריך סיום: ___________

**חתימה:** ___________ ✅

---

## 💬 עזרה נוספת?

אם תקלע ב:
1. קרא את [SECURITY_URGENT.md](SECURITY_URGENT.md)
2. שאל את Claude
3. גוגל: "rotate [service] api key"

**זה קריטי - אל תדחה!** 🚨
