// eslint-disable-next-line import/prefer-default-export, no-console
export const errLogger = (loc: string) => (err: unknown) => console.log(`error at ${loc}: `, err);
