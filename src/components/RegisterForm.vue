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
        <label for="confirmPassword">Confirm Password</label>
        <input 
            id="confirmPassword" 
            type="password" 
            name="confirmPassword" 
            required
        />

        <div>
            <a href="/login">Login</a>
            <button type="submit">Register</button>
        </div>
    </form>
</template>

<script setup>
import { ofetch } from 'ofetch'

function validateForm(form) {
    const username = form.get('username')
    const password = form.get('password')
    const confirmPassword = form.get('confirmPassword')

    if(!username.length > 0 || !password.length > 0 || !confirmPassword.length > 0) {
        console.log('foo')
        return false
    }
    
    if(password != confirmPassword) return false
    console.log('bar')

    return true
}
async function submitForm(event) {
    const formData = new FormData(event.currentTarget)
    const validForm = validateForm(formData)

    if(!validForm) return

    const response = await ofetch('/api/register', {
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

<style scoped>
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