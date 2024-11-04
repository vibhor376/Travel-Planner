const fs = require('fs');
const puppeteer = require('puppeteer');
const path = require('path');

begin = `<!doctype html>
            <html lang="en">
               <head>
                  <meta charset="utf-8">
                  <meta name="viewport" content="width=device-width, initial-scale=1">
                  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet"
                     integrity="sha384-9ndCyUaIbzAi2FUVXJi0CjmCapSmO7SnpJef0486qhLnuZ2cdeRhO02iuK6FUUVM" crossorigin="anonymous">
                  <link rel="stylesheet" href="/css/styles.css">
                  <style>
                     #chatbox{
                        height: 100%;
                     }
                  </style> 
               </head>
               <body>
                  <div class="container-fluid p-4">`;

end = `</div></body></html>`;

// Read the CSS content from a local file
const cssContent = fs.readFileSync('public/css/styles.css', 'utf-8');


async function makePdf(htmlContent) {
   htmlContent = begin + htmlContent + end;
   const response = "Mail Sent";
   console.log(htmlContent);

   try {
      const browser = await puppeteer.launch();
      const page = await browser.newPage();

      // Set the base URL for the page
      const baseUrl = `file://${path.resolve(__dirname)}/public/`;

      await page.goto(baseUrl, { waitUntil: 'networkidle0' });

      // Set the HTML content with the base URL
      await page.setContent(htmlContent, { waitUntil: 'networkidle0', baseUR: baseUrl });

      // Inject custom CSS styles into the page
      await page.addStyleTag({ content: cssContent });

      // Configure the page to generate high-quality PDF
      await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 2 });

      // Take a full-page screenshot as PDF
      await page.pdf({ path: 'output.pdf', format: 'A4', printBackground: true });

      await browser.close();

      console.log('PDF generated successfully!');

   } catch (error) {
      console.error('Error generating PDF:', error);
      response = "Some error occurred!";
   }

   return response;
}

module.exports = makePdf;
