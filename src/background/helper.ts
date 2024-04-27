import { XPATH_URL } from "src/utils/constants";
import { addDate } from "src/utils/helper";
import { XPathModelSchema, type XPathModel } from "src/utils/xpaths";

export async function fetchXPathUpdate(
  signal?: AbortSignal,
): Promise<XPathModel | undefined> {
  try {
    const resJson = await (await fetch(XPATH_URL, { signal })).json();

    const xPathValueValidated = await XPathModelSchema.parseAsync(resJson);

    const xpathValues = addDate(xPathValueValidated);

    return xpathValues;
  } catch (e) {
    return undefined;
  }
}
