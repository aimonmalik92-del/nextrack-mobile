/* NEXTRACK shared script. Each part only runs on its own page (body.page-landing / body.page-app). */

/* ======== LANDING PAGE (index.html) ======== */
if (document.body.classList.contains('page-landing')) {
(function () {
    var APP_PAGE = "app.html";            // page opened after login (the AI assistant)
    var LOGIN_REQUIRED = false;           // sign-in switched off for now: buttons open the AI page directly. Set to true to turn the login popup back on.
    var USER_KEY = "nextrack-user";       // demo login is kept in this browser only
    var $ = function (id) { return document.getElementById(id); };
    function getUser() { try { return JSON.parse(localStorage.getItem(USER_KEY)); } catch (e) { return null; } }
    function setUser(u) { try { localStorage.setItem(USER_KEY, JSON.stringify(u)); } catch (e) {} }

    // hero photo: if hero.jpg exists in this folder it replaces the illustration
    var img = new Image();
    img.onload = function () { $("hero").classList.add("has-photo"); };
    img.src = "hero.jpg";

    $("yr").textContent = new Date().getFullYear();

    // signed-in state in the header
    var user = getUser();
    if (user) $("accountLabel").textContent = (user.name || "My Account").split(" ")[0];


    // ---- mobile menu ----
    var mt = $("menuToggle"), mn = $("mainNav");
    function closeMenu() { mt.classList.remove("open"); mn.classList.remove("open"); mt.setAttribute("aria-expanded", "false"); }
    mt.addEventListener("click", function () { var o = mn.classList.toggle("open"); mt.classList.toggle("open", o); mt.setAttribute("aria-expanded", o ? "true" : "false"); });
    mn.querySelectorAll("a").forEach(function (a) { a.addEventListener("click", closeMenu); });
    window.addEventListener("resize", function () { if (window.innerWidth > 1100) closeMenu(); });

    // ---- modal ----
    var overlay = $("authOverlay"), signup = false;
    function openAuth(isSignup) {
        if (!LOGIN_REQUIRED || getUser()) { window.location.href = APP_PAGE; return; }   // no login needed / already signed in -> straight to the app
        signup = !!isSignup; paint();
        overlay.classList.add("active"); overlay.setAttribute("aria-hidden", "false");
        setTimeout(function () { (signup ? $("authName") : $("authEmail")).focus(); }, 60);
    }
    function closeAuth() { overlay.classList.remove("active"); overlay.setAttribute("aria-hidden", "true"); $("authErr").textContent = ""; }
    function paint() {
        $("authTitle").textContent = signup ? "Create your account" : "Welcome back";
        $("authSub").textContent = signup ? "Start tracking your home construction." : "Sign in to view your project.";
        $("nameField").hidden = !signup;
        $("authSubmit").textContent = signup ? "Create account" : "Sign in";
        $("authSwitch").innerHTML = signup ? 'Already have an account? <a href="#" id="authToggle">Sign in</a>' : 'New to NEXTRACK? <a href="#" id="authToggle">Create an account</a>';
        $("authToggle").addEventListener("click", function (e) { e.preventDefault(); signup = !signup; paint(); });
        $("authPass").setAttribute("autocomplete", signup ? "new-password" : "current-password");
    }
    document.querySelectorAll("[data-login]").forEach(function (el) {
        el.addEventListener("click", function (e) { e.preventDefault(); openAuth(false); });
    });
    $("accountBtn").addEventListener("click", function () { openAuth(false); });
    $("authClose").addEventListener("click", closeAuth);
    overlay.addEventListener("click", function (e) { if (e.target === overlay) closeAuth(); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAuth(); });

    $("authForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var email = $("authEmail").value.trim(), pass = $("authPass").value, name = $("authName").value.trim();
        if (signup && !name) { $("authErr").textContent = "Please enter your name."; return; }
        if (!email) { $("authErr").textContent = "Please enter your email or phone number."; return; }
        if (pass.length < 4) { $("authErr").textContent = "Password must be at least 4 characters."; return; }
        // DEMO ONLY: replace with a real sign-in (e.g. Firebase Authentication) before going live
        setUser({ name: name || email.split("@")[0], email: email });
        window.location.href = APP_PAGE;
    });
    $("googleBtn").addEventListener("click", function () {
        // DEMO ONLY: connect Google sign-in here
        setUser({ name: "Guest", email: "" });
        window.location.href = APP_PAGE;
    });

    if (location.hash === "#login" && LOGIN_REQUIRED) openAuth(false);

    // tool cards open login with Enter / Space too
    document.querySelectorAll(".tool[data-login]").forEach(function (el) {
        el.addEventListener("keydown", function (e) { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openAuth(false); } });
    });

    // ---- scroll reveal + number counters ----
    function countUp(el) {
        var end = +el.dataset.count, t0 = null, dur = 1200;
        function step(ts) { if (!t0) t0 = ts; var k = Math.min(1, (ts - t0) / dur); el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(step); }
        requestAnimationFrame(step);
    }
    var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var targets = document.querySelectorAll(".reveal, [data-count]");
    function show(el) {
        el.classList.add("in");
        if (el.dataset && el.dataset.count && !el.dataset.done) { el.dataset.done = 1; if (reduce) el.textContent = el.dataset.count; else countUp(el); }
        el.querySelectorAll && el.querySelectorAll("[data-count]").forEach(function (c) { if (!c.dataset.done) { c.dataset.done = 1; if (reduce) c.textContent = c.dataset.count; else countUp(c); } });
    }
    if ("IntersectionObserver" in window) {
        var io = new IntersectionObserver(function (entries) { entries.forEach(function (en) { if (en.isIntersecting) { show(en.target); io.unobserve(en.target); } }); }, { threshold: 0.15 });
        targets.forEach(function (el) { io.observe(el); });
    } else { targets.forEach(show); }

    // ---- FAQ accordion ----
    document.querySelectorAll(".faq-q").forEach(function (q) {
        q.setAttribute("aria-expanded", "false");
        q.addEventListener("click", function () {
            var item = q.parentElement, open = item.classList.contains("open");
            document.querySelectorAll(".faq-item.open").forEach(function (i) { i.classList.remove("open"); i.querySelector(".faq-a").style.maxHeight = ""; i.querySelector(".faq-q").setAttribute("aria-expanded", "false"); });
            if (!open) { item.classList.add("open"); var a = item.querySelector(".faq-a"); a.style.maxHeight = a.scrollHeight + "px"; q.setAttribute("aria-expanded", "true"); }
        });
    });

    // ---- contact form: opens the visitor's email app with the details filled in ----
    var CONTACT_EMAIL = "support@nextrack.pk";   // change to your real email address
    $("contactForm").addEventListener("submit", function (e) {
        e.preventDefault();
        var name = $("cName").value.trim(), phone = $("cPhone").value.trim(), city = $("cCity").value, plot = $("cPlot").value, svc = $("cSvc").value, msg = $("cMsg").value.trim();
        if (!name || !phone) { $("cErr").textContent = "Please enter your name and phone number."; return; }
        if (!/^[0-9+\-\s()]{7,}$/.test(phone)) { $("cErr").textContent = "Please enter a valid phone number."; return; }
        $("cErr").textContent = "";
        var body = "Name: " + name + "\nPhone: " + phone + "\nCity: " + (city || "-") + "\nPlot size: " + (plot || "-") + "\nService: " + svc + "\n\n" + msg;
        window.location.href = "mailto:" + CONTACT_EMAIL + "?subject=" + encodeURIComponent("Consultation request - " + name) + "&body=" + encodeURIComponent(body);
        $("cOk").classList.add("show");
    });
})();
}

/* ======== AI PAGE (app.html) ======== */
if (document.body.classList.contains('page-app')) {
// NEXTRACK AI page: sidebar + search
var menuBtn = document.getElementById('menuBtn');
var sidebar = document.getElementById('sidebar');
var searchInput = document.getElementById('searchInput');

menuBtn.addEventListener('click', function () {
    sidebar.classList.toggle('open');
    menuBtn.classList.toggle('open');
});

// tap outside the sidebar closes it (handy on phones)
document.addEventListener('click', function (e) {
    if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
        menuBtn.classList.remove('open');
    }
});

// chips without a page just fill the search box (the 4 main chips navigate via their onclick)
document.querySelectorAll('.chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
        if (chip.getAttribute('onclick')) return;
        searchInput.value = chip.textContent;
        searchInput.focus();
    });
});

function ask() {
    var q = searchInput.value.trim();
    if (q) alert('You asked: ' + q);
}
searchInput.addEventListener('keypress', function (e) { if (e.key === 'Enter') ask(); });
document.querySelector('.send-btn').addEventListener('click', ask);

// log in / sign up (demo login, kept in this browser only) + signed-in name + log out
        (function () {
            var KEY = 'nextrack-user', $ = function (id) { return document.getElementById(id); };
            function getU() { try { return JSON.parse(localStorage.getItem(KEY)); } catch (e) { return null; } }
            var u = getU();
            if (u) {
                $('authOpen').hidden = true; $('logoutBtn').hidden = false;
                var nm = (u.name || '').trim();
                if (nm) { $('userName').hidden = false; $('userName').textContent = 'Hi, ' + nm.split(' ')[0]; var av = document.querySelector('.user-avatar span'); if (av) av.textContent = nm.charAt(0).toUpperCase(); }
            }
            $('logoutBtn').addEventListener('click', function (e) {
                e.preventDefault();
                try { localStorage.removeItem(KEY); } catch (err) {}
                window.location.reload();
            });

            var ov = $('alOverlay'), signup = false;
            function view(v) { $('alChoose').hidden = v !== 'choose'; $('alEmailForm').hidden = v !== 'email'; if (v === 'email') paint(); }
            function open() { view('choose'); ov.classList.add('active'); ov.setAttribute('aria-hidden', 'false'); }
            function close() { ov.classList.remove('active'); ov.setAttribute('aria-hidden', 'true'); }
            function paint() {
                $('alFormTitle').textContent = signup ? 'Sign up with email' : 'Log in with email';
                $('alFormSub').textContent = signup ? 'Create your NEXTRACK account.' : 'Welcome back. Enter your details.';
                $('alNameField').hidden = !signup;
                $('alSubmit').firstChild.textContent = signup ? 'Create account' : 'Log in';
                $('alSwitch').innerHTML = signup ? 'Already have an account? <a href="#" id="alToggle">Log in</a>' : 'New to NEXTRACK? <a href="#" id="alToggle">Sign up</a>';
                $('alToggle').addEventListener('click', function (e) { e.preventDefault(); signup = !signup; $('alErr').textContent = ''; paint(); });
                $('alPass').setAttribute('autocomplete', signup ? 'new-password' : 'current-password');
            }
            function finish(user) { try { localStorage.setItem(KEY, JSON.stringify(user)); } catch (e) {} window.location.reload(); }

            $('authOpen').addEventListener('click', open);
            $('alClose').addEventListener('click', close);
            ov.addEventListener('click', function (e) { if (e.target === ov) close(); });
            document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
            $('alEmailBtn').addEventListener('click', function () { view('email'); setTimeout(function () { $('alEmail').focus(); }, 60); });
            $('alBack').addEventListener('click', function () { view('choose'); });
            document.querySelectorAll('.al-social').forEach(function (b) {
                b.addEventListener('click', function () {
                    // DEMO ONLY: connect real Google / Facebook / X sign-in here (e.g. Firebase Authentication)
                    var p = b.getAttribute('data-provider');
                    finish({ name: 'Guest', email: '', provider: p });
                });
            });
            $('alEmailForm').addEventListener('submit', function (e) {
                e.preventDefault();
                var name = $('alName').value.trim(), email = $('alEmail').value.trim(), pass = $('alPass').value;
                if (signup && !name) { $('alErr').textContent = 'Please enter your name.'; return; }
                if (!/^\S+@\S+\.\S+$/.test(email)) { $('alErr').textContent = 'Please enter a valid email address.'; return; }
                if (pass.length < 4) { $('alErr').textContent = 'Password must be at least 4 characters.'; return; }
                // DEMO ONLY: replace with a real sign-in before going live
                finish({ name: name || email.split('@')[0], email: email, provider: 'email' });
            });
        })();

// ===== Greeting + "project at a glance" (data saved in this browser by the other pages) =====
        (function () {
            var NAMES = ["Site Handover & Mobilization","Structural & Architectural Drawings","MEP Drawings","Finishing Book","Layout & Setting Out","Excavation","Anti-Termite, Soling & PCC","Foundation Steel & Shuttering","Foundation Concreting","Plinth Beam, DPC & Backfilling","Columns","Beam & Slab Shuttering","Slab Concreting","Brick / Block Masonry","Electrical Conduiting","Plumbing & Drainage","Waterproofing","Plaster","Flooring & Wall Tiling","Doors & Windows","False Ceiling","Paint & Polish","Sanitary & Electrical Fixtures","External Works & Boundary Wall","Final Snagging & Handover"];
            var GREY = 18; // activities 1-18 = grey structure, 19-25 = finishing
            function read(k) { try { return JSON.parse(localStorage.getItem(k)); } catch (e) { return null; } }
            var el = function (id) { return document.getElementById(id); };

            // greeting
            var u = read('nextrack-user'), h = new Date().getHours();
            var part = h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
            el('greet').querySelector('span').textContent = part + (u && u.name ? ', ' + u.name.split(' ')[0] : '') + ' 👋';

            // timeline progress
            var tl = read('nvhomes-project-timeline-v2');
            if (tl && tl.acts) {
                var tw = 0, aw = 0, gw = 0, ga = 0, fw = 0, fa = 0, next = -1, prog = -1;
                for (var i = 0; i < NAMES.length; i++) {
                    var a = tl.acts[i]; if (!a) continue;
                    var d = Math.max(1, +a.dur || 1), p = a.af ? 100 : Math.min(100, +a.pct || 0);
                    tw += d; aw += d * p / 100;
                    if (i < GREY) { gw += d; ga += d * p / 100; } else { fw += d; fa += d * p / 100; }
                    if (p < 100 && a.as && prog < 0) prog = i;
                    if (p < 100 && !a.as && next < 0) next = i;
                }
                var pct = tw ? Math.round(aw / tw * 100) : 0;
                el('gProg').textContent = pct + '%';
                el('gGrey').style.width = (gw ? ga / gw * 100 : 0) + '%';
                el('gFin').style.width = (fw ? fa / fw * 100 : 0) + '%';
                el('gProgSub').textContent = 'Grey ' + Math.round(gw ? ga / gw * 100 : 0) + '% · Finishing ' + Math.round(fw ? fa / fw * 100 : 0) + '%';
                if (prog >= 0) el('gNext').textContent = 'In progress: ' + NAMES[prog] + ' (' + (+tl.acts[prog].pct || 0) + '%)';
                else if (next >= 0) el('gNext').textContent = 'Next: ' + NAMES[next];
                else el('gNext').textContent = 'All activities completed 🎉';
            }

            // budget tracking (expenses saved on the Budget Tracking page)
            var bt = read('nextrack-activity-budget-v1');
            var bTot = 12500000, bSp = 0;
            if (bt && bt.totals) {
                bTot = (+bt.totals.grey || 0) + (+bt.totals.finishing || 0);
                bSp = (bt.expenses || []).reduce(function (m, x) { return m + (+x.amount || 0); }, 0);
            }
            var lac = function (n) { return (Math.round(n / 1000) / 100) + ' Lacs'; };
            var bp = bTot ? bSp / bTot * 100 : 0;
            el('gBud').textContent = Math.round(bp) + '%';
            el('gBudSub').textContent = lac(bSp) + ' of ' + lac(bTot) + ' spent';
            el('gBudBar').style.width = Math.min(100, bp) + '%';
            if (bp > 100) { el('gBud').style.color = '#B42318'; el('gBudBar').style.background = '#B42318'; }

            // quality checklists
            var qc = read('nvhomes-quality-checklists-v1');
            var ITEMS = [7,5,5,4,5,6,5,7,5,5,6,8,6,7,6,7,6,6,6,5,5,5,6,5,7];
            if (qc && qc.acts) {
                var done = 0, lists = 0;
                ITEMS.forEach(function (n, i) {
                    var v = (qc.acts[i] && qc.acts[i].v) || {}, c = 0;
                    Object.keys(v).forEach(function (k) { if (v[k] === 'Yes' || v[k] === 'N/A') c++; });
                    done += Math.min(c, n); if (c >= n) lists++;
                });
                el('gQc').textContent = done;
                el('gQcSub').textContent = lists + ' of 25 checklists completed';
                el('gQcBar').style.width = (done / 145 * 100) + '%';
            }
        })();

    // phones: zoom the background sketch on the house + building so it is clearly visible
    (function () {
        var svg = document.querySelector('.bg-city');
        if (!svg) return;
        function fit() { svg.setAttribute('viewBox', window.innerWidth <= 700 ? '30 0 560 230' : '0 0 1600 230'); }
        fit(); window.addEventListener('resize', fit);
    })();
}