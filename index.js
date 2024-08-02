const puppeteer = require('puppeteer')
const fs = require('fs/promises')
const xlsx = require('xlsx');

async function start(){
    const browser = await puppeteer.launch()
    const page=await browser.newPage()
    await page.goto("https://www.amazon.com/")
    await page.screenshot({ path: "home.png", fullPage : true})

    const names = await page.evaluate(() => {
        console.log()
        return Array.from(document.querySelectorAll("#CardInstancecfDvq-0gnXd4hLSlfe-9Ag > div > h2")).map(x => x.textContent)
    })
    await fs.writeFile("names.txt", names.join("\r\n"))

    const photos = await page.$$eval("img", imgs => {
        return imgs.map(x => x.scr)
    })

    await page.type("#twotabsearchtextbox","bottle")
    
    
    await Promise.all(page.click("#nav-search-submit-button button"),page.waitForNavigation())

    const info = await page.$eval("message",el=>el.textContent)
    console.log(info)

    for(const url of urls){
        await page.goto(url, {waitUntil: 'domcontentloaded'});

        const productName = await page.$eval('#productTitle', (element) => element.textContent.trim());
        const productPriceElement = await page.$('.a-price-whole');
        const productPrice  =productPriceElement ? await page.evaluate(element => element.textContent.trim(), productPriceElement) : 'N/A';

        productsdata.push({
            name: productName,
            price: productPrice
        })
        console.log('fetched successfully.......')
    }

    for (const photo of photos){
        const imagepage=await page.goto(photo)
        await fs.writeFile(photo.split("/").pop(), await imagepage.buffer())
    }

    await browser.close()
}

const worksheet = xlsx.utils.json_to_sheet(productsdata);
    const excelData = xlsx.write(
        {Sheets: {'Products': worksheet}, SheetNames: ['Products']},
        {bookType: 'xlsx', type: 'buffer'}
    );

    fs.writeFileSync('products.xlsx', excelData);

start()
