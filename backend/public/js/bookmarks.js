
const RESOURCE_MANIFEST = {

  1:  { title: "MoneyHelper Budget Planner",       category: "Finance",   description: "Interactive tool to track income and spending.",                                                           href: "https://www.moneyhelper.org.uk/en/everyday-money/budgeting/budget-planner" },
  2:  { title: "Citizens Advice Budget Worksheet", category: "Finance",   description: "Step-by-step monthly budgeting breakdown.",                                                                href: "https://www.citizensadvice.org.uk/debt-and-money/budgeting1/work-out-your-budget/" },
  3:  { title: "Excel Budget Templates",           category: "Finance",   description: "Download customisable budgeting spreadsheets.",                                                            href: "https://excel.cloud.microsoft/create/en/budget-templates/" },

  12: { title: "Benefits & Exemptions",            category: "Finance",   description: "Citizens Advice for benefits, tax credits, council tax, housing costs and healthcare support.",           href: "finance.html#benefits" },
  13: { title: "Parents' Learning Allowance",      category: "Finance",   description: "Grant for full-time students with children — does not need to be repaid and won't affect benefits.",      href: "finance.html#students-children" },
  14: { title: "Disabled Students' Allowances",    category: "Finance",   description: "DSAs cover additional study costs due to disability, long-term illness or mental health conditions.",     href: "finance.html#dsas" },
  15: { title: "Adult Dependants' Grant",          category: "Finance",   description: "Up to £3,094 if an adult depends on you financially. Does not need to be repaid.",                        href: "finance.html#adult-dependants" },
  16: { title: "Grants & Scholarships",            category: "Finance",   description: "Scholarship Hub, Turn2us, Buttle UK, Unite Foundation and more for care and estranged students.",        href: "finance.html#grants" },

  
  4:  { title: "How Much Deposit Do I Need?",      category: "Housing",   description: "Typically at least 5% of property value. Use calculators to estimate borrowing power.",                  href: "https://www.which.co.uk/money/mortgages-and-property/first-time-buyers" },
  5:  { title: "Lifetime ISA",                     category: "Housing",   description: "Save up to £4,000 yearly and receive a 25% government bonus.",                                            href: "https://www.gov.uk/lifetime-isa" },
  6:  { title: "Costs of Buying a Home",           category: "Housing",   description: "Stamp duty, surveys, legal fees and more.",                                                                href: "https://www.which.co.uk/money/mortgages-and-property/first-time-buyers/buying-a-home/the-cost-of-buying-a-house-asdg78z63xuq" },


  17: { title: "Finding Accommodation",            category: "Housing",   description: "Save the Student and Which? guides for renting, including what to check before signing.",                 href: "housing.html#finding-accommodation" },
  18: { title: "Guarantors",                       category: "Housing",   description: "University guarantors, Housing Hand Ltd and how to approach your landlord about your situation.",         href: "housing.html#guarantors" },
  19: { title: "Your Rights as a Renter",          category: "Housing",   description: "Citizens Advice housing advice and Save the Student's 10 tenancy rights.",                               href: "housing.html#renter-rights" },
  20: { title: "Rent Deposits & Protection",       category: "Housing",   description: "Government deposit protection schemes and how to get your deposit back.",                                  href: "housing.html#deposits" },
  21: { title: "Dealing with Difficult Housemates",category: "Housing",   description: "Save the Student and Our Everyday Life guides on managing housemate conflicts.",                          href: "housing.html#housemates" },
  22: { title: "Make It Your Own",                 category: "Housing",   description: "Impact Arts sessions helping care leavers turn a tenancy into a home.",                                   href: "housing.html#make-it-your-own" },


  7:  { title: "#StayAlive",                       category: "Wellbeing", description: "UK suicide prevention app with crisis tools and safety planning.",                                        href: "wellbeing.html" },
  8:  { title: "Bright Sky",                       category: "Wellbeing", description: "Confidential support app for domestic abuse situations.",                                                  href: "wellbeing.html" },
  9:  { title: "Unmind",                           category: "Wellbeing", description: "Mental health platform for proactive wellbeing.",                                                          href: "wellbeing.html" },
  10: { title: "Zero Suicide Alliance",            category: "Wellbeing", description: "Free online training to recognise warning signs and support someone in crisis.",                           href: "wellbeing.html" },
  11: { title: "Headspace",                        category: "Wellbeing", description: "Guided meditation and mindfulness support.",                                                               href: "https://www.headspace.com/" },

 
  23: { title: "Student Minds",                    category: "Wellbeing", description: "University mental health support programmes and services for students.",                                   href: "wellbeing.html#student-minds" },
  24: { title: "Youth & Student Support",          category: "Wellbeing", description: "Off The Record (free counselling), UMHAN and Students Against Depression.",                               href: "wellbeing.html#youth-support" },
  25: { title: "Community Organisations",          category: "Wellbeing", description: "Amour Destiné, WarriorKind and Mind — community mental health support.",                                  href: "wellbeing.html#community-orgs" },
  26: { title: "Student Health & Online Support",  category: "Wellbeing", description: "Student Health App and Togetherall — anonymous 24/7 online support community.",                          href: "wellbeing.html#health-online" },

  /* ── New deep-content accordion guides ── */
  27: { title: "Care-Experienced Students",        category: "Finance",   description: "Propel, Become, UCAS care-experienced guide and Stand Alone HE contacts for care leavers.",               href: "finance.html#care-experienced" },
  28: { title: "If Home Isn't Safe or Available",  category: "Housing",   description: "Shelter emergency options, Unite Foundation and year-round university accommodation for care leavers.",    href: "housing.html#emergency-housing" },
  29: { title: "Loneliness & Feeling Disconnected",category: "Wellbeing", description: "Student Space, UCAS and Mind guides on loneliness, estrangement and building connection at university.",   href: "wellbeing.html#loneliness-connection" }
};

(async function initBookmarks() {
  const token = localStorage.getItem("token");
  const cards = document.querySelectorAll("[data-resource-id]");
  if (!cards.length) return;

 
  let savedIds = new Set();
  if (token) {
    try {
      const res = await apiRequest("/bookmarks");
      savedIds = new Set(res.data);
    } catch (_) {

    }
  }

  cards.forEach(card => {
    const resourceId = parseInt(card.dataset.resourceId, 10);
    const saved = savedIds.has(resourceId);

    const btn = document.createElement("button");
    btn.className = "bookmark-btn" + (saved ? " saved" : "");
    btn.type = "button";
    btn.setAttribute("aria-label", saved ? "Remove bookmark" : "Save resource");
    btn.innerHTML = bookmarkIcon();

    if (!token) {
      btn.title = "Log in to save resources";
      btn.addEventListener("click", () => {
        window.location.href = "login.html";
      });
    } else {
      btn.addEventListener("click", () => toggleBookmark(btn, resourceId));
    }

    card.appendChild(btn);
  });
})();

async function toggleBookmark(btn, resourceId) {
  const isSaved = btn.classList.contains("saved");
  btn.disabled = true;
  try {
    if (isSaved) {
      await apiRequest(`/bookmarks/${resourceId}`, "DELETE");
      btn.classList.remove("saved");
      btn.setAttribute("aria-label", "Save resource");
    } else {
      await apiRequest("/bookmarks", "POST", { resource_id: resourceId });
      btn.classList.add("saved");
      btn.setAttribute("aria-label", "Remove bookmark");
    }
  } catch (_) {

  } finally {
    btn.disabled = false;
  }
}

function bookmarkIcon() {
  return `<svg width="15" height="15" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path class="bm-outline" d="M3.5 2.5h9a.5.5 0 01.5.5v11l-5-3-5 3V3a.5.5 0 01.5-.5z"
      stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
    <path class="bm-fill" d="M3.5 2.5h9a.5.5 0 01.5.5v11l-5-3-5 3V3a.5.5 0 01.5-.5z"
      fill="currentColor" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/>
  </svg>`;
}


window.RESOURCE_MANIFEST = RESOURCE_MANIFEST;
