// declaring module will allow typescript to import the module
declare module "csv-iter-parse" {
  // typing module default export as `any` will allow you to access its members without compiler warning
  type Apps = {
    csv_async_iter: any;
  };

  const ts: Apps;
  export = ts;
}
