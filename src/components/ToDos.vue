<template>
    <ul>
        <li v-if="toDosList.length == 0">
            You don't have any To Dos!<br/> Create your first one using the input down below
        </li>
        <li 
            v-for="(toDo, index) in toDosList" 
            :key="toDo.id"
            :class="{
                'is-updating': updatingToDos.has(toDo.id)
            }"
        >
            <input 
                :id="`to-do-${toDo.id}`" 
                :checked="toDo.is_completed"
                @change="toggleToDoCompleted($event, toDo)"
                type="checkbox"
            />
            <input
                v-if="editingToDoId == toDo.id"
                :id="`to-do-${toDo.id}`"
                v-model="editingToDoModel"
            />
            <label v-else :id="`to-do-label-${toDo.id}`" :for="`to-do-${toDo.id}`">
                {{ toDo.content }}
            </label>
            <button v-if="editingToDoId == toDo.id" title="Save" @click="saveChanges(index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="m14.431 3.323l-8.47 10l-.79-.036l-3.35-4.77l.818-.574l2.978 4.24l8.051-9.506l.764.646z" clip-rule="evenodd"/></svg>
                <span class="visually-hidden">Save edit {{ toDo.content }}</span>
            </button>
            <button :title="`${editingToDoId == toDo.id ? 'Cancel' : 'Edit'}`" @click="toggleEditing(toDo)">
                <svg v-if="editingToDoId == toDo.id" xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="m7.116 8l-4.558 4.558l.884.884L8 8.884l4.558 4.558l.884-.884L8.884 8l4.558-4.558l-.884-.884L8 7.116L3.442 2.558l-.884.884L7.116 8z" clip-rule="evenodd"/></svg>
                <svg v-else xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16" aria-hidden><path fill="currentColor" d="M13.23 1h-1.46L3.52 9.25l-.16.22L1 13.59L2.41 15l4.12-2.36l.22-.16L15 4.23V2.77L13.23 1zM2.41 13.59l1.51-3l1.45 1.45l-2.96 1.55zm3.83-2.06L4.47 9.76l8-8l1.77 1.77l-8 8z"/></svg>
                <span class="visually-hidden">Toggle edit {{ toDo.content }}</span>
            </button>
            <button v-if="editingToDoId != toDo.id" title="Delete" @click="deleteToDo(toDo.id, index)">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="currentColor" fill-rule="evenodd" d="M10 3h3v1h-1v9l-1 1H4l-1-1V4H2V3h3V2a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1zM9 2H6v1h3V2zM4 13h7V4H4v9zm2-8H5v7h1V5zm1 0h1v7H7V5zm2 0h1v7H9V5z" clip-rule="evenodd"/></svg>
                <span class="visually-hidden">Remove {{ toDo.content }}</span>
            </button>
        </li>
        <li class="add-new">
            <form @submit.prevent="addNewToDo">
                <input 
                    v-model="newToDoModel" 
                    type="text" 
                    :class="{ error: newToDoError }"
                    :disabled="addingToDo"
                />
                <button :disabled="addingToDo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 16 16"><path fill="currentColor" d="M14 7v1H8v6H7V8H1V7h6V1h1v6h6z"/></svg>
                    <span class="visually-hidden">Add new To Do</span>
                </button>
            </form>
        </li>
    </ul>
</template>

<script setup>
import { ofetch } from 'ofetch'
import { reactive, computed, ref } from 'vue'

const props = defineProps({
    initialToDos: {
        type: Array,
        required: true
    },
    userToken: {
        type: String,
        required: true
    }
})

const initialToDos = ref(props.initialToDos.map(todo => (todo)))
const addedToDos = ref([])

const toDosList = computed(() => {
    return [...initialToDos.value, ...addedToDos.value]
})

const updatingToDos = reactive(new Set())
async function toggleToDoCompleted(event, toDo) {
    try {
        updatingToDos.add(toDo.id)

        const body = new FormData()
        body.append('id', toDo.id)
        body.append('is_completed', toDo.is_completed)

        const response = await ofetch('/api/todo', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${props.userToken}`
            },
            body
        }).then(res => JSON.parse(res))

        if(!response.data) throw response.message

        updatingToDos.delete(toDo.id)
    } catch (error) {
        event.target.checked = !event.target.checked
        updatingToDos.delete(toDo.id)
    }
}

const editingToDoId = ref(null)
const editingToDoModel = ref('')

function toggleEditing(toDo) {
    if(editingToDoId.value == toDo.id) {
        editingToDoId.value = null
        editingToDoModel.value = ''
        return
    }
    editingToDoId.value = toDo.id
    editingToDoModel.value = toDo.content
}

async function saveChanges(index) {
    try {
        updatingToDos.add(editingToDoId.value)

        const body = new FormData()
        body.append('id', editingToDoId.value)
        body.append('content', editingToDoModel.value)

        const response = await ofetch('/api/todo', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${props.userToken}`
            },
            body
        }).then(res => JSON.parse(res))

        if(!response.data) throw response.message
        toDosList.value[index].content = response.data.content
    } catch (error) {
        console.log(error)
        return
    } finally {
        updatingToDos.delete(editingToDoId.value)
        editingToDoId.value = null
        editingToDoModel.value = ''
    }
}

const newToDoModel = ref('')
const newToDoError = ref(false)
const addingToDo = ref(false)

async function addNewToDo() {
    try {
        
        newToDoError.value = false
        addingToDo.value = true

        const body = new FormData()
        body.append('content', newToDoModel.value)

        const response = await ofetch('/api/todo', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${props.userToken}`
            },
            body
        }).then(res => JSON.parse(res))

        if(!response.data) throw response.message
        
        newToDoModel.value = ''
        addedToDos.value.push(response.data)
    } catch (error) {
        newToDoError.value = true
        console.log(error)
        return
    } finally {
        addingToDo.value = false
    }
}

async function deleteToDo(toDoId, index) {
    try {
        updatingToDos.add(toDoId)

        const body = new FormData()
        body.append('id', toDoId)

        const response = await ofetch('/api/todo', {
            method: 'DELETE',
            headers: {
                Authorization: `Bearer ${props.userToken}`
            },
            body
        }).then(res => JSON.parse(res))

        if(!response.data) throw response.message

        initialToDos.value = initialToDos.value.filter(toDo => toDo.id != toDoId)
        addedToDos.value = initialToDos.value.filter(toDo => toDo.id != toDoId)
    } catch (error) {
        console.log(error)
        return
    } finally {
        updatingToDos.delete(toDoId)
    }
}
</script>

<style scoped>
    ul {
        margin: 20px auto;
        width: fit-content;
        display: flex;
        flex-direction: column;
        gap: 12px;
    }
    li, li form {
        display: flex;
        align-items: center;
        gap: 4px;
        transition: all 0.2s ease;
        font-size: 20px;
        width: fit-content;
    }

    li button {
        padding: 4px;
        border: none;
        background-color: transparent;
        margin-top: 4px;
        display: grid;
        place-items: center;
    }

    li input[type=checkbox] {
        margin-right: 8px;
        width: 18px;
        aspect-ratio: 1;
    }

    li.is-updating {
        opacity: 0.5;
    }

    .add-new {
        margin-top: 20px;
    }
</style>