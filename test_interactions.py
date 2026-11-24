import asyncio, json
from playwright.async_api import async_playwright
URL="http://localhost:8123/"
R=[]
def ok(name,cond,extra=""): R.append((name,bool(cond),extra)); 
async def main():
    async with async_playwright() as p:
        b=await p.chromium.launch(executable_path="/usr/bin/google-chrome",args=["--no-sandbox"])
        ctx=await b.new_context(viewport={"width":1440,"height":900}); pg=await ctx.new_page()
        errs=[]; pg.on("console",lambda m: errs.append(m.text) if m.type=="error" else None); pg.on("pageerror",lambda e: errs.append(str(e)))
        await pg.goto(URL,wait_until="networkidle")
        # internal anchors
        hrefs=await pg.evaluate("[...document.querySelectorAll('a[href^=\"#\"]')].map(a=>a.getAttribute('href'))")
        missing=[h for h in hrefs if h not in ("#top","#") and not await pg.evaluate(f"!!document.querySelector('{h}')")]
        ok("internal anchors resolve",not missing,str(missing))
        # external links
        ext=await pg.evaluate("[...document.querySelectorAll('a[href^=\"http\"],a[href^=\"mailto\"]')].map(a=>a.getAttribute('href'))")
        print("EXTERNAL:",sorted(set(ext)))
        ok("all external links open in new tab w/ noopener",await pg.evaluate("[...document.querySelectorAll('a[href^=\"http\"]')].filter(a=>!document.getElementById('lightbox').contains(a)).every(a=>a.target==='_blank'&&a.rel.includes('noopener'))"))
        # resume
        r=await pg.request.get(URL+"assets/Menasri_V_Resume.pdf"); ok("resume pdf 200 + pdf",r.status==200 and "pdf" in r.headers.get("content-type",""),r.headers.get("content-type",""))
        ok("resume link has download attr",await pg.evaluate("!!document.querySelector('a[download][href$=\"Menasri_V_Resume.pdf\"]')"))
        # theme toggle + persistence
        await pg.click("#theme"); t1=await pg.evaluate("document.documentElement.dataset.theme"); await pg.reload(wait_until="networkidle")
        t2=await pg.evaluate("document.documentElement.dataset.theme"); ok("theme toggles and persists",t1=="dark" and t2=="dark",f"{t1},{t2}")
        await pg.screenshot(path="/home/claude/shots/dark-hero.png")
        await pg.click("#theme")
        # project dialogs
        for d in ["dlg-zenith","dlg-brief","dlg-image","dlg-booknest"]:
            await pg.evaluate(f"document.querySelector('[data-open={d}]').scrollIntoView({{block:'center'}})")
            await pg.click(f"[data-open={d}]"); await pg.wait_for_timeout(400)
            ok(f"{d} opens",await pg.evaluate(f"document.getElementById('{d}').open"))
            if d=="dlg-image": await pg.screenshot(path="/home/claude/shots/dialog-image.png")
            if d=="dlg-zenith": await pg.screenshot(path="/home/claude/shots/dialog-zenith.png")
            await pg.keyboard.press("Escape"); await pg.wait_for_timeout(200)
            ok(f"{d} closes on Esc",not await pg.evaluate(f"document.getElementById('{d}').open"))
        # close button + backdrop
        await pg.click("[data-open=dlg-zenith]"); await pg.click("#dlg-zenith [data-close]"); ok("close button works",not await pg.evaluate("document.getElementById('dlg-zenith').open"))
        await pg.click("[data-open=dlg-zenith]"); await pg.mouse.click(5,450); await pg.wait_for_timeout(200); ok("backdrop click closes",not await pg.evaluate("document.getElementById('dlg-zenith').open"))
        ok("body scroll restored",await pg.evaluate("document.body.style.overflow===''"))
        # screenshot tabs
        await pg.click("[data-open=dlg-image]"); await pg.click("[data-shot*=feedback]"); await pg.wait_for_timeout(300)
        ok("screenshot tab switches",await pg.evaluate("document.getElementById('shot-main').src.includes('feedback')") and await pg.evaluate("document.getElementById('shot-main').naturalWidth>0"))
        await pg.keyboard.press("Escape")
        # cert filters
        counts={}
        for f in ["all","tech","nptel","lang"]:
            await pg.click(f"[data-f={f}]"); counts[f]=await pg.evaluate("[...document.querySelectorAll('#certs .cert')].filter(c=>!c.hidden).length")
        ok("cert filter counts 8/3/4/1",counts=={"all":8,"tech":3,"nptel":4,"lang":1},str(counts))
        await pg.click("[data-f=all]")
        # lightbox for each cert
        n=await pg.evaluate("document.querySelectorAll('#certs .cert').length"); verify=[]
        for i in range(n):
            await pg.evaluate(f"document.querySelectorAll('#certs .cert')[{i}].scrollIntoView({{block:'center'}})")
            await pg.evaluate(f"document.querySelectorAll('#certs .cert')[{i}].click()"); await pg.wait_for_timeout(350)
            info=await pg.evaluate("({open:document.getElementById('lightbox').open,t:document.getElementById('lb-title').textContent,loaded:document.getElementById('lb-img').naturalWidth>100,v:document.getElementById('lb-verify').hidden?null:document.getElementById('lb-verify').href})")
            ok(f"lightbox cert {i}: {info['t'][:34]}",info["open"] and info["loaded"]); 
            if info["v"]: verify.append(info["v"])
            if i==0: await pg.screenshot(path="/home/claude/shots/lightbox.png")
            await pg.keyboard.press("Escape")
        ok("verify links only on RHCSA + EF SET",verify==["https://www.credly.com/badges/e60bcb93-8c23-47f4-8523-ef33c9d8ac26","https://cert.efset.org/xpqrFY"],str(verify))
        # form
        await pg.evaluate("document.getElementById('contact').scrollIntoView()")
        await pg.click("#contact-form button"); ok("form rejects empty",("Please fill" in await pg.inner_text("#form-note")))
        await pg.fill("[name=name]","Test"); await pg.fill("[name=email]","bad"); await pg.fill("[name=message]","Hi"); await pg.click("#contact-form button")
        ok("form rejects bad email",("valid email" in await pg.inner_text("#form-note")))
        # nav active state
        await pg.evaluate("window.scrollTo(0,0)"); await pg.wait_for_timeout(200)
        ok("no nav active at top",await pg.evaluate("!document.querySelector('#nav a.active')"))
        await pg.evaluate("document.getElementById('projects').scrollIntoView()"); await pg.wait_for_timeout(300)
        ok("nav highlights Projects",await pg.evaluate("document.querySelector('#nav a.active')?.getAttribute('href')")=="#projects")
        ok("no console errors during interaction",not errs,str(errs))
        await ctx.close()
        # mobile menu
        m=await b.new_context(viewport={"width":390,"height":844}); mp=await m.new_page(); await mp.goto(URL,wait_until="networkidle")
        ok("mobile nav hidden initially",not await mp.is_visible("#nav"))
        await mp.click("#menu"); ok("mobile menu opens",await mp.is_visible("#nav") and await mp.get_attribute("#menu","aria-expanded")=="true")
        await mp.screenshot(path="/home/claude/shots/mobile-menu.png")
        await mp.click("#nav a[href='#projects']"); await mp.wait_for_timeout(700); ok("mobile menu closes after nav",not await mp.is_visible("#nav"))
        await mp.click("[data-open=dlg-brief]"); await mp.wait_for_timeout(400); await mp.screenshot(path="/home/claude/shots/mobile-dialog.png")
        ok("mobile dialog fits viewport",await mp.evaluate("(()=>{const r=document.getElementById('dlg-brief').getBoundingClientRect();return r.width<=window.innerWidth&&r.height<=window.innerHeight+1})()"))
        await b.close()
    w=max(len(n) for n,_,_ in R)
    for n,c,e in R: print(("PASS " if c else "FAIL ")+n.ljust(w),e if not c else "")
    print(f"\n{sum(c for _,c,_ in R)}/{len(R)} passed")
asyncio.run(main())
