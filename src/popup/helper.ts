import { XPATH_URL } from "src/utils/constants";
import { addDate } from "src/utils/helper";
import { xPathValuesWritable } from "src/utils/storage";
import { type XPathModel, XPathModelSchema } from "src/utils/xpaths";

export async function fetchXPathUpdate(): Promise<XPathModel | undefined> {
  try {
    const resJson = await (await fetch(XPATH_URL)).json();

    const xPathValueValidated = await XPathModelSchema.parseAsync(resJson);

    const xpathValues = addDate(xPathValueValidated);

    xPathValuesWritable.update((current) => {
      return { ...current, ...xpathValues };
    });
    return xpathValues;
  } catch (e) {
    return undefined;
  }
}
