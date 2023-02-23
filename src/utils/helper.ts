export function isXPathExpressionExists(expression: string): boolean {
    const result = document.evaluate(expression, document, null, XPathResult.ANY_TYPE, null);
    return result.iterateNext() !== null;
}

export async function delay(ms: number) {
    // return await for better async stack trace support in case of errors.
    return await new Promise((resolve) => setTimeout(resolve, ms));
}