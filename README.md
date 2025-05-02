# Angular WebWorker Demo

Create new WebWorker using the Angular CLI: `ng generate web-worker <name>`

Must use `import.meta.url` when importing worker file due to path changes during bundling

Initialize worker with `new Worker(new URL('<name>.worker', import.meta.url))`
