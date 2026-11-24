<script setup lang="ts">
import { ref } from 'vue'

interface ProductRepo {
  name: string
  url: string
}

interface ProductSpec {
  title: string
  description: string
}

interface Product {
  id: string
  name: string
  url: string
  actionLabel?: string
  repos: ProductRepo[]
  summary: string
  specs: ProductSpec[]
}

const products = ref<Product[]>([
  {
    id: 'caliph-auction',
    name: 'カリフオークション',
    url: 'https://www.caliphauction.com/',
    repos: [
      { name: 'Frontend', url: 'https://github.com/xm-i/CaliphAuctionFront' },
      { name: 'Backend', url: 'https://github.com/xm-i/CaliphAuctionBackend' }
    ],
    summary:
      '2010年代初頭に社会問題になった「ペニーオークション」の仕組みをそのまま再現したデモサイト。',
    specs: [
      {
        title: '入札とサクラBOT',
        description:
          '入札するたびに手数料分のコインだけが消費され、裏側のBOTが自動で価格を吊り上げます。'
      },
      {
        title: '黒字化判定と撒き餌',
        description:
          '運営の手数料収入が一定ラインに達するまで絶対に落札できません。ときどきBOTに格安で落とさせることで、当たる可能性があるように見せます。'
      },
      {
        title: '仮想コインでの再現',
        description:
          'デモ用の仮想コインで動くため、実際にお金を使わずに一連の挙動をひととおり触って確認できます。'
      }
    ]
  },
  {
    id: 'mediadeck',
    name: 'MediaDeck',
    url: 'https://mediadeck.xm-i.net/',
    repos: [{ name: 'Repository', url: 'https://github.com/xm-i/MediaDeck' }],
    summary:
      '数万件規模の画像や動画を、待たされずに検索・整理できるWindows用メディア管理アプリ。',
    specs: [
      {
        title: '大量ファイルでも固まらない表示と検索',
        description:
          '読み込み中も画面が止まらず、数万件の画像・動画からタグ・解像度・サイズ・評価・日時などをトークンで組み合わせて絞り込めます。'
      },
      {
        title: 'タグ整理・仮想アルバム・マップ表示',
        description:
          'カテゴリや読み仮名・別名を付けられるタグに加え、実フォルダとは別の仮想アルバムや位置情報からの地図表示、複数タブが使えます。'
      },
      {
        title: '重複ファイルの検出と変更同期',
        description:
          'ファイル名が違っても中身が同じ重複を検出できます。エクスプローラー側での移動・リネーム・削除も自動で検知し、ライブラリへ反映します。'
      }
    ]
  },
  {
    id: 'magic-flight',
    name: 'MAGIC FLIGHT',
    url: '/magic-flight/',
    actionLabel: 'ゲームを開く',
    repos: [],
    summary:
      '1990年代後半にNECのパソコンなどにプリインストールされていたタイピングソフトをブラウザで再現したもの。',
    specs: [
      {
        title: '当時の画面と演出',
        description:
          '月夜を飛ぶ魔女のタイトル画面、島マップ、NFER/XFERキーの付いたキーボードと両手ガイド、落下時の水しぶきまで当時の雰囲気に合わせて作り直しています。'
      },
      {
        title: '魔女の飛行と7つの島',
        description:
          '正しく打つと魔女が飛んで進み、ミスや時間経過で下がっていきます。あいうえおの基本練習から90年代ネタ・早口言葉まで7つの島を順番に進みます。'
      },
      {
        title: 'ブラウザ上での再現',
        description:
          '当時のPCやソフトが手元になくても、ブラウザを開くだけでそのまま遊べます。難易度はVeryEasyからVeryHardまでの5段階です。'
      }
    ]
  }
])

function formatIndex(index: number): string {
  return String(index + 1).padStart(2, '0')
}

function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url)
}

function formatHost(url: string): string {
  if (url.startsWith('/')) {
    return `xm-i.net${url.replace(/\/$/, '')}`
  }
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}
</script>

<template>
  <div class="page-shell">
    <header class="site-header">
      <div class="site-topbar">
        <span class="brand-mark">
          <span class="brand-dot" aria-hidden="true"></span>
          xm-i.net
        </span>
        <a
          href="https://github.com/xm-i"
          target="_blank"
          rel="noopener noreferrer"
          class="header-link"
        >
          <svg
            class="btn-icon"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            aria-hidden="true"
          >
            <path
              d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"
            />
          </svg>
          github.com/xm-i
        </a>
      </div>

      <div class="header-intro">
        <h1 class="page-title">作ったもの</h1>
        <p class="page-subtitle">
          個人で公開しているWebサイトとWindowsアプリ。
        </p>
      </div>
    </header>

    <main class="products-list">
      <article
        v-for="(product, index) in products"
        :key="product.id"
        class="product-panel"
      >
        <div class="product-overview">
          <div class="product-overview-top">
            <div class="product-meta">
              <span class="meta-index">{{ formatIndex(index) }}</span>
              <span class="meta-domain">{{ formatHost(product.url) }}</span>
            </div>

            <h2 class="product-title">{{ product.name }}</h2>
            <p class="product-summary">{{ product.summary }}</p>
          </div>

          <nav class="product-actions" :aria-label="`${product.name}の関連リンク`">
            <a
              :href="product.url"
              :target="isExternalUrl(product.url) ? '_blank' : undefined"
              :rel="isExternalUrl(product.url) ? 'noopener noreferrer' : undefined"
              class="btn-primary"
            >
              <svg
                v-if="isExternalUrl(product.url)"
                class="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <svg
                v-else
                class="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
              {{ product.actionLabel ?? 'サイトを開く' }}
            </a>

            <a
              v-for="repo in product.repos"
              :key="repo.name"
              :href="repo.url"
              target="_blank"
              rel="noopener noreferrer"
              class="btn-secondary"
            >
              <svg
                class="btn-icon"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
                aria-hidden="true"
              >
                <polyline points="16 18 22 12 16 6" />
                <polyline points="8 6 2 12 8 18" />
              </svg>
              {{ repo.name }}
            </a>
          </nav>
        </div>

        <div class="product-specs">
          <ol class="specs-sequence">
            <li
              v-for="(spec, sIdx) in product.specs"
              :key="spec.title"
              class="spec-row"
            >
              <span class="spec-index" aria-hidden="true">{{ formatIndex(sIdx) }}</span>
              <div class="spec-body">
                <h3 class="spec-title">{{ spec.title }}</h3>
                <p class="spec-desc">{{ spec.description }}</p>
              </div>
            </li>
          </ol>
        </div>
      </article>
    </main>

    <footer class="site-footer">
      <p class="footer-note">&copy; 2026 xm-i</p>
    </footer>
  </div>
</template>
