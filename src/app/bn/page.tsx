import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'bn',
  title: 'Flux Kontext AI - পেশাদার AI ইমেজ জেনারেশন প্ল্যাটফর্ম | অসাধারণ ইমেজ তৈরি করুন',
  description: 'আমাদের অত্যাধুনিক AI প্রযুক্তির সাথে আপনার ধারণাগুলিকে পেশাদার ইমেজে রূপান্তরিত করুন। টেক্সট থেকে ইমেজ তৈরি করুন, বিদ্যমান ইমেজ সম্পাদনা করুন, এবং Flux Kontext AI এর শক্তি দিয়ে একাধিক ইমেজ প্রক্রিয়া করুন।',
})

const bnDictionary = {
  hero: {
    badge: "পেশাদার AI ইমেজ জেনারেশন প্ল্যাটফর্ম",
    title: "অসাধারণ ইমেজ তৈরি করুন",
    subtitle: "Flux Kontext AI",
    description: "আমাদের অত্যাধুনিক AI প্রযুক্তির সাথে আপনার ধারণাগুলিকে পেশাদার ইমেজে রূপান্তরিত করুন। টেক্সট থেকে ইমেজ তৈরি করুন, বিদ্যমান ইমেজ সম্পাদনা করুন, এবং Flux Kontext AI এর শক্তি দিয়ে একাধিক ইমেজ প্রক্রিয়া করুন।",
    cta: {
      primary: "তৈরি করা শুরু করুন",
      secondary: "মূল্য দেখুন"
    }
  },
  features: {
    title: "Flux Kontext AI প্ল্যাটফর্মের মূল বৈশিষ্ট্য",
    subtitle: "আমাদের Flux Kontext AI একটি নিরবচ্ছিন্ন প্ল্যাটফর্মে পেশাদার ইমেজ জেনারেশন এবং সম্পাদনা প্রদান করতে অত্যাধুনিক প্রযুক্তি একত্রিত করে।",
    items: [
      {
        title: "টেক্সট থেকে ইমেজ জেনারেশন",
        description: "উন্নত AI প্রযুক্তির সাথে আপনার টেক্সট বর্ণনাগুলিকে অসাধারণ, উচ্চ মানের ইমেজে রূপান্তরিত করুন।"
      },
      {
        title: "পেশাদার ইমেজ সম্পাদনা",
        description: "নির্ভুল পরিবর্তনের জন্য প্রাকৃতিক ভাষার নির্দেশনা দিয়ে বিদ্যমান ইমেজ সম্পাদনা করুন।"
      },
      {
        title: "মাল্টি-ইমেজ প্রক্রিয়াকরণ",
        description: "সামঞ্জস্যপূর্ণ স্টাইল এবং গুণমানের সাথে একসাথে একাধিক ইমেজ প্রক্রিয়া করুন।"
      }
    ]
  },
  faq: {
    title: "প্রায়শই জিজ্ঞাসিত প্রশ্ন",
    subtitle: "আমাদের Flux Kontext AI প্ল্যাটফর্ম এবং এর শক্তিশালী ইমেজ জেনারেশন বৈশিষ্ট্য সম্পর্কে সাধারণ প্রশ্নের উত্তর খুঁজুন।",
    items: [
      {
        question: "Flux Kontext AI কী?",
        answer: "Flux Kontext AI হল একটি উন্নত ইমেজ জেনারেশন প্ল্যাটফর্ম যা টেক্সট বর্ণনা থেকে অসাধারণ ইমেজ তৈরি করতে, বিদ্যমান ইমেজ সম্পাদনা করতে, এবং একসাথে একাধিক ইমেজ প্রক্রিয়া করতে অত্যাধুনিক কৃত্রিম বুদ্ধিমত্তা ব্যবহার করে।"
      }
    ]
  },
  cta: {
    title: "অবিশ্বাস্য ইমেজ তৈরি করতে প্রস্তুত?",
    subtitle: "হাজার হাজার সৃজনশীল ব্যক্তিদের সাথে যোগ দিন যারা তাদের ধারণাগুলিকে জীবন্ত করতে Flux Kontext AI ব্যবহার করেন।",
    button: "এখনই শুরু করুন"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "পেশাদার AI ইমেজ জেনারেশন প্ল্যাটফর্ম।",
      copyright: "© 2025 Flux Kontext. সমস্ত অধিকার সংরক্ষিত।"
    },
    contact: {
      title: "যোগাযোগ",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "আইনি",
      terms: "সেবার শর্তাবলী",
      privacy: "গোপনীয়তা নীতি",
      refund: "ফেরত নীতি"
    },
    languages: {
      title: "ভাষা"
    },
    social: {
      builtWith: "বিশ্বব্যাপী সৃজনশীলদের জন্য ❤️ দিয়ে তৈরি",
      followUs: "আমাদের অনুসরণ করুন"
    }
  }
}

export default function BengaliPage() {
  return <HomeContentSimple dictionary={bnDictionary} />
} 
