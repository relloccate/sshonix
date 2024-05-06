<template>
    <div class="release">
        <div class="release-top-wrap">
            <div class="name">{{ release.name }}</div>
            <div class="date">{{ new Date(release.published_at).toLocaleString() }}</div>
            <div class="version">{{ release.tag_name }}</div>
        </div>
        <div class="body" v-html="parseMarkdown(release.body)"></div>
        <div class="assets">
            <div class="asset" v-for="asset in getFilteredAssets" :key="asset.id" v-tooltip="'Dowload via Browser'">
                <a :href="asset.browser_download_url">{{ asset.browser_download_url }}</a>
                <div class="size">
                    {{ bytesToSize(asset.size, true) }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import StoreUpdates from 'front/store/StoreUpdates';
import bytesToSize from 'front/misc/BytesToSize';

export default {
    props: {
        release: {
            name: String,
            published_at: String,
            tag_name: String,
            body: String,
            assets: Array
        }
    },
    setup() {
        const { getUpdatableReleases } = StoreUpdates;

        return {
            getUpdatableReleases,
            bytesToSize
        };
    },
    computed: {
        getFilteredAssets() {
            return this.release.assets.filter(asset => {
                if (asset.browser_download_url.endsWith('.yml')) return false;
                if (asset.browser_download_url.endsWith('.blockmap')) return false;

                return true;
            });
        }
    },
    methods: {
        // https://www.bigomega.dev/markdown-parser
        parseMarkdown(markdownText) {
            const htmlText = markdownText
                .replace(/^### (.*$)/gim, '<h3>$1</h3>')
                .replace(/^## (.*$)/gim, '<h2>$1</h2>')
                .replace(/^# (.*$)/gim, '<h1>$1</h1>')
                .replace(/^\> (.*$)/gim, '<blockquote>$1</blockquote>')
                .replace(/\*\*(.*)\*\*/gim, '<b>$1</b>')
                .replace(/\*(.*)\*/gim, '<i>$1</i>')
                .replace(/!\[(.*?)\]\((.*?)\)/gim, "<img alt='$1' src='$2' />")
                .replace(/\[(.*?)\]\((.*?)\)/gim, `<a href='$2' target="_blank">$1</a>`)
                .replace(/\r\n/gim, '<br />');

            return htmlText.trim();
        }
    }
};
</script>
<style lang="postcss" scoped>
.release {
    margin-bottom: 6em;
    /* padding-bottom: 2em; */
    /* border-bottom: 2px solid var(--back-color); */

    &:last-child {
        margin-bottom: 0;
        /* padding-bottom: 0; */
        /* border-bottom: none; */
    }

    & .release-top-wrap {
        display: flex;
        align-items: center;
        padding: 0 1em;
        font-weight: 600;
        /* justify-content: center; */

        & .name {
            font-size: 1.25em;
        }

        & .version,
        & .date {
            background-color: color-mod(var(--dark-white-color) a(5%));
            color: color-mod(var(--dark-white-color) a(85%));
            border-radius: 0.75rem;
            padding: 0.25rem 0.75rem;
            font-size: 0.85em;
            margin-left: 1rem;
        }

        & .date {
            margin-left: auto;
        }
    }

    & .body {
        display: block;
        border-radius: 0.75em 0.75em 0 0;
        /* border: 1px solid color-mod(var(--grey-color) a(5%)); */
        padding: 1em 1.25em;
        white-space: pre-wrap;
    }

    & .assets {
        background-color: var(--back-color);
        border-top: none;
        border-radius: 0.75em;
        padding: 1em 1.25em;
        margin: 0 1em;

        & .asset {
            border-bottom: 1px dashed color-mod(var(--grey-color) a(15%));
            margin-bottom: 0.75em;
            padding-bottom: 0.75em;
            display: flex;
            flex-flow: row nowrap;

            &:last-child {
                margin-bottom: 0;
                padding-bottom: 0;
                border-bottom: none;
            }

            & .size {
                margin-left: auto;
            }
        }
    }
}
</style>
