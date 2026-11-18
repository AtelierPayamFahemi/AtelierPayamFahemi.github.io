/* =====================================================================
   CONTENT.JS  —  ALL EDITABLE TEXT OF THE WEBSITE
   ---------------------------------------------------------------------
   How to edit:
   • Change only the text between quotes "..." .
   • <b>word</b> makes a word bold.  <br> makes a new line.
   • Images: write the file name WITHOUT extension, e.g. "MAIN_Logo".
     The site automatically finds .png, .jpg or .jpeg inside /Source.
     (GitHub is case-sensitive: "MAIN_Logo" is not "main_logo".)
   • To ADD an item (certificate, project, card...): copy one whole
     block { ... }, paste it after the last one, put a comma between
     blocks, and change the texts.
   • Empty text "" = left blank on purpose (you fill it later).

   Sections in this file:
     1. SITE        – contacts, links, CV
     2. MENU        – menu items
     3. SOLUTIONS   – the 4 solutions (Main page)
     4. PROJECTS    – key projects (Main page + project page)
     5. CERTIFICATES
     6. STORY       – storyteller chapters
     7. CARDS       – pop-up cards opened by "+ ..." links
   ===================================================================== */


/* =====================================================================
   1. SITE
   ===================================================================== */
const SITE = {
  name: "PAYAM FAHEMI",
  logo: "MAIN_Logo",
  cv: "Source/MAIN_CV.pdf",
  location: "Milan (MI), Italy",
  email: "fahemipayam@gmail.com",
  phone: "+39 388 3791802",
  linkedin: "",          // ← paste your LinkedIn URL between the quotes
  youtube: "",           // ← paste your YouTube URL between the quotes
  copyright: "© 2026 Payam Fahemi Milan IT"
};


/* =====================================================================
   2. MENU   (same menu on every page)
   ===================================================================== */
const MENU = [
  { label: "Home",         href: "index.html#home" },
  { label: "About me",     href: "index.html#about" },
  { label: "Solution",     href: "index.html#solutions" },
  { label: "Key projects", href: "index.html#key-projects" }
];


/* =====================================================================
   3. SOLUTIONS  (Main page — the floating network)
   ===================================================================== */
const SOLUTIONS = [
  {
    label: "BIM Automation",
    intro: "Automating repetitive BIM tasks through scripting and parametric workflows, reducing manual effort and standardizing outputs across disciplines.",
    tools: ["DYNAMO", "PYREVIT", "PYTHON"],
    problem: "Repetitive manual tasks consume valuable project time, while manual data handling increases the risk of inconsistencies between BIM models, project documentation, schedules, and deliverables.",
    result: "By leveraging Dynamo, pyRevit, Python, and other automation tools, repetitive workflows can be automated, data synchronization improved, and consistency maintained across BIM models and project documentation, reducing errors while increasing efficiency."
  },
  {
    label: "AI-Assisted Design",
    intro: "Leveraging AI tools to accelerate design exploration, generate photorealistic visualizations, and streamline documentation workflows.",
    tools: ["CLAUDE", "CHATGPT", "KREA"],
    problem: "Traditional design exploration, visualization, and documentation workflows are often time-consuming, requiring multiple iterations across different software while repetitive production tasks slow project delivery.",
    result: "Leveraging AI tools accelerates concept development, generates high-quality photorealistic visualizations, and streamlines documentation workflows, enabling faster design iterations, improved communication, and more efficient project delivery."
  },
  {
    label: "Data & Coordination",
    intro: "Structuring BIM data for interoperability, rule-based model checking and live reporting dashboards for project stakeholders.",
    tools: ["IFC", "IDS", "POWER BI", "SOLIBRI", "NAVISWORKS"],
    problem: "",         // ← write the Problem text here
    result: ""           // ← write the Result text here
  },
  {
    label: "Visualization Pipeline",
    intro: "Building end-to-end visualization workflows from BIM model to photorealistic render, integrating AI post-processing for final outputs.",
    tools: ["", "", ""], // ← write the 3 tool names here
    problem: "Architectural visualization workflows often require multiple disconnected software platforms, repetitive file transfers, and extensive manual post-processing, resulting in longer production times and inconsistent outputs.",
    result: "An end-to-end visualization workflow seamlessly transforms BIM models into photorealistic renders, integrating AI-assisted post-processing to accelerate production, enhance visual quality, and ensure consistent deliverables."
  }
];


/* =====================================================================
   4. PROJECTS  (Key projects)
   ---------------------------------------------------------------------
   embed : an .html file inside /Source shown in the white hatched
           square (e.g. "Source/KEYPROJECT_01.html"). Until the file
           exists, the hatch pattern is shown.
   workflow : steps shown on the "+ See the project" page.
   ===================================================================== */
const PROJECTS = [
  {
    id: "01",
    title: "CODE CRAFTED ROOM SHEET",
    tools: "DYNAMO PYTHON HTML CSS",
    embed: "Source/KEYPROJECT_01.html",
    challenge: "Room data was scattered across multiple Revit schedules with no unified, printable output per room - coordinators had to manually compile information for each space.",
    solution: "A fully automated pipeline that generates one formatted A4 PDF for each room, using live data directly from the Revit model. Dynamo extracts the room information, while a Python node structures the data into an HTML file and saves it to a designated directory. The HTML files are then converted into individually formatted PDF sheets, creating a complete and automated room documentation workflow.",
    workflow: [
      { title: "Extract",  text: "Dynamo reads room data directly from the live Revit model.", image: "" },
      { title: "Structure", text: "A Python node organizes the data and writes one HTML file per room.", image: "" },
      { title: "Publish",  text: "Each HTML file is converted into a formatted A4 PDF sheet.", image: "" }
    ]
  },
  {
    id: "02",
    title: "PROJECT TITLE",
    tools: "TOOL TOOL TOOL",
    embed: "Source/KEYPROJECT_02.html",
    challenge: "Write the challenge here.",
    solution: "Write the solution here.",
    workflow: [
      { title: "Step 1", text: "Describe the step.", image: "" },
      { title: "Step 2", text: "Describe the step.", image: "" },
      { title: "Step 3", text: "Describe the step.", image: "" }
    ]
  },
  {
    id: "03",
    title: "PROJECT TITLE",
    tools: "TOOL TOOL TOOL",
    embed: "Source/KEYPROJECT_03.html",
    challenge: "Write the challenge here.",
    solution: "Write the solution here.",
    workflow: [
      { title: "Step 1", text: "Describe the step.", image: "" },
      { title: "Step 2", text: "Describe the step.", image: "" },
      { title: "Step 3", text: "Describe the step.", image: "" }
    ]
  }
];


/* =====================================================================
   5. CERTIFICATES
   ---------------------------------------------------------------------
   image : file name in /Source (horizontal or vertical — it adapts).
   ===================================================================== */
const CERTIFICATES = [
  {
    title: "BUILDING SMART - FOUNDATION",
    text: "Demonstrates knowledge and complete mastery of the fundamentals of OpenBIM.",
    hours: "16 h",
    issuer: "BuildingSMART International",
    year: "2025",
    image: "CERTIFICATE_BIM Foundation"
  },
  {
    title: "CERTIFICATE TITLE",
    text: "Write a short description of the certificate.",
    hours: "00 h",
    issuer: "Issuer name",
    year: "0000",
    image: "CERTIFICATE_Name02"
  },
  {
    title: "CERTIFICATE TITLE",
    text: "Write a short description of the certificate.",
    hours: "00 h",
    issuer: "Issuer name",
    year: "0000",
    image: "CERTIFICATE_Name03"
  },
  {
    title: "CERTIFICATE TITLE",
    text: "Write a short description of the certificate.",
    hours: "00 h",
    issuer: "Issuer name",
    year: "0000",
    image: "CERTIFICATE_Name04"
  },
  {
    title: "CERTIFICATE TITLE",
    text: "Write a short description of the certificate.",
    hours: "00 h",
    issuer: "Issuer name",
    year: "0000",
    image: "CERTIFICATE_Name05"
  }
];


/* =====================================================================
   6. STORY  (Storyteller page)
   ---------------------------------------------------------------------
   Each chapter has "moments" that appear one by one while scrolling,
   connected by the dashed thread.

   Moment fields (all optional):
     year     : "2009"
     heading  : first line (bold allowed)
     title    : larger title line
     text     : description
     image    : file name in /Source
     shape    : "circle" (image in a white circle) | "photo" | "plain"
                | "geometry" (drawn circle, no image)
     check    : true  → shows the green checkmark
     grade    : file name of the grade image (e.g. "STORYTELLER_Grade108")
     logos    : [{ image: "...", text: "..." }]
     links    : [{ label: "+ See thesis", card: "card-id" }]  → opens a card (section 7)
     goto     : { label: "+ Go to Chapter II", chapter: 1 }   → jumps (0 = Chapter I)
     note     : small text above the timeline line (Chapter IV only)
   ===================================================================== */
const STORY = {
  intro: {
    title: "STORYTELLER",
    text: "A journey shaped by <b>places</b>, <b>people</b>, <b>experiences</b>, and the constant desire to <b>learn</b>."
  },

  chapters: [
    /* ---------- CHAPTER I ---------- */
    {
      title: "LIFE BACK HOME",
      roman: "I",
      layout: "right",
      skyline: "STORYTELLER_SkylineTehran",
      moments: [
        {
          heading: "It all began with a passion for <b>drawing</b> &amp; <b>painting</b>.",
          image: "STORYTELLER_ColorPallet", shape: "plain",
          text: "Discovered my passion for drawing by my loving parents, I started from the early age to learn how to draw and paint.",
          links: [{ label: "+ See some of my paintings", card: "paintings" }]
        },
        {
          shape: "geometry",
          heading: "<b>Geometry!</b>",
          text: "I loved it always.<br><br>Combined with passion to drawing led me to choose <b>Architecture</b> at the university."
        },
        {
          image: "STORYTELLER_Basketball", shape: "plain",
          heading: "<b>Basketball</b> is my favourite sport to play.",
          text: "I still play basketball at my free time and I was point guard at the university team in <b>Isfahan</b>.",
          links: [{ label: "+ See more here", card: "basketball" }]
        },
        {
          title: "Architecture.",
          heading: "I started studying it in <b>Isfahan</b>;<br>A city with enriched Persian architecture",
          image: "STORYTELLER_ArchitectureSketch", shape: "photo",
          after: "The discipline that taught me to see the world differently, pay closer attention to details, and recognise the stories behind the spaces we inhabit."
        },
        {
          image: "STORYTELLER_GraduationCap", shape: "circle",
          year: "2009",
          title: "Bachelor’s Degree<br>Architecture",
          text: "I graduated from Azad University of Isfahan, earning an honours distinction in my third year.",
          links: [{ label: "+ See thesis", card: "thesis-bachelor" }]
        },
        {
          text: "I decided to study abroad.",
          goto: { label: "+ Go to Chapter II", chapter: 1 }
        }
      ]
    },

    /* ---------- CHAPTER II ---------- */
    {
      title: "IMMIGRATION",
      roman: "II",
      layout: "left",
      skyline: "STORYTELLER_PisaTower",
      plane: "STORYTELLER_PlaneWhite",
      moments: [
        {
          heading: "<b>Study Architecture in Italia</b>"
        },
        {
          heading: "<b>Italian Language.</b>",
          text: "First step to start",
          image: "STORYTELLER_ItalianBook", shape: "photo",
          after: "To obtain a visa and secure university admission, I had to pass the Italian language examination at the Italian Embassy.",
          check: true
        },
        {
          heading: "<b>Military service.</b>",
          text: "Second step",
          image: "STORYTELLER_Soldier", shape: "circle",
          after: "I had to complete a major commitment:<br>nearly two years of mandatory military service.",
          year: "2012",
          title: "Finished it!"
        },
        {
          text: "First landing, Parma.",
          goto: { label: "+ Go to Chapter III", chapter: 2 }
        }
      ]
    },

    /* ---------- CHAPTER III ---------- */
    {
      title: "STUDY ABROAD",
      roman: "III",
      layout: "bottom",
      skyline: "STORYTELLER_SkylineParma",
      moments: [
        {
          image: "STORYTELLER_SealParma", shape: "circle",
          year: "2012",
          heading: "I started studying <b>Architecture</b>,",
          title: "University of Parma",
          links: [{ label: "+ See selected projects", card: "parma-projects" }]
        },
        {
          year: "2016",
          image: "STORYTELLER_ADesignAward", shape: "plain",
          title: "Bronze winner",
          text: "Awarded in architecture, building and structure design category for the project “Sunshade-deck canopy”.",
          links: [{ label: "+ See the project", card: "sunshade" }]
        },
        {
          text: "I had part time jobs as architect and,<br>artistic carpet restoration",
          logos: [
            { image: "STORYTELLER_LogoGiandebiaggi", text: "Giandebiaggi Architettura | Parma" },
            { image: "STORYTELLER_LogoIntergros",    text: "Intergros Tappeti | Parma" }
          ]
        },
        {
          image: "STORYTELLER_GraduationCap", shape: "circle",
          grade: "STORYTELLER_Grade108",
          year: "2017",
          title: "Master’s Degree",
          text: "I graduated from University of Parma.<br>University of Parma, Department of Civil Engineering &amp; Architecture",
          links: [{ label: "+ See thesis", card: "thesis-master" }]
        },
        {
          image: "STORYTELLER_ReadingIcon", shape: "plain",
          text: "I kept studying &amp; exploring"
        },
        {
          heading: "<b>2018 – FLORENCE – WORKSHOP</b>",
          text: "Design visual identities and narratives in architecture",
          check: true,
          links: [{ label: "+ See more info", card: "florence" }]
        },
        {
          heading: "<b>2023 – APF YOUTUBE</b>",
          text: "I launched my personal YouTube channel",
          check: true,
          links: [{ label: "+ Link", card: "youtube" }]
        },
        {
          heading: "<b>2026 – COPENHAGEN – Workshop Henning Larsen at Ramboll’s</b>",
          text: "AI for architects",
          check: true,
          links: [{ label: "+ See more info", card: "copenhagen" }]
        },
        {
          image: "STORYTELLER_SealPolimi", shape: "circle",
          year: "2018",
          heading: "I started postgraduate master <b>BIM MANAGEMENT</b>,",
          title: "Polytechnic University of Milan",
          text: "<i>Scuola di Fratelli Pesenti</i>",
          links: [{ label: "+ See thesis", card: "thesis-bim" }]
        },
        {
          text: "Before graduation I started my career<br>as a <b>BIM Specialist</b>.",
          goto: { label: "+ Go to Chapter IV", chapter: 3 }
        },
        {
          image: "STORYTELLER_GraduationCap", shape: "circle",
          grade: "STORYTELLER_Grade110",
          year: "2020",
          heading: "I graduated",
          links: [{ label: "+ See thesis", card: "thesis-bim" }]
        }
      ]
    },

    /* ---------- CHAPTER IV ---------- */
    {
      title: "PROFESSIONAL WORK",
      roman: "IV",
      layout: "frame",
      skyline: "STORYTELLER_SkylineMilan",
      moments: [
        {
          image: "STORYTELLER_LogoATI",
          title: "Jan 2020 - Dec 2022",
          heading: "<b>BIM Specialist</b>",
          links: [
            { label: "+ More information", card: "ati-1-info" },
            { label: "+ See the project that I worked on", card: "ati-1-project" }
          ]
        },
        {
          image: "STORYTELLER_LogoATI",
          title: "Dec 2022 - Sep 2024",
          heading: "<b>BIM Coordinator</b>",
          links: [
            { label: "+ More information", card: "ati-2-info" },
            { label: "+ See the project that I worked on", card: "ati-2-project" }
          ]
        },
        {
          image: "STORYTELLER_LogoCEAS",
          note: "After <b>4 years</b> and <b>9 months</b> my<br>journey at ATIProject ended.",
          title: "Sep 2024 - May 2025",
          heading: "<b>BIM Coordinator</b>",
          links: [
            { label: "+ More information", card: "ceas-info" },
            { label: "+ See the project that I worked on", card: "ceas-project" }
          ]
        },
        {
          image: "STORYTELLER_LogoStarching",
          title: "May 2025 - Oct 2025",
          heading: "<b>BIM Coordinator</b>",
          links: [
            { label: "+ More information", card: "starching-info" },
            { label: "+ See the project that I worked on", card: "starching-project" }
          ]
        },
        {
          image: "STORYTELLER_LogoLPartners",
          title: "Oct 2025 - Ongoing",
          heading: "<b>BIM Coordinator | CDE Manager | BIM &amp; Digital Information Manager</b>",
          links: [
            { label: "+ More information", card: "lpartners-info" },
            { label: "+ See the project that I worked on", card: "lpartners-project" }
          ]
        },
        {
          text: "Want to see what I’m working on today?!",
          goto: { label: "+ Go to Chapter V", chapter: 4 }
        }
      ]
    },

    /* ---------- CHAPTER V — TODAY ---------- */
    {
      title: "TODAY",
      roman: "V",
      layout: "today",
      today: {
        lead: "Today I work at <b>L+Partners</b> — Healthcare Building Design.",
        role: "BIM Coordinator | CDE Manager | BIM &amp; Digital Information Manager",
        focusTitle: "What I’m working on",
        focus: [
          { label: "+ CDE management &amp; information requirements", card: "today-1" },
          { label: "+ BIM automation with Dynamo, pyRevit &amp; Python", card: "today-2" },
          { label: "+ AI-assisted design &amp; visualization", card: "today-3" }
        ],
        closing: "The journey continues."
      }
    }
  ]
};


/* =====================================================================
   7. CARDS  (pop-up cards for every "+ ..." link)
   ---------------------------------------------------------------------
   A card can have images, text, or both.
     title   : card title
     caption : text on the image, e.g. "01 | UNOG<br>2020"
     images  : ["STORYTELLER_xxx", "STORYTELLER_yyy"]  → gallery with dots
     text    : paragraph (justified)
     list    : ["line", "line"]  → list with | marks
     listTitle : title above the list
     link    : { label: "Open", url: "https://..." }  → button
   The id (e.g. "paintings") must match the "card" of the link.
   ===================================================================== */
const CARDS = {
  "paintings":        { title: "My paintings", images: [], text: "" },
  "basketball":       { title: "Basketball", images: [], text: "" },
  "thesis-bachelor":  { title: "Bachelor’s thesis", images: [], text: "" },
  "parma-projects":   { title: "Selected projects", images: [], text: "" },
  "sunshade":         { title: "Sunshade-deck canopy", images: [], text: "" },
  "thesis-master":    { title: "Master’s thesis", images: [], text: "" },
  "florence":         { title: "2018 – Florence – Workshop", images: [], text: "" },
  "youtube":          { title: "APF YouTube", images: [], text: "", link: { label: "Open the channel", url: "" } },
  "copenhagen":       { title: "2026 – Copenhagen – Workshop", images: [], text: "" },
  "thesis-bim":       { title: "BIM Management thesis", images: [], text: "" },

  "ati-1-info": {
    title: "",
    images: [],
    text: "What began during my second-level Master’s degree in BIM Management became one of the most transformative experiences of my professional journey. As a BIM Specialist working on the renovation of the United Nations Office at Geneva (UNOG), I was introduced to the complexity of heritage projects, large-scale coordination, and the real connection between BIM and construction. Joining the dynamic environment of ATIProject was a turning point in my career. Surrounded by talented young professionals, I experienced a culture of collaboration, innovation, and digital thinking that deeply shaped my professional mindset."
  },
  "ati-1-project": {
    title: "",
    caption: "01 | UNOG<br>2020",
    images: ["STORYTELLER_ATI_Project01"],
    listTitle: "Skills acquired &amp; tools:",
    list: [
      "Developed BIM models and coordinated architectural deliverables",
      "Managed large-scale Revit models and architecture remodeling based on point cloud",
      "Worked with Recap files and point cloud",
      "Oversaw technical documentation from detail design to execution",
      "Supported IFC exports and structured information delivery",
      "Supported workflows using Dynamo"
    ]
  },
  "ati-2-info":        { title: "", images: [], text: "" },
  "ati-2-project":     { title: "", caption: "", images: [], listTitle: "Skills acquired &amp; tools:", list: [] },
  "ceas-info":         { title: "", images: [], text: "" },
  "ceas-project":      { title: "", caption: "", images: [], listTitle: "Skills acquired &amp; tools:", list: [] },
  "starching-info":    { title: "", images: [], text: "" },
  "starching-project": { title: "", caption: "", images: [], listTitle: "Skills acquired &amp; tools:", list: [] },
  "lpartners-info":    { title: "", images: [], text: "" },
  "lpartners-project": { title: "", caption: "", images: [], listTitle: "Skills acquired &amp; tools:", list: [] },

  "today-1": { title: "CDE management", images: [], text: "" },
  "today-2": { title: "BIM automation", images: [], text: "" },
  "today-3": { title: "AI-assisted design", images: [], text: "" }
};
