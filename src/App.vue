<script setup lang="ts">
import { ref } from 'vue'

const products = ref([
  {
    id: "caliph-auction",
    name: "カリフオークション",
    url: "https://www.caliphauction.com/",
    repos: [
      { name: "Frontend", url: "https://github.com/xm-i/CaliphAuctionFront" },
      { name: "Backend", url: "https://github.com/xm-i/CaliphAuctionBackend" }
    ],
    summary: "2010年代初頭に社会問題となった「ペニーオークション」のビジネスモデルとユーザー体験を再現した体験型・闇のインターネットデモサイト。",
    specs: [
      {
        title: "通常入札フェーズ",
        description: "入札するたびに手数料（コイン）だけが消費され、裏のサクラBOTが自動で即座に価格を吊り上げます。買えそうで買えないもどかしさを演出するフェーズ。"
      },
      {
        title: "黒字化判定と「撒き餌」ロジック",
        description: "運営側の利益（手数料）が一定額に達するまで絶対に落札できませんが、時々BOTが超格安で落札して『本当に当たるんだ！』と信じ込ませる悪魔のロジック。"
      },
      {
        title: "完全無料の『絶望』体験",
        description: "デモ用の仮想コインを使うため、自分のお金を一円も失うことなく、かつて社会問題になったペニーオークション詐欺の仕組みを安全に体験できます。"
      }
    ]
  },
  {
    id: "mediadeck",
    name: "MediaDeck",
    url: "https://mediadeck.xm-i.net/",
    repos: [
      { name: "Repository", url: "https://github.com/xm-i/MediaDeck" }
    ],
    summary: "Windows向けの高機能メディア管理アプリケーション。画像、動画、PDF、アーカイブファイルなどを一元管理し、高度な検索、タグ付け、メタデータ管理機能を提供します。",
    specs: [
      {
        title: "あらゆるメディアの一元管理",
        description: "画像、動画、PDF、ZIPなどの多様なファイルをまとめて管理。あちこちのフォルダを探し回る手間がなくなります。"
      },
      {
        title: "直感的なタグと高度な検索",
        description: "お気に入りのタグを付けたり詳細な情報を記録しておくことで、数千・数万のファイルの中から見たいデータを一瞬で見つけ出せます。"
      },
      {
        title: "サクサク快適な動作",
        description: "大量のファイルがあっても動作が重くならず、スムーズで軽快にブラウジング。ストレスフリーな使い心地を提供します。"
      }
    ]
  }
])
</script>

<template>
  <div class="container">
    <header>
      <h1 class="title">Product Showcase</h1>
      <p class="subtitle">開発したものたち。</p>
    </header>

    <main class="products-grid">
      <article 
        v-for="(product, index) in products" 
        :key="product.id" 
        class="product-card"
        :style="{ animationDelay: `${index * 0.2}s` }"
      >
        <div class="product-header">
          <h2 class="product-title">
            <a :href="product.url" target="_blank" rel="noopener noreferrer">
              {{ product.name }}
            </a>
          </h2>
          <div class="links-container">
            <a :href="product.url" target="_blank" rel="noopener noreferrer" class="btn-link primary">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
              Visit Site
            </a>
            <a 
              v-for="repo in product.repos" 
              :key="repo.name" 
              :href="repo.url" 
              target="_blank" 
              rel="noopener noreferrer" 
              class="btn-link"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
              {{ repo.name }}
            </a>
          </div>
        </div>

        <p class="product-summary">{{ product.summary }}</p>

        <div class="specs-list">
          <div v-for="spec in product.specs" :key="spec.title" class="spec-item">
            <h3 class="spec-title">{{ spec.title }}</h3>
            <p class="spec-desc">{{ spec.description }}</p>
          </div>
        </div>
      </article>
    </main>
  </div>
</template>
