'use client';

import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

interface PricingPlan {
    name: string;
    price: number;
    period: string;
    description: string;
    features: Array<{ text: string; included: boolean }>;
    popular?: boolean;
    buttonText: string;
}

const plans: PricingPlan[] = [
    {
        name: 'Free',
        price: 0,
        period: 'forever',
        description: 'Perfect for getting started',
        features: [
            { text: '5 searches per day', included: true },
            { text: '7 days history retention', included: true },
            { text: 'Basic question details', included: true },
            { text: 'Export to PDF', included: false },
            { text: 'AI-powered hints', included: false },
            { text: 'Priority support', included: false },
        ],
        buttonText: 'Current Plan',
    },
    {
        name: 'Premium',
        price: 9.99,
        period: 'month',
        description: 'For serious problem solvers',
        features: [
            { text: 'Unlimited searches', included: true },
            { text: 'Forever history retention', included: true },
            { text: 'Full question details', included: true },
            { text: 'Export to PDF', included: true },
            { text: 'AI-powered hints', included: true },
            { text: 'Priority support', included: true },
        ],
        popular: true,
        buttonText: 'Upgrade Now',
    },
];

export default function PricingCard() {
    return (
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {plans.map((plan) => (
                <Card
                    key={plan.name}
                    className={`
            relative overflow-hidden
            ${plan.popular ? 'border-accent-primary/50 shadow-lg shadow-accent-primary/10' : ''}
          `}
                    hover
                >
                    {/* Popular badge */}
                    {plan.popular && (
                        <div className="absolute top-4 right-4">
                            <span className="px-3 py-1 text-xs font-semibold text-white rounded-full gradient-bg">
                                POPULAR
                            </span>
                        </div>
                    )}

                    {/* Plan header */}
                    <div className="mb-6">
                        <h3 className="text-2xl font-bold text-foreground mb-1">{plan.name}</h3>
                        <p className="text-foreground-secondary text-sm">{plan.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold gradient-text">
                                ${plan.price}
                            </span>
                            <span className="text-foreground-secondary">
                                /{plan.period}
                            </span>
                        </div>
                    </div>

                    {/* Features */}
                    <ul className="space-y-3 mb-8">
                        {plan.features.map((feature, index) => (
                            <li key={index} className="flex items-center gap-3">
                                {feature.included ? (
                                    <div className="w-5 h-5 rounded-full bg-green-500/10 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                ) : (
                                    <div className="w-5 h-5 rounded-full bg-foreground-secondary/10 flex items-center justify-center">
                                        <svg className="w-3 h-3 text-foreground-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </div>
                                )}
                                <span className={feature.included ? 'text-foreground' : 'text-foreground-secondary'}>
                                    {feature.text}
                                </span>
                            </li>
                        ))}
                    </ul>

                    {/* CTA Button */}
                    <Button
                        variant={plan.popular ? 'primary' : 'secondary'}
                        size="lg"
                        className="w-full"
                        disabled={plan.price === 0}
                    >
                        {plan.buttonText}
                    </Button>
                </Card>
            ))}
        </div>
    );
}
