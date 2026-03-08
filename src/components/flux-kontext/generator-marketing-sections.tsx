"use client";

import {
  Edit,
  Image as ImageIcon,
  Layers,
  Lock,
  Settings,
  Upload,
  Zap,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { GeneratorModelValue } from "@/components/flux-kontext/types";

interface GeneratorMarketingSectionsProps {
  selectedModel: GeneratorModelValue;
  availableModels: string[];
  onSelectModel: (value: GeneratorModelValue) => void;
  onUpgrade: () => void;
}

export function GeneratorMarketingSections({
  selectedModel,
  availableModels,
  onSelectModel,
  onUpgrade,
}: GeneratorMarketingSectionsProps) {
  const workflowSteps = [
    {
      title: "Stage your source",
      description:
        "Drop in a reference image when you need identity, styling, or composition continuity.",
      icon: Upload,
    },
    {
      title: "Direct the edit",
      description:
        "Write specific instructions for the change you want instead of wrestling with fragmented controls.",
      icon: Edit,
    },
    {
      title: "Render and iterate",
      description:
        "Choose the model tier that matches your speed, cost, and quality target, then refine from the result.",
      icon: Zap,
    },
  ];

  const featureCards = [
    {
      title: "Character consistency",
      description:
        "Keep identity, wardrobe, and silhouette stable while you change scene, lighting, or framing.",
      icon: Layers,
    },
    {
      title: "Directed editing",
      description:
        "Make precise modifications without rebuilding the full prompt stack for every variation.",
      icon: Settings,
    },
    {
      title: "Reference-driven style",
      description:
        "Push new generations toward an existing look instead of starting from visual zero each time.",
      icon: ImageIcon,
    },
    {
      title: "Fast iteration loop",
      description:
        "Stay in a short feedback cycle, so prompt tuning feels like design iteration instead of queue management.",
      icon: Zap,
    },
  ];

  const faqs = [
    {
      question: "What is Flux Kontext best at?",
      answer:
        "It shines when you need controlled image generation or editing with context, especially when reference images matter.",
    },
    {
      question: "When should I use Pro vs Max?",
      answer:
        "Pro is the faster day-to-day workhorse. Max costs more, but it is better when typography, prompt adherence, or final-polish output matters.",
    },
    {
      question: "Why keep the controls opinionated?",
      answer:
        "Because a smaller, curated control surface usually produces better outcomes than a giant dashboard with every toggle exposed.",
    },
  ];

  const modelCards = [
    {
      key: "pro" as const,
      title: "Pro Model",
      credits: "16 Credits",
      summary: "Balanced for fast editing loops and reliable prompt iteration.",
      points: [
        "Faster turnaround for experimentation",
        "Strong editing and reference support",
        "Best default for everyday generation",
      ],
    },
    {
      key: "max" as const,
      title: "Max Model",
      credits: "32 Credits",
      summary:
        "Higher-cost output path for stricter prompts and polished results.",
      points: [
        "Better prompt adherence under pressure",
        "Stronger typography and detail handling",
        "Better fit for premium deliverables",
      ],
    },
  ];

  return (
    <>
      <section className="generator-section-frame generator-reveal mt-8 p-6 sm:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="mb-8 text-center">
            <span className="generator-kicker">
              Operate with less dashboard noise
            </span>
            <h2 className="generator-heading mt-4 text-3xl font-semibold sm:text-4xl">
              A cleaner workflow for image generation and editing
            </h2>
            <p className="generator-subheading mx-auto mt-3 max-w-2xl text-sm sm:text-base">
              The goal is not more knobs. It is a tighter studio flow where
              uploads, prompting, and model choice feel deliberate instead of
              scattered.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {workflowSteps.map((step, index) => {
              const Icon = step.icon;
              return (
                <article
                  key={step.title}
                  className="generator-marketing-card p-5 text-left"
                >
                  <div className="mb-4 flex items-center gap-3">
                    <div className="generator-icon-orb flex h-12 w-12 items-center justify-center">
                      <Icon className="h-5 w-5 text-[rgba(245,234,214,0.9)]" />
                    </div>
                    <Badge
                      variant="outline"
                      className="generator-chip text-[11px]"
                    >
                      Step {index + 1}
                    </Badge>
                  </div>
                  <h3 className="generator-heading text-xl font-semibold">
                    {step.title}
                  </h3>
                  <p className="generator-copy mt-3 text-sm leading-6">
                    {step.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="generator-reveal mt-8 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <span className="generator-kicker">
              What the system is actually good at
            </span>
            <h2 className="generator-heading mt-4 text-3xl font-semibold sm:text-4xl">
              Core strengths without the marketing fog
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((feature) => {
              const Icon = feature.icon;
              return (
                <article
                  key={feature.title}
                  className="generator-marketing-card p-6 text-left"
                >
                  <div className="generator-icon-orb mb-4 flex h-12 w-12 items-center justify-center">
                    <Icon className="h-5 w-5 text-[rgba(111,203,228,0.92)]" />
                  </div>
                  <h3 className="generator-heading text-xl font-semibold">
                    {feature.title}
                  </h3>
                  <p className="generator-copy mt-3 text-sm leading-6">
                    {feature.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="generator-reveal mt-8 py-4">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 text-center">
            <span className="generator-kicker">Straight answers</span>
            <h2 className="generator-heading mt-4 text-3xl font-semibold sm:text-4xl">
              Frequently asked questions
            </h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq) => (
              <article
                key={faq.question}
                className="generator-marketing-card p-6"
              >
                <h3 className="generator-heading text-xl font-semibold">
                  {faq.question}
                </h3>
                <p className="generator-copy mt-3 text-sm leading-6">
                  {faq.answer}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="generator-reveal mt-8 py-4">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 text-center">
            <span className="generator-kicker">
              Choose for workflow, not hype
            </span>
            <h2 className="generator-heading mt-4 text-3xl font-semibold sm:text-4xl">
              Model tiers mapped to real use cases
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {modelCards.map((model) => {
              const isAvailable = availableModels.includes(model.key);
              const isSelected = selectedModel === model.key;

              return (
                <article
                  key={model.key}
                  className="generator-marketing-card flex h-full flex-col p-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="generator-heading text-2xl font-semibold">
                      {model.title}
                    </h3>
                    <Badge
                      variant="outline"
                      className={
                        model.key === "max"
                          ? "generator-chip generator-chip--warm"
                          : "generator-chip"
                      }
                    >
                      {model.credits}
                    </Badge>
                  </div>

                  <p className="generator-copy mb-6 text-sm leading-6">
                    {model.summary}
                  </p>

                  <ul className="mb-6 flex-1 space-y-3">
                    {model.points.map((point) => (
                      <li key={point} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 rounded-full bg-[rgba(111,203,228,0.8)]" />
                        <span className="generator-copy text-sm">{point}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    variant="outline"
                    className={
                      isSelected
                        ? "generator-primary-button w-full"
                        : "generator-secondary-button w-full"
                    }
                    onClick={() => {
                      if (!isAvailable) {
                        onUpgrade();
                        return;
                      }
                      onSelectModel(model.key);
                    }}
                  >
                    {!isAvailable ? (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Upgrade Required
                      </>
                    ) : isSelected ? (
                      "Selected"
                    ) : (
                      `Select ${model.title}`
                    )}
                  </Button>
                </article>
              );
            })}
          </div>
        </div>
      </section>
    </>
  );
}
