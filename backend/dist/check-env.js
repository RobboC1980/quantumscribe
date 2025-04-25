const REQUIRED = [
    'JWT_SECRET',
    'OPENAI_KEY',
    'STRIPE_SECRET',
    'STRIPE_PRICE_MONTHLY'
];
const missing = REQUIRED.filter(k => !process.env[k]);
if (missing.length) {
    // eslint-disable-next-line no-console
    console.error(`❌  Missing env vars: ${missing.join(', ')}`);
    process.exit(1);
}
export {};
