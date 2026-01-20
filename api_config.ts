// ডাইনামিক API কনফিগারেশন

// আমরা চেক করছি অ্যাপটি 'production' মোডে আছে কিনা।
// import.meta.env.PROD ব্যবহার করার সময় ক্র্যাশ এড়াতে optional chaining (?.) ব্যবহার করা হয়েছে।
// যদি বিল্ড প্রসেস এটি রিপ্লেস না করে, তাহলে আমরা পোর্ট চেক করে সিদ্ধান্ত নেব।

// ১. সেফলি চেক করা
const viteEnvProd = (import.meta as any).env?.PROD;

// ২. ফলব্যাক: যদি পোর্ট ৫১৭৩ (Vite default) হয়, তাহলে এটি ডেভ মোড। অন্যথায় প্রোডাকশন (XAMPP/Live)।
const isDevPort = window.location.port === '5173';

const isProduction = viteEnvProd || !isDevPort;

export const API_BASE_URL = isProduction 
  ? './backend' 
  : 'http://localhost/dollar-tracker/backend'; // ডেভেলপমেন্টের সময় আপনার ফোল্ডারের নাম নিশ্চিত করুন