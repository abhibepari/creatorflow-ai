
import './style.css';

document.querySelector('#app').innerHTML = `
  <div class="app-shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-icon">C</div>
        <span>CreatorFlow<span class="brand-ai"> AI</span></span>
      </div>

      <div class="nav-label">WORKSPACE</div>
      <button class="nav-item active">◈ &nbsp; Dashboard</button>
      <button class="nav-item">✦ &nbsp; Content Studio</button>
      <button class="nav-item">◷ &nbsp; History</button>

      <div class="sidebar-bottom">
        <div class="upgrade-card">
          <span class="sparkle">✦</span>
          <strong>Your creative space</strong>
          <p>Turn one idea into content for every platform.</p>
        </div>
        <div class="profile">
          <div class="avatar">A</div>
          <div><strong>Creator</strong><small>Free workspace</small></div>
        </div>
      </div>
    </aside>

    <main class="main-content">
      <header class="topbar">
        <span>Workspace / Dashboard</span>
        <span class="status"><i></i> AI Studio</span>
      </header>

      <section class="welcome">
        <div>
          <p class="eyebrow">YOUR CREATIVE WORKSPACE</p>
          <h1>Create more.<br><span>Work smarter.</span></h1>
          <p class="subtitle">Turn your ideas into platform-ready content with AI assistance.</p>
        </div>
        <div class="welcome-art">✦</div>
      </section>

      <section class="studio">
        <div class="section-heading">
          <div>
            <p class="eyebrow">CONTENT GENERATOR</p>
            <h2>Start with an idea</h2>
            <p>Tell us about your content. We'll help you shape it.</p>
          </div>
          <span class="ai-badge">✦ AI POWERED</span>
        </div>

        <form id="creator-form">
          <label for="content">Your video idea or transcript</label>
          <textarea id="content" placeholder="Example: Today I'm sharing 5 useful AI tools that every college student should know..." required></textarea>

          <div class="form-grid">
            <div>
              <label for="platform">Choose platform</label>
              <select id="platform">
                <option value="YouTube">YouTube</option>
                <option value="Instagram">Instagram</option>
                <option value="YouTube Shorts">YouTube Shorts</option>
                <option value="Multiple platforms">Multiple platforms</option>
              </select>
            </div>

            <div>
              <label for="tone">Choose your tone</label>
              <select id="tone">
                <option value="Engaging">Engaging</option>
                <option value="Professional">Professional</option>
                <option value="Funny">Funny</option>
                <option value="Educational">Educational</option>
                <option value="Storytelling">Storytelling</option>
              </select>
            </div>
          </div>

          <button class="generate-btn" type="submit">
            ✦ Generate content <span>→</span>
          </button>
          <p id="form-status" class="form-status" aria-live="polite"></p>
        </form>
      </section>

      <section class="features">
        <div class="section-heading">
          <div>
            <p class="eyebrow">YOUR CREATIVE TOOLKIT</p>
            <h2>Made for creators</h2>
          </div>
        </div>

        <div class="feature-grid">
          <article class="feature-card">
            <div class="feature-icon purple">✦</div>
            <h3>Smart Hooks</h3>
            <p>Catch your audience's attention from the first second.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon orange">▤</div>
            <h3>Captions & Titles</h3>
            <p>Create engaging captions and titles for your content.</p>
          </article>

          <article class="feature-card">
            <div class="feature-icon green">#</div>
            <h3>Hashtag Ideas</h3>
            <p>Discover relevant hashtag suggestions for your posts.</p>
          </article>
        </div>
      </section>

      <footer>CreatorFlow AI · Built to empower human creativity.</footer>
    </main>
  </div>
`;

function renderResultCards(output, result) {
  output.innerHTML = '';

  output.style.cssText = `
    margin-top: 24px;
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
    color: white;
  `;

  const headings = [
    { key: 'hooks', title: 'Video Hooks', icon: '✦' },
    { key: 'titles', title: 'Title Suggestions', icon: '▤' },
    { key: 'caption', title: 'Caption', icon: '✎' },
    { key: 'hashtags', title: 'Hashtags', icon: '#' },
    { key: 'script', title: 'Script Outline', icon: '▣' }
  ];

  const normalized = String(result).replace(/\r\n/g, '\n');

  // Detect numbered and unnumbered Markdown headings.
  const headingRegex = /^\s*#{1,3}\s*(?:\d+\s*[.)-]?\s*)?(.+?)\s*#*\s*$/gm;
  const matches = [...normalized.matchAll(headingRegex)];

  const sections = headings.map(item => {
    const matchIndex = matches.findIndex(match => {
      const heading = match[1]
        .replace(/[*_`]/g, '')
        .trim()
        .toLowerCase();

      if (item.key === 'hooks') return heading.includes('hook');
      if (item.key === 'titles') return heading.includes('title');
      if (item.key === 'caption') return heading.includes('caption');
      if (item.key === 'hashtags') return heading.includes('hashtag');
      if (item.key === 'script') {
        return heading.includes('script') || heading.includes('outline');
      }

      return false;
    });

    if (matchIndex === -1) {
      return { ...item, content: '' };
    }

    const match = matches[matchIndex];
    const start = match.index + match[0].length;
    const nextMatch = matches[matchIndex + 1];
    const end = nextMatch ? nextMatch.index : normalized.length;

    return {
      ...item,
      content: normalized.slice(start, end).trim()
    };
  });

  sections.forEach(section => {
    const card = document.createElement('article');

    card.style.cssText = `
      background: #211b35;
      border: 1px solid #39304d;
      border-radius: 16px;
      padding: 22px;
      min-width: 0;
    `;

    const heading = document.createElement('h3');
    heading.textContent = `${section.icon} ${section.title}`;
    heading.style.cssText = 'margin:0 0 16px;font-size:18px;';

    const content = document.createElement('div');

    // Fallback for hashtags if the heading parser misses that section.
    let sectionContent = section.content;

    if (section.key === 'hashtags' && !sectionContent) {
      const hashtagMatches = normalized.match(/#[\p{L}\p{N}_]+/gu) || [];
      sectionContent = [...new Set(hashtagMatches)].join(' ');
    }

    content.textContent = sectionContent || 'No content returned for this section. Try generating again.';
    content.style.cssText = `
      white-space: pre-wrap;
      line-height: 1.8;
      overflow-wrap: anywhere;
      color: #e8e2f4;
    `;

    const copy = document.createElement('button');
    copy.textContent = 'Copy';
    copy.style.cssText = `
      margin-top:18px;
      padding:9px 18px;
      border:0;
      border-radius:8px;
      cursor:pointer;
    `;

    copy.onclick = async () => {
      if (!sectionContent) return;

      try {
        await navigator.clipboard.writeText(sectionContent);
        copy.textContent = 'Copied!';
      } catch {
        copy.textContent = 'Copy failed';
      }
    };

    card.append(heading, content, copy);
    output.appendChild(card);
  });

  const copyAll = document.createElement('button');
  copyAll.textContent = 'Copy All Content';
  copyAll.style.cssText = `
    grid-column: 1 / -1;
    padding:13px;
    border:0;
    border-radius:10px;
    cursor:pointer;
    font-weight:bold;
  `;

  copyAll.onclick = async () => {
    const allContent = sections
      .map(section => `${section.title}\n\n${section.content}`)
      .join('\n\n----------------\n\n');

    try {
      await navigator.clipboard.writeText(allContent);
      copyAll.textContent = 'Copied All!';
    } catch {
      copyAll.textContent = 'Copy failed';
    }
  };

  output.appendChild(copyAll);
}

document.querySelector('#creator-form').addEventListener('submit', async (event) => {
  event.preventDefault();

  const content = document.querySelector('#content').value.trim();
  const platform = document.querySelector('#platform').value;
  const tone = document.querySelector('#tone').value;
  const status = document.querySelector('#form-status');

  if (!content) {
    status.textContent = 'Please enter your content idea first.';
    return;
  }

  const button = document.querySelector('.generate-btn');
  button.disabled = true;
  button.textContent = 'Generating...';
  status.textContent = 'Creating your content...';

  let output = document.querySelector('#ai-result');

  if (!output) {
    output = document.createElement('section');
    output.id = 'ai-result';
    document.querySelector('#creator-form').after(output);
  }

  try {
    const response = await fetch('http://localhost:3001/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ content, platform, tone })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'AI generation failed');
    }

    renderResultCards(output, data.result || 'No content generated.');
    status.textContent = 'Your AI-generated content is ready!';

  } catch (error) {
    status.textContent = 'Error: ' + error.message;
  } finally {
    button.disabled = false;
    button.innerHTML = '✦ Generate content <span>→</span>';
  }
});
