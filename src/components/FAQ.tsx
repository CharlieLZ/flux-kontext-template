import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { FAQSchema } from "@/components/StructuredData"
import { home } from "@/lib/content"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "What is Flux Kontext AI?",
    answer: "Flux Kontext AI is an advanced image generation platform that uses cutting-edge artificial intelligence to create stunning images from text descriptions, edit existing images, and process multiple images simultaneously."
  },
  {
    question: "How does text-to-image generation work?",
    answer: "Our AI analyzes your text description and generates high-quality images using advanced Flux Pro and Max models. Simply describe what you want to see, and our AI creates professional-grade images in seconds."
  },
  {
    question: "Can I edit existing images with Flux Kontext?",
    answer: "Yes! Our platform supports image editing through natural language instructions. Upload an image and describe the changes you want, and our AI will apply those modifications professionally."
  },
  {
    question: "What image formats and sizes are supported?",
    answer: "Flux Kontext AI supports multiple aspect ratios including 1:1, 16:9, 9:16, 4:3, 3:2, and 21:9. You can export images in JPEG and PNG formats at high resolution for professional use."
  },
  {
    question: "How many images can I generate at once?",
    answer: "You can generate up to 4 images simultaneously with our multi-image processing feature. This allows you to explore different variations of your concept efficiently."
  },
  {
    question: "What makes Flux Kontext different from other AI image generators?",
    answer: "Flux Kontext stands out with its advanced Flux Pro and Max models, professional image editing capabilities, multi-image processing, and flexible aspect ratio support all in one seamless platform."
  },
  {
    question: "Are there any usage limits or restrictions?",
    answer: "Usage depends on your plan and API limits. Our platform includes safety controls and content filtering to ensure responsible AI image generation while maintaining creative freedom."
  },
  {
    question: "Can I use generated images commercially?",
    answer: "Yes, images generated through Flux Kontext AI can typically be used for commercial purposes. Please review the specific terms of service and licensing agreements for detailed usage rights."
  }
]

export function FAQ() {
  return (
    <section className="app-section-shell px-4 py-16">
      <div className="container mx-auto max-w-4xl">
        <FAQSchema faqs={home.faq.items} />
        
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 gradient-text">
            {home.faq.title}
          </h2>
          <p className="text-muted-foreground text-lg">
            {home.faq.description}
          </p>
        </div>

        <Accordion type="single" collapsible className="space-y-4">
          {home.faq.items.map((item, index) => (
            <AccordionItem
              key={`faq-${item.question.slice(0, 20).replace(/\s+/g, '-')}`}
              value={`item-${index}`}
              className="app-surface-card app-surface-card--interactive rounded-2xl px-6 data-[state=open]:border-primary/50"
            >
              <AccordionTrigger className="text-left hover:no-underline hover:text-primary py-6">
                <span className="text-lg font-semibold">{item.question}</span>
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-6 leading-relaxed">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
