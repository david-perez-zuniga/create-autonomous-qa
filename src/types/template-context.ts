export interface TemplateContext {
  [key: string]: string;
  PROJECT_NAME: string;
  PROJECT_PATH: string;
  PACKAGE_NAME: string;
  PACKAGE_MANAGER: string;
  PACKAGE_MANAGER_FIELD: string;
  INSTALL_COMMAND: string;
  TEST_COMMAND: string;
  AUTHOR: string;
  DATE: string;
  YEAR: string;
  VERSION: string;
  NODE_VERSION: string;
}
