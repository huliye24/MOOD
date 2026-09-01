import Link from "next/link";

export default function TokenPage() {
  return <main className="mood-site">
    <nav className="mood-nav" aria-label="主导航">
      <Link className="mood-brand" href="/"><img src="/favicon.svg" alt="" /><span>MOOD</span></Link>
      <div className="mood-nav-links"><Link href="/world">World</Link><Link href="/manifesto">Manifesto</Link><Link href="/canon">Canon</Link><Link href="/library">Library</Link><Link href="/protocol">Protocol</Link></div>
      <Link className="mood-nav-action" href="/portal">进入门户</Link>
    </nav>

    <header className="mood-hero">
      <div className="mood-hero-copy"><span className="mood-kicker">A DIGITAL HOME FOR FREE SPIRITS</span><h1><span>BE YOURSELF.</span><small>在这里，<br /><em>成为你自己。</em></small></h1><p>MOOD 是一个属于自由意志、独立选择与美的数字家园。没有被规定的人生，只有你愿意生活的方式。</p><div className="mood-actions"><a className="mood-primary" href="#world">进入这个世界</a><Link className="mood-secondary" href="/manifesto">阅读我们的信念</Link></div></div>
      <div className="mood-hero-mark" aria-hidden="true"><span className="mood-orbit mood-orbit-one" /><span className="mood-orbit mood-orbit-two" /><img src="/favicon.svg" alt="" /><small>ENTER THE WORLD</small></div>
    </header>

    <section id="world" className="mood-world-gate"><div className="mood-world-intro"><span className="mood-kicker">ENTER THE WORLD</span><h2>从世界出发，<br />理解它的规则。</h2><p>MOOD 是面向人类与机器主体的开放协调协议与数字世界。这里先定义意义，再让协议与软件从意义中生长。</p></div><nav className="mood-world-map" aria-label="MOOD 阅读路径"><Link href="/world"><span>01</span><strong>World</strong><small>理解 MOOD 假定的世界</small></Link><Link href="/manifesto"><span>02</span><strong>Manifesto</strong><small>阅读我们的信念与方向</small></Link><Link href="/canon"><span>03</span><strong>Canon</strong><small>进入最高概念权威</small></Link><Link href="/library"><span>04</span><strong>Library</strong><small>阅读这个世界的公开记忆</small></Link></nav></section>

    <figure className="mood-world"><img src="/mood-world-hero.png" alt="人们在开放的未来音乐空间里围绕紫蓝色波形相遇、聆听与创作" /><figcaption>MOOD WORLD · A PLACE WITHOUT A PRESCRIBED LIFE</figcaption></figure>

    <section id="story" className="mood-story"><div><span className="mood-kicker">CULTURE · STORIES</span><h2>协议需要规则，<br />世界也需要文化。</h2></div><div className="mood-story-copy"><p>下面的咖啡馆、道路与闲暇之地，是 MOOD 的文化想象，不是已经运行的协议事实。它们帮助我们讨论：当人和机器都能行动时，我们希望保留怎样的生活。</p><p>这些故事服从 Canon，也允许世界拥有温度、象征、记忆与美。</p><Link className="mood-inline-link" href="/manifesto">阅读 Manifesto →</Link></div></section>

    <section id="home" className="mood-chapters">
      <article id="cafe" className="mood-chapter"><div className="mood-chapter-copy"><span>01 · THE CAFÉ</span><h2>思想在咖啡馆相遇。</h2><p>没有标准答案，也没有被安排好的立场。有人交谈，有人阅读，有人独处。我们因不同而靠近，也保留不被说服的权利。</p></div><figure><img src="/mood-cafe.png" alt="开放山景中的咖啡馆与图书空间，人们阅读、交谈、写作和演奏音乐" /></figure></article>
      <article id="road" className="mood-chapter mood-chapter-reverse"><div className="mood-chapter-copy"><span>02 · ON THE ROAD</span><h2>路不一定通向目的地。</h2><p>自由不是拥有更多选项，而是能够决定什么值得追寻。慢下来，转身，停留，重新出发——人生属于选择它的人。</p></div><figure><img src="/mood-road.png" alt="人们沿着海岸道路自由旅行、绘画、游泳、阅读和演奏" /></figure></article>
      <article id="leisure" className="mood-chapter mood-chapter-night"><div className="mood-chapter-copy"><span>03 · IN PRAISE OF IDLENESS</span><h2>闲暇让灵魂重新生长。</h2><p>创造并不只发生在工作里。看星星、种花、跳舞、做一顿饭，或和喜欢的人消磨一个夜晚——生活的美不需要效率来批准。</p></div><figure><img src="/mood-leisure.png" alt="夜色中的水上花园，人们休息、创作、观星、共餐和跳舞" /></figure></article>
    </section>

    <section className="mood-principles" aria-label="MOOD 的信念"><article><span>01</span><h3>独立意志</h3><p>没有人替你定义完整的人生。选择权始终属于你。</p></article><article><span>02</span><h3>自由连接</h3><p>关系源于自愿，而不是许可。世界因真实的连接而存在。</p></article><article><span>03</span><h3>生活之美</h3><p>美不是附加项。它是我们愿意生活、创造和留下的理由。</p></article></section>

    <section id="use" className="mood-use"><div className="mood-use-intro"><span className="mood-kicker">PHASE ZERO · WORLDBUILDING</span><h2>参与从理解开始。</h2><p>当前阶段的首要工作是减少世界的歧义。Portal、身份、节点与治理仍是草案；网站不会把未来描述成已经发生。</p><div className="mood-mini-facts"><span>WORLD</span><span>CANON</span><span>CULTURE</span></div></div><div className="mood-phase-card"><span>当前状态</span><strong>Worldbuilding</strong><p>先阅读世界与 Canon，再进入正在形成的协议层。</p><div><Link href="/canon">阅读 Canon</Link><Link href="/protocol">探索 Protocol</Link></div></div></section>

    <footer className="mood-footer"><Link className="mood-brand" href="/"><img src="/favicon.svg" alt="" /><span>MOOD</span></Link><p>World before system. Meaning before mechanism.</p><div><Link href="/manifesto">Manifesto</Link><Link href="/canon">Canon</Link><Link href="/library">Library</Link><Link href="/protocol">Protocol</Link></div></footer>
  </main>;
}
