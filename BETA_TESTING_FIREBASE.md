# دليل الاختبار التجريبي للعبة Skyward Realms: Echo of Elements على Firebase Hosting

يشرح هذا الدليل كيفية نشر لعبة Skyward Realms: Echo of Elements على Firebase Hosting لإجراء اختبار تجريبي (Beta Testing) بسهولة ومشاركتها مع المختبرين.

## المتطلبات المسبقة

تأكد من تثبيت البرامج التالية على جهازك:

1.  **Node.js و npm/pnpm**: يفضل استخدام `pnpm` لإدارة الحزم.
2.  **Firebase CLI**: واجهة سطر الأوامر الخاصة بـ Firebase.
    -   إذا لم تكن مثبتة، يمكنك تثبيتها باستخدام `npm`:
        ```bash
        npm install -g firebase-tools
        ```
3.  **حساب Firebase**: ستحتاج إلى مشروع Firebase موجود أو إنشاء مشروع جديد.

## خطوات النشر على Firebase Hosting

اتبع الخطوات التالية لنشر اللعبة:

### 1. بناء اللعبة للإنتاج

قبل النشر، يجب بناء نسخة محسّنة من اللعبة. تأكد أنك داخل مجلد `game-client`:

```bash
cd skyward_realms/game-client
pnpm run build
```

سيؤدي هذا إلى إنشاء مجلد `dist` يحتوي على جميع الملفات الثابتة الجاهزة للنشر.

### 2. تسجيل الدخول إلى Firebase

إذا لم تكن قد سجلت الدخول إلى Firebase CLI من قبل، فافعل ذلك باستخدام الأمر التالي:

```bash
firebase login
```

سيفتح هذا نافذة متصفح لتسجيل الدخول إلى حساب Google الخاص بك.

### 3. تهيئة مشروع Firebase

انتقل إلى المجلد الجذر لمشروعك (مجلد `skyward_realms`) وقم بتهيئة Firebase:

```bash
cd skyward_realms
firebase init
```

عندما يُطلب منك، اختر الخيارات التالية:

-   **Which Firebase features do you want to set up for this directory?** اختر `Hosting` (استخدم مفتاح المسافة للتحديد، ثم Enter).
-   **Please select a project:** اختر مشروع Firebase الحالي الخاص بك أو أنشئ مشروعًا جديدًا.
-   **What do you want to use as your public directory?** اكتب `game-client/dist` (هذا هو المجلد الذي يحتوي على ملفات الإنتاج المبنية).
-   **Configure as a single-page app (rewrite all URLs to /index.html)?** اكتب `Yes` (نعم).
-   **Set up automatic builds and deploys with GitHub?** اكتب `No` (لا) في الوقت الحالي، يمكنك إعداد ذلك لاحقًا إذا أردت.

سيؤدي هذا إلى إنشاء ملف `firebase.json` وملف `.firebaserc` في المجلد الجذر لمشروعك.

### 4. نشر اللعبة

الآن، يمكنك نشر اللعبة على Firebase Hosting باستخدام الأمر التالي من المجلد الجذر لمشروعك (`skyward_realms`):

```bash
firebase deploy --only hosting
```

بعد اكتمال النشر، ستظهر لك رسالة تحتوي على رابط `Hosting URL`. هذا هو الرابط الذي يمكنك مشاركته مع المختبرين.

## تحديث اللعبة المنشورة

عند إجراء تغييرات على اللعبة وتريد تحديث النسخة المنشورة:

1.  قم ببناء اللعبة مرة أخرى:
    ```bash
    cd skyward_realms/game-client
    pnpm run build
    ```
2.  انشر التغييرات:
    ```bash
    cd skyward_realms
    firebase deploy --only hosting
    ```

## استكشاف الأخطاء وإصلاحها

-   **خطأ في النشر**: تأكد من أنك قمت بتسجيل الدخول إلى Firebase (`firebase login`) وأنك اخترت المشروع الصحيح (`firebase use <project-id>`).
-   **عدم ظهور اللعبة**: تأكد من أن `public directory` في `firebase.json` يشير بشكل صحيح إلى `game-client/dist`.
-   **مشاكل في التوجيه (Routing)**: إذا كانت اللعبة لا تعمل بشكل صحيح عند التنقل بين الصفحات، تأكد من أنك قمت بتعيين `single-page app` إلى `Yes` أثناء التهيئة.

---

