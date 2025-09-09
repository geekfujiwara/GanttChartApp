PCF wrapper scaffold for TAskGantt

This folder contains a minimal Power Apps Component Framework (PCF) scaffold that wraps the Code App iframe.

How to use (high level):
1. Install Power Platform CLI (`pac`) and Node.js.
2. Adjust `pcfconfig.json` controlResources to point to the hosted `index.html` URL or the local path.
3. Build the PCF project (this scaffold uses webpack/typescript placeholders) and package as a solution.
4. Import the solution into Power Apps (make sure to host the Code App files on a public HTTPS URL and configure the control to use that URL).

Note: This is a minimal scaffold for convenience. For production usage follow Microsoft PCF docs to create a fully featured control.
