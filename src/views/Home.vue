<template lang="pug">
  div(class="home container")
    div(class="row pt-3 mb-2")
      b-card( text-variant="success" title="Todo List" class="col-lg-4 col-md-5 col-sm-10 m-auto p-1 ")
        b-list-group(class="home__content" )
          div(class="d-flex home__add-task")
            b-form-input(
              class="home__add_input"
              v-model="newTaskDesc"
              type="text"
              placeholder="what will be done?")
            b-button(variant="success" class="home__add_button" @click="addTask()")
              b-icon(icon="check")

          Loader(v-if="todos.length === 0")
          Container(
            v-else
            group-name="todos"
            @drop="onDrop($event)"
            :get-child-payload="getChildPayload"
            :drop-placeholder="{ className: 'placeholder'}"
            :non-drag-area-selector="'.no-draggable'"
            :drag-class="'.opacity-ghost'"
          )
            Draggable(
              v-for="(item, index) in todos"
              :key="item.id"
              class="home__draggable"

            )
              b-list-group-item(
                class="home__task_item"
                button
                @click="editTask(item.id, item.description)"
                )
                div(v-if="mutableTask === item.id"  class="d-flex justify-content-end home__change_block" @click.stop )
                  Loader(v-if="loading")
                  template(v-else)
                    b-form-input(
                      class="home__change_input no-draggable"
                      v-model="mutableTaskDesc"
                      type="text"
                      placeholder="todo's description")
                    b-button(variant="primary" class="home__change_button no-draggable" @click="acceptChanges(index)")
                      b-icon(icon="check")
                    b-button(variant="danger" class="home__change_button no-draggable" @click="deleteTask(item.id, index)")
                      b-icon(icon="trash")
                    b-button(variant="dark" class="home__change_button no-draggable" @click="closeEdit")
                      b-icon(icon="x")
                div(v-if="mutableTask !== item.id" class="home__task_content d-flex justify-content-between rounded-2")
                  Loader(v-if="changedStatusIndex === index || removedIndex === index || addedIndex === index" :isPadding="false")
                  template(v-else)
                    span(:class="{'text-decoration-line-through': item.status}") {{item.description}}
                    div(@click.stop="changeStatus(item.id, index)")
                      b-icon(v-if="item.status" variant="success" icon="check-circle")
                      b-icon(v-else variant="success" icon="circle")

</template>

<script>
  import api from '@/api'
  import Loader from "../components/Loader";
  import { Container, Draggable } from "vue-smooth-dnd";

export default {
  name: 'Home',
  components: {
    Loader, Container, Draggable
  },
  beforeCreate() {
    if(!localStorage.getItem('accessToken')) {
      this.$router.replace({ name: "Login"})
    }
  },
  async created() {
    await api.get('/todos')
      .then(res => {
        this.todos = res.data.todos
    })
  },
  data: () => ({
    todos: [],
    newTaskDesc: null,
    mutableTask: null,
    mutableTaskDesc: null,
    loading: false,
    loadingItemStatus: null,
    changedStatusIndex: null,
    removedIndex: null,
    addedIndex: null,

  }),
  computed: {

  },
  methods: {
    getChildPayload(index) {
      return {
        index,
      }
    },
    async onDrop(event) {
      const { removedIndex, addedIndex } = event;
      if(removedIndex !== addedIndex) {
        const relocatableTask = this.todos[removedIndex];
        this.removedIndex = removedIndex;
        this.addedIndex = addedIndex;
        await api.post('/replace_task', {
          removedId: this.todos[removedIndex].id,
          addedId: this.todos[addedIndex].id,
        }).then(res => {
          this.todos.splice(removedIndex, 1);
          this.todos.splice(addedIndex, 0, relocatableTask);
          this.todos.forEach((task, index) => {
            task.id = index;
          });
        }).catch(err => {
          console.error(err);
        });
        this.removedIndex = this.addedIndex = null;
      }
      console.log(event);
    },
    async acceptChanges(index) {
      if(this.todos[index].description !== this.mutableTaskDesc) {
        this.loading = true;
        await api.post('/change_task', {
          id: this.mutableTask,
          description: this.mutableTaskDesc,
        }).then(res => {
          this.loading = false;
          this.todos[index].description = res.data.description;
          this.closeEdit();

        })
      } else {
        this.closeEdit()
      }
    },
    async changeStatus(id, index) {
      this.changedStatusIndex = index;
      await api.post('/change_status', {
        id
      }).then(res => {
        this.todos[index].status = res.data.status;
        this.changedStatusIndex = null;
      }).catch(err => {
        console.error(err);
        this.changedStatusIndex = null;
      })
    },
    editTask(id, desc) {
      this.mutableTask = id;
      this.mutableTaskDesc = desc;
    },
    closeEdit() {
      setTimeout(() => {
        this.mutableTask = this.mutableTaskDesc = null;
      }, 1)

    },
    async addTask() {
      if(this.newTaskDesc) {
        await api.post('/task',
          {
            description: this.newTaskDesc
          })
          .then(res => {
            this.todos.splice(0, 0, res.data.task);
            for(let i = 1; i <= this.todos.length - 1; i++) {
              this.todos[i].id++;
            }
          })
      }
    },
    async deleteTask(id, index) {
      this.loading = true;
      await api.delete(`/task/${id}`)
        .then(res => {
          this.todos.splice(index, 1);
          for(let i = index; i <= this.todos.length - 1; i++) {
            if(i === 0) {
              this.todos[0].id = 0
            } else {
              this.todos[i].id = this.todos[i - 1].id + 1;
            }
          }
          this.loading = false;
          this.closeEdit();
        })
        .catch(err => {
          console.error(err);
          this.loading = false;
        })
    }
  }
}
</script>

<style lang="sass">
  .home
    &__
      &draggable
        & > .list-group-item:hover
          border-radius: 5px
      &add-task
        & > *
          &:first-child
            border-radius: 0.25rem 0 0 0.25rem
          &:last-child
            border-radius: 0 0.25rem 0.25rem 0
      &task_item
        &.list-group-item
          padding: 0
          border: none
          border-radius: 5px
          margin-top: 5px
          & .home__change_block
            & > *
              &:not(:first-child):not(:last-child)
                border-radius: 0px
              &:first-child
                border-radius: 0.25rem 0 0 0.25rem
              &:last-child
                border-radius: 0 0.25rem 0.25rem 0
      &task_content
        padding: 10px 15px 10px 10px
      &change_input.form-control
        padding: 9px 0.75rem
        &:focus
          box-shadow: none
  .placeholder
    background-color: rgba(#198754, 0.2)
    border-radius: 5px
    border: 2px solid #fff
  .smooth-dnd-ghost
    border-radius: 5px
    & > .list-group-item
      background-color: #f8f9fa



</style>
