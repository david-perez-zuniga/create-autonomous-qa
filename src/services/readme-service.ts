import fs from "node:fs";

import { replaceTemplateVariables }
  from "../utils/template-engine";

export function updateReadme(
  readmePath: string,
  projectName: string
) {
  if (!fs.existsSync(readmePath)) {
    return;
  }

  const content = fs.readFileSync(
    readmePath,
    "utf8"
  );

  const updatedContent =
    replaceTemplateVariables(
      content,
      {
        PROJECT_NAME: projectName
      }
    );

  fs.writeFileSync(
    readmePath,
    updatedContent
  );
}