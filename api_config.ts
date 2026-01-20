// ডাইনামিক API কনফিগারেশন
const isLocal = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// লোকালহোস্টে থাকলে পুরো পাথ, আর লাইভ সার্ভারে থাকলে রিলেটিভ পাথ ব্যবহার করবে
// লাইভ সার্ভারে 'backend' ফোল্ডারটি আপনার index.html এর পাশেই আপলোড করবেন
export const API_BASE_URL = isLocal 
  ? 'http://localhost/dollar-tracker/backend' 
  : './backend'; 
