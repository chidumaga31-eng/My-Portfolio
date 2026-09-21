const $ = id => document.getElementById(id);

function safeText(id, value) {
  const el = $(id);
  if (el) el.textContent = value ?? "";
}

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({
    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"
  }[c]));
}

function safeURL(value = "") {
  return String(value).replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

async function loadProfile() {
  const { data, error } = await supabaseClient
    .from("profiles")
    .select("*")
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("Profile loading error:", error);
    return;
  }

  if (!data) {
    console.warn("No profile row was found.");
    return;
  }

  const name = data.full_name || data.name || "Your Name";
  const profession = data.professional_title || data.profession || "Professional Portfolio";
  const bio = data.bio || "Your professional biography will appear here.";

  document.title = `${name} | ${profession}`;
  safeText("brand", name);
  safeText("profession", profession.toUpperCase());
  safeText("bio", bio);
  safeText("aboutBio", bio);
  safeText("quoteName", name);
  safeText("footerName", name);

  const hero = $("heroName");
  if (hero) {
    hero.innerHTML = `${escapeHTML(name)}<br><em>Your impact.</em>`;
  }

  const photo = data.profile_photo || data.photo_url || data.avatar_url;
  if (photo) {
    const photoEl = $("profilePhoto");
    photoEl.textContent = "";
    photoEl.style.backgroundImage = `url("${safeURL(photo)}")`;
    photoEl.style.backgroundSize = "cover";
    photoEl.style.backgroundPosition = "center";
  }

  const email = data.contact_email || data.email;
  if (email) {
    const emailEl = $("email");
    emailEl.href = `mailto:${email}`;
  }

  if (data.years_experience) {
    safeText("experienceText", `${data.years_experience} years of professional experience.`);
  }
}

async function loadAchievements() {
  const { data, error } = await supabaseClient
    .from("achievements")
    .select("*")
    .order("year", { ascending: false });

  if (error) {
    console.error("Achievements loading error:", error);
    return;
  }

  const el = $("achievementsGrid");
  if (!el) return;

  if (!data?.length) {
    el.innerHTML = "<p>No achievements have been added yet.</p>";
    return;
  }

  el.innerHTML = data.map(a => `
    <article class="card">
      <span>${escapeHTML(a.year || "")}</span>
      <h3>${escapeHTML(a.title || "Achievement")}</h3>
      <p>${escapeHTML(a.description || "")}</p>
    </article>
  `).join("");
}

async function loadPosts() {
  const { data, error } = await supabaseClient
    .from("posts")
    .select("*")
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Posts loading error:", error);
    return;
  }

  const el = $("posts");
  if (!el) return;

  if (!data?.length) {
    el.innerHTML = "<p>No stories have been published yet.</p>";
    return;
  }

  el.innerHTML = data.map(p => `
    <article class="card post">
      ${p.image_url ? `<img src="${safeURL(p.image_url)}" alt="">` : ""}
      <small>${escapeHTML(p.category || "STORY")}</small>
      <h3>${escapeHTML(p.title || "")}</h3>
      <p>${escapeHTML(p.content || "")}</p>
    </article>
  `).join("");
}

async function loadGallery() {
  const { data, error } = await supabaseClient
    .from("gallery")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Gallery loading error:", error);
    return;
  }

  const el = $("galleryGrid");
  if (!el) return;

  if (!data?.length) {
    el.innerHTML = "<p>No gallery photos have been added yet.</p>";
    return;
  }

  el.innerHTML = data.map(g => `
    <figure>
      <img src="${safeURL(g.image_url || "")}" alt="${safeURL(g.caption || "Portfolio photo")}">
      ${g.caption ? `<figcaption>${escapeHTML(g.caption)}</figcaption>` : ""}
    </figure>
  `).join("");
}

async function initPortfolio() {
  await loadProfile();
  await loadAchievements();
  await loadPosts();
  await loadGallery();
}

$("menu")?.addEventListener("click", () => $("menu").nextElementSibling?.classList.toggle("open"));
initPortfolio();
