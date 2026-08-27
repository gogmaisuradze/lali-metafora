# -*- coding: utf-8 -*-
import re
import json

with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# 1. Remove the misplaced i18n block from lines ~815-1193
old_i18n_pattern = re.compile(r'// ==========================================================================\s*// COMPREHENSIVE I18N BILINGUAL TRANSLATION ENGINE[\s\S]*?langToggleBtns\.forEach\(btn => \{[\s\S]*?\}\);\s*', re.DOTALL)

# Load the dictionary from update_full_i18n.py
from update_full_i18n import FULL_TRANSLATIONS

dict_json = json.dumps(FULL_TRANSLATIONS, ensure_ascii=False, indent=8)

clean_i18n_func = f'''
    // ==========================================================================
    // 18. ROBUST BILINGUAL I18N ENGINE (KA ⇄ EN)
    // ==========================================================================
    const I18N_DICTIONARY = {dict_json};

    const I18N_REVERSE_DICTIONARY = {{}};
    Object.keys(I18N_DICTIONARY).forEach(ka => {{
        I18N_REVERSE_DICTIONARY[I18N_DICTIONARY[ka]] = ka;
    }});

    const I18N_DYNAMIC_DATA = {{
        KA: {{
            profiles: [
                {{ id: 0, name: 'Personal Development', role: 'იპოვე შენი შინაგანი ძალა' }},
                {{ id: 1, name: 'Business', role: 'გაიზარდე და შექმენი შესაძლებლობები' }},
                {{ id: 2, name: 'Think Tank', role: 'სიღრმისეული სალონური დისკუსიები' }},
                {{ id: 3, name: 'Art', role: 'შემოქმედებითი ენერგია & ხელოვნება' }},
                {{ id: 4, name: 'Clubs', role: 'შენი მესამე სივრცე & კომუნა' }},
                {{ id: 5, name: 'ჩვენს შესახებ', role: 'მანიფესტი, გუნდი & ფილოსოფია' }},
                {{ id: 6, name: 'გალერეა', role: 'სივრცე, გუნდი & ღონისძიებები' }},
                {{ id: 7, name: 'ბლოგი', role: 'სიახლეები, სტატიები & იდეები' }}
            ],
            testimonials: [
                {{ name: 'ლალი', jobtitle: 'დამფუძნებელი & ფასილიტატორი', text: '„მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარებისა და შთაგონებისთვის.' }},
                {{ name: 'თინათინი', jobtitle: 'პოზიტიური ფსიქოთერაპევტი', text: 'Personal Development მიმართულება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ემოციური ჰარმონიის პოვნაში პროფესიული მხარდაჭერით.' }},
                {{ name: 'გიორგი', jobtitle: 'Think Tank მოდერატორი', text: 'Think Tank სალონური დისკუსიები და ინტელექტუალური დებატები ქმნის სივრცეს, სადაც იდეები გარდაიქმნება რეალურ ცვლილებებად და ინოვაციებად.' }},
                {{ name: 'ნინო', jobtitle: 'Playback თეატრის არტისტი', text: 'Playback თეატრი მაყურებლის ემოციებსა და ისტორიებს აცოცხლებს სცენაზე — ეს არის უნიკალური შემოქმედებითი და არტ-თერაპიული გამოცდილება.' }},
                {{ name: 'დავითი', jobtitle: 'Business & Partnerships Lead', text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.' }},
                {{ name: 'ელენე', jobtitle: 'Community Manager & Clubs Host', text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.' }},
                {{ name: 'სანდრო', jobtitle: 'Creative Producer & Curator', text: 'ჩვენ ვქმნით შთამაგონებელ გარემოს, ვორქშოფებსა და არტ-საღამოებს, რომლებიც ადამიანებს აკავშირებს და ავსებს შემოქმედებითი ენერგიით.' }}
            ],
            afisha: [
                {{ title: "🎭 Playback იმპროვიზაციის საღამო", testimonial: "თეატრალური პერფორმანსი, სადაც მაყურებლის რეალური ისტორიები და ემოციები სცენაზე ცოცხლდება.", by: "28 აგვ | 19:00 • Playback დასი" }},
                {{ title: "🌿 პოზიტიური ფსიქოლოგიის ვორქშოფი", testimonial: "სტრესის მართვის, ემოციური ბალანსისა და თვითშემეცნების პრაქტიკული სემინარი ფსიქოთერაპევტთან.", by: "30 აგვ | 18:30 • ანა კაპანაძე" }},
                {{ title: "🎲 Board Games Night & Cocktail Hour", testimonial: "სამაგიდო თამაშების ჩემპიონატი, საავტორო კოქტეილები, ახალი ნაცნობობა და მხიარული ატმოსფერო.", by: "02 სექ | 20:00 • მეტაფორა Bar" }},
                {{ title: "💡 Think Tank & ფილოსოფიის საღამო", testimonial: "დისკუსია თანამედროვე კულტურასა და „მესამე ადგილის“ ფენომენზე თანამოაზრეთა წრეში.", by: "05 სექ | 19:30 • ლევან ჯაფარიძე" }},
                {{ title: "🎨 არტ-თერაპია & თვითგამოხატვა", testimonial: "შემოქმედებითი ხატვისა და ემოციური განტვირთვის სესია მყუდრო ლაუნჯში.", by: "08 სექ | 18:00 • სალომე მგელაძე" }},
                {{ title: "☕ Coworking & Mastermind საუზმე", testimonial: "დილის ყავა, პროდუქტიული ნეთვორქინგი და გამოცდილების გაზიარება სტარტაპერებთან.", by: "12 სექ | 10:30 • გიორგი გელოვანი" }},
                {{ title: "📚 წიგნის კლუბი & ღია დისკუსია", testimonial: "თვიური წიგნის განხილვა, საინტერესო დებატები და ცხელი ჩაის საღამო.", by: "15 სექ | 19:00 • მეტაფორა Club" }}
            ],
            botWelcome: "<p>გამარჯობა! მე ვარ <strong>მეტაბოტი</strong> ✨ — „მეტაფორას“ ვირტუალური გიდი.</p><p>რით შემიძლია დაგეხმაროთ? მკითხეთ ჩვენს <strong>სერვისებზე</strong>, <strong>სივრცეებზე</strong>, <strong>ღონისძიებებზე</strong> ან <strong>ჯავშანზე</strong>!</p>"
        }},
        EN: {{
            profiles: [
                {{ id: 0, name: 'Personal Development', role: 'Find your inner strength & balance' }},
                {{ id: 1, name: 'Business', role: 'Grow and unlock new opportunities' }},
                {{ id: 2, name: 'Think Tank', role: 'Deep salon discussions & debates' }},
                {{ id: 3, name: 'Art', role: 'Creative energy & artistic expression' }},
                {{ id: 4, name: 'Clubs', role: 'Your third place & community hub' }},
                {{ id: 5, name: 'About Us', role: 'Manifesto, team & philosophy' }},
                {{ id: 6, name: 'Gallery', role: 'Spaces, team & vibrant events' }},
                {{ id: 7, name: 'Blog', role: 'Insights, articles & inspiring ideas' }}
            ],
            testimonials: [
                {{ name: 'Lali', jobtitle: 'Founder & Facilitator', text: '“Metaphora” is an environment where ideas come to life and people connect with new possibilities. Everything here is crafted for your growth and inspiration.' }},
                {{ name: 'Tinatin', jobtitle: 'Positive Psychotherapist', text: 'Personal Development helps individuals find inner resilience, balance, and emotional harmony with dedicated professional support.' }},
                {{ name: 'Giorgi', jobtitle: 'Think Tank Moderator', text: 'Think Tank salon discussions and intellectual debates create a fertile space where bold ideas turn into tangible progress.' }},
                {{ name: 'Nino', jobtitle: 'Playback Theatre Artist', text: 'Playback Theatre brings audience stories and emotions to life on stage — an unforgettable creative and therapeutic art experience.' }},
                {{ name: 'Davit', jobtitle: 'Business & Partnerships Lead', text: 'Metaphora Business unites entrepreneurs and professionals for impactful collaboration, strategic partnerships, and new ventures.' }},
                {{ name: 'Elene', jobtitle: 'Community Manager & Clubs Host', text: 'Metaphora Clubs is your “Third Place” — where you always feel at home, relaxed, and surrounded by kindred spirits.' }},
                {{ name: 'Sandro', jobtitle: 'Creative Producer & Curator', text: 'We design inspiring gatherings, workshops, and art evenings that connect people and spark boundless creative energy.' }}
            ],
            afisha: [
                {{ title: "🎭 Playback Improvisation Night", testimonial: "A theatrical performance where audience real stories and emotions come alive on stage.", by: "Aug 28 | 19:00 • Playback Troupe" }},
                {{ title: "🌿 Positive Psychology Workshop", testimonial: "A practical seminar on stress management, emotional balance and self-discovery.", by: "Aug 30 | 18:30 • Ana Kapanadze" }},
                {{ title: "🎲 Board Games Night & Cocktail Hour", testimonial: "Board game tournament, signature cocktails & mocktails, and inspiring new connections.", by: "Sep 02 | 20:00 • Metaphora Bar" }},
                {{ title: "💡 Think Tank & Philosophy Salon", testimonial: "Engaging discussions on modern culture and the 'Third Place' phenomenon with peers.", by: "Sep 05 | 19:30 • Levan Japaridze" }},
                {{ title: "🎨 Art Therapy & Creative Expression", testimonial: "A soothing session of creative painting and emotional decompression in a cozy lounge.", by: "Sep 08 | 18:00 • Salome Mgeladze" }},
                {{ title: "☕ Coworking & Mastermind Breakfast", testimonial: "Morning coffee, productive networking, and experience sharing with creators and founders.", by: "Sep 12 | 10:30 • Giorgi Gelovani" }},
                {{ title: "📚 Book Club & Open Dialogue", testimonial: "Monthly book discussion, lively debates, and a warm tea evening in good company.", by: "Sep 15 | 19:00 • Metaphora Club" }}
            ],
            botWelcome: "<p>Hello! I am <strong>MetaBot</strong> ✨ — Metaphora’s virtual AI guide.</p><p>How can I help you today? Ask me about our <strong>services</strong>, <strong>spaces</strong>, <strong>events</strong>, or <strong>booking</strong>!</p>"
        }}
    }};

    function translateDOMNodes(node, targetLang) {{
        if (node.nodeType === Node.TEXT_NODE) {{
            const raw = node.nodeValue.trim();
            if (!raw) return;

            if (targetLang === 'EN') {{
                if (I18N_DICTIONARY[raw]) {{
                    if (!node._originalKa) node._originalKa = raw;
                    node.nodeValue = node.nodeValue.replace(raw, I18N_DICTIONARY[raw]);
                }}
            }} else if (targetLang === 'KA') {{
                if (node._originalKa) {{
                    const cur = node.nodeValue.trim();
                    node.nodeValue = node.nodeValue.replace(cur, node._originalKa);
                }} else if (I18N_REVERSE_DICTIONARY[raw]) {{
                    node.nodeValue = node.nodeValue.replace(raw, I18N_REVERSE_DICTIONARY[raw]);
                }}
            }}
        }} else if (node.nodeType === Node.ELEMENT_NODE) {{
            const tag = node.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style' || tag === 'svg' || tag === 'path' || tag === 'line' || tag === 'circle') return;

            if (node.placeholder) {{
                const p = node.placeholder.trim();
                if (targetLang === 'EN' && I18N_DICTIONARY[p]) {{
                    if (!node._origPlace) node._origPlace = p;
                    node.placeholder = I18N_DICTIONARY[p];
                }} else if (targetLang === 'KA' && node._origPlace) {{
                    node.placeholder = node._origPlace;
                }}
            }}

            node.childNodes.forEach(child => translateDOMNodes(child, targetLang));
        }}
    }}

    function setLanguage(lang, save = true) {{
        document.querySelectorAll('.lang-label, #lang-active-label').forEach(lbl => {{
            lbl.textContent = lang;
        }});
        document.querySelectorAll('.lang-single-btn, #lang-toggle-btn').forEach(btn => {{
            btn.setAttribute('title', lang === 'KA' ? 'ენა: KA (დააწკაპუნეთ ინგლისურზე გადასართავად)' : 'Language: EN (Click to switch to Georgian)');
        }});
        document.documentElement.setAttribute('lang', lang.toLowerCase());

        if (save) {{
            localStorage.setItem('metafora_lang', lang);
        }}

        // Translate DOM text nodes
        if (lang === 'EN' || (lang === 'KA' && localStorage.getItem('metafora_lang_switched') === '1')) {{
            translateDOMNodes(document.body, lang);
            if (lang === 'EN') localStorage.setItem('metafora_lang_switched', '1');
        }}

        // Update dynamic data arrays in memory
        const dynData = I18N_DYNAMIC_DATA[lang];
        if (dynData) {{
            // Update profiles data
            if (typeof profiles !== 'undefined' && Array.isArray(profiles)) {{
                dynData.profiles.forEach((p, idx) => {{
                    if (profiles[idx]) {{
                        profiles[idx].name = p.name;
                        profiles[idx].role = p.role;
                    }}
                }});
            }}

            // Update testimonials
            if (typeof testimonials !== 'undefined' && Array.isArray(testimonials)) {{
                dynData.testimonials.forEach((t, idx) => {{
                    if (testimonials[idx]) {{
                        testimonials[idx].name = t.name;
                        testimonials[idx].jobtitle = t.jobtitle;
                        testimonials[idx].text = t.text;
                    }}
                }});
            }}

            // Update afisha events
            if (typeof afishaEvents !== 'undefined' && Array.isArray(afishaEvents)) {{
                dynData.afisha.forEach((a, idx) => {{
                    if (afishaEvents[idx]) {{
                        afishaEvents[idx].title = a.title;
                        afishaEvents[idx].testimonial = a.testimonial;
                        afishaEvents[idx].by = a.by;
                    }}
                }});
            }}

            // Re-render active UI pieces
            if (typeof updateCenterCard === 'function') updateCenterCard();
            if (typeof setTestimonial === 'function' && typeof currentTwIdx !== 'undefined') setTestimonial(currentTwIdx);
            if (typeof renderAfishaCards === 'function') renderAfishaCards();

            // Update MetaBot welcome msg
            const firstBotMsg = document.querySelector('.metabot-msg.bot-msg .metabot-msg-bubble');
            if (firstBotMsg) {{
                firstBotMsg.innerHTML = dynData.botWelcome;
            }}
        }}
    }}

    function initI18nLanguageSwitcher() {{
        const langToggleBtns = document.querySelectorAll('.lang-single-btn, #lang-toggle-btn');
        const savedLang = localStorage.getItem('metafora_lang') || 'KA';
        
        if (savedLang === 'EN') {{
            setLanguage('EN', false);
        }} else {{
            document.querySelectorAll('.lang-label, #lang-active-label').forEach(lbl => {{
                lbl.textContent = 'KA';
            }});
        }}

        langToggleBtns.forEach(btn => {{
            btn.addEventListener('click', (e) => {{
                e.preventDefault();
                const currentLang = localStorage.getItem('metafora_lang') || 'KA';
                const nextLang = (currentLang === 'KA') ? 'EN' : 'KA';
                
                btn.classList.add('flipping');
                setTimeout(() => btn.classList.remove('flipping'), 380);

                setLanguage(nextLang, true);
            }});
        }});
    }}
'''

# Remove old i18n code
if old_i18n_pattern.search(app_js):
    app_js = old_i18n_pattern.sub('', app_js)
    print("Old misplaced i18n block removed successfully!")

# Append new clean_i18n_func before closing DOMContentLoaded
init_calls_pattern = re.compile(r'(initServiceVideoInteractions\(\);\s*)(\n*\}\);\s*)$')
if init_calls_pattern.search(app_js):
    app_js = init_calls_pattern.sub(r'\1    initI18nLanguageSwitcher();\n' + clean_i18n_func + r'\n});\n', app_js)
    print("Clean i18n engine attached at bottom of DOMContentLoaded!")
else:
    # Fallback append
    app_js = app_js.replace('initServiceVideoInteractions();', 'initServiceVideoInteractions();\n    initI18nLanguageSwitcher();\n' + clean_i18n_func)
    print("Fallback append executed!")

with open('app.js', 'w', encoding='utf-8') as f:
    f.write(app_js)

print("app.js completely patched and ordered correctly!")
