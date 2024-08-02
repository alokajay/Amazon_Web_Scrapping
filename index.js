const puppeteer = require('puppeteer')
const fs = require('fs/promises')

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


    for (const photo of photos){
        const imagepage=await page.goto(photo)
        await fs.writeFile(photo.split("/").pop(), await imagepage.buffer())
    }

    await browser.close()
}

start()