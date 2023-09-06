<template>
    <header>
        <figure>
            <img src="/favicon.png"/>
        </figure>
        <button @click="logOut">
            Log out
        </button>
    </header>
</template>

<script setup>
function logOut() {
    import('vue3-cookies').then(vue3Cookies => {
        const handler = vue3Cookies.useCookies()
        handler.cookies.remove('user')
        window.location.href = "/login"
    })
}
</script>

<style scoped>
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 12px 24px;
        background-color: var(--primary-green);
        border-bottom: 1px solid var(--main-dark-color);
        margin-bottom: 24px;
    }

    figure {
        height: 60px;
        width: 60px;
    }

    img {
        height: 100%;
        width: 100%;
        object-fit: cover;
    }

    button {
        padding: 8px;
        font-size: 16px;
        background-color: transparent;
        border: none;
        text-decoration: underline;
    }
</style>