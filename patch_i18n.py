# -*- coding: utf-8 -*-
import re

with open('app.js', 'r', encoding='utf-8') as f:
    app_js = f.read()

# Let's inspect where setLanguage is and replace it with a comprehensive i18n system
i18n_code = r'''
    // ==========================================================================
    // COMPREHENSIVE I18N BILINGUAL TRANSLATION ENGINE (KA ⇄ EN)
    // ==========================================================================
    const I18N_DICTIONARY = {
        // Navigation & General Header
        "მთავარი": "Home",
        "ჩვენს შესახებ": "About Us",
        "მანიფესტი & ფილოსოფია": "Manifesto & Philosophy",
        "მესამე ადგილის კონცეფცია": "The Third Place Concept",
        "მეტაფორას გუნდი": "Metaphora Team",
        "გაიცანით ჩვენი წევრები": "Meet Our Team",
        "სერვისები": "Services",
        "სერვისები & სივრცეები": "Services & Spaces",
        "1. Edutainment & ვორქშოფები": "1. Edutainment & Workshops",
        "განათლება და პიროვნული ზრდა": "Education and personal growth",
        "2. პოზიტიური ფსიქოთერაპია": "2. Positive Psychotherapy",
        "ინდივიდუალური & ჯგუფური სესიები": "Individual & group sessions",
        "3. Playback თეატრი": "3. Playback Theatre",
        "იმპროვიზაციული არტ-პერფორმანსი": "Improvisational art performance",
        "4. Coworking & Quiet Lounge": "4. Coworking & Quiet Lounge",
        "კომფორტული სამუშაო სივრცე": "Comfortable workspace & quiet zone",
        "5. Themed Bar & Community": "5. Themed Bar & Community",
        "სამაგიდო თამაშები & კოქტეილები": "Board games & signature drinks",
        "გალერეა": "Gallery",
        "ბლოგი": "Blog",
        "კონტაქტი": "Contact",
        "ჯავშანი": "Book Now",
        "ონლაინ ჯავშანი": "Online Booking",
        "ადგილის დაჯავშნა": "Reserve a Spot",
        "დაჯავშნე ადგილი": "Reserve a Spot",
        "დაჯავშნე ვიზიტი": "Book a Visit",
        "მოძებნე მეტაფორაში...": "Search in Metaphora...",
        "მისწერე მეტაბოტს...": "Message MetaBot...",
        "გაიგე მეტი": "Learn More",
        "აღმოაჩინე მეტი": "Discover More",
        "სერვისების ნახვა": "View Services",
        "კონსულტაციის ჯავშანი": "Book Consultation",
        "გაიცანი სივრცე": "Explore Space",
        "გაიცანი წევრი": "Meet Member",
        "← მთავარ გვერდზე დაბრუნება": "← Back to Home Page",

        // Entrance Portal
        "✨ Edutainment Hub & Third Place": "✨ Edutainment Hub & Third Place",
        "შედი მეტაფორაში": "Enter Metaphora",
        "გადადი სივრცეში": "Explore Space",

        // Hero Slider
        "შენი მესამე ადგილი — სახლსა და სამსახურს მიღმა": "Your Third Place — Beyond Home and Work",
        "„მეტაფორა“ არის უნიკალური სივრცე თბილისში, რომელიც აერთიანებს პიროვნულ განვითარებას, შემოქმედებას, სალონურ დისკუსიებსა და მეგობრულ გარემოს.": "“Metaphora” is a unique space in Tbilisi uniting personal growth, creative arts, intellectual salon discussions, and a warm community.",
        "🎭 Playback თეატრი & არტ-პერფორმანსი": "🎭 Playback Theatre & Art Performance",
        "ცოცხალი იმპროვიზაცია და შენი ისტორიები სცენაზე": "Live Improvisation & Your Stories on Stage",
        "გახდი სპექტაკლის თანაავტორი. Playback თეატრი აცოცხლებს მაყურებლის რეალურ ემოციებსა და გამოცდილებას.": "Become a co-creator of the performance. Playback Theatre brings real audience stories and emotions to life on stage.",
        "🧠 Think Tank & პოზიტიური ფსიქოთერაპია": "🧠 Think Tank & Positive Psychotherapy",
        "ინტელექტუალური დისკუსიები და პიროვნული ზრდა": "Intellectual Discussions & Personal Growth",
        "სიღრმისეული სალონური შეხვედრები, მენტორინგი და ფსიქოლოგიური მხარდაჭერა შინაგანი ჰარმონიისთვის.": "In-depth salon dialogues, mentorship, and psychological guidance for inner balance and harmony.",

        // Section 2: Kinetic Reveal & Stagger Carousel
        "ჩვენი ფილოსოფია": "Our Philosophy",
        "სივრცე, სადაც ყოველი დეტალი შენზეა მორგებული": "A space where every detail is tailored for you",
        "მეტაფორა არის გარემო, სადაც იდეები ცოცხლდებიან": "Metaphora is an environment where ideas come to life",
        "და ადამიანები პოულობენ ახალ შესაძლებლობებს": "and people discover new possibilities and growth",
        "შექმნილია შთაგონებისთვის, განვითარებისა და ჰარმონიისთვის": "Crafted for inspiration, development, and harmony",
        "ღონისძიებების აფიშა & სიახლეები": "Events Schedule & Announcements",
        "აღმოაჩინეთ მეტაფორას უახლოესი ვორქშოფები, სპექტაკლები და შეხვედრები": "Discover Metaphora’s upcoming workshops, performances, and gatherings",

        // Section 3: Services
        "აღმოაჩინე „მეტაფორა“": "Discover “Metaphora”",
        "ეს არ არის უბრალოდ სივრცე — „მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ.": "This is not just a space — “Metaphora” is an environment where ideas thrive and people connect with new opportunities.",
        "1. მეტაფორა Personal Development": "1. Metaphora Personal Development",
        "შინაგანი ძალა": "Inner Strength",
        "ზრდა & ბალანსი": "Growth & Balance",
        "იპოვე შენი შინაგანი ძალა. პიროვნული განვითარება, ფსიქოლოგიური მხარდაჭერა და თვითშემეცნება.": "Find your inner strength. Personal growth, psychological support, and deep self-discovery.",
        "2. მეტაფორა Business": "2. Metaphora Business",
        "შესაძლებლობები": "Opportunities",
        "ნეთვორქინგი": "Networking",
        "გაიზარდე, ითანამშრომლე და შექმენი ახალი შესაძლებლობები. ბიზნეს-კონტაქტები და პარტნიორობა.": "Grow, collaborate, and create new possibilities. Business connections and high-impact partnerships.",
        "3. მეტაფორა Think Tank": "3. Metaphora Think Tank",
        "დისკუსიები": "Discussions",
        "სალონური გარემო": "Salon Atmosphere",
        "ჩაერთე სიღრმისეულ სალონურ დისკუსიებში. ინტელექტუალური დებატები, იდეების გაზიარება და ანალიტიკა.": "Engage in deep salon discussions. Intellectual debates, insightful ideas, and analytical exchanges.",
        "4. მეტაფორა Art": "4. Metaphora Art",
        "შემოქმედება": "Creativity",
        "ხელოვნება & ენერგია": "Art & Energy",
        "დაიმუხტე შემოქმედებითი ენერგიითა და ხელოვნებით. Playback თეატრი, პერფორმანსები და გამოფენები.": "Energize through creative energy and art. Playback Theatre, live performances, and exhibitions.",
        "5. მეტაფორა Clubs": "5. Metaphora Clubs",
        "მესამე სივრცე": "Third Place",
        "შინაური გარემო ★": "Homey Vibe ★",
        "შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად იგრძნობ. თემატური კლუბები და კომუნა.": "Your “Third Place” — where you always feel at home. Themed community clubs and inspiring circles.",
        "🌱 1. Personal Development": "🌱 1. Personal Development",
        "💼 2. Business": "💼 2. Business",
        "🧠 3. Think Tank": "🧠 3. Think Tank",
        "🎨 4. Art & Playback თეატრი": "🎨 4. Art & Playback Theatre",
        "🏛️ 5. Clubs & Coworking": "🏛️ 5. Clubs & Coworking",

        // Section 4: Team
        "გაიცანი მეტაფორას გუნდი": "Meet the Metaphora Team",
        "პროფესიონალები, რომლებიც ქმნიან მეტაფორას ატმოსფეროს": "The dedicated professionals shaping Metaphora’s atmosphere",

        // Section 5: Manifesto Typewriter
        "მეტაფორას მანიფესტი": "Metaphora Manifesto",
        "მოუსმინეთ ჩვენს ხმას და გაეცანით მეტაფორას ფილოსოფიას": "Listen to our voice and explore the philosophy behind Metaphora",
        "ხმოვანი აუდიო გზამკვლევი": "Voice Audio Guide",
        "დამფუძნებელი & ფასილიტატორი": "Founder & Facilitator",
        "პოზიტიური ფსიქოთერაპევტი": "Positive Psychotherapist",
        "Think Tank მოდერატორი": "Think Tank Moderator",
        "Playback თეატრის არტისტი": "Playback Theatre Artist",
        "Business & Partnerships Lead": "Business & Partnerships Lead",
        "Community Manager & Clubs Host": "Community Manager & Clubs Host",
        "Creative Producer & Curator": "Creative Producer & Curator",

        // Section 6: Contact & Footer
        "დაგვიკავშირდით": "Get in Touch",
        "ჩვენ მზად ვართ გიპასუხოთ ნებისმიერ შეკითხვაზე": "We are ready to answer all your questions and welcome you",
        "მისამართი:": "Address:",
        "თბილისი, საქართველო": "Tbilisi, Georgia",
        "სამუშაო საათები:": "Working Hours:",
        "ორშაბათი - კვირა: 10:00 - 23:00": "Monday - Sunday: 10:00 - 23:00",
        "ტელეფონი:": "Phone:",
        "ელ.ფოსტა:": "Email:",
        "ყველა უფლება დაცულია": "All Rights Reserved",
        "ნავიგაცია": "Navigation",
        "სოციალური ქსელები": "Social Networks",

        // Booking Modal
        "აირჩიეთ სასურველი სერვისი ან სივრცე": "Select your desired service or space",
        "სახელი და გვარი": "Full Name",
        "ტელეფონის ნომერი": "Phone Number",
        "აირჩიეთ სერვისი": "Choose Service",
        "თარიღი": "Date",
        "შეტყობინება / კომენტარი": "Message / Notes",
        "დაჯავშნის გაგზავნა": "Submit Reservation",
        "გაგზავნა": "Send",
        "დახურვა": "Close",

        // MetaBot Widget
        "მეტაბოტი": "MetaBot",
        "ონლაინ ასისტენტი": "AI Online Guide",
        "🌿 რა არის მეტაფორა?": "🌿 What is Metaphora?",
        "🌱 სერვისები": "🌱 Services",
        "🎭 Playback თეატრი": "🎭 Playback Theatre",
        "📅 ონლაინ ჯავშანი": "📅 Online Booking",
        "📍 ლოკაცია & კონტაქტი": "📍 Location & Contact",
        "მეტაბოტი წერს...": "MetaBot is typing...",

        // Gallery Page
        "სივრცეები & ღონისძიებები": "Spaces & Events",
        "მეტაფორას ფოტოგალერეა": "Metaphora Photo Gallery",
        "დაათვალიერეთ ჩვენი მრავალფუნქციური სივრცეები, არტ-საღამოები და გუნდის შემოქმედებითი პროცესი.": "Explore our multifunctional spaces, art evenings, and team’s creative journey.",
        "ყველა ფოტო": "All Photos",
        "გუნდი": "Team",
        "ღონისძიებები & თეატრი": "Events & Theatre",
        "სივრცეები & ლაუნჯი": "Spaces & Lounge",

        // Blog Page
        "სტატიები & ფიქრები": "Articles & Insights",
        "მეტაფორას ბლოგი": "Metaphora Blog",
        "გაეცანით საინტერესო მოსაზრებებს ფსიქოლოგიაზე, მესამე ადგილის კონცეფციასა და თვითგანვითარებაზე.": "Read inspiring perspectives on psychology, the Third Place concept, and personal growth.",
        "🌟 რჩეული სტატია • 5 წთ საკითხავი": "🌟 Featured Article • 5 min read",
        "რა არის „მესამე ადგილი“ და რატომ სჭირდება ის თანამედროვე ადამიანს?": "What is the “Third Place” and why do modern people need it?",
        "სოციოლოგი რეი ოლდენბურგის თეორიით, ადამიანის ბედნიერებისთვის აუცილებელია მესამე სივრცე — ადგილი სახლსა და სამსახურს მიღმა, სადაც არ არის იერარქია, სადაც ურთიერთობა არის მარტივი და შთამაგონებელი.": "According to sociologist Ray Oldenburg’s theory, a third space beyond home and work is vital for human fulfillment — a place free from hierarchy, where connection is simple and inspiring.",
        "ავტორი: მეტაფორას გუნდი": "Author: Metaphora Team",
        "თეატრი & ემოცია • 4 წთ": "Theatre & Emotion • 4 min",
        "Playback თეატრის მაგია და არტ-თერაპია": "The Magic of Playback Theatre & Art Therapy",
        "როგორ ეხმარება იმპროვიზაციული თეატრი საკუთარი ისტორიების გარედან დანახვას, ემოციების გაცნობიერებასა და სტრესის განმუხტვას.": "How improvisational theatre helps reflect on personal stories from outside, process emotions, and relieve stress.",
        "ფსიქოლოგია • 6 წთ": "Psychology • 6 min",
        "პოზიტიური ფსიქოთერაპიის 5 ოქროს წესი": "5 Golden Rules of Positive Psychotherapy",
        "როგორ შევხედოთ პრობლემებს არა როგორც დაბრკოლებას, არამედ როგორც ზრდისა და განვითარების რესურსს.": "How to view challenges not as barriers, but as resources for growth and personal development.",
        "პროდუქტიულობა • 3 წთ": "Productivity • 3 min",
        "როგორ შევქმნათ Deep Work გარემო?": "How to Create a Deep Work Environment?",
        "რატომ არის მნიშვნელოვანი მყუდრო Coworking სივრცე ყოველდღიური კონცენტრაციისა და ახალი იდეების დაბადებისთვის.": "Why a cozy Coworking space is essential for daily focus and sparking innovative ideas.",
        "კომუნა • 4 წთ": "Community • 4 min",
        "სამაგიდო თამაშები როგორც სოციალური ხიდი": "Board Games as a Social Bridge",
        "რატომ გვაახლოებს ინტელექტუალური თამაშები და როგორ ქმნის ის უსაფრთხო გარემოს ახალი ნაცნობობისთვის.": "Why intellectual board games bring us closer and create a welcoming environment for new friendships.",
        "თვითგამოხატვა • 5 წთ": "Self-Expression • 5 min",
        "არტ-თერაპია და შინაგანი ბალანსი": "Art Therapy & Inner Balance",
        "ფერებითა და ფორმებით თვითგამოხატვა მათთვისაც, ვისაც ჰგონია, რომ ხატვა არ ეხერხება.": "Expressing yourself through colors and forms — even for those who think they can’t paint."
    };

    // Reverse lookup for EN -> KA restoration
    const I18N_REVERSE_DICTIONARY = {};
    Object.keys(I18N_DICTIONARY).forEach(ka => {
        I18N_REVERSE_DICTIONARY[I18N_DICTIONARY[ka]] = ka;
    });

    const I18N_DYNAMIC_DATA = {
        KA: {
            profiles: [
                { id: 0, name: 'Personal Development', role: 'იპოვე შენი შინაგანი ძალა' },
                { id: 1, name: 'Business', role: 'გაიზარდე და შექმენი შესაძლებლობები' },
                { id: 2, name: 'Think Tank', role: 'სიღრმისეული სალონური დისკუსიები' },
                { id: 3, name: 'Art', role: 'შემოქმედებითი ენერგია & ხელოვნება' },
                { id: 4, name: 'Clubs', role: 'შენი მესამე სივრცე & კომუნა' },
                { id: 5, name: 'ჩვენს შესახებ', role: 'მანიფესტი, გუნდი & ფილოსოფია' },
                { id: 6, name: 'გალერეა', role: 'სივრცე, გუნდი & ღონისძიებები' },
                { id: 7, name: 'ბლოგი', role: 'სიახლეები, სტატიები & იდეები' }
            ],
            testimonials: [
                { name: 'ლალი', jobtitle: 'დამფუძნებელი & ფასილიტატორი', text: '„მეტაფორა“ არის გარემო, სადაც იდეები ცოცხლდებიან, ხოლო ადამიანები და შესაძლებლობები ერთმანეთს პოულობენ. აქ ყველაფერია შენი განვითარებისა და შთაგონებისთვის.' },
                { name: 'თინათინი', jobtitle: 'პოზიტიური ფსიქოთერაპევტი', text: 'Personal Development მიმართულება ეხმარება ადამიანებს შინაგანი ძალის, ბალანსისა და ემოციური ჰარმონიის პოვნაში პროფესიული მხარდაჭერით.' },
                { name: 'გიორგი', jobtitle: 'Think Tank მოდერატორი', text: 'Think Tank სალონური დისკუსიები და ინტელექტუალური დებატები ქმნის სივრცეს, სადაც იდეები გარდაიქმნება რეალურ ცვლილებებად და ინოვაციებად.' },
                { name: 'ნინო', jobtitle: 'Playback თეატრის არტისტი', text: 'Playback თეატრი მაყურებლის ემოციებსა და ისტორიებს აცოცხლებს სცენაზე — ეს არის უნიკალური შემოქმედებითი და არტ-თერაპიული გამოცდილება.' },
                { name: 'დავითი', jobtitle: 'Business & Partnerships Lead', text: 'მეტაფორა Business აერთიანებს მეწარმეებსა და პროფესიონალებს ნაყოფიერი თანამშრომლობის, პარტნიორობისა და ახალი შესაძლებლობების შესაქმნელად.' },
                { name: 'ელენე', jobtitle: 'Community Manager & Clubs Host', text: 'მეტაფორა Clubs არის შენი „მესამე სივრცე“ — ადგილი, სადაც თავს ყოველთვის შინაურად, მყუდროდ და თავისუფლად იგრძნობ თანამოაზრეებთან ერთად.' },
                { name: 'სანდრო', jobtitle: 'Creative Producer & Curator', text: 'ჩვენ ვქმნით შთამაგონებელ გარემოს, ვორქშოფებსა და არტ-საღამოებს, რომლებიც ადამიანებს აკავშირებს და ავსებს შემოქმედებითი ენერგიით.' }
            ],
            afisha: [
                { title: "🎭 Playback იმპროვიზაციის საღამო", testimonial: "თეატრალური პერფორმანსი, სადაც მაყურებლის რეალური ისტორიები და ემოციები სცენაზე ცოცხლდება.", by: "28 აგვ | 19:00 • Playback დასი" },
                { title: "🌿 პოზიტიური ფსიქოლოგიის ვორქშოფი", testimonial: "სტრესის მართვის, ემოციური ბალანსისა და თვითშემეცნების პრაქტიკული სემინარი ფსიქოთერაპევტთან.", by: "30 აგვ | 18:30 • ანა კაპანაძე" },
                { title: "🎲 Board Games Night & Cocktail Hour", testimonial: "სამაგიდო თამაშების ჩემპიონატი, საავტორო კოქტეილები, ახალი ნაცნობობა და მხიარული ატმოსფერო.", by: "02 სექ | 20:00 • მეტაფორა Bar" },
                { title: "💡 Think Tank & ფილოსოფიის საღამო", testimonial: "დისკუსია თანამედროვე კულტურასა და „მესამე ადგილის“ ფენომენზე თანამოაზრეთა წრეში.", by: "05 სექ | 19:30 • ლევან ჯაფარიძე" },
                { title: "🎨 არტ-თერაპია & თვითგამოხატვა", testimonial: "შემოქმედებითი ხატვისა და ემოციური განტვირთვის სესია მყუდრო ლაუნჯში.", by: "08 სექ | 18:00 • სალომე მგელაძე" },
                { title: "☕ Coworking & Mastermind საუზმე", testimonial: "დილის ყავა, პროდუქტიული ნეთვორქინგი და გამოცდილების გაზიარება სტარტაპერებთან.", by: "12 სექ | 10:30 • გიორგი გელოვანი" },
                { title: "📚 წიგნის კლუბი & ღია დისკუსია", testimonial: "თვიური წიგნის განხილვა, საინტერესო დებატები და ცხელი ჩაის საღამო.", by: "15 სექ | 19:00 • მეტაფორა Club" }
            ],
            botWelcome: "<p>გამარჯობა! მე ვარ <strong>მეტაბოტი</strong> ✨ — „მეტაფორას“ ვირტუალური გიდი.</p><p>რით შემიძლია დაგეხმაროთ? მკითხეთ ჩვენს <strong>სერვისებზე</strong>, <strong>სივრცეებზე</strong>, <strong>ღონისძიებებზე</strong> ან <strong>ჯავშანზე</strong>!</p>"
        },
        EN: {
            profiles: [
                { id: 0, name: 'Personal Development', role: 'Find your inner strength & balance' },
                { id: 1, name: 'Business', role: 'Grow and unlock new opportunities' },
                { id: 2, name: 'Think Tank', role: 'Deep salon discussions & debates' },
                { id: 3, name: 'Art', role: 'Creative energy & artistic expression' },
                { id: 4, name: 'Clubs', role: 'Your third place & community hub' },
                { id: 5, name: 'About Us', role: 'Manifesto, team & philosophy' },
                { id: 6, name: 'Gallery', role: 'Spaces, team & vibrant events' },
                { id: 7, name: 'Blog', role: 'Insights, articles & inspiring ideas' }
            ],
            testimonials: [
                { name: 'Lali', jobtitle: 'Founder & Facilitator', text: '“Metaphora” is an environment where ideas come to life and people connect with new possibilities. Everything here is crafted for your growth and inspiration.' },
                { name: 'Tinatin', jobtitle: 'Positive Psychotherapist', text: 'Personal Development helps individuals find inner resilience, balance, and emotional harmony with dedicated professional support.' },
                { name: 'Giorgi', jobtitle: 'Think Tank Moderator', text: 'Think Tank salon discussions and intellectual debates create a fertile space where bold ideas turn into tangible progress.' },
                { name: 'Nino', jobtitle: 'Playback Theatre Artist', text: 'Playback Theatre brings audience stories and emotions to life on stage — an unforgettable creative and therapeutic art experience.' },
                { name: 'Davit', jobtitle: 'Business & Partnerships Lead', text: 'Metaphora Business unites entrepreneurs and professionals for impactful collaboration, strategic partnerships, and new ventures.' },
                { name: 'Elene', jobtitle: 'Community Manager & Clubs Host', text: 'Metaphora Clubs is your “Third Place” — where you always feel at home, relaxed, and surrounded by kindred spirits.' },
                { name: 'Sandro', jobtitle: 'Creative Producer & Curator', text: 'We design inspiring gatherings, workshops, and art evenings that connect people and spark boundless creative energy.' }
            ],
            afisha: [
                { title: "🎭 Playback Improvisation Night", testimonial: "A theatrical performance where audience real stories and emotions come alive on stage.", by: "Aug 28 | 19:00 • Playback Troupe" },
                { title: "🌿 Positive Psychology Workshop", testimonial: "A practical seminar on stress management, emotional balance and self-discovery.", by: "Aug 30 | 18:30 • Ana Kapanadze" },
                { title: "🎲 Board Games Night & Cocktail Hour", testimonial: "Board game tournament, signature cocktails & mocktails, and inspiring new connections.", by: "Sep 02 | 20:00 • Metaphora Bar" },
                { title: "💡 Think Tank & Philosophy Salon", testimonial: "Engaging discussions on modern culture and the 'Third Place' phenomenon with peers.", by: "Sep 05 | 19:30 • Levan Japaridze" },
                { title: "🎨 Art Therapy & Creative Expression", testimonial: "A soothing session of creative painting and emotional decompression in a cozy lounge.", by: "Sep 08 | 18:00 • Salome Mgeladze" },
                { title: "☕ Coworking & Mastermind Breakfast", testimonial: "Morning coffee, productive networking, and experience sharing with creators and founders.", by: "Sep 12 | 10:30 • Giorgi Gelovani" },
                { title: "📚 Book Club & Open Dialogue", testimonial: "Monthly book discussion, lively debates, and a warm tea evening in good company.", by: "Sep 15 | 19:00 • Metaphora Club" }
            ],
            botWelcome: "<p>Hello! I am <strong>MetaBot</strong> ✨ — Metaphora’s virtual AI guide.</p><p>How can I help you today? Ask me about our <strong>services</strong>, <strong>spaces</strong>, <strong>events</strong>, or <strong>booking</strong>!</p>"
        }
    };

    // Recursive DOM Text Node Translator
    function translateDOMNodes(node, lang) {
        if (node.nodeType === Node.TEXT_NODE) {
            const rawText = node.nodeValue.trim();
            if (!rawText) return;

            if (lang === 'EN') {
                if (I18N_DICTIONARY[rawText]) {
                    node.nodeValue = node.nodeValue.replace(rawText, I18N_DICTIONARY[rawText]);
                }
            } else if (lang === 'KA') {
                if (I18N_REVERSE_DICTIONARY[rawText]) {
                    node.nodeValue = node.nodeValue.replace(rawText, I18N_REVERSE_DICTIONARY[rawText]);
                }
            }
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // Ignore scripts, styles, inputs handled separately
            const tag = node.tagName.toLowerCase();
            if (tag === 'script' || tag === 'style') return;

            // Handle Input Placeholders
            if (node.placeholder) {
                const p = node.placeholder.trim();
                if (lang === 'EN' && I18N_DICTIONARY[p]) node.placeholder = I18N_DICTIONARY[p];
                else if (lang === 'KA' && I18N_REVERSE_DICTIONARY[p]) node.placeholder = I18N_REVERSE_DICTIONARY[p];
            }

            // Handle Titles
            if (node.title) {
                const t = node.title.trim();
                if (lang === 'EN' && I18N_DICTIONARY[t]) node.title = I18N_DICTIONARY[t];
                else if (lang === 'KA' && I18N_REVERSE_DICTIONARY[t]) node.title = I18N_REVERSE_DICTIONARY[t];
            }

            node.childNodes.forEach(child => translateDOMNodes(child, lang));
        }
    }

    // Main Language Switcher Trigger
    function setLanguage(lang, save = true) {
        document.querySelectorAll('.lang-label, #lang-active-label').forEach(lbl => {
            lbl.textContent = lang;
        });
        document.querySelectorAll('.lang-single-btn, #lang-toggle-btn').forEach(btn => {
            btn.setAttribute('title', lang === 'KA' ? 'ენა: KA (დააწკაპუნეთ ინგლისურზე გადასართავად)' : 'Language: EN (Click to switch to Georgian)');
        });
        document.documentElement.setAttribute('lang', lang.toLowerCase());

        if (save) {
            localStorage.setItem('metafora_lang', lang);
        }

        // 1. Translate all DOM text nodes across the entire page
        translateDOMNodes(document.body, lang);

        // 2. Update dynamic data arrays in memory
        const dynData = I18N_DYNAMIC_DATA[lang];
        if (dynData) {
            // Update profiles data
            dynData.profiles.forEach((p, idx) => {
                if (profiles[idx]) {
                    profiles[idx].name = p.name;
                    profiles[idx].role = p.role;
                }
            });

            // Update testimonials
            dynData.testimonials.forEach((t, idx) => {
                if (testimonials[idx]) {
                    testimonials[idx].name = t.name;
                    testimonials[idx].jobtitle = t.jobtitle;
                    testimonials[idx].text = t.text;
                }
            });

            // Update afisha events
            dynData.afisha.forEach((a, idx) => {
                if (afishaEvents[idx]) {
                    afishaEvents[idx].title = a.title;
                    afishaEvents[idx].testimonial = a.testimonial;
                    afishaEvents[idx].by = a.by;
                }
            });

            // Re-render active UI pieces
            if (typeof updateCenterCard === 'function') updateCenterCard();
            if (typeof setTestimonial === 'function' && typeof currentTwIdx !== 'undefined') setTestimonial(currentTwIdx);
            if (typeof renderAfishaCards === 'function') renderAfishaCards();

            // Update MetaBot welcome msg
            const firstBotMsg = document.querySelector('.metabot-msg.bot-msg .metabot-msg-bubble');
            if (firstBotMsg) {
                firstBotMsg.innerHTML = dynData.botWelcome;
            }
        }
    }

    // Single Direct Language Toggle Button (KA ⇄ EN)
    const langToggleBtns = document.querySelectorAll('.lang-single-btn, #lang-toggle-btn');
    const savedLang = localStorage.getItem('metafora_lang') || 'KA';
    setLanguage(savedLang, false);

    langToggleBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const currentLang = localStorage.getItem('metafora_lang') || 'KA';
            const nextLang = (currentLang === 'KA') ? 'EN' : 'KA';
            
            btn.classList.add('flipping');
            setTimeout(() => btn.classList.remove('flipping'), 380);

            setLanguage(nextLang, true);
        });
    });
'''

# Find the old language handler block in app.js and replace it
old_block_pattern = re.compile(r'// Single Direct Language Toggle Button \(KA ⇄ EN\).*?localStorage\.setItem\(\'metafora_lang\', lang\);\s*\}\s*\}', re.DOTALL)

if old_block_pattern.search(app_js):
    app_js = old_block_pattern.sub(i18n_code.strip(), app_js)
    with open('app.js', 'w', encoding='utf-8') as f:
        f.write(app_js)
    print("SUCCESS: app.js replaced with complete i18n translation engine!")
else:
    print("WARNING: Pattern not matched directly, manual replacement needed.")
