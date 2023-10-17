import { test as base } from "@playwright/test";
import { extractCodeName } from "../../src/core/utils/string";
import { ConfigImpl } from "@core/conf/conf";
import { OcgLogger } from "@core/logger";



import type {
  CaseConf,
  Config,
  TestConfig,
} from "../../src/types";


const logger = OcgLogger.get();

/**
 * Sanitize test config
 * @param config
 */
const sanitizeTestConfig = (config: Config): TestConfig => {
  const isCaseConfEmpty = Object.keys(config.caseConf).length === 0;

  // Case conf empty when case using data driven
  if (isCaseConfEmpty && config.suiteConf.is_merge_case_data) {
    const suiteConf = config.suiteConf.cases;
    let currentCaseData;

    for (const suitConfKey in suiteConf) {
      if (suiteConf[suitConfKey].data) {
        const caseConfigs = suiteConf[suitConfKey].data;

        for (const caseConfig of caseConfigs) {
          if (caseConfig.case_id === config.caseName) {
            currentCaseData = caseConfig;
            break;
          }
        }
      }

      if (currentCaseData) {
        // already found case conf
        break;
      }
    }

    if (!currentCaseData) {
      throw Error(`Cannot get config for case ${config.caseName}`);
    }

    return Object.assign({}, config.suiteConf || {}, currentCaseData || {}) as TestConfig;
  }

  return Object.assign({}, config.suiteConf || {}, config.caseConf || {}) as TestConfig;
};

export const test = base.extend<{
  conf: Config;
  cConf: CaseConf;
}>({
  // all conf
  conf: [
    async ({}, use, testInfo) => {
      const codeNames = extractCodeName(testInfo.title);
      if (codeNames.length !== 1) {
        throw new Error(
          "Invalid code name." +
            "Please attach code name to your test with the format @TC_<codename> OR @TS_<codename> OR @SB_<codename> OR @PB_<codename>",
        );
      }
      const conf = new ConfigImpl(testInfo.file, codeNames[0]);
      conf.loadConfigFromFile();
      await use(conf);
    },
    { scope: "test" },
  ],
  // case conf
  cConf: [
    async ({ conf }, use) => {
      await use(conf.caseConf);
    },
    { scope: "test" },
  ]
});

export { expect, request } from "@playwright/test";
