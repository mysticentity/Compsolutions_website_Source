const APP_VERSION = "5-hover-tooltips";
console.info("PC Buying Quiz loaded:", APP_VERSION);

const QUESTIONS = [
  {
    id: "primaryUse",
    title: "Which best describes your main use?",
    subtitle: "This sets your starting path.",
    options: [
      { label: "Office / business productivity", effects: { office: 3 } },
      { label: "Gaming / content creation", effects: { creative: 3 } },
      { label: "Both about equally", effects: { office: 2, creative: 2 } }
    ]
  },
  {
    id: "apps",
    title: "What apps/work do you use most often?",
    options: [
      { label: "Web, email, docs, spreadsheets, video calls", effects: { office: 3 } },
      { label: "Photo/video editing, design apps, coding tools", effects: { creative: 2, multicore: 1, ramNeed: 1 } },
      { label: "Modern games and occasional streaming", effects: { gaming: 3, gpuNeed: 2 } },
      { label: "A mix of everything above", effects: { office: 1, creative: 1, gaming: 1, hybridHint: 2 } }
    ]
  },
  {
    id: "multitask",
    title: "How heavy is your multitasking?",
    options: [
      { label: "Light (few tabs/apps at once)", effects: { ramNeed: 0, cpuNeed: 0 } },
      { label: "Medium (many tabs + several apps)", effects: { ramNeed: 1, cpuNeed: 1 } },
      { label: "Heavy (large files, many apps, multiple monitors)", effects: { ramNeed: 2, cpuNeed: 2, multicore: 1 } }
    ]
  },
  {
    id: "gamingTarget",
    title: "If you game, what is your target?",
    branch: (state) => state.scores.creative + state.scores.gaming >= 3,
    options: [
      { label: "Esports / lighter games at 1080p", effects: { gaming: 1, gpuNeed: 1 } },
      { label: "AAA gaming at 1080p/1440p", effects: { gaming: 2, gpuNeed: 2 } },
      { label: "Mostly not gaming", effects: { office: 1 } }
    ]
  },
  {
    id: "creatorLoad",
    title: "If you create content, how heavy are your projects?",
    branch: (state) => state.scores.creative >= 2,
    options: [
      { label: "Light edits and social content", effects: { creative: 1, ramNeed: 1 } },
      { label: "Regular 1080p/1440p editing and effects", effects: { creative: 2, multicore: 2, ramNeed: 2, gpuNeed: 1 } },
      { label: "Heavy timelines / large media / 3D work", effects: { creative: 3, multicore: 3, ramNeed: 3, gpuNeed: 2, storageNeed: 2 } }
    ]
  },
  {
    id: "silence",
    title: "How important is a quiet computer?",
    options: [
      { label: "Not a big deal", effects: {} },
      { label: "Somewhat important", effects: { coolingNeed: 1 } },
      { label: "Very important", effects: { coolingNeed: 2, caseNeed: 1 } }
    ]
  },
  {
    id: "portability",
    title: "Where will this system be used?",
    options: [
      { label: "Desk only, mostly one location", effects: { desktopBias: 1 } },
      { label: "Moved occasionally between rooms/locations", effects: { desktopBias: 0 } },
      { label: "I likely need a laptop instead", effects: { laptopFlag: 1 } }
    ]
  },
  {
    id: "storage",
    title: "How much active storage do you realistically need?",
    options: [
      { label: "500GB to 1TB is enough", effects: { storageNeed: 0 } },
      { label: "1TB to 2TB", effects: { storageNeed: 1 } },
      { label: "2TB+ due to media/game libraries", effects: { storageNeed: 2 } }
    ]
  },
  {
    id: "upgradePlan",
    title: "Do you want easy upgrades over time?",
    options: [
      { label: "Not important", effects: {} },
      { label: "Yes, I want headroom", effects: { upgradeBias: 2, psuNeed: 1 } }
    ]
  },
  {
    id: "internet",
    title: "How will you connect to internet most of the time?",
    options: [
      { label: "Wired Ethernet", effects: {} },
      { label: "Wi-Fi mainly", effects: { wifiNeed: 1 } },
      { label: "Both, depending on location", effects: { wifiNeed: 1 } }
    ]
  },
  {
    id: "timeline",
    title: "How critical is speed for your workflow?",
    options: [
      { label: "As long as it works, I can wait", effects: {} },
      { label: "Moderately important", effects: { cpuNeed: 1, storageNeed: 1 } },
      { label: "Very important, I need fast exports/loads", effects: { cpuNeed: 2, multicore: 1, storageNeed: 2 } }
    ]
  },
  {
    id: "futureProof",
    title: "How long do you want this machine to feel good?",
    options: [
      { label: "2-3 years", effects: {} },
      { label: "4-5 years", effects: { upgradeBias: 1, ramNeed: 1 } },
      { label: "5+ years", effects: { upgradeBias: 2, ramNeed: 2, psuNeed: 1 } }
    ]
  }
];

const TIER_BUDGETS = {
  value: "$500-$750",
  balanced: "$900-$1200",
  premium: "$1200-$1500"
};

const state = {
  index: 0,
  activeQuestions: [],
  answers: {},
  scores: {
    office: 0,
    creative: 0,
    gaming: 0,
    hybridHint: 0,
    cpuNeed: 0,
    gpuNeed: 0,
    ramNeed: 0,
    storageNeed: 0,
    multicore: 0,
    coolingNeed: 0,
    caseNeed: 0,
    wifiNeed: 0,
    psuNeed: 0,
    upgradeBias: 0,
    laptopFlag: 0,
    desktopBias: 0
  }
};

const introEl = document.getElementById("intro");
const quizEl = document.getElementById("quiz");
const resultsEl = document.getElementById("results");
const startBtn = document.getElementById("start-btn");
const backBtn = document.getElementById("back-btn");
const restartBtn = document.getElementById("restart-btn");
const desktopTab = document.getElementById("desktop-tab");
const laptopTab = document.getElementById("laptop-tab");
const qTitle = document.getElementById("question-title");
const qSubtitle = document.getElementById("question-subtitle");
const optionsEl = document.getElementById("options");
const progressLabel = document.getElementById("progress-label");
const progressFill = document.getElementById("progress-fill");
const pathSummary = document.getElementById("path-summary");
const resultsModeNote = document.getElementById("results-mode-note");
const monitorCard = document.getElementById("monitor-card");
const resultCards = document.getElementById("result-cards");
const copyResultsBtn = document.getElementById("copy-results-btn");
const copyStatus = document.getElementById("copy-status");
const shareText = document.getElementById("share-text");
let selectedResultsMode = "desktop";

function initQuiz() {
  state.index = 0;
  state.answers = {};
  Object.keys(state.scores).forEach((k) => {
    state.scores[k] = 0;
  });
  state.activeQuestions = QUESTIONS.filter((q) => !q.branch || q.branch(state));
}

function recomputeStateFromAnswers() {
  Object.keys(state.scores).forEach((k) => {
    state.scores[k] = 0;
  });

  QUESTIONS.forEach((q) => {
    const selectedIndex = state.answers[q.id];
    if (selectedIndex === undefined) return;
    const selected = q.options[selectedIndex];
    applyEffects(selected.effects);
  });

  state.activeQuestions = QUESTIONS.filter((q) => !q.branch || q.branch(state));
  if (state.index >= state.activeQuestions.length) {
    state.index = state.activeQuestions.length - 1;
  }
}

function applyEffects(effects = {}) {
  Object.entries(effects).forEach(([key, value]) => {
    state.scores[key] = (state.scores[key] || 0) + value;
  });
}

function renderQuestion() {
  const question = state.activeQuestions[state.index];
  qTitle.textContent = question.title;
  qSubtitle.textContent = question.subtitle || "";
  optionsEl.innerHTML = "";
  backBtn.disabled = state.index === 0;

  const progress = ((state.index + 1) / state.activeQuestions.length) * 100;
  progressFill.style.width = `${progress}%`;
  progressLabel.textContent = `Question ${state.index + 1} of ${state.activeQuestions.length}`;

  question.options.forEach((opt, i) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = opt.label;
    btn.onclick = () => {
      state.answers[question.id] = i;
      recomputeStateFromAnswers();
      next();
    };
    optionsEl.appendChild(btn);
  });
}

function next() {
  if (state.index < state.activeQuestions.length - 1) {
    state.index += 1;
    renderQuestion();
  } else {
    showResults();
  }
}

function getPathType() {
  const { office, creative, gaming, hybridHint } = state.scores;
  const creativeTotal = creative + gaming;
  const diff = Math.abs(office - creativeTotal);

  if (hybridHint >= 2 || (office >= 4 && creativeTotal >= 4 && diff <= 3)) {
    return "Hybrid";
  }
  return office > creativeTotal ? "Office / Business" : "Gaming / Content Creation";
}

function buildSpecsForTier(tier) {
  const s = state.scores;
  const heavyCreative = s.multicore + s.ramNeed >= 5;
  const strongGpuNeed = s.gpuNeed + s.gaming >= 5;

  const cpu =
    tier === "value"
      ? heavyCreative
        ? "6-core / 12-thread modern CPU"
        : "4-6 core modern CPU"
      : tier === "balanced"
        ? heavyCreative
          ? "8-core / 16-thread modern CPU"
          : "6-8 core modern CPU"
        : heavyCreative
          ? "8-core / 16-thread high-clock modern CPU"
          : "8-core modern CPU";

  const gpu =
    strongGpuNeed || getPathType() !== "Office / Business"
      ? tier === "value"
        ? "Entry-to-mid dedicated GPU with 8GB VRAM target"
        : tier === "balanced"
          ? "Midrange dedicated GPU with 8-12GB VRAM target"
          : "Upper-mid dedicated GPU with 12GB VRAM target"
      : "Integrated graphics or basic entry dedicated GPU";

  const ramBase = s.ramNeed >= 4 ? 32 : s.ramNeed >= 2 ? 24 : 16;
  const ram =
    tier === "value"
      ? `${Math.max(16, ramBase)}GB DDR4/DDR5`
      : tier === "balanced"
        ? `${Math.max(24, ramBase)}GB DDR5 preferred`
        : `${Math.max(32, ramBase)}GB DDR5`;

  const storageBase = s.storageNeed >= 3 ? "2TB NVMe SSD" : "1TB NVMe SSD";
  const storage =
    tier === "premium" && s.storageNeed >= 2
      ? "2TB fast NVMe SSD (with room for second drive)"
      : storageBase;

  const motherboard =
    s.upgradeBias >= 2
      ? "Mainstream chipset board with 2+ M.2 slots and strong upgrade support"
      : "Reliable mainstream motherboard with needed ports";

  const psu =
    tier === "value"
      ? strongGpuNeed
        ? "550W-650W quality PSU"
        : "500W-550W quality PSU"
      : tier === "balanced"
        ? "650W quality PSU (80+ Bronze/Gold)"
        : "750W quality PSU (80+ Gold target)";

  const cooling =
    s.coolingNeed >= 2
      ? "Quiet-focused case + better tower cooler"
      : "Stock/entry tower cooling with mesh airflow case";

  const network = s.wifiNeed ? "Built-in Wi-Fi + Bluetooth recommended" : "Ethernet-first networking is fine";

  return { cpu, gpu, ram, storage, motherboard, psu, cooling, network };
}

function desktopToLaptopValue(text) {
  const map = [
    ["6-core / 12-thread modern CPU", "Modern H-series laptop CPU (6 performance-oriented cores class)"],
    ["4-6 core modern CPU", "Modern U/H-series laptop CPU"],
    ["8-core / 16-thread modern CPU", "Modern H-series laptop CPU (8-core class)"],
    ["8-core / 16-thread high-clock modern CPU", "High-performance H/HS laptop CPU (8-core class)"],
    ["8-core modern CPU", "Modern H-series laptop CPU (8-core class)"],
    ["Entry-to-mid dedicated GPU with 8GB VRAM target", "Laptop RTX 4050/4060-class GPU (target 6-8GB VRAM)"],
    ["Midrange dedicated GPU with 8-12GB VRAM target", "Laptop RTX 4060/4070-class GPU"],
    ["Upper-mid dedicated GPU with 12GB VRAM target", "Laptop RTX 4070-class or higher"],
    ["Integrated graphics or basic entry dedicated GPU", "Integrated graphics or entry discrete laptop GPU"],
    ["1TB NVMe SSD", "1TB NVMe SSD (user-upgradeable preferred)"],
    ["2TB NVMe SSD", "2TB NVMe SSD or 1TB + expansion slot"],
    ["2TB fast NVMe SSD (with room for second drive)", "2TB fast NVMe SSD with secondary storage option"],
    ["Reliable mainstream motherboard with needed ports", "Laptop with enough I/O (USB-C/USB-A/HDMI) and reliable thermals"],
    [
      "Mainstream chipset board with 2+ M.2 slots and strong upgrade support",
      "Laptop with upgrade-friendly RAM/storage and robust port selection"
    ],
    ["500W-550W quality PSU", "Included OEM adapter sized for GPU/CPU class"],
    ["550W-650W quality PSU", "Included OEM adapter with headroom for sustained load"],
    ["650W quality PSU (80+ Bronze/Gold)", "Efficient laptop power brick with sustained performance design"],
    ["750W quality PSU (80+ Gold target)", "High-capacity power brick for performance laptops"],
    ["Stock/entry tower cooling with mesh airflow case", "Laptop with dual-fan cooling and stable sustained clocks"],
    ["Quiet-focused case + better tower cooler", "Laptop with quiet performance profile and quality thermal design"],
    ["Built-in Wi-Fi + Bluetooth recommended", "Wi-Fi 6/6E + Bluetooth support recommended"],
    ["Ethernet-first networking is fine", "Wi-Fi 6 is enough; Ethernet optional via dock/adapter"]
  ];

  let out = text;
  map.forEach(([from, to]) => {
    out = out.replace(from, to);
  });
  return out;
}

function toModeSpecs(specs, mode) {
  if (mode === "desktop") return specs;
  return Object.fromEntries(Object.entries(specs).map(([k, v]) => [k, desktopToLaptopValue(v)]));
}

function getEstimatedCostBand(tier, pathType) {
  const heavy = state.scores.gpuNeed + state.scores.multicore + state.scores.ramNeed >= 8;
  const officeOnly = pathType === "Office / Business";

  if (tier === "value") return officeOnly ? "$550-$700 typical" : heavy ? "$700-$750 typical" : "$600-$725 typical";
  if (tier === "balanced") return officeOnly ? "$900-$1100 typical" : heavy ? "$1050-$1200 typical" : "$950-$1150 typical";
  return officeOnly ? "$1200-$1400 typical" : heavy ? "$1350-$1500 typical" : "$1250-$1450 typical";
}

function getExampleBuilds(tier, mode, pathType) {
  const officeLike = pathType === "Office / Business";
  const gpuHeavy = state.scores.gpuNeed + state.scores.gaming >= 5;

  if (mode === "laptop") {
    if (tier === "value") {
      return [
        {
          label: "Laptop Example A",
          parts: [
            "CPU: AMD Ryzen 5 7640HS",
            "GPU: NVIDIA GeForce RTX 4050 Laptop",
            "RAM: 16GB DDR5",
            "Storage: 1TB NVMe SSD",
            "Display: 1080p 144Hz",
            "Why compatible: CPU/GPU balance fits entry gaming and creator starter workloads"
          ]
        },
        {
          label: "Laptop Example B",
          parts: [
            "CPU: Intel Core i5-13500H",
            officeLike ? "GPU: Intel Iris Xe (integrated)" : "GPU: NVIDIA GeForce RTX 4050 Laptop",
            "RAM: 16GB DDR5",
            "Storage: 1TB NVMe SSD",
            "Display: 1080p 120-144Hz",
            "Why compatible: Good all-around platform with upgrade-ready storage in many models"
          ]
        }
      ];
    }

    if (tier === "balanced") {
      return [
        {
          label: "Laptop Example A",
          parts: [
            "CPU: AMD Ryzen 7 7840HS",
            officeLike ? "GPU: Radeon 780M (integrated)" : "GPU: NVIDIA GeForce RTX 4060 Laptop",
            "RAM: 32GB DDR5",
            "Storage: 1TB NVMe SSD",
            "Display: 1440p 165Hz",
            "Why compatible: Extra CPU and RAM headroom for heavier multitasking and creator workflows"
          ]
        },
        {
          label: "Laptop Example B",
          parts: [
            "CPU: Intel Core i7-13620H",
            officeLike ? "GPU: Intel Iris Xe (integrated)" : "GPU: NVIDIA GeForce RTX 4060 Laptop",
            "RAM: 32GB DDR5",
            "Storage: 1TB NVMe SSD",
            "Display: 1440p 120-165Hz",
            "Why compatible: Strong performance-per-dollar with broad software compatibility"
          ]
        }
      ];
    }

    return [
      {
        label: "Laptop Example A",
        parts: [
          "CPU: AMD Ryzen 9 8945HS",
          officeLike ? "GPU: Radeon 780M (integrated)" : "GPU: NVIDIA GeForce RTX 4070 Laptop",
          "RAM: 32GB DDR5",
          "Storage: 2TB NVMe SSD",
          "Display: 1440p 165Hz or 4K creator panel",
          "Why compatible: Premium-tier sustained performance for advanced mixed workloads"
        ]
      },
      {
        label: "Laptop Example B",
        parts: [
          "CPU: Intel Core Ultra 9 185H",
          officeLike ? "GPU: Intel Arc (integrated)" : "GPU: NVIDIA GeForce RTX 4070 Laptop",
          "RAM: 32GB DDR5/LPDDR5X",
          "Storage: 2TB NVMe SSD",
          "Display: 1440p 165Hz or 4K 120Hz",
          "Why compatible: High-end mobile CPU/GPU class with strong creator and productivity throughput"
        ]
      }
    ];
  }

  if (tier === "value") {
    return [
      {
        label: "Desktop Example A (AMD)",
        parts: [
          "CPU: AMD Ryzen 5 5600",
          "Motherboard: B550 mATX (AM4 socket, PCIe 4.0 support)",
          officeLike ? "GPU: Radeon integrated-level optional / reuse existing GPU" : "GPU: Radeon RX 6600 8GB",
          "RAM: 16GB (2x8GB) DDR4-3200 CL16",
          "Storage: 1TB NVMe PCIe 4.0 SSD",
          "PSU: 550W 80+ Bronze",
          "Cooler: Stock AMD cooler or Thermalright Assassin X 120",
          "Case: mATX airflow case (2 included fans)",
          "Why compatible: AM4 + B550 + DDR4 combo is proven, budget-friendly, and fully compatible"
        ]
      },
      {
        label: "Desktop Example B (Intel)",
        parts: [
          "CPU: Intel Core i5-12400F",
          "Motherboard: B760 DDR4 mATX (LGA1700 socket)",
          officeLike ? "GPU: Intel UHD/iGPU variant i5-12400 (non-F)" : "GPU: Radeon RX 6600 8GB",
          "RAM: 16GB (2x8GB) DDR4-3200",
          "Storage: 1TB NVMe PCIe 4.0 SSD",
          "PSU: 550W 80+ Bronze",
          "Cooler: DeepCool AG400 class tower cooler",
          "Case: Airflow-focused mATX mid tower",
          "Why compatible: LGA1700 + B760 board provides straightforward drop-in compatibility"
        ]
      }
    ];
  }

  if (tier === "balanced") {
    return [
      {
        label: "Desktop Example A (AMD)",
        parts: [
          "CPU: AMD Ryzen 5 7600",
          "Motherboard: B650 ATX/mATX (AM5 socket)",
          officeLike ? "GPU: Radeon 760M integrated or RX 6600 8GB optional" : "GPU: Radeon RX 7700 XT 12GB",
          "RAM: 32GB (2x16GB) DDR5-6000 CL30",
          "Storage: 1TB NVMe PCIe 4.0 SSD",
          "PSU: 650W 80+ Gold",
          "Cooler: Thermalright Peerless Assassin 120 class",
          "Case: Mid tower airflow case with 3-4 fans",
          "Why compatible: AM5 + DDR5 gives strong upgrade runway while staying in budget"
        ]
      },
      {
        label: "Desktop Example B (Intel)",
        parts: [
          "CPU: Intel Core i5-14600K",
          "Motherboard: B760 DDR5 (LGA1700 socket)",
          officeLike ? "GPU: Intel UHD 770 integrated (on non-F variant)" : "GPU: NVIDIA GeForce RTX 4060 Ti 16GB",
          "RAM: 32GB (2x16GB) DDR5-6000",
          "Storage: 1TB NVMe PCIe 4.0 SSD",
          "PSU: 650W 80+ Gold",
          "Cooler: 240mm AIO or high-end air cooler",
          "Case: Airflow mid tower with front mesh",
          "Why compatible: LGA1700 platform supports this CPU and keeps a balanced gaming/creator stack"
        ]
      }
    ];
  }

  return [
    {
      label: "Desktop Example A (AMD)",
      parts: [
        "CPU: AMD Ryzen 7 7700X",
        "Motherboard: B650E ATX (AM5 socket, stronger VRM, PCIe 5.0 option)",
        officeLike ? "GPU: Radeon 760M integrated or RTX 4060 optional for creator acceleration" : "GPU: NVIDIA GeForce RTX 4070 12GB",
        "RAM: 32GB (2x16GB) DDR5-6000 CL30",
        "Storage: 2TB NVMe PCIe 4.0 SSD",
        "PSU: 750W 80+ Gold",
        "Cooler: 240mm AIO or premium dual-tower air cooler",
        "Case: Performance airflow mid tower",
        "Why compatible: Strong AM5 platform pairing for premium performance-per-dollar"
      ]
    },
    {
      label: "Desktop Example B (Intel)",
      parts: [
        "CPU: Intel Core i7-14700F",
        "Motherboard: B760 DDR5 (LGA1700 socket, quality VRM)",
        officeLike ? "GPU: RTX 4060 8GB optional for GPU-accelerated apps" : gpuHeavy ? "GPU: AMD Radeon RX 7800 XT 16GB" : "GPU: NVIDIA GeForce RTX 4070 12GB",
        "RAM: 32GB (2x16GB) DDR5-6400",
        "Storage: 2TB NVMe PCIe 4.0 SSD",
        "PSU: 750W 80+ Gold",
        "Cooler: Dual-tower air cooler (AK620 class)",
        "Case: High-airflow ATX mid tower",
        "Why compatible: CPU, board, and DDR5 kit align on LGA1700 with enough power and cooling headroom"
      ]
    }
  ];
}

function getMonitorRecommendation(pathType) {
  const s = state.scores;
  const visualHeavy = s.gaming + s.creative + s.gpuNeed >= 6;
  const esportsBias = s.gaming >= 4 && s.creative <= 2;

  if (pathType === "Office / Business") {
    return {
      target: "24-27 inch 1080p or 1440p, 60-100Hz IPS",
      why: "For office work, clarity and panel quality matter more than extreme refresh rates, so this keeps cost and comfort balanced."
    };
  }
  if (esportsBias) {
    return {
      target: "24-27 inch 1080p, 144-240Hz",
      why: "Competitive games benefit most from higher refresh rates and lower latency over higher resolution."
    };
  }
  if (visualHeavy) {
    return {
      target: "27 inch 1440p, 144Hz (or 4K 60-120Hz for creator-focused setups)",
      why: "This gives a strong blend of visual detail and smoothness for mixed gaming and creation workloads."
    };
  }
  return {
    target: "24-27 inch 1080p/1440p, 75-144Hz",
    why: "This is a balanced display target for mixed workloads without overspending."
  };
}

function explainParts(specs, pathType) {
  return [
    {
      part: "CPU",
      value: specs.cpu,
      why: "This gives enough processing headroom for your app load and keeps the system responsive when multitasking."
    },
    {
      part: "GPU",
      value: specs.gpu,
      why:
        pathType === "Office / Business"
          ? "Your workflow does not require a large graphics budget, so this avoids overspending while keeping displays smooth."
          : "This graphics target matches your gaming/creation intensity and helps maintain better visual performance."
    },
    {
      part: "RAM",
      value: specs.ram,
      why: "More memory helps when running many tabs, apps, or larger projects so performance does not bog down."
    },
    {
      part: "Storage",
      value: specs.storage,
      why: "An NVMe SSD keeps boot, file loads, project opens, and game/app launches noticeably faster."
    },
    {
      part: "Motherboard",
      value: specs.motherboard,
      why: "This provides stable connectivity today while leaving a practical path for future upgrades."
    },
    {
      part: "Power Supply",
      value: specs.psu,
      why: "A quality PSU improves stability and gives safe power headroom for component spikes and future additions."
    },
    {
      part: "Cooling / Case",
      value: specs.cooling,
      why: "Good airflow and cooling keep temperatures under control, helping both performance consistency and component lifespan."
    },
    {
      part: "Display",
      value: "",
      why: "This panel size and resolution match your workload for clarity, comfort, and smooth motion where it matters."
    },
    {
      part: "Networking",
      value: specs.network,
      why: "This aligns your build with how you actually connect, so daily setup is simpler and more reliable."
    }
  ];
}

function parseBuildParts(partsArray) {
  const parts = [];
  let compatWhy = "";

  partsArray.forEach((line) => {
    if (line.startsWith("Why compatible:")) {
      compatWhy = line.replace("Why compatible: ", "");
      return;
    }
    const splitAt = line.indexOf(": ");
    if (splitAt === -1) return;
    parts.push({ part: line.slice(0, splitAt), value: line.slice(splitAt + 2) });
  });

  return { parts, compatWhy };
}

function getWhyForPart(partName, pathType, specs) {
  const partKey =
    partName === "PSU"
      ? "Power Supply"
      : partName === "Cooler" || partName === "Case"
        ? "Cooling / Case"
        : partName;

  const entry = explainParts(specs, pathType).find((item) => item.part === partKey);
  return entry ? entry.why : "";
}

function buildConsolidatedParts(primaryBuild, pathType, specs, mode) {
  const { parts, compatWhy } = parseBuildParts(primaryBuild.parts);
  const items = [];
  let coolerValue = "";
  let caseValue = "";

  parts.forEach(({ part, value }) => {
    if (part === "Cooler") {
      coolerValue = value;
      return;
    }
    if (part === "Case") {
      caseValue = value;
      return;
    }
    items.push({ part, value, why: getWhyForPart(part, pathType, specs) });
  });

  if (coolerValue || caseValue) {
    const combined = [coolerValue, caseValue].filter(Boolean).join("; ");
    items.push({
      part: "Cooling / Case",
      value: combined,
      why: getWhyForPart("Cooler", pathType, specs)
    });
  }

  if (mode === "desktop" && !items.some((item) => item.part === "Networking")) {
    const network = explainParts(specs, pathType).find((item) => item.part === "Networking");
    if (network) {
      items.push({ part: "Networking", value: network.value, why: network.why });
    }
  }

  return { items, compatWhy };
}

function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function partWithTooltip(partLabel, value, why) {
  const safeValue = escapeHtml(value);
  const safeWhy = escapeHtml(why);
  return `<strong>${partLabel}:</strong> <span class="part-hover" tabindex="0"><span class="part-value">${safeValue}</span><span class="part-tooltip" role="tooltip">${safeWhy}</span></span>`;
}

function renderPartsList(items) {
  const ul = document.createElement("ul");
  ul.className = "parts-list";
  items.forEach((entry) => {
    const li = document.createElement("li");
    li.innerHTML = partWithTooltip(entry.part, entry.value, entry.why);
    ul.appendChild(li);
  });
  return ul;
}

function renderAlternativePartsList(parts, pathType, specs) {
  const ul = document.createElement("ul");
  ul.className = "parts-list";
  parts.forEach(({ part, value }) => {
    const partKey =
      part === "PSU"
        ? "Power Supply"
        : part === "Cooler" || part === "Case"
          ? "Cooling / Case"
          : part;
    const why = getWhyForPart(part, pathType, specs);
    const li = document.createElement("li");
    li.innerHTML = partWithTooltip(part, value, why);
    ul.appendChild(li);
  });
  return ul;
}

function createTierCard(tier, pathType, mode) {
  const specs = toModeSpecs(buildSpecsForTier(tier), mode);
  const estCost = getEstimatedCostBand(tier, pathType);
  const exampleBuilds = getExampleBuilds(tier, mode, pathType);
  const primary = buildConsolidatedParts(exampleBuilds[0], pathType, specs, mode);
  const alternative = exampleBuilds[1] ? parseBuildParts(exampleBuilds[1].parts) : null;

  const card = document.createElement("article");
  card.className = "tier-card";

  const title = tier === "value" ? "Value" : tier === "balanced" ? "Balanced" : "Premium Price-to-Performance";
  card.innerHTML = `
    <h3>${title}</h3>
    <div class="tier-budget">${TIER_BUDGETS[tier]}</div>
    <div class="tier-budget">Estimated spend: ${estCost}</div>
  `;

  const primaryTitle = document.createElement("p");
  primaryTitle.className = "muted";
  primaryTitle.innerHTML = `<strong>${exampleBuilds[0].label}</strong>`;
  card.appendChild(primaryTitle);
  card.appendChild(renderPartsList(primary.items));

  if (primary.compatWhy) {
    const compat = document.createElement("p");
    compat.className = "muted";
    compat.textContent = `Platform note: ${primary.compatWhy}`;
    card.appendChild(compat);
  }

  if (alternative) {
    const altTitle = document.createElement("p");
    altTitle.className = "muted";
    altTitle.innerHTML = `<strong>${exampleBuilds[1].label}</strong>`;
    card.appendChild(altTitle);
    card.appendChild(renderAlternativePartsList(alternative.parts, pathType, specs));

    if (alternative.compatWhy) {
      const altCompat = document.createElement("p");
      altCompat.className = "muted";
      altCompat.textContent = `Platform note: ${alternative.compatWhy}`;
      card.appendChild(altCompat);
    }
  }

  return card;
}

function getTierTitle(tier) {
  return tier === "value" ? "Value" : tier === "balanced" ? "Balanced" : "Premium Price-to-Performance";
}

function generateShareText(pathType) {
  const monitor = getMonitorRecommendation(pathType);
  const modeLabel = selectedResultsMode === "desktop" ? "Desktop Targets" : "Laptop Equivalents";
  const tiers = ["value", "balanced", "premium"];

  const lines = [
    "PC Buying Quiz - Recommendation Summary",
    `Path: ${pathType}`,
    `View: ${modeLabel}`,
    `Monitor target: ${monitor.target}`,
    `Why: ${monitor.why}`,
    ""
  ];

  tiers.forEach((tier) => {
    const specs = toModeSpecs(buildSpecsForTier(tier), selectedResultsMode);
    const examples = getExampleBuilds(tier, selectedResultsMode, pathType);
    const primary = buildConsolidatedParts(examples[0], pathType, specs, selectedResultsMode);
    const alternative = examples[1] ? parseBuildParts(examples[1].parts) : null;

    lines.push(`${getTierTitle(tier)} (${TIER_BUDGETS[tier]}, ${getEstimatedCostBand(tier, pathType)})`);
    lines.push(`${examples[0].label}:`);
    primary.items.forEach((entry) => {
      lines.push(`- ${entry.part}: ${entry.value}`);
      lines.push(`  Why: ${entry.why}`);
    });
    if (primary.compatWhy) lines.push(`  Platform note: ${primary.compatWhy}`);

    if (alternative) {
      lines.push(`${examples[1].label}:`);
      alternative.parts.forEach(({ part, value }) => lines.push(`- ${part}: ${value}`));
      if (alternative.compatWhy) lines.push(`  Platform note: ${alternative.compatWhy}`);
    }
    lines.push("");
  });

  lines.push("Generated by the adaptive PC Buying Quiz.");
  return lines.join("\n");
}

function updateShareText(pathType) {
  shareText.value = generateShareText(pathType);
}

function showResults() {
  quizEl.classList.add("hidden");
  resultsEl.classList.remove("hidden");

  const pathType = getPathType();
  const laptopNotice =
    state.scores.laptopFlag > 0
      ? " You indicated potential laptop use, so you can switch to laptop equivalents below."
      : "";
  pathSummary.textContent = `Recommended path: ${pathType}.${laptopNotice}`;

  const monitor = getMonitorRecommendation(pathType);
  monitorCard.innerHTML = `<strong>Recommended monitor target:</strong> ${monitor.target}. ${monitor.why}`;

  renderResultCards(pathType);
  updateShareText(pathType);
  copyStatus.textContent = "";
}

function renderResultCards(pathType) {
  desktopTab.classList.toggle("active", selectedResultsMode === "desktop");
  laptopTab.classList.toggle("active", selectedResultsMode === "laptop");
  resultsModeNote.textContent =
    selectedResultsMode === "desktop"
      ? "Showing desktop component targets."
      : "Showing laptop-equivalent performance classes for each tier.";

  resultCards.innerHTML = "";
  resultCards.appendChild(createTierCard("value", pathType, selectedResultsMode));
  resultCards.appendChild(createTierCard("balanced", pathType, selectedResultsMode));
  resultCards.appendChild(createTierCard("premium", pathType, selectedResultsMode));
  updateShareText(pathType);
}

function startQuiz() {
  initQuiz();
  introEl.classList.add("hidden");
  resultsEl.classList.add("hidden");
  quizEl.classList.remove("hidden");
  renderQuestion();
}

startBtn.onclick = startQuiz;

backBtn.onclick = () => {
  if (state.index > 0) {
    state.index -= 1;
    renderQuestion();
  }
};

restartBtn.onclick = () => {
  introEl.classList.remove("hidden");
  resultsEl.classList.add("hidden");
  quizEl.classList.add("hidden");
};

desktopTab.onclick = () => {
  selectedResultsMode = "desktop";
  if (!resultsEl.classList.contains("hidden")) {
    renderResultCards(getPathType());
  }
};

laptopTab.onclick = () => {
  selectedResultsMode = "laptop";
  if (!resultsEl.classList.contains("hidden")) {
    renderResultCards(getPathType());
  }
};

copyResultsBtn.onclick = async () => {
  const text = shareText.value.trim();
  if (!text) return;

  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      copyStatus.textContent = "Copied to clipboard.";
      return;
    }
    shareText.focus();
    shareText.select();
    const success = document.execCommand("copy");
    copyStatus.textContent = success ? "Copied to clipboard." : "Select the text and copy manually.";
  } catch (_error) {
    copyStatus.textContent = "Copy blocked by browser. Select text and copy manually.";
  }
};
