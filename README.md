# 🌌 Nexus 3D Admin Panel

একটি আধুনিক, ফিউচারিস্টিক এবং ইন্টারেক্টিভ **3D Admin Panel** যা **Vite, React 18, Three.js, React Three Fiber (R3F), Drei, Framer Motion, Tailwind CSS** এবং **Lucide Icons** দিয়ে তৈরি করা হয়েছে।

---

## 📁 প্রজেক্ট স্ট্রাকচার (Project Structure)

```
my-3d-admin-panel/
├── public/
│   ├── assets/
│   │   ├── images/              # ব্যাকগ্রাউন্ড ও অন্যান্য হাই-কোয়ালিটি ছবি
│   │   ├── videos/              # স্ক্রল-ট্রিগার ভিডিও ও ব্যাকগ্রাউন্ড ভিডিও
│   │   └── models/              # 3D মডেল ফাইল (.gltf, .glb, .obj)
│   └── favicon.ico              # 3D কিউব আইকন
│
├── src/
│   ├── assets/                  # সোর্স ফোল্ডারের মিডিয়া ও স্টাইলস
│   │   ├── styles/
│   │   │   ├── main.css         # গ্লোবাল স্টাইলস ও গ্লাসমোরফিজম
│   │   │   └── animations.css   # কাস্টম ৩ডি ও নিয়ন অ্যানিমেশন
│   │   └── fonts/               # কাস্টম ফন্টস
│   │
│   ├── components/              # রি-ইউজেবল UI কম্পোনেন্ট
│   │   ├── layout/
│   │   │   ├── Sidebar.jsx      # সাইডবার নেভিগেশন ও GPU VRAM মিটার
│   │   │   ├── Navbar.jsx       # টপ বার, গ্লোবাল সার্চ ও নোটিফিকেশন
│   │   │   └── Footer.jsx       # লাইভ FPS ও মেমোরি স্ট্যাটাস বার
│   │   │
│   │   ├── 3d/                  # 3D সিন ও এলিমেন্টসমূহ
│   │   │   ├── BackgroundCanvas.jsx  # ৩ডি পার্টিকেল স্টারফিল্ড ও গ্রিড সিন
│   │   │   ├── InteractiveModel.jsx  # মাউস/ড্র্যাগ ইন্টারেক্টিভ ৩ডি কোর (OrbitControls)
│   │   │   └── FloatingElements.jsx  # ভাসমান ৩ডি অবজেক্ট ও কিউবস
│   │   │
│   │   ├── media/               # ইমেজ ও ভিডিও কম্পোনেন্ট
│   │   │   ├── ScrollVideoPlayer.jsx # স্ক্রল করলে ভিডিও/ক্যানভাস ফ্রেম স্ক্রাব হয়
│   │   │   └── ImageGallery.jsx      # ৩ডি টিল্ট ইমেজ শোকেস ও লাইটবক্স
│   │   │
│   │   └── UI/                  # গ্লাসমোরফিজম ও অ্যানিমেটেড কন্ট্রোল
│   │       ├── GlassCard.jsx         # ৩ডি টিল্ট ফ্রস্টেড গ্লাস কার্ড
│   │       └── AnimatedButton.jsx    # নিয়ন গ্লো ও রিপল বাটন
│   │
│   ├── views/ / pages/          # বিভিন্ন পেজ বা ড্যাশবোর্ড স্ক্রিন
│   │   ├── Dashboard.jsx        # মূল ৩ডি ড্যাশবোর্ড ও লাইভ লগ
│   │   ├── Analytics.jsx        # ড্র-কল ও গ্লোবাল লেটেন্সি চার্ট
│   │   └── Settings.jsx         # ৩ডি গ্রাফিক্স কোয়ালিটি ও থিম সিলেক্টর
│   │
│   ├── hooks/                   # কাস্টম হুকস
│   │   ├── useScrollAnimation.js# স্ক্রল পজিশন ও প্রগ্রেস ট্র্যাকার
│   │   └── use3DScene.js        # ৩ডি মাউস প্যারাল্যাক্স ও FPS মনিটর
│   │
│   ├── utils/                   # কনস্ট্যান্ট ও মক ডেটা
│   │   └── constants.js
│   │
│   ├── App.jsx                  # রুট কম্পোনেন্ট ও সিন কোঅর্ডিনেটর
│   └── main.jsx                 # এন্ট্রি পয়েন্ট
│
├── index.html                   # HTML টেমপ্লেট
├── vite.config.js               # Vite কনফিগারেশন
├── tailwind.config.js           # সাইবার নিয়ন কালার ও শ্যাডো কনফিগ
├── postcss.config.js            # PostCSS প্লাগইন
├── package.json                 # ডিপেনডেন্সি ফাইল
└── README.md
```

---

## ✨ প্রধান ফিচারসমূহ (Key Features)

1. **WebGL 3D Background**: রিয়েল-টাইম পার্টিকেল গ্যালাক্সি এবং মোশন গ্রিড যা ব্রাউজারের ব্যাকগ্রাউন্ডে মসৃণভাবে 60+ FPS-এ রেন্ডার হয়।
2. **Interactive 3D Model Viewer**: `OrbitControls`, ওয়্যারফ্রেম টগল, কালার চেঞ্জার এবং জিওমেট্রি সুইচিং (`Icosahedron`, `TorusKnot`, `Octahedron`, `Dodecahedron`)।
3. **Scroll-Driven Media Player**: ভিউপোর্টের স্ক্রলিং গভীরতার সাথে ভিডিও ফ্রেম বা প্রসিডিউরাল ক্যানভাস ওয়েভফর্ম স্ক্রাবিং।
4. **3D Parallax Image Gallery**: মাউস হবার করলে কার্ডগুলো ৩ডি পার্সপেক্টিভে টিল্ট হয় এবং ক্লিক করলে ফুলস্ক্রিন হলো-লাইটবক্সে ওপেন হয়।
5. **Ultra Glassmorphism UI**: ফ্রস্টেড গ্লাস ব্যাকড্রপ ব্লার, নিয়ন বর্ডার গ্লো এবং ডায়নামিক লাইট রিফ্লেকশন।
6. **Live Diagnostics**: রিয়েলটাইম FPS কাউন্টার, VRAM ইউটিলাইজেশন এবং সাবসিস্টেম ইভেন্ট লগ।
7. **Graphics Quality Controls**: লো, মিডিয়াম এবং আল্ট্রা প্রিসেট যাতে যেকোনো ডিভাইসে স্মুথ চলে।

---

## 🚀 ইন্সটলেশন ও রান করার নিয়ম (How to Run)

### ১. ডিপেনডেন্সি ইন্সটল করুন
```bash
npm install
```

### ২. ডেভেলপমেন্ট সার্ভার চালু করুন
```bash
npm run dev
```
ব্রাউজারে চালু হবে: `http://localhost:3000`

### ৩. প্রোডাকশন বিল্ড তৈরি করুন
```bash
npm run build
```

---

## 🎨 নতুন 3D মডেল (.gltf / .glb) যুক্ত করার নিয়ম

আপনার কাস্টম 3D মডেল যোগ করতে:
1. আপনার `.glb` বা `.gltf` ফাইলটি `public/assets/models/` ফোল্ডারে রাখুন।
2. Drei এর `useGLTF` হুক ব্যবহার করে সহজে লোড করুন:
```jsx
import { useGLTF } from '@react-three/drei';

function CustomModel() {
  const { scene } = useGLTF('/assets/models/your-model.glb');
  return <primitive object={scene} scale={1.5} />;
}
```

---

## 🛠️ ব্যবহৃত টেকনোলজি (Tech Stack)
- **Framework**: React 18
- **Bundler**: Vite 5
- **3D Engine**: Three.js, @react-three/fiber, @react-three/drei
- **Styling**: Tailwind CSS, Custom Glassmorphism, CSS Animations
- **Motion**: Framer Motion
- **Icons**: Lucide React
- **Effects**: Canvas-Confetti
