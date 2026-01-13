import PricingCard from '@/components/subscription/PricingCard';

export default function SubscriptionPage() {
    return (
        <div className="py-8">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-foreground mb-4">
                    Choose Your <span className="gradient-text">Plan</span>
                </h1>
                <p className="text-lg text-foreground-secondary max-w-lg mx-auto">
                    Unlock unlimited access to LeetCode problem searching with our Premium plan
                </p>
            </div>

            <PricingCard />

            {/* FAQ Section */}
            <div className="max-w-2xl mx-auto mt-16">
                <h2 className="text-2xl font-bold text-foreground text-center mb-8">
                    Frequently Asked Questions
                </h2>
                <div className="space-y-4">
                    {[
                        {
                            q: 'What is included in the Free plan?',
                            a: 'The Free plan includes 5 searches per day, 7 days of history retention, and basic question details.',
                        },
                        {
                            q: 'Can I cancel my Premium subscription?',
                            a: 'Yes, you can cancel your Premium subscription at any time. You will continue to have access until the end of your billing period.',
                        },
                        {
                            q: 'What payment methods do you accept?',
                            a: 'We accept all major credit cards, debit cards, and PayPal.',
                        },
                    ].map((faq, index) => (
                        <div
                            key={index}
                            className="bg-background-secondary border border-border rounded-xl p-6"
                        >
                            <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                            <p className="text-foreground-secondary text-sm">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
