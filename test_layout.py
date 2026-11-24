import asyncio, json, sys
from playwright.async_api import async_playwright
URL="http://localhost:8123/"
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        report={}
        for name,w,h in [("desktop",1440,900),("tablet",820,1100),("mobile",390,844)]:
            ctx=await b.new_context(viewport={"width":w,"height":h},device_scale_factor=1)
            pg=await ctx.new_page(); errs=[]; failed=[]
            pg.on("console",lambda m,errs=errs: errs.append(m.text) if m.type in("error","warning") else None)
            pg.on("pageerror",lambda e,errs=errs: errs.append("PAGEERROR "+str(e)))
            pg.on("requestfailed",lambda r,failed=failed: failed.append(r.url))
            pg.on("response",lambda r,failed=failed: failed.append(f"{r.status} {r.url}") if r.status>=400 else None)
            await pg.goto(URL,wait_until="networkidle")
            # scroll through to trigger lazy images + reveals
            H=await pg.evaluate("document.documentElement.scrollHeight")
            for y in range(0,H,500): await pg.evaluate(f"window.scrollTo(0,{y})"); await pg.wait_for_timeout(120)
            await pg.wait_for_timeout(600)
            broken=await pg.evaluate("[...document.images].filter(i=>!(i.complete&&i.naturalWidth>0)).map(i=>i.src)")
            hscroll=await pg.evaluate("document.documentElement.scrollWidth>document.documentElement.clientWidth")
            await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(300)
            await pg.screenshot(path=f"/home/claude/shots/{name}-full.png",full_page=True)
            await pg.screenshot(path=f"/home/claude/shots/{name}-hero.png")
            report[name]=dict(height=H,console=errs,failed=failed,broken_images=broken,horizontal_overflow=hscroll)
            await ctx.close()
        print(json.dumps(report,indent=1))
        await b.close()
asyncio.run(main())
