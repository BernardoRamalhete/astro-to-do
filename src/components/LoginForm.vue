<template>
    <form @submit.prevent="submitForm">
        <figure>
            <img src="/favicon.png"/>
        </figure>
        <label for="username">Username</label>
        <input 
            id="username" 
            type="text" 
            name="username" 
            required
            />
            <!-- class:list={ { error: errors.username } } -->

        <label for="password">Password</label>
        <input 
            id="password" 
            type="password" 
            name="password" 
            required
        />

        <div>
            <a href="/register">Register</a>
            <button type="submit">Login</button>
        </div>
    </form>
</template>

<script setup>
import { ofetch } from 'ofetch'

async function submitForm(event) {
    const formData = new FormData(event.currentTarget)

    const response = await ofetch('/api/login', {
        method: 'POST',
        body: formData
    }).then(res => JSON.parse(res))
    
    if(response.data.token) {
        import('vue3-cookies').then(vue3Cookies => {
            const handler = vue3Cookies.useCookies()
            handler.cookies.set('user', response.data.token)
            window.location.href = "/"
        })
    }
}
</script>

<style>
    form {
        display: flex;
        flex-direction: column;
    }

    form > div {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-top: 24px;
    }

    figure {
        margin-inline: auto;
    }

    label {
        margin-bottom: 8px;
        margin-top: 20px;
    }
    
    label:first-of-type {
        margin-top: 0px;
    }

    a {
        color: var(--primary-green);
        transition: all 0.2s ease;
    }

    a:hover, button:hover {
        opacity: 0.4;
    }

    button {
        background-color: var(--primary-green);
        padding: 8px 20px;
        border-radius: 50px;
        color: #fff;
        border: none;
        font-size: 20px;
        transition: all 0.2s ease;
    }
</style>