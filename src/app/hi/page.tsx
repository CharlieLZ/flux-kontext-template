import type { Metadata } from 'next'
import { HomeContentSimple } from '@/components/HomeContentSimple'
import { generateLocalizedHomeMetadata } from '@/lib/seo/metadata-generator'

export const metadata: Metadata = generateLocalizedHomeMetadata({
  locale: 'hi',
  title: 'Flux Kontext AI - पेशेवर AI इमेज जेनरेशन प्लेटफॉर्म | शानदार इमेज बनाएं',
  description: 'हमारी अत्याधुनिक AI तकनीक के साथ अपने विचारों को पेशेवर इमेज में बदलें। टेक्स्ट से इमेज जेनरेट करें, मौजूदा इमेज को एडिट करें, और Flux Kontext AI की शक्ति के साथ कई इमेज को प्रोसेस करें।',
})

const hiDictionary = {
  hero: {
    badge: "पेशेवर AI इमेज जेनरेशन प्लेटफॉर्म",
    title: "शानदार इमेज बनाएं",
    subtitle: "Flux Kontext AI",
    description: "हमारी अत्याधुनिक AI तकनीक के साथ अपने विचारों को पेशेवर इमेज में बदलें। टेक्स्ट से इमेज जेनरेट करें, मौजूदा इमेज को एडिट करें, और Flux Kontext AI की शक्ति के साथ कई इमेज को प्रोसेस करें।",
    cta: {
      primary: "बनाना शुरू करें",
      secondary: "कीमत देखें"
    }
  },
  features: {
    title: "Flux Kontext AI प्लेटफॉर्म की मुख्य विशेषताएं",
    subtitle: "हमारा Flux Kontext AI एक सहज प्लेटफॉर्म में पेशेवर इमेज जेनरेशन और एडिटिंग प्रदान करने के लिए अत्याधुनिक तकनीक को जोड़ता है।",
    items: [
      {
        title: "टेक्स्ट से इमेज जेनरेशन",
        description: "उन्नत AI तकनीक के साथ अपने टेक्स्ट विवरण को शानदार, उच्च गुणवत्ता वाली इमेज में बदलें।"
      },
      {
        title: "पेशेवर इमेज एडिटिंग",
        description: "सटीक संशोधन के लिए प्राकृतिक भाषा निर्देशों के साथ मौजूदा इमेज को एडिट करें।"
      },
      {
        title: "मल्टी-इमेज प्रोसेसिंग",
        description: "लगातार स्टाइल और गुणवत्ता के साथ एक साथ कई इमेज को प्रोसेस करें।"
      }
    ]
  },
  faq: {
    title: "अक्सर पूछे जाने वाले प्रश्न",
    subtitle: "हमारे Flux Kontext AI प्लेटफॉर्म और इसकी शक्तिशाली इमेज जेनरेशन सुविधाओं के बारे में सामान्य प्रश्नों के उत्तर खोजें।",
    items: [
      {
        question: "Flux Kontext AI क्या है?",
        answer: "Flux Kontext AI एक उन्नत इमेज जेनरेशन प्लेटफॉर्म है जो टेक्स्ट विवरण से शानदार इमेज बनाने, मौजूदा इमेज को एडिट करने, और एक साथ कई इमेज को प्रोसेस करने के लिए अत्याधुनिक कृत्रिम बुद्धिमत्ता का उपयोग करता है।"
      }
    ]
  },
  cta: {
    title: "अद्भुत इमेज बनाने के लिए तैयार हैं?",
    subtitle: "हजारों रचनाकारों के साथ जुड़ें जो अपने विचारों को जीवंत करने के लिए Flux Kontext AI का उपयोग करते हैं।",
    button: "अभी शुरू करें"
  },
  footer: {
    brand: {
      name: "Flux Kontext",
      description: "पेशेवर AI इमेज जेनरेशन प्लेटफॉर्म।",
      copyright: "© 2025 Flux Kontext. सभी अधिकार सुरक्षित।"
    },
    contact: {
      title: "संपर्क",
      email: "{{supportEmail}}"
    },
    legal: {
      title: "कानूनी",
      terms: "सेवा की शर्तें",
      privacy: "गोपनीयता नीति",
      refund: "रिफंड नीति"
    },
    languages: {
      title: "भाषाएं"
    },
    social: {
      builtWith: "दुनिया भर के रचनाकारों के लिए ❤️ के साथ बनाया गया",
      followUs: "हमें फॉलो करें"
    }
  }
}

export default function HindiPage() {
  return <HomeContentSimple dictionary={hiDictionary} />
} 
