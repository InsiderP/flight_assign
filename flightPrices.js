const puppeteer = require('puppeteer');

async function getFlightPrices(source, destination, date) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto('https://www.google.com/flights');
    await page.waitForSelector('input[aria-label="Leaving from"]');
    await page.waitForTimeout(2000); // Add a slight delay to let the page fully load

    // Fill in the source, destination, and date in the search form
    await page.type('input[aria-label="Leaving from"]', source);
    await page.type('input[aria-label="Going to"]', destination);
    await page.type('input[placeholder="Departure date"]', date);

    await page.click('button[data-flt-ve="one_way"]');
    await page.waitForSelector('.gws-flights-form__submit-button');

    await Promise.all([
      page.waitForNavigation(), // Wait for navigation to complete
      page.click('.gws-flights-form__submit-button'), // Click the submit button
    ]);

    await page.waitForSelector('.gws-flights-results__result-item');

    // Extract flight prices from the search results
    const prices = await page.evaluate(() => {
      const flights = Array.from(document.querySelectorAll('.gws-flights-results__result-item'));
      return flights.reduce((acc, flight) => {
        const airline = flight.querySelector('.gws-flights-results__carriers').textContent.trim();
        const price = flight.querySelector('.gws-flights-results__price').textContent.trim();
        acc[airline] = price;
        return acc;
      }, {});
    });

    return prices;
  } catch (error) {
    console.error('Error fetching flight prices:', error.message);
    return null;
  } finally {
    await browser.close();
  }
}

// Example usage
const source = 'Delhi';
const destination = 'Jaipur';
const date = '15 April 2023';

getFlightPrices(source, destination, date)
  .then((prices) => {
    if (prices) {
      console.log(prices);
    }
  })
  .catch((error) => {
    console.error('Error:', error.message);
  });
